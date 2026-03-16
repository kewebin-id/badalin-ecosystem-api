import * as dotenv from 'dotenv';
dotenv.config();

import { clientDb as prisma } from '../../utils/db';

const main = async () => {
  const slug = process.env.DEFAULT_AGENCY;

  if (!slug) {
    throw new Error('❌ DEFAULT_AGENCY is not defined in .env');
  }

  console.log('🌱 Seeding internal agency...');

  const badalinAgency = await prisma.agency.upsert({
    where: { slug: slug },
    update: {},
    create: {
      name: 'Badalin',
      slug: slug,
      visaPrice: 0,
      isActive: true,
      createdBy: 'SYSTEM',
    },
  });

  console.log('✅ Internal agency seeded:', badalinAgency.name);
};

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
