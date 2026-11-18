import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LotterySeed {
  name: string;
  slug: string;
  category: 'LOTERIA' | 'CHANCE' | 'ESPECIAL' | 'BALOTO';
  schedule: 'Mañana' | 'Tarde' | 'Noche';
  playDays: string;
  hasSeries?: boolean;
  hasZodiac?: boolean;
  isBaloto?: boolean;
}

const LOTTERIES_DATA: LotterySeed[] = [
  // 15 Loterías Tradicionales de Colombia
  { name: 'Lotería de Cundinamarca', slug: 'loteria-cundinamarca', category: 'LOTERIA', schedule: 'Noche', playDays: 'Lunes', hasSeries: true },
  { name: 'Lotería del Tolima', slug: 'loteria-tolima', category: 'LOTERIA', schedule: 'Noche', playDays: 'Lunes', hasSeries: true },
  { name: 'Lotería de la Cruz Roja', slug: 'loteria-cruz-roja', category: 'LOTERIA', schedule: 'Noche', playDays: 'Martes', hasSeries: true },
  { name: 'Lotería del Huila', slug: 'loteria-huila', category: 'LOTERIA', schedule: 'Noche', playDays: 'Martes', hasSeries: true },
  { name: 'Lotería de Manizales', slug: 'loteria-manizales', category: 'LOTERIA', schedule: 'Noche', playDays: 'Miércoles', hasSeries: true },
  { name: 'Lotería del Meta', slug: 'loteria-meta', category: 'LOTERIA', schedule: 'Noche', playDays: 'Miércoles', hasSeries: true },
  { name: 'Lotería del Valle', slug: 'loteria-valle', category: 'LOTERIA', schedule: 'Noche', playDays: 'Miércoles', hasSeries: true },
  { name: 'Lotería de Bogotá', slug: 'loteria-bogota', category: 'LOTERIA', schedule: 'Noche', playDays: 'Jueves', hasSeries: true },
  { name: 'Lotería del Quindío', slug: 'loteria-quindio', category: 'LOTERIA', schedule: 'Noche', playDays: 'Jueves', hasSeries: true },
  { name: 'Lotería de Medellín', slug: 'loteria-medellin', category: 'LOTERIA', schedule: 'Noche', playDays: 'Viernes', hasSeries: true },
  { name: 'Lotería de Risaralda', slug: 'loteria-risaralda', category: 'LOTERIA', schedule: 'Noche', playDays: 'Viernes', hasSeries: true },
  { name: 'Lotería de Santander', slug: 'loteria-santander', category: 'LOTERIA', schedule: 'Noche', playDays: 'Viernes', hasSeries: true },
  { name: 'Lotería de Boyacá', slug: 'loteria-boyaca', category: 'LOTERIA', schedule: 'Noche', playDays: 'Sábado', hasSeries: true },
  { name: 'Lotería del Cauca', slug: 'loteria-cauca', category: 'LOTERIA', schedule: 'Noche', playDays: 'Sábado', hasSeries: true },
  { name: 'Lotería Extra de Colombia', slug: 'loteria-extra-colombia', category: 'LOTERIA', schedule: 'Noche', playDays: 'Sábado', hasSeries: true },

  // Chances Diarios
  { name: 'Dorado Mañana', slug: 'dorado-manana', category: 'CHANCE', schedule: 'Mañana', playDays: 'Lunes a Sábado' },
  { name: 'Dorado Tarde', slug: 'dorado-tarde', category: 'CHANCE', schedule: 'Tarde', playDays: 'Lunes a Sábado' },
  { name: 'Dorado Noche', slug: 'dorado-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Lunes a Sábado' },

  { name: 'Antioqueñita Día', slug: 'antioquenita-dia', category: 'CHANCE', schedule: 'Mañana', playDays: 'Diario' },
  { name: 'Antioqueñita Tarde', slug: 'antioquenita-tarde', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },

  { name: 'Paisita Día', slug: 'paisita-dia', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },
  { name: 'Paisita Noche', slug: 'paisita-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Diario' },

  { name: 'Chontico Día', slug: 'chontico-dia', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },
  { name: 'Chontico Noche', slug: 'chontico-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Diario' },

  { name: 'Cafeterito Tarde', slug: 'cafeterito-tarde', category: 'CHANCE', schedule: 'Tarde', playDays: 'Lunes a Sábado' },
  { name: 'Cafeterito Noche', slug: 'cafeterito-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Diario' },

  { name: 'Sinuano Día', slug: 'sinuano-dia', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },
  { name: 'Sinuano Noche', slug: 'sinuano-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Diario' },

  { name: 'Caribeña Día', slug: 'caribena-dia', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },
  { name: 'Caribeña Noche', slug: 'caribena-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Diario' },

  { name: 'Fantástica Día', slug: 'fantastica-dia', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },
  { name: 'Fantástica Noche', slug: 'fantastica-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Diario' },

  { name: 'Motilón Tarde', slug: 'motilon-tarde', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },
  { name: 'Motilón Noche', slug: 'motilon-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Diario' },

  { name: 'Culona Día', slug: 'culona-dia', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },
  { name: 'Culona Noche', slug: 'culona-noche', category: 'CHANCE', schedule: 'Noche', playDays: 'Diario' },

  { name: 'Pijao de Oro', slug: 'pijao-de-oro', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },
  { name: 'Samán de la Suerte', slug: 'saman-de-la-suerte', category: 'CHANCE', schedule: 'Tarde', playDays: 'Diario' },

  // Especiales
  { name: 'Súper Astro Sol', slug: 'super-astro-sol', category: 'ESPECIAL', schedule: 'Tarde', playDays: 'Lunes a Sábado', hasZodiac: true },
  { name: 'Súper Astro Luna', slug: 'super-astro-luna', category: 'ESPECIAL', schedule: 'Noche', playDays: 'Diario', hasZodiac: true },

  // Baloto y Revancha
  { name: 'Baloto', slug: 'baloto', category: 'BALOTO', schedule: 'Noche', playDays: 'Miércoles y Sábados', isBaloto: true },
  { name: 'Baloto Revancha', slug: 'baloto-revancha', category: 'BALOTO', schedule: 'Noche', playDays: 'Miércoles y Sábados', isBaloto: true },
];

async function main() {
  console.log('--- Iniciando Seed Maestro de DataChance CO (Catálogo 100% Real, Cero Ficticios) ---');

  // 1. Limpieza total de resultados simulados anteriores
  const deletedResults = await prisma.result.deleteMany();
  console.log(`Tabla Result limpiada: ${deletedResults.count} registros eliminados.`);

  // 2. Limpieza y carga del catálogo maestro de loterías
  await prisma.lottery.deleteMany();
  console.log('Tabla Lottery limpiada.');

  for (const item of LOTTERIES_DATA) {
    const lottery = await prisma.lottery.create({
      data: {
        name: item.name,
        slug: item.slug,
        category: item.category,
        schedule: item.schedule,
        playDays: item.playDays,
        hasSeries: !!item.hasSeries,
        hasZodiac: !!item.hasZodiac,
        isBaloto: !!item.isBaloto,
      },
    });

    console.log(`Lotería registrada: ${lottery.name} [${lottery.category}] (ID: ${lottery.id})`);
  }

  console.log(`\n Catálogo maestro completado con éxito: ${LOTTERIES_DATA.length} juegos registrados.`);
  console.log(' Tabla Result se mantiene en 0 registros a la espera de sincronización con datos reales.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
