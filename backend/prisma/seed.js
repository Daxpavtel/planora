const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  // Trivial seed to ensure the DB isn't completely empty
  const user = await prisma.user.upsert({
    where: { email: 'demo@planora.app' },
    update: {},
    create: {
      email: 'demo@planora.app',
      name: 'Demo User',
      firstName: 'Demo',
      initials: 'DU',
    },
  });

  const trip = await prisma.trip.create({
    data: {
      name: 'Summer in Europe',
      start: new Date(),
      end: new Date(new Date().setDate(new Date().getDate() + 10)),
      dateLabel: 'July 1 - July 10',
      travellers: 2,
      estimated: 5000,
      budget: 5500,
      progress: 0,
      status: 'planning',
      style: 'Exploration',
      summary: 'A grand tour across the beautiful cities of Europe.',
      userId: user.id
    }
  });
  console.log('Created trip:', trip.id);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
