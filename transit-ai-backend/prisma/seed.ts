import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const puntosRuta: Record<number, [number, number][]> = {
  1: [[-63.170335, -17.782792],[-63.171189, -17.782882],[-63.171782, -17.782936],[-63.172136, -17.782795],[-63.172197, -17.782451],[-63.172276, -17.781988],[-63.172419, -17.780853],[-63.172513, -17.780187],[-63.172609, -17.779521],[-63.172831, -17.779421],[-63.173995, -17.779694],[-63.174992, -17.779851],[-63.176729, -17.780134],[-63.177664, -17.780287],[-63.17877, -17.780457],[-63.178509, -17.781499],[-63.178337, -17.782498],[-63.178252, -17.783533],[-63.178153, -17.784542],[-63.178014, -17.78538],[-63.177796, -17.786312],[-63.17884, -17.786529],[-63.180125, -17.786742],[-63.181232, -17.786915],[-63.182301, -17.787091],[-63.183332, -17.787249],[-63.184373, -17.78739],[-63.185345, -17.787582],[-63.186242, -17.787741],[-63.18644, -17.787795],[-63.186668, -17.787892],[-63.187282, -17.78812],[-63.187739, -17.788624],[-63.18791, -17.788777],[-63.187715, -17.789441],[-63.187634, -17.789529],[-63.187556, -17.789776],[-63.187434, -17.790604],[-63.187289, -17.791654],[-63.187274, -17.791769],[-63.187208, -17.792258],[-63.187107, -17.792977],[-63.187101, -17.793126],[-63.187171, -17.793205],[-63.188001, -17.793855]],
  2: [[-63.188725,-17.794736],[-63.187611,-17.793736],[-63.187344,-17.793495],[-63.187153,-17.793408],[-63.18704,-17.793487],[-63.186783,-17.793375],[-63.186796,-17.793185],[-63.186873,-17.793071],[-63.186996,-17.792233],[-63.187061,-17.791643],[-63.187233,-17.790455],[-63.187347,-17.789761],[-63.187411,-17.789356],[-63.186398,-17.789103],[-63.18514,-17.788808],[-63.184187,-17.788572],[-63.18317,-17.788338],[-63.182164,-17.788132],[-63.181086,-17.78787],[-63.180041,-17.787589],[-63.178686,-17.78724],[-63.177644,-17.786982],[-63.176743,-17.786765],[-63.176877,-17.786001],[-63.177004,-17.785223],[-63.177101,-17.78446],[-63.177215,-17.783438],[-63.177343,-17.782398],[-63.177452,-17.781411],[-63.176498,-17.781287],[-63.174861,-17.781106],[-63.173818,-17.780992],[-63.173752,-17.781047],[-63.172604,-17.780978],[-63.172484,-17.781819],[-63.172338,-17.782832],[-63.172404,-17.783016],[-63.172292,-17.783154],[-63.172051,-17.783103],[-63.171782,-17.782936],[-63.171189,-17.782882],[-63.170335,-17.782792]],
};

function geojson(pts: [number, number][]) {
  return { type: 'LineString', coordinates: pts };
}

