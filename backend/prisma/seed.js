require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/hash');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Default admin credentials
  const adminEmail = 'admin@storeratingapp.com';
  const adminPassword = 'Admin@123456';
  const adminName = 'System Administrator User';
  const adminAddress = '123 Admin Street, System City, Admin State 00000';

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log('ℹ️  Admin user already exists — skipping seed.');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    return;
  }

  const hashed = await hashPassword(adminPassword);

  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      address: adminAddress,
      role: 'ADMIN',
    },
  });

  console.log('✅ Default admin user created successfully!');
  console.log('');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│          DEFAULT ADMIN CREDENTIALS           │');
  console.log('├─────────────────────────────────────────────┤');
  console.log(`│  Email:    ${adminEmail}   │`);
  console.log(`│  Password: ${adminPassword}              │`);
  console.log('└─────────────────────────────────────────────┘');
  console.log('');
  console.log('⚠️  Please change these credentials after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
