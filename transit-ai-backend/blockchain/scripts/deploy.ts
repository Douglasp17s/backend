import hre from 'hardhat';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Despliega el contrato TransitPay en la red seleccionada y guarda la dirección
 * + ABI en blockchain/deployments/<red>.json para que el backend NestJS lo lea.
 */
async function main() {
  const { ethers, network, artifacts } = hre;

  const factory = await ethers.getContractFactory('TransitPay');
  const contrato = await factory.deploy();
  await contrato.waitForDeployment();

  const address = await contrato.getAddress();
  const artifact = await artifacts.readArtifact('TransitPay');

  const dir = join(__dirname, '..', 'deployments');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${network.name}.json`),
    JSON.stringify({ address, abi: artifact.abi }, null, 2),
  );

  console.log(`✅ TransitPay desplegado en ${network.name}: ${address}`);
  console.log(`   Dirección + ABI guardados en blockchain/deployments/${network.name}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