async function main() {
  console.log('🌱 Iniciando seed con datos sintéticos...\n');

  // SINDICATOS
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

  console.log('✅ Sindicatos creados (2)');

  // USUARIOS
  const hash = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@transit.bo' },
    update: {},
    create: { email: 'admin@transit.bo', passwordHash: hash, name: 'Super Administrador', role: 'SUPERADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'admin.norte@transit.bo' },
    update: {},
    create: { email: 'admin.norte@transit.bo', passwordHash: hash, name: 'Admin Sindicato Norte', role: 'SINDICATO_ADMIN', syndicateId: sindicato1.id },
  });

  const userConductor1 = await prisma.user.upsert({
    where: { email: 'conductor1@transit.bo' },
    update: {},
    create: { email: 'conductor1@transit.bo', passwordHash: hash, name: 'Pedro Rojas', phone: '76000001', role: 'DRIVER', syndicateId: sindicato1.id },
  });

  const userConductor2 = await prisma.user.upsert({
    where: { email: 'conductor2@transit.bo' },
    update: {},
    create: { email: 'conductor2@transit.bo', passwordHash: hash, name: 'Luis Vaca', phone: '76000002', role: 'DRIVER', syndicateId: sindicato1.id },
  });

  const pasajero1 = await prisma.user.upsert({
    where: { email: 'pasajero1@transit.bo' },
    update: {},
    create: { email: 'pasajero1@transit.bo', passwordHash: hash, name: 'María García', phone: '77000001', role: 'PASSENGER' },
  });

  const pasajero2 = await prisma.user.upsert({
    where: { email: 'pasajero2@transit.bo' },
    update: {},
    create: { email: 'pasajero2@transit.bo', passwordHash: hash, name: 'Juan López', phone: '77000002', role: 'PASSENGER' },
  });

  const pasajero3 = await prisma.user.upsert({
    where: { email: 'pasajero3@transit.bo' },
    update: {},
    create: { email: 'pasajero3@transit.bo', passwordHash: hash, name: 'Carmen Rodríguez', phone: '77000003', role: 'PASSENGER' },
  });

  console.log('✅ Usuarios creados (7)');

  // LÍNEAS
  const colores = ['#E63946','#457B9D','#2A9D8F','#E9C46A','#F4A261'];
  const lineasDef = [
    { code: 'L1', name: 'Línea 1 — Centro / UV-86', synd: sindicato1.id },
    { code: 'L2', name: 'Línea 2 — Circular Centro', synd: sindicato1.id },
    { code: 'L3', name: 'Línea 3 — Av. Busch / Terminal', synd: sindicato1.id },
    { code: 'L4', name: 'Línea 4 — UV-234 / Cristo', synd: sindicato1.id },
    { code: 'L5', name: 'Línea 5 — Norte / Equipetrol', synd: sindicato2.id },
  ];

  const lineasCreadas: any[] = [];
  for (const [i, def] of lineasDef.entries()) {
    const l = await prisma.busLine.upsert({
      where: { code: def.code },
      update: {},
      create: {
        syndicateId: def.synd,
        name: def.name,
        code: def.code,
        description: `Recorrido ${def.name}`,
        fare: 2.5,
        color: colores[i],
        operationStartTime: new Date('1970-01-01T05:30:00'),
        operationEndTime: new Date('1970-01-01T22:30:00'),
      },
    });
    lineasCreadas.push(l);
  }

  console.log('✅ Líneas creadas (5)');

  // RUTAS
  const rutasCreadas: any[] = [];

  for (let idRuta = 1; idRuta <= 6; idRuta++) {
    const lineaIdx = Math.min(idRuta - 1, lineasCreadas.length - 1);
    const linea = lineasCreadas[lineaIdx];
    const esIda = idRuta % 2 === 1;
    const pts = puntosRuta[((idRuta - 1) % 2) + 1];

    const recording = await prisma.routeRecording.create({
      data: {
        lineId: linea.id,
        method: 'KML_IMPORT',
        direction: esIda ? 'OUTBOUND' : 'INBOUND',
        recordedPoints: geojson(pts) as any,
        pointCount: pts.length,
        distanceKm: parseFloat((pts.length * 0.085).toFixed(2)),
        durationMinutes: Math.round(pts.length * 0.28),
        status: 'APPROVED',
        startedAt: new Date(),
        finishedAt: new Date(),
        approvedAt: new Date(),
      },
    });

    const ruta = await prisma.route.create({
      data: {
        lineId: linea.id,
        name: `${linea.code} — ${esIda ? 'IDA' : 'VUELTA'} (${pts.length} puntos)`,
        direction: esIda ? 'OUTBOUND' : 'INBOUND',
        totalDistanceKm: parseFloat((pts.length * 0.085).toFixed(2)),
        estimatedTimeMin: Math.round(pts.length * 0.28),
        restTimeMin: 5,
        routeRecordingId: recording.id,
      },
    });

    rutasCreadas.push(ruta);
  }

  console.log('✅ Rutas creadas (6)');

  // BUSES
  const buses: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const bus = await prisma.internal.upsert({
      where: { licensePlate: `SCZ-${String(i).padStart(4, '0')}` },
      update: {},
      create: {
        syndicateId: sindicato1.id,
        lineId: lineasCreadas[i % lineasCreadas.length].id,
        internalNumber: String(100 + i),
        licensePlate: `SCZ-${String(i).padStart(4, '0')}`,
        model: ['Mercedes Benz OF-1721', 'Agrale MA 9.2', 'Volkswagen 17.230 OD', 'Scania K-400', 'Volvo B12M'][i % 5],
        manufactureYear: 2018 + (i % 5),
        capacity: 35 + i * 2,
        operationalStatus: 'ACTIVE',
      },
    });
    buses.push(bus);
  }

  console.log('✅ Buses creados (5)');

  // CONDUCTORES
  const conductor1 = await prisma.driver.upsert({
    where: { nationalId: '7654321' },
    update: {},
    create: {
      userId: userConductor1.id,
      syndicateId: sindicato1.id,
      lineId: lineasCreadas[0].id,
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
      lineId: lineasCreadas[1].id,
      nationalId: '1234567',
      nationalIdExtension: 'SC',
      licenseNumber: 'LIC-002-SC',
      licenseCategory: 'C',
      licenseExpirationDate: new Date('2027-06-30'),
      credentialStatus: 'VALID',
    },
  });

  console.log('✅ Conductores creados (2)');

  // TURNOS
  const turnoMañana = await prisma.shift.create({
    data: {
      name: 'MANANA',
      daysOfWeek: '1,2,3,4,5,6',
      startTime: new Date('1970-01-01T06:00:00'),
      endTime: new Date('1970-01-01T14:00:00'),
      expectedRounds: 8,
    },
  });

  const turnoTarde = await prisma.shift.create({
    data: {
      name: 'TARDE',
      daysOfWeek: '1,2,3,4,5,6',
      startTime: new Date('1970-01-01T14:00:00'),
      endTime: new Date('1970-01-01T22:00:00'),
      expectedRounds: 8,
    },
  });

  console.log('✅ Turnos creados (2)');

  // ASIGNACIONES Y VIAJES
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const asignacion = await prisma.dailyAssignment.create({
    data: {
      syndicateId: sindicato1.id,
      driverId: conductor1.id,
      busId: buses[0].id,
      routeId: rutasCreadas[0].id,
      shiftId: turnoMañana.id,
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
      busId: buses[0].id,
      routeId: rutasCreadas[0].id,
      status: 'IN_PROGRESS',
    },
  });

  console.log('✅ Asignaciones diarias creadas (1), Viajes activos (1)');

  // UBICACIONES GPS
  const pts1 = puntosRuta[1];
  await prisma.driverLocation.createMany({
    data: [
      { tripId: viaje.id, latitude: pts1[0][1], longitude: pts1[0][0], heading: 90, speed: 35, recordedAt: new Date(Date.now() - 300000) },
      { tripId: viaje.id, latitude: pts1[10][1], longitude: pts1[10][0], heading: 88, speed: 38, recordedAt: new Date(Date.now() - 180000) },
      { tripId: viaje.id, latitude: pts1[20][1], longitude: pts1[20][0], heading: 85, speed: 40, recordedAt: new Date(Date.now() - 60000) },
    ],
  });

  console.log('✅ Ubicaciones GPS creadas (3)');

  // PREFERENCIAS
  for (const pasajero of [pasajero1, pasajero2, pasajero3]) {
    await prisma.userPreference.create({
      data: {
        userId: pasajero.id,
        preferredCriteria: ['FASTEST', 'LEAST_COST', 'LEAST_WALKING'][Math.floor(Math.random() * 3)],
        maxWalkingMeters: 500 + Math.random() * 500,
        maxTransfers: 1 + Math.floor(Math.random() * 2),
        learnedPatterns: { criterioUsos: { FASTEST: Math.floor(Math.random() * 10) } },
      },
    });
  }

  console.log('✅ Preferencias de usuario creadas (3)');

  // VIAJES FAVORITOS
  for (let i = 0; i < 3; i++) {
    await prisma.favoriteTrip.create({
      data: {
        userId: [pasajero1, pasajero2, pasajero3][i].id,
        alias: ['Casa → Centro', 'Centro → Universidad', 'Oficina → Casa'][i],
        originLatitude: pts1[0][1],
        originLongitude: pts1[0][0],
        originLabel: `Origen ${i + 1}`,
        destinationLatitude: pts1[10 + i * 2][1],
        destinationLongitude: pts1[10 + i * 2][0],
        destinationLabel: `Destino ${i + 1}`,
      },
    });
  }

  console.log('✅ Viajes favoritos creados (3)');

  console.log('\n' + '═'.repeat(80));
  console.log('🎉 SEED COMPLETADO CON ÉXITO');
  console.log('═'.repeat(80));
  console.log('\n📊 DATOS SINTÉTICOS CREADOS:');
  console.log('   • Sindicatos: 2');
  console.log('   • Usuarios: 7 (1 super admin, 1 admin, 2 conductores, 3 pasajeros)');
  console.log('   • Líneas: 5');
  console.log('   • Rutas: 6 (IDA/VUELTA)');
  console.log('   • Buses: 5');
  console.log('   • Conductores: 2');
  console.log('   • Turnos: 2');
  console.log('   • Asignaciones diarias: 1');
  console.log('   • Viajes activos: 1');
  console.log('   • Ubicaciones GPS: 3');
  console.log('   • Preferencias: 3');
  console.log('   • Viajes favoritos: 3');
  console.log('\n📋 CREDENCIALES (password: password123):');
  console.log('   Super Admin   → admin@transit.bo');
  console.log('   Admin Norte   → admin.norte@transit.bo');
  console.log('   Conductor 1   → conductor1@transit.bo');
  console.log('   Conductor 2   → conductor2@transit.bo');
  console.log('   Pasajero 1    → pasajero1@transit.bo');
  console.log('   Pasajero 2    → pasajero2@transit.bo');
  console.log('   Pasajero 3    → pasajero3@transit.bo\n');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
