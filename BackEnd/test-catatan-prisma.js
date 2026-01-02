#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCatatan() {
  try {
    console.log('Testing catatan field in hewan_ternak...\n');

    // Create test data
    console.log('1. Creating test hewan with catatan...');
    
    // First create a user/kelompok
    const user = await prisma.user.upsert({
      where: { username: 'testuser' },
      update: {},
      create: {
        username: 'testuser',
        password: 'test123',
        fullName: 'Test User',
        role: 'kelompok'
      }
    });

    console.log(`   User created: ${user.username}`);

    // Create kelompok
    const kelompok = await prisma.kelompok.create({
      data: {
        name: `Test Kelompok ${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        kecamatan: 'Cilacap Selatan',
        desa: 'Sidakaya'
      }
    });

    console.log(`   Kelompok created: ${kelompok.name} (ID: ${kelompok.id})`);

    // Create hewan with catatan
    const hewan1 = await prisma.hewanTernak.create({
      data: {
        kelompokId: kelompok.id,
        jenisKelamin: 'JANTAN',
        ras: 'Limousin',
        tanggalLahir: new Date('2024-01-01'),
        bobot: 150,
        catatan: 'Hewan ini sangat sehat dan aktif',
        idHewan: `HW-TEST-001-${Date.now()}`
      }
    });

    console.log(`   Hewan 1 created:`);
    console.log(`     ID: ${hewan1.id}`);
    console.log(`     ID Hewan: ${hewan1.idHewan}`);
    console.log(`     Catatan: ${hewan1.catatan}`);

    // Create hewan tanpa catatan
    const hewan2 = await prisma.hewanTernak.create({
      data: {
        kelompokId: kelompok.id,
        jenisKelamin: 'BETINA',
        ras: 'Brahman',
        tanggalLahir: new Date('2023-06-01'),
        bobot: 120,
        idHewan: `HW-TEST-002-${Date.now()}`
      }
    });

    console.log(`   Hewan 2 created:`);
    console.log(`     ID: ${hewan2.id}`);
    console.log(`     ID Hewan: ${hewan2.idHewan}`);
    console.log(`     Catatan: ${hewan2.catatan || 'NULL'}`);

    // Read and verify
    console.log('\n2. Verifying catatan field...');
    
    const readHewan1 = await prisma.hewanTernak.findUnique({
      where: { id: hewan1.id }
    });

    const readHewan2 = await prisma.hewanTernak.findUnique({
      where: { id: hewan2.id }
    });

    console.log(`   Hewan 1 Catatan: ${readHewan1.catatan}`);
    console.log(`   Hewan 2 Catatan: ${readHewan2.catatan || 'NULL'}`);

    if (readHewan1.catatan === 'Hewan ini sangat sehat dan aktif' && !readHewan2.catatan) {
      console.log('\n✓ Test PASSED: Catatan field works correctly');
      process.exit(0);
    } else {
      console.log('\n✗ Test FAILED: Catatan field not working as expected');
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testCatatan();
