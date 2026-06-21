import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── Sindicatos ──────────────────────────────────────────────────────────────
  const sindicato1 = await prisma.syndicate.upsert({
    where: { Nit: '1234567890' },
    update: {},
    create: {
      name: 'Sindicato de Transporte Urbano Norte',
      Nit: '1234567890',
      legalRepresentative: 'Carlos Mendoza',
      contactPhone: '75000001',
      contactEmail: 'norte@transit.bo',
      address: 'Av. Cañoto 123, Santa Cruz',
    },
  });

  const sindicato2 = await prisma.syndicate.upsert({
    where: { Nit: '0987654321' },
    update: {},
    create: {
      name: 'Sindicato de Transporte Urbano Sur',
      Nit: '0987654321',
      legalRepresentative: 'Ana Torres',
      contactPhone: '75000002',
      contactEmail: 'sur@transit.bo',
      address: 'Av. Santos Dumont 456, Santa Cruz',
    },
  });

  console.log('✅ Sindicatos creados');

  // ── Usuarios ─────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@transit.bo' },
    update: {},
    create: {
      email: 'admin@transit.bo',
      passwordHash: hash,
      name: 'Super Administrador',
      role: 'SUPERADMIN',
    },
  });

  const adminNorte = await prisma.user.upsert({
    where: { email: 'admin.norte@transit.bo' },
    update: {},
    create: {
      email: 'admin.norte@transit.bo',
      passwordHash: hash,
      name: 'Admin Sindicato Norte',
      role: 'SINDICATO_ADMIN',
      syndicateId: sindicato1.id,
    },
  });

  const userConductor1 = await prisma.user.upsert({
    where: { email: 'conductor1@transit.bo' },
    update: {},
    create: {
      email: 'conductor1@transit.bo',
      passwordHash: hash,
      name: 'Pedro Rojas',
      phone: '76000001',
      role: 'DRIVER',
      syndicateId: sindicato1.id,
    },
  });

  const userConductor2 = await prisma.user.upsert({
    where: { email: 'conductor2@transit.bo' },
    update: {},
    create: {
      email: 'conductor2@transit.bo',
      passwordHash: hash,
      name: 'Luis Vaca',
      phone: '76000002',
      role: 'DRIVER',
      syndicateId: sindicato1.id,
    },
  });

  const pasajero = await prisma.user.upsert({
    where: { email: 'pasajero@transit.bo' },
    update: {},
    create: {
      email: 'pasajero@transit.bo',
      passwordHash: hash,
      name: 'María García',
      phone: '77000001',
      role: 'PASSENGER',
    },
  });

  console.log('✅ Usuarios creados');

  // ── Líneas ───────────────────────────────────────────────────────────────────
  const linea1 = await prisma.busLine.upsert({
    where: { code: 'L1' },
    update: {},
    create: {
      syndicateId: sindicato1.id,
      name: 'Línea 1 — Centro / UV234',
      code: 'L1',
      description: 'Recorrido desde el centro hasta la UV234',
      fare: 2.50,
      color: '#E63946',
      operationStartTime: new Date('1970-01-01T06:00:00'),
      operationEndTime: new Date('1970-01-01T22:00:00'),
    },
  });

  const linea2 = await prisma.busLine.upsert({
    where: { code: 'L2' },
    update: {},
    create: {
      syndicateId: sindicato1.id,
      name: 'Línea 2 — Plan 3000 / Terminal Bimodal',
      code: 'L2',
      description: 'Recorrido Plan 3000 a Terminal Bimodal',
      fare: 2.50,
      color: '#457B9D',
      operationStartTime: new Date('1970-01-01T05:30:00'),
      operationEndTime: new Date('1970-01-01T23:00:00'),
    },
  });

  console.log('✅ Líneas creadas');

  // ── Rutas ────────────────────────────────────────────────────────────────────
  const rutaIda = await prisma.route.create({
    data: {
      lineId: linea1.id,
      name: 'L1 — IDA (Centro → UV234)',
      direction: 'OUTBOUND',
      totalDistanceKm: 12.5,
      estimatedTimeMin: 45,
      restTimeMin: 5,
    },
  });

  const rutaVuelta = await prisma.route.create({
    data: {
      lineId: linea1.id,
      name: 'L1 — VUELTA (UV234 → Centro)',
      direction: 'INBOUND',
      totalDistanceKm: 12.5,
      estimatedTimeMin: 45,
      restTimeMin: 5,
    },
  });

  const rutaL2 = await prisma.route.create({
    data: {
      lineId: linea2.id,
      name: 'L2 — CIRCULAR (Plan 3000 / Terminal)',
      direction: 'CIRCULAR',
      totalDistanceKm: 18.0,
      estimatedTimeMin: 60,
      restTimeMin: 10,
    },
  });

  console.log('✅ Rutas creadas');

  // ── Terminales ───────────────────────────────────────────────────────────────
  const terminalCentro = await prisma.terminal.create({
    data: {
      name: 'Terminal Centro',
      type: 'START',
      latitude: -17.7833,
      longitude: -63.1820,
      address: 'Plaza 24 de Septiembre, Santa Cruz',
      busLineId: linea1.id,
    },
  });

  const terminalUV234 = await prisma.terminal.create({
    data: {
      name: 'Terminal UV234',
      type: 'END',
      latitude: -17.7200,
      longitude: -63.1500,
      address: 'UV234, Santa Cruz',
      busLineId: linea1.id,
    },
  });

  console.log('✅ Terminales creadas');

  // ── Internos (Buses) ─────────────────────────────────────────────────────────
  const bus1 = await prisma.internal.upsert({
    where: { licensePlate: 'SCZ-0001' },
    update: {},
    create: {
      syndicateId: sindicato1.id,
      lineId: linea1.id,
      internalNumber: '101',
      licensePlate: 'SCZ-0001',
      model: 'Mercedes Benz OF-1721',
      manufactureYear: 2018,
      capacity: 40,
      operationalStatus: 'ACTIVE',
    },
  });

  const bus2 = await prisma.internal.upsert({
    where: { licensePlate: 'SCZ-0002' },
    update: {},
    create: {
      syndicateId: sindicato1.id,
      lineId: linea1.id,
      internalNumber: '102',
      licensePlate: 'SCZ-0002',
      model: 'Agrale MA 9.2',
      manufactureYear: 2020,
      capacity: 35,
      operationalStatus: 'ACTIVE',
    },
  });

  const bus3 = await prisma.internal.upsert({
    where: { licensePlate: 'SCZ-0003' },
    update: {},
    create: {
      syndicateId: sindicato1.id,
      lineId: linea2.id,
      internalNumber: '201',
      licensePlate: 'SCZ-0003',
      model: 'Volkswagen 17.230 OD',
      manufactureYear: 2019,
      capacity: 38,
      operationalStatus: 'ACTIVE',
    },
  });

  console.log('✅ Buses creados');

  // ── Conductores ──────────────────────────────────────────────────────────────
  const conductor1 = await prisma.driver.upsert({
    where: { nationalId: '7654321' },
    update: {},
    create: {
      userId: userConductor1.id,
      syndicateId: sindicato1.id,
      lineId: linea1.id,
      nationalId: '7654321',
      nationalIdExtension: 'SC',
      licenseNumber: 'LIC-001-SC',
      licenseCategory: 'C',
      licenseExpirationDate: new Date('2028-12-31'),
      credentialStatus: 'VALID',
    },
  });

  const conductor2 = await prisma.driver.upsert({
    where: { nationalId: '1234567' },
    update: {},
    create: {
      userId: userConductor2.id,
      syndicateId: sindicato1.id,
      lineId: linea1.id,
      nationalId: '1234567',
      nationalIdExtension: 'SC',
      licenseNumber: 'LIC-002-SC',
      licenseCategory: 'C',
      licenseExpirationDate: new Date('2027-06-30'),
      credentialStatus: 'VALID',
    },
  });

  console.log('✅ Conductores creados');

  // ── Turno ────────────────────────────────────────────────────────────────────
  const turno = await prisma.shift.create({
    data: {
      name: 'Turno Mañana',
      daysOfWeek: '1,2,3,4,5,6',
      startTime: new Date('1970-01-01T06:00:00'),
      endTime: new Date('1970-01-01T14:00:00'),
      expectedRounds: 8,
    },
  });

  console.log('✅ Turno creado');

  // ── Asignación y Viaje activo ────────────────────────────────────────────────
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const asignacion = await prisma.dailyAssignment.create({
    data: {
      syndicateId: sindicato1.id,
      driverId: conductor1.id,
      busId: bus1.id,
      routeId: rutaIda.id,
      shiftId: turno.id,
      date: hoy,
      startTime: new Date('1970-01-01T06:00:00'),
      endTime: new Date('1970-01-01T14:00:00'),
      status: 'IN_PROGRESS',
    },
  });

  const viaje = await prisma.trip.create({
    data: {
      assignmentId: asignacion.id,
      driverId: conductor1.id,
      busId: bus1.id,
      routeId: rutaIda.id,
      status: 'IN_PROGRESS',
    },
  });

  // Ubicaciones GPS de ejemplo
  await prisma.driverLocation.createMany({
    data: [
      { tripId: viaje.id, latitude: -17.7833, longitude: -63.1820, heading: 90, speed: 35, recordedAt: new Date(Date.now() - 300000) },
      { tripId: viaje.id, latitude: -17.7820, longitude: -63.1790, heading: 88, speed: 38, recordedAt: new Date(Date.now() - 180000) },
      { tripId: viaje.id, latitude: -17.7810, longitude: -63.1760, heading: 85, speed: 40, recordedAt: new Date(Date.now() - 60000) },
    ],
  });

  console.log('✅ Asignación y viaje activo creados');

  // ── Notificación ─────────────────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      title: 'Bienvenido a Transit AI',
      body: 'El sistema de transporte inteligente está en línea.',
      type: 'SYSTEM',
      createdById: superAdmin.id,
    },
  });

  console.log('✅ Notificación creada');

  // ── Favorito del pasajero ────────────────────────────────────────────────────
  await prisma.favoriteTrip.create({
    data: {
      userId: pasajero.id,
      alias: 'Casa → Trabajo',
      originLatitude: -17.7900,
      originLongitude: -63.1900,
      originLabel: 'Mi Casa',
      destinationLatitude: -17.7833,
      destinationLongitude: -63.1820,
      destinationLabel: 'Centro',
    },
  });

  console.log('✅ Favorito creado');

  console.log('\n🎉 Seed completado correctamente.');
  console.log('\n📋 Credenciales de acceso (password: password123):');
  console.log('   Super Admin  → admin@transit.bo');
  console.log('   Admin Norte  → admin.norte@transit.bo');
  console.log('   Conductor 1  → conductor1@transit.bo');
  console.log('   Conductor 2  → conductor2@transit.bo');
  console.log('   Pasajero     → pasajero@transit.bo');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
