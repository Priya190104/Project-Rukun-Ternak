const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('\n✅ CONNECTING TO DATABASE...\n');

    // 1. Ambil semua user
    const users = await prisma.user.findMany({
      include: {
        kelompok: true
      },
      orderBy: { id: 'asc' }
    });

    console.log('👥 === SEMUA USER ===\n');
    if (users.length === 0) {
      console.log('❌ Tidak ada user ditemukan');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Nama: ${user.fullName || 'N/A'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Kelompok: ${user.kelompok?.name || 'Belum ada'}`);
        console.log('');
      });
    }

    // 2. Statistik user
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 === STATISTIK USER ===\n`);
    console.log(`Total User: ${totalUsers}`);

    // 3. User per role
    const userByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });
    
    console.log('\nUser Per Role:');
    userByRole.forEach(item => {
      console.log(`  - ${item.role}: ${item._count}`);
    });

    // 4. User per kelompok
    const userByKelompok = await prisma.user.groupBy({
      by: ['kelompokId'],
      _count: true
    });
    
    console.log('\nUser Per Kelompok:');
    for (const item of userByKelompok) {
      if (item.kelompokId) {
        const kelompok = await prisma.kelompok.findUnique({
          where: { id: item.kelompokId }
        });
        console.log(`  - ${kelompok?.name}: ${item._count} user`);
      } else {
        console.log(`  - Belum ada kelompok: ${item._count} user`);
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Database disconnected\n');
  }
}

checkUsers();
