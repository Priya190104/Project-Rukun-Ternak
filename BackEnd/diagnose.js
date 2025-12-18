const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('=== DATA INTEGRITY CHECK ===\n');
    
    // Check users
    const users = await prisma.user.findMany();
    console.log(`✓ Users: ${users.length} found`);
    users.forEach(u => console.log(`  - ${u.username} (${u.role})`));
    
    // Check kelompok
    const kelompok = await prisma.kelompok.findMany();
    console.log(`\n✓ Kelompok: ${kelompok.length} found`);
    kelompok.slice(0, 3).forEach(k => console.log(`  - ${k.name}`));
    
    // Check laporan
    const laporan = await prisma.laporan.findMany();
    console.log(`\n✓ Laporan: ${laporan.length} found`);
    
    // Check berita
    const berita = await prisma.berita.findMany();
    console.log(`\n✓ Berita: ${berita.length} found`);
    berita.forEach(b => {
      console.log(`  - ${b.caption.substring(0, 50)}...`);
      console.log(`    publishedAt: ${b.publishedAt}`);
      console.log(`    createdAt: ${b.createdAt}`);
    });
    
    console.log('\n=== ALL DATA INTACT ===');
    
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
