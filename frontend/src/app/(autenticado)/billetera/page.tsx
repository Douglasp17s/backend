'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet, Percent, Split, UserCog, Search, Save, Check, Ticket, Coins,
  GraduationCap, Accessibility, User as UserIcon, AlertTriangle, Info, ShieldCheck,
  History, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';
import { billeteraServicio } from '../../../services/billetera.servicio';
import { usuariosServicio, Usuario } from '../../../services/usuarios.servicio';
import { lineasServicio, Linea } from '../../../services/lineas.servicio';
import { Transaccion } from '../../../core/tipos/respuesta';
import { Cargando } from '../../../components/dashboard/Cargando';

type Config = {
  descuentos: { GENERAL: number; ESTUDIANTE: number; ADULTO_MAYOR: number };
  reparto: { sindicatoPct: number; choferPct: number; sistemaPct: number };
  abono: { viajes: number; dias: number };
};

const CATEGORIAS: { valor: string; label: string; icono: React.ReactNode }[] = [
  { valor: 'GENERAL', label: 'General', icono: <UserIcon size={15} /> },
  { valor: 'ESTUDIANTE', label: 'Estudiante', icono: <GraduationCap size={15} /> },
  { valor: 'ADULTO_MAYOR', label: 'Adulto mayor', icono: <Accessibility size={15} /> },
];

type TabKey = 'tarifas' | 'descuentos' | 'reparto' | 'abono' | 'categorias' | 'movimientos';
const TABS: { key: TabKey; label: string; icono: React.ReactNode }[] = [
  { key: 'tarifas', label: 'Tarifas', icono: <Coins size={15} /> },
  { key: 'descuentos', label: 'Descuentos', icono: <Percent size={15} /> },
  { key: 'reparto', label: 'Reparto', icono: <Split size={15} /> },
  { key: 'abono', label: 'Abono', icono: <Ticket size={15} /> },
  { key: 'categorias', label: 'Categorías', icono: <UserCog size={15} /> },
  { key: 'movimientos', label: 'Transaccions', icono: <History size={15} /> },
];

const TIPO_INFO: Record<string, { label: string; color: string; signo: string; icono: React.ReactNode }> = {
  TOPUP: { label: 'Recarga', color: '#00d992', signo: '+', icono: <ArrowDownLeft size={14} /> },
  FARE_PAYMENT: { label: 'Pago de pasaje', color: '#3b82f6', signo: '−', icono: <ArrowUpRight size={14} /> },
  PASS_PURCHASE: { label: 'Abono', color: '#a855f7', signo: '−', icono: <Ticket size={13} /> },
};
const FILTROS_TIPO: { valor: string; label: string }[] = [
  { valor: '', label: 'Todos los movimientos' },
  { valor: 'TOPUP', label: 'Solo recargas' },
  { valor: 'FARE_PAYMENT', label: 'Solo pagos de pasaje' },
  { valor: 'PASS_PURCHASE', label: 'Solo abonos' },
];

// ── estilos reutilizables ─────────────────────────────────────────────────────
const VERDE = '#00d992';
const card: React.CSSProperties = { padding: '1.75rem' };
const etiqueta: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: '#b8b3b0', display: 'block', marginBottom: '0.4rem' };
const ayudaTxt: React.CSSProperties = { color: '#8b949e', fontSize: '0.82rem', lineHeight: 1.5, margin: '0.35rem 0 1.5rem' };
const moneda = (bs: number) => `Bs ${Number(bs).toFixed(2)}`;

function TituloSeccion({ icono, children }: { icono: React.ReactNode; children: React.ReactNode }) {
  return <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f2f2f2', display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.15rem' }}>{icono} {children}</h2>;
}

function BotonGuardar({ onClick, pending, ok, texto = 'Guardar' }: { onClick: () => void; pending: boolean; ok: boolean; texto?: string }) {
  return (
    <button className="boton boton-primario" style={{ justifyContent: 'center', minWidth: 130 }} onClick={onClick} disabled={pending}>
      {pending ? 'Guardando...' : ok ? <><Check size={14} /> Guardado</> : <><Save size={14} /> {texto}</>}
    </button>
  );
}

