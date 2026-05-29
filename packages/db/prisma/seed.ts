// packages/db/prisma/seed.ts
// Database seeder — creates demo users for local development
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // ── Admin ─────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@prescribeflow.com' },
    update: {},
    create: {
      email: 'admin@prescribeflow.com',
      passwordHash,
      name: 'System Admin',
      role: Role.ADMIN,
      phone: '+1-000-000-0000',
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ── Doctor 1 ──────────────────────────────────────────────
  const doctor1 = await prisma.user.upsert({
    where: { email: 'dr.smith@prescribeflow.com' },
    update: {},
    create: {
      email: 'dr.smith@prescribeflow.com',
      passwordHash,
      name: 'Dr. Emily Smith',
      role: Role.DOCTOR,
      phone: '+1-555-100-0001',
      doctorProfile: {
        create: {
          specialty: 'Cardiology',
          licenseNumber: 'MD-CARD-001',
          clinicName: 'Metro Heart Clinic',
          clinicAddress: '123 Medical Drive, New York, NY 10001',
          clinicPhone: '+1-555-100-0002',
        },
      },
    },
  });
  console.log(`✅ Doctor: ${doctor1.email}`);

  // ── Doctor 2 ──────────────────────────────────────────────
  const doctor2 = await prisma.user.upsert({
    where: { email: 'dr.chen@prescribeflow.com' },
    update: {},
    create: {
      email: 'dr.chen@prescribeflow.com',
      passwordHash,
      name: 'Dr. James Chen',
      role: Role.DOCTOR,
      phone: '+1-555-200-0001',
      doctorProfile: {
        create: {
          specialty: 'Pediatrics',
          licenseNumber: 'MD-PEDI-002',
          clinicName: "St. Jude Children's Clinic",
          clinicAddress: '456 Health Avenue, Boston, MA 02101',
        },
      },
    },
  });
  console.log(`✅ Doctor: ${doctor2.email}`);

  // ── Patient 1 ─────────────────────────────────────────────
  const patient1 = await prisma.user.upsert({
    where: { email: 'jane.doe@prescribeflow.com' },
    update: {},
    create: {
      email: 'jane.doe@prescribeflow.com',
      passwordHash,
      name: 'Jane Doe',
      role: Role.PATIENT,
      phone: '+1-555-300-0001',
      patientProfile: {
        create: {
          dob: new Date('1990-04-15'),
          gender: 'FEMALE',
          bloodGroup: 'O+',
          allergies: ['Penicillin', 'Sulfa'],
          conditions: ['Hypertension', 'Type 2 Diabetes'],
          emergencyContactName: 'John Doe',
          emergencyContactPhone: '+1-555-300-0099',
        },
      },
    },
  });
  console.log(`✅ Patient: ${patient1.email}`);

  // ── Patient 2 ─────────────────────────────────────────────
  const patient2 = await prisma.user.upsert({
    where: { email: 'john.smith@prescribeflow.com' },
    update: {},
    create: {
      email: 'john.smith@prescribeflow.com',
      passwordHash,
      name: 'John Smith',
      role: Role.PATIENT,
      phone: '+1-555-400-0001',
      patientProfile: {
        create: {
          dob: new Date('1985-08-22'),
          gender: 'MALE',
          bloodGroup: 'A-',
          allergies: ['Aspirin'],
          conditions: ['Asthma'],
        },
      },
    },
  });
  console.log(`✅ Patient: ${patient2.email}`);

  // ── Medicine Catalog ──────────────────────────────────────
  const medicines = [
    {
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      category: 'Antibiotic',
      form: 'Capsule',
      strength: '500mg',
      defaultDosage: '500mg',
      defaultFrequency: 'Three times daily',
      defaultDuration: '7 days',
      commonInteractions: ['Warfarin', 'Methotrexate'],
    },
    {
      name: 'Metformin',
      genericName: 'Metformin Hydrochloride',
      category: 'Antidiabetic',
      form: 'Tablet',
      strength: '500mg',
      defaultDosage: '500mg',
      defaultFrequency: 'Twice daily',
      defaultDuration: 'Ongoing',
      commonInteractions: ['Alcohol', 'Iodine contrast'],
    },
    {
      name: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      category: 'Statin',
      form: 'Tablet',
      strength: '20mg',
      defaultDosage: '20mg',
      defaultFrequency: 'Once daily at night',
      defaultDuration: 'Ongoing',
      commonInteractions: ['Cyclosporine', 'Clarithromycin', 'Grapefruit'],
    },
    {
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      category: 'ACE Inhibitor',
      form: 'Tablet',
      strength: '10mg',
      defaultDosage: '10mg',
      defaultFrequency: 'Once daily',
      defaultDuration: 'Ongoing',
      commonInteractions: ['Potassium supplements', 'NSAIDs', 'Spironolactone'],
    },
    {
      name: 'Salbutamol',
      genericName: 'Albuterol',
      category: 'Bronchodilator',
      form: 'Inhaler',
      strength: '100mcg/dose',
      defaultDosage: '100-200mcg',
      defaultFrequency: 'As needed',
      defaultDuration: 'As needed',
      commonInteractions: ['Beta blockers', 'MAO inhibitors'],
    },
  ];

  for (const med of medicines) {
    await prisma.medicine.upsert({
      where: { id: med.name.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: {
        id: med.name.toLowerCase().replace(/ /g, '-'),
        ...med,
        brandNames: [],
        requiresPrescription: true,
        isControlled: false,
      },
    });
  }
  console.log(`✅ ${medicines.length} medicines seeded`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Credentials (password: password123)');
  console.log('   Admin:   admin@prescribeflow.com');
  console.log('   Doctor:  dr.smith@prescribeflow.com');
  console.log('   Doctor:  dr.chen@prescribeflow.com');
  console.log('   Patient: jane.doe@prescribeflow.com');
  console.log('   Patient: john.smith@prescribeflow.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
