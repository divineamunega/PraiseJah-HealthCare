import { PrismaClient, Role, ActiveStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@praisejah.com';
  const adminPassword = 'AdminPassword123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: passwordHash,
      firstName: 'Demo',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      status: ActiveStatus.ACTIVE,
    },
  });

  console.log('Seed successful. Admin user ready:');
  console.log(`- Email: ${admin.email}`);
  console.log(`- Role: ${admin.role}`);
  console.log(`- Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
