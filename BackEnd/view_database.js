const { PrismaClient } = require('@prisma/client');

async function viewDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('\n========== 📊 DATABASE OVERVIEW ==========\n');

    // 1. Count semua tabel
    const userCount = await prisma.user.count();
    const kelompokCount = await prisma.kelompok.count();
    const laporanCount = await prisma.laporan.count();
    const hewanCount = await prisma.hewanTernak.count();
    const beritaCount = await prisma.berita.count();
    const bannerCount = await prisma.banner.count();

    console.log(`👤 Users: ${userCount}`);
    console.log(`🐄 Kelompok: ${kelompokCount}`);
    console.log(`📊 Laporan: ${laporanCount}`);
    console.log(`🐑 Hewan Ternak: ${hewanCount}`);
    console.log(`📰 Berita: ${beritaCount}`);
    console.log(`🖼️  Banner: ${bannerCount}`);

    console.log('\n========== 👥 USERS ==========\n');
    const users = await prisma.user.findMany({
      include: { kelompok: true },
      orderBy: { id: 'asc' }
    });

    if (users.length === 0) {
      console.log('Tidak ada user');
    } else {
      console.table(users.map(u => ({
        ID: u.id,
        Username: u.username,
        'Nama': u.fullName,
        'Role': u.role,
        'Kelompok': u.kelompok?.name || '-'
      })));
    }

    console.log('\n========== 🐄 KELOMPOK ==========\n');
    const kelompok = await prisma.kelompok.findMany({
      orderBy: { id: 'asc' }
    });

    if (kelompok.length === 0) {
      console.log('Tidak ada kelompok');
    } else {
      console.table(kelompok.map(k => ({
        ID: k.id,
        'Nama': k.name,
        'Email': k.email,
        'Kecamatan': k.kecamatan,
        'Desa': k.desa,
        'PIC 1': k.pic1Nama
      })));
    }

    console.log('\n========== 📰 BERITA ==========\n');
    const berita = await prisma.berita.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (berita.length === 0) {
      console.log('Tidak ada berita');
    } else {
      console.table(berita.map(b => ({
        ID: b.id,
        'Caption': b.caption.substring(0, 40),
        'Slug': b.slug,
        'Published': b.publishedAt ? 'Ya' : 'Belum',
        'Created': new Date(b.createdAt).toLocaleDateString('id-ID')
      })));
    }

    console.log('\n========== 📊 LAPORAN TERBARU ==========\n');
    const laporan = await prisma.laporan.findMany({
      orderBy: { tanggal: 'desc' },
      take: 10
    });

    if (laporan.length === 0) {
      console.log('Tidak ada laporan');
    } else {
      console.table(laporan.map(l => ({
        ID: l.id,
        'Jenis': l.jenis,
        'Kelompok': l.kelompok,
        'User ID': l.userId,
        'Tanggal': new Date(l.tanggal).toLocaleDateString('id-ID')
      })));
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Done\n');
  }
}

viewDatabase();
