import { PrismaClient, Role, ActiveStatus, Sex } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  console.log('--- SEEDING USERS ---');
  const users = [
    { email: 'admin@praisejah.com', firstName: 'System', lastName: 'Admin', role: Role.SUPER_ADMIN },
    { email: 'manager@demo.com', firstName: 'Hospital', lastName: 'Manager', role: Role.ADMIN },
    { email: 'doctor@demo.com', firstName: 'Gregory', lastName: 'House', role: Role.DOCTOR },
    { email: 'nurse@demo.com', firstName: 'Florence', lastName: 'Nightingale', role: Role.NURSE },
    { email: 'secretary@demo.com', firstName: 'Pam', lastName: 'Beesly', role: Role.SECRETARY },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: { status: ActiveStatus.ACTIVE },
      create: { ...userData, passwordHash, status: ActiveStatus.ACTIVE },
    });
    console.log(`✔ [${userData.role}] ${userData.email}`);
  }

  console.log('\n--- SEEDING PATIENTS ---');
  const patients = [
    { firstName: 'Elizabeth', lastName: 'Anderson', dateOfBirth: new Date('1985-05-12'), sex: Sex.FEMALE },
    { firstName: 'Jonathan', lastName: 'Harker', dateOfBirth: new Date('1972-11-20'), sex: Sex.MALE },
    { firstName: 'Mina', lastName: 'Murray', dateOfBirth: new Date('1988-02-14'), sex: Sex.FEMALE },
    { firstName: 'Arthur', lastName: 'Holmwood', dateOfBirth: new Date('1965-09-30'), sex: Sex.MALE },
    { firstName: 'Quincey', lastName: 'Morris', dateOfBirth: new Date('1990-07-04'), sex: Sex.OTHER },
    { firstName: 'Lucy', lastName: 'Westenra', dateOfBirth: new Date('1995-12-25'), sex: Sex.FEMALE },
    { firstName: 'Abraham', lastName: 'Van Helsing', dateOfBirth: new Date('1945-03-15'), sex: Sex.MALE },
  ];

  for (const patientData of patients) {
    const patient = await prisma.patient.create({
      data: patientData,
    });
    console.log(`✔ [PATIENT] Created: ${patient.firstName} ${patient.lastName}`);
  }

  console.log('\n--- SEED COMPLETE ---');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