function Buscador({ valor, onChange, placeholder }: { valor: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: 'relative', maxWidth: 380, marginBottom: '1.25rem' }}>
      <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
      <input className="campo-entrada" style={{ paddingLeft: '2.5rem' }} placeholder={placeholder} value={valor} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function PaginaBilletera() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabKey>('tarifas');

  // TODO: Desplegar contrato inteligente en Hardhat antes de habilitar
  // const { data: config, isLoading, isError } = useQuery<Config>({ queryKey: ['billetera-config'], queryFn: () => billeteraServicio.obtenerConfig(), retry: false });
  const config: Config | null = null;
  const isLoading = false;
  const isError = false;
  const { data: usuarios = [] } = useQuery<Usuario[]>({ queryKey: ['usuarios', 'PASSENGER'], queryFn: () => usuariosServicio.obtenerTodos({ rol: 'PASSENGER' }) });
  const { data: lineas = [] } = useQuery<Linea[]>({ queryKey: ['lineas'], queryFn: () => lineasServicio.obtenerTodas() });

  // estados editables
  const [desc, setDesc] = useState({ GENERAL: '0', ESTUDIANTE: '50', ADULTO_MAYOR: '30' });
  const [reparto, setReparto] = useState({ sindicato: '80', chofer: '15' });
  const [abono, setAbono] = useState({ viajes: '40', dias: '30' });
  const [tarifas, setTarifas] = useState<Record<string, string>>({});
  // filtros
  const [filtroLinea, setFiltroLinea] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [catSel, setCatSel] = useState<Record<string, string>>({});
  const [filtroTipo, setFiltroTipo] = useState<'TOPUP' | 'FARE_PAYMENT' | 'PASS_PURCHASE' | ''>('');
  const [buscaMov, setBuscaMov] = useState('');

  const { data: movimientos = [], isLoading: cargandoMov } = useQuery<Transaccion[]>({
    queryKey: ['billetera-tx', filtroTipo],
    queryFn: () => billeteraServicio.historial(undefined),
    enabled: tab === 'movimientos',
  });

  useEffect(() => {
    if (config) {
      const cfg = config as Config;
      setDesc({ GENERAL: String(cfg.descuentos.GENERAL), ESTUDIANTE: String(cfg.descuentos.ESTUDIANTE), ADULTO_MAYOR: String(cfg.descuentos.ADULTO_MAYOR) });
      setReparto({ sindicato: String(cfg.reparto.sindicatoPct), chofer: String(cfg.reparto.choferPct) });
      setAbono({ viajes: String(cfg.abono.viajes), dias: String(cfg.abono.dias) });
    }
  }, [config]);
  useEffect(() => {
    if (lineas.length) setTarifas(Object.fromEntries(lineas.map((l) => [l.id, String(l.tarifaBaseBs)])));
  }, [lineas]);

  // mutaciones
  const mDescuento = useMutation({ mutationFn: (categoria: 'GENERAL' | 'ESTUDIANTE' | 'ADULTO_MAYOR') => billeteraServicio.actualizarDescuento({ categoria, porcentaje: parseFloat((desc as any)[categoria]) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['billetera-config'] }) });
  const mReparto = useMutation({ mutationFn: () => billeteraServicio.actualizarReparto({ sindicato: parseFloat(reparto.sindicato), chofer: parseFloat(reparto.chofer) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['billetera-config'] }) });
  const mAbono = useMutation({ mutationFn: () => billeteraServicio.actualizarAbono({ viajes: parseInt(abono.viajes), dias: parseInt(abono.dias) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['billetera-config'] }) });
  const mTarifa = useMutation({ mutationFn: ({ id }: { id: string }) => lineasServicio.actualizar(id, { tarifa: parseFloat(tarifas[id]) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['lineas'] }) });
  const mCat = useMutation({ mutationFn: ({ id, categoria }: { id: string; categoria: 'GENERAL' | 'ESTUDIANTE' | 'ADULTO_MAYOR' }) => billeteraServicio.asignarCategoria(id, { categoria }) });

  const sistemaPct = Math.max(0, 100 - (parseFloat(reparto.sindicato) || 0) - (parseFloat(reparto.chofer) || 0));
  const repartoValido = (parseFloat(reparto.sindicato) || 0) + (parseFloat(reparto.chofer) || 0) <= 100;
  const lineasFiltradas = lineas.filter((l) => l.nombre?.toLowerCase().includes(filtroLinea.toLowerCase()) || l.numero?.toLowerCase().includes(filtroLinea.toLowerCase()));
  const filtrados = usuarios.filter((u) => u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || u.email?.toLowerCase().includes(busqueda.toLowerCase()));
  const movFiltrados = movimientos.filter((m) => m.titular?.toLowerCase().includes(buscaMov.toLowerCase()) || (m.email ?? '').toLowerCase().includes(buscaMov.toLowerCase()));
  const fmtFecha = (f: string) => new Date(f).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.625rem', color: '#f2f2f2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wallet size={22} color={VERDE} /> Pagos y Billetera</h1>
        <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Panel de administración del sistema de pagos digitales</p>
      </div>

      {/* ── Banner educativo ─────────────────────────────────────────────── */}
      <div className="tarjeta" style={{ padding: '1.1rem 1.25rem', marginBottom: '1.25rem', borderColor: 'rgba(0,217,146,0.25)', background: 'rgba(0,217,146,0.04)' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Info size={20} color={VERDE} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.84rem', color: '#b8b3b0', lineHeight: 1.6 }}>
            <strong style={{ color: '#f2f2f2' }}>¿Qué es esto?</strong> Cada pasajero tiene una <strong style={{ color: VERDE }}>billetera digital</strong> con saldo. Al pagar un pasaje por QR, el sistema cobra y lo <strong style={{ color: VERDE }}>reparte automáticamente</strong> entre sindicato, chofer y sistema, dejando un registro inalterable en la <strong style={{ color: VERDE }}>blockchain</strong>. Desde acá controlás precios, descuentos, reparto y abonos — sin necesidad de saber nada técnico.
          </div>
        </div>
      </div>

      {isError ? (
        <div className="tarjeta" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fb923c' }}>
          <AlertTriangle size={20} />
          <div>
            <p style={{ fontWeight: 700, color: '#f2f2f2' }}>El sistema de pagos no está disponible</p>
            <p style={{ fontSize: '0.8125rem', color: '#8b949e' }}>El servicio de blockchain está apagado. Hay que iniciar el nodo y desplegar el contrato (ver BLOCKCHAIN.md).</p>
          </div>
        </div>
      ) : isLoading ? <Cargando /> : (
        <>
          {/* ── Tabs (botones con borde) ────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '0.55rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {TABS.map((t) => {
              const activo = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', fontSize: '0.85rem',
                  fontWeight: activo ? 700 : 500, color: activo ? VERDE : '#b8b3b0',
                  background: activo ? 'rgba(0,217,146,0.1)' : '#101010',
                  border: activo ? `1px solid rgba(0,217,146,0.45)` : '1px solid #3d3a39',
                  borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: activo ? '0 0 0 3px rgba(0,217,146,0.06)' : 'none',
                }}>
                  {t.icono} {t.label}
                </button>
              );
            })}
          </div>

          {/* ── 1. Tarifas ──────────────────────────────────────────────── */}
          {tab === 'tarifas' && (
            <div className="tarjeta animar-aparecer" style={card}>
              <TituloSeccion icono={<Coins size={18} color={VERDE} />}>Precio del pasaje por línea</TituloSeccion>
              <p style={ayudaTxt}>Lo que cuesta un viaje en cada línea. Es el precio base sobre el que se aplican los descuentos.</p>
              <Buscador valor={filtroLinea} onChange={setFiltroLinea} placeholder="Buscar línea por nombre o código..." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '0.75rem' }}>
                {lineasFiltradas.length === 0 && <p style={{ color: '#8b949e', fontSize: '0.8rem' }}>Sin resultados.</p>}
                {lineasFiltradas.map((l) => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.85rem', border: '1px solid #3d3a39', borderRadius: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#00d99220', border: '1px solid #00d99240', color: '#00d992', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>{l.numero}</div>
                    <div style={{ flex: 1, minWidth: 80 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f2f2f2' }}>{l.nombre}</p>
                      <p style={{ fontSize: '0.7rem', color: '#8b949e' }}>Bs {l.tarifaBaseBs}</p>
                    </div>
                    <div style={{ position: 'relative', width: 105 }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '0.8rem' }}>Bs</span>
                      <input type="number" step="0.5" min={0} className="campo-entrada" style={{ paddingLeft: '2.2rem' }} value={tarifas[l.id] ?? ''} onChange={(e) => setTarifas({ ...tarifas, [l.id]: e.target.value })} />
                    </div>
                    <button className="boton boton-secundario" style={{ padding: '0.5rem 0.65rem' }} onClick={() => mTarifa.mutate({ id: l.id })} disabled={mTarifa.isPending}>
                      {mTarifa.isPending && mTarifa.variables?.id === l.id ? '...' : mTarifa.isSuccess && mTarifa.variables?.id === l.id ? <Check size={14} color={VERDE} /> : <Save size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 2. Descuentos ───────────────────────────────────────────── */}
          {tab === 'descuentos' && (
            <div className="tarjeta animar-aparecer" style={card}>
              <TituloSeccion icono={<Percent size={18} color={VERDE} />}>Descuentos por tipo de pasajero</TituloSeccion>
              <p style={ayudaTxt}>Rebaja que se aplica automáticamente según la categoría del pasajero. Ej: si un estudiante tiene 50%, paga la mitad.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                {CATEGORIAS.map((c) => {
                  const pct = parseFloat((desc as any)[c.valor]) || 0;
                  const ejemplo = 2.5 * (1 - pct / 100);
                  return (
                    <div key={c.valor} style={{ border: '1px solid #3d3a39', borderRadius: 10, padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f2f2f2', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.9rem' }}>{c.icono} {c.label}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.7rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input type="number" min={0} max={100} className="campo-entrada" style={{ paddingRight: '1.8rem' }} value={(desc as any)[c.valor]} onChange={(e) => setDesc({ ...desc, [c.valor]: e.target.value })} />
                          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '0.8rem' }}>%</span>
                        </div>
                        <button className="boton boton-secundario" style={{ padding: '0.5rem 0.65rem' }} onClick={() => mDescuento.mutate(c.valor as 'GENERAL' | 'ESTUDIANTE' | 'ADULTO_MAYOR')} disabled={mDescuento.isPending}>
                          {mDescuento.isPending && mDescuento.variables === c.valor ? '...' : mDescuento.isSuccess && mDescuento.variables === c.valor ? <Check size={14} color={VERDE} /> : <Save size={14} />}
                        </button>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: '#8b949e' }}>Un pasaje de Bs 2.50 → paga <strong style={{ color: VERDE }}>{moneda(ejemplo)}</strong></p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 3. Reparto ──────────────────────────────────────────────── */}
          {tab === 'reparto' && (
            <div className="tarjeta animar-aparecer" style={{ ...card, maxWidth: 720 }}>
              <TituloSeccion icono={<Split size={18} color={VERDE} />}>Reparto del dinero de cada pasaje</TituloSeccion>
              <p style={ayudaTxt}>De cada pasaje cobrado, qué porcentaje va a cada parte. El sistema reparte solo, al momento del pago. Sindicato + chofer no puede pasar de 100%; lo que sobra es para el sistema.</p>

              <div style={{ display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden', marginBottom: '1.1rem', border: '1px solid #3d3a39' }}>
                <div style={{ width: `${parseFloat(reparto.sindicato) || 0}%`, background: VERDE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#04150f' }}>{parseFloat(reparto.sindicato) || 0}%</div>
                <div style={{ width: `${parseFloat(reparto.chofer) || 0}%`, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>{parseFloat(reparto.chofer) || 0}%</div>
                <div style={{ width: `${sistemaPct}%`, background: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>{sistemaPct}%</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={etiqueta}><span style={{ color: VERDE }}>●</span> Sindicato</label>
                  <div style={{ position: 'relative' }}><input type="number" min={0} max={100} className="campo-entrada" style={{ paddingRight: '1.8rem' }} value={reparto.sindicato} onChange={(e) => setReparto({ ...reparto, sindicato: e.target.value })} /><span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '0.8rem' }}>%</span></div>
                </div>
                <div>
                  <label style={etiqueta}><span style={{ color: '#3b82f6' }}>●</span> Chofer</label>
                  <div style={{ position: 'relative' }}><input type="number" min={0} max={100} className="campo-entrada" style={{ paddingRight: '1.8rem' }} value={reparto.chofer} onChange={(e) => setReparto({ ...reparto, chofer: e.target.value })} /><span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '0.8rem' }}>%</span></div>
                </div>
                <div>
                  <label style={etiqueta}><span style={{ color: '#6b7280' }}>●</span> Sistema</label>
                  <div className="campo-entrada" style={{ display: 'flex', alignItems: 'center', color: '#8b949e', background: '#0a0a0a' }}>{sistemaPct}%</div>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '0.9rem' }}>Ejemplo con un pasaje de Bs 2.50 → Sindicato <strong style={{ color: VERDE }}>{moneda(2.5 * (parseFloat(reparto.sindicato) || 0) / 100)}</strong>, Chofer <strong style={{ color: '#3b82f6' }}>{moneda(2.5 * (parseFloat(reparto.chofer) || 0) / 100)}</strong>, Sistema <strong style={{ color: '#9ca3af' }}>{moneda(2.5 * sistemaPct / 100)}</strong></p>
              {!repartoValido && <p style={{ color: '#fb565b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>La suma de sindicato + chofer no puede superar el 100%.</p>}
              <BotonGuardar onClick={() => mReparto.mutate()} pending={mReparto.isPending && repartoValido} ok={mReparto.isSuccess} texto="Guardar reparto" />
            </div>
          )}

          {/* ── 4. Abono ────────────────────────────────────────────────── */}
          {tab === 'abono' && (
            <div className="tarjeta animar-aparecer" style={{ ...card, maxWidth: 720 }}>
              <TituloSeccion icono={<Ticket size={18} color={VERDE} />}>Abono / pase mensual</TituloSeccion>
              <p style={ayudaTxt}>Un pase que el pasajero compra una vez y le sirve por un tiempo. El precio se calcula como el equivalente a una cantidad de viajes de la línea.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={etiqueta}>Equivale a (viajes)</label>
                  <input type="number" min={1} max={500} className="campo-entrada" value={abono.viajes} onChange={(e) => setAbono({ ...abono, viajes: e.target.value })} />
                </div>
                <div>
                  <label style={etiqueta}>Días de validez</label>
                  <input type="number" min={1} max={365} className="campo-entrada" value={abono.dias} onChange={(e) => setAbono({ ...abono, dias: e.target.value })} />
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '0.9rem' }}>Para una línea de Bs 2.50, el abono costaría <strong style={{ color: VERDE }}>{moneda(2.5 * (parseInt(abono.viajes) || 0))}</strong> y duraría <strong style={{ color: '#f2f2f2' }}>{abono.dias} días</strong>.</p>
              <BotonGuardar onClick={() => mAbono.mutate()} pending={mAbono.isPending} ok={mAbono.isSuccess} texto="Guardar abono" />
            </div>
          )}

          {/* ── 5. Categorías ───────────────────────────────────────────── */}
          {tab === 'categorias' && (
            <div className="tarjeta animar-aparecer" style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <TituloSeccion icono={<UserCog size={18} color={VERDE} />}>Categoría de cada pasajero</TituloSeccion>
                  <p style={ayudaTxt}>Asigná a qué grupo pertenece cada pasajero para que reciba el descuento que le corresponde.</p>
                </div>
                <span className="insignia" style={{ background: 'rgba(0,217,146,0.1)', color: VERDE, border: '1px solid rgba(0,217,146,0.2)' }}>{filtrados.length} pasajeros</span>
              </div>
              <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar pasajero por nombre o email..." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: '0.75rem' }}>
                {filtrados.length === 0 && <p style={{ color: '#8b949e', fontSize: '0.8rem' }}>Sin pasajeros.</p>}
                {filtrados.map((u) => (
                  <div key={u.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', padding: '0.9rem', border: '1px solid #3d3a39', borderRadius: 10 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f2f2f2' }}>{u.nombre}</p>
                      <p style={{ fontSize: '0.72rem', color: '#8b949e' }}>{u.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select className="campo-entrada" style={{ flex: 1 }} value={catSel[u.id] ?? 'GENERAL'} onChange={(e) => setCatSel({ ...catSel, [u.id]: e.target.value })}>
                        {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.label}</option>)}
                      </select>
                      <button className="boton boton-secundario" style={{ fontSize: '0.75rem', padding: '0.45rem 0.7rem', minWidth: 92, justifyContent: 'center' }} onClick={() => mCat.mutate({ id: u.id, categoria: (catSel[u.id] ?? 'GENERAL') as 'GENERAL' | 'ESTUDIANTE' | 'ADULTO_MAYOR' })} disabled={mCat.isPending}>
                        {mCat.isPending && mCat.variables?.id === u.id ? '...' : mCat.isSuccess && mCat.variables?.id === u.id ? <><Check size={13} color={VERDE} /> Listo</> : 'Aplicar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 6. Transaccions ──────────────────────────────────────────── */}
          {tab === 'movimientos' && (
            <div className="tarjeta animar-aparecer" style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <TituloSeccion icono={<History size={18} color={VERDE} />}>Transaccions de las billeteras</TituloSeccion>
                  <p style={ayudaTxt}>Todas las recargas, pagos de pasaje y abonos de los pasajeros. Cada uno quedó registrado en la blockchain.</p>
                </div>
                <span className="insignia" style={{ background: 'rgba(0,217,146,0.1)', color: VERDE, border: '1px solid rgba(0,217,146,0.2)' }}>{movFiltrados.length} movimientos</span>
              </div>

              {/* filtros */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 380 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
                  <input className="campo-entrada" style={{ paddingLeft: '2.5rem' }} placeholder="Buscar por pasajero..." value={buscaMov} onChange={(e) => setBuscaMov(e.target.value)} />
                </div>
                <select className="campo-entrada" style={{ width: 230 }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as 'TOPUP' | 'FARE_PAYMENT' | 'PASS_PURCHASE' | '')}>
                  {FILTROS_TIPO.map((f) => <option key={f.valor} value={f.valor}>{f.label}</option>)}
                </select>
              </div>

              {cargandoMov ? <Cargando /> : movFiltrados.length === 0 ? (
                <p style={{ color: '#8b949e', fontSize: '0.85rem', padding: '1rem 0' }}>No hay movimientos todavía. Aparecerán acá cuando los pasajeros recarguen saldo o paguen pasajes.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#8b949e', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Fecha</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Tipo</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Pasajero</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textAlign: 'right' }}>Monto</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Bloque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movFiltrados.map((m) => {
                        const info = TIPO_INFO[m.tipo] ?? { label: m.tipo, color: '#8b949e', signo: '', icono: null };
                        return (
                          <tr key={m.id} style={{ borderTop: '1px solid #3d3a39' }}>
                            <td style={{ padding: '0.7rem 0.75rem', color: '#b8b3b0', whiteSpace: 'nowrap' }}>{fmtFecha(m.fecha)}</td>
                            <td style={{ padding: '0.7rem 0.75rem' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, color: info.color, background: `${info.color}1a`, border: `1px solid ${info.color}33` }}>{info.icono} {info.label}</span>
                            </td>
                            <td style={{ padding: '0.7rem 0.75rem' }}>
                              <p style={{ fontWeight: 600, color: '#f2f2f2' }}>{m.titular}</p>
                              {m.email && <p style={{ fontSize: '0.72rem', color: '#8b949e' }}>{m.email}</p>}
                            </td>
                            <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 700, color: info.color, whiteSpace: 'nowrap' }}>{info.signo} Bs {m.montoBs.toFixed(2)}</td>
                            <td style={{ padding: '0.7rem 0.75rem', color: '#8b949e', fontFamily: 'monospace', fontSize: '0.78rem' }}>#{m.blockNumber ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Pie de seguridad ────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#8b949e', fontSize: '0.78rem', padding: '1rem 0.25rem 0' }}>
            <ShieldCheck size={16} color={VERDE} />
            Cada cambio en descuentos y reparto se guarda en la blockchain como un registro permanente e inalterable.
          </div>
        </>
      )}
    </div>
  );
}
