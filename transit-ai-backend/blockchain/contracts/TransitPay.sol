// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TransitPay — Billetera y pagos de transporte público sobre blockchain.
/// @notice Token ERC-20 que representa el saldo de la billetera (en centavos de Bs).
///         Un único contrato concentra: saldo, recargas, pago de pasajes con
///         distribución automática (sindicato / chofer / sistema) y descuentos
///         por categoría de pasajero. El "owner" es el backend (modelo custodial).
contract TransitPay is ERC20, Ownable {
    /// Categorías de pasajero que determinan el descuento aplicado.
    enum Category {
        GENERAL, // 0 — sin descuento
        ESTUDIANTE, // 1
        ADULTO_MAYOR // 2
    }

    /// Descuento por categoría en puntos base (bps). 10000 bps = 100%.
    mapping(Category => uint16) public descuentoBps;

    /// Categoría asignada a cada billetera.
    mapping(address => Category) public categoriaDe;

    /// Reparto del pasaje en bps. El resto (10000 - sindicato - chofer) va al sistema.
    uint16 public bpsSindicato = 8000; // 80% al sindicato
    uint16 public bpsChofer = 1500; //    15% al chofer
    // sistema = 5%

    // ─── Eventos (registro inmutable on-chain) ──────────────────────────────────
    event Recarga(address indexed usuario, uint256 monto, uint256 nuevoSaldo);

    event PasajePagado(
        address indexed pasajero,
        address indexed sindicato,
        address indexed chofer,
        uint256 tarifaBase,
        uint256 tarifaPagada,
        uint16 descuentoBps,
        uint256 fecha
    );

    event AbonoComprado(
        address indexed pasajero,
        address indexed sindicato,
        uint256 precio,
        uint256 validoHasta,
        uint256 fecha
    );

    event CategoriaAsignada(address indexed usuario, Category categoria);

    constructor() ERC20("Transit Credits", "TRC") Ownable(msg.sender) {
        descuentoBps[Category.GENERAL] = 0; //         0%
        descuentoBps[Category.ESTUDIANTE] = 5000; //  50%
        descuentoBps[Category.ADULTO_MAYOR] = 3000; // 30%
    }

    /// El saldo se maneja en centavos de Boliviano (2 decimales).
    function decimals() public pure override returns (uint8) {
        return 2;
    }

    // ─── Recarga (caso de uso: carga de saldo por medios tradicionales) ─────────
    /// @dev El backend valida el pago con tarjeta/transferencia y luego acuña el saldo.
    function recargar(address usuario, uint256 monto) external onlyOwner {
        _mint(usuario, monto);
        emit Recarga(usuario, monto, balanceOf(usuario));
    }

    // ─── Descuentos ─────────────────────────────────────────────────────────────
    function asignarCategoria(address usuario, Category categoria) external onlyOwner {
        categoriaDe[usuario] = categoria;
        emit CategoriaAsignada(usuario, categoria);
    }

    function setDescuento(Category categoria, uint16 bps) external onlyOwner {
        require(bps <= 10000, "bps invalido");
        descuentoBps[categoria] = bps;
    }

    function setReparto(uint16 _sindicato, uint16 _chofer) external onlyOwner {
        require(_sindicato + _chofer <= 10000, "reparto invalido");
        bpsSindicato = _sindicato;
        bpsChofer = _chofer;
    }

    /// Tarifa final luego de aplicar el descuento de la categoría del pasajero.
    function tarifaConDescuento(address pasajero, uint256 tarifaBase)
        public
        view
        returns (uint256)
    {
        uint16 d = descuentoBps[categoriaDe[pasajero]];
        return tarifaBase - (tarifaBase * d) / 10000;
    }

    // ─── Pago de pasaje con distribución automática ─────────────────────────────
    /// @notice Cobra el pasaje al pasajero y reparte automáticamente entre
    ///         sindicato, chofer y sistema. Todo en una sola transacción.
    function pagarPasaje(
        address pasajero,
        address sindicato,
        address chofer,
        uint256 tarifaBase
    ) external onlyOwner returns (uint256 tarifaPagada) {
        uint16 d = descuentoBps[categoriaDe[pasajero]];
        tarifaPagada = tarifaBase - (tarifaBase * d) / 10000;
        require(balanceOf(pasajero) >= tarifaPagada, "Saldo insuficiente");

        uint256 parteSindicato = (tarifaPagada * bpsSindicato) / 10000;
        uint256 parteChofer = (tarifaPagada * bpsChofer) / 10000;
        uint256 parteSistema = tarifaPagada - parteSindicato - parteChofer;

        if (parteSindicato > 0) _transfer(pasajero, sindicato, parteSindicato);
        if (parteChofer > 0) _transfer(pasajero, chofer, parteChofer);
        if (parteSistema > 0) _transfer(pasajero, owner(), parteSistema);

        emit PasajePagado(
            pasajero,
            sindicato,
            chofer,
            tarifaBase,
            tarifaPagada,
            d,
            block.timestamp
        );
    }

    // ─── Compra de abono / pase mensual (pago on-chain, sin NFT) ─────────────────
    function comprarAbono(
        address pasajero,
        address sindicato,
        uint256 precio,
        uint256 validoHasta
    ) external onlyOwner {
        require(balanceOf(pasajero) >= precio, "Saldo insuficiente");

        uint256 parteSindicato = (precio * bpsSindicato) / 10000;
        uint256 parteSistema = precio - parteSindicato;

        if (parteSindicato > 0) _transfer(pasajero, sindicato, parteSindicato);
        if (parteSistema > 0) _transfer(pasajero, owner(), parteSistema);

        emit AbonoComprado(pasajero, sindicato, precio, validoHasta, block.timestamp);
    }
}
