// Test all laporan forms using native fetch API
const BASE_URL = 'http://localhost:4000/api';
let authToken = '';

async function login() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'kelompok1',
        password: 'kelompok1pass'
      })
    });
    const data = await response.json();
    // Response structure: { success: true, data: { token, user } }
    const token = data.data?.token || data.token;
    if (!token) {
      console.error('❌ Login gagal:', data);
      return false;
    }
    authToken = token;
    console.log('✅ Login berhasil dengan token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Login gagal:', error.message);
    return false;
  }
}

async function testKelahiran() {
  console.log('\n=== TEST FORM KELAHIRAN ===');
  try {
    const payload = {
      jenis: 'Kelahiran',
      tanggal: '2025-12-12',
      data: {
        nomor_indukan: 'IND-001',
        nomor_pejantan: 'PEJ-001',
        nomor_kelahiran: 'KLH-001',
        jenis_kelamin: 'Jantan',
        bobot_lahir: 2.5,
        kondisi_lahir: 'Sehat',
        catatan: 'Kelahiran normal, indukan sehat'
      }
    };

    const response = await fetch(`${BASE_URL}/laporan`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const laporan = data.data || data;
      console.log('✅ Laporan Kelahiran berhasil dibuat');
      console.log('   ID:', laporan.id);
      console.log('   Jenis:', laporan.jenis);
      return laporan.id;
    } else {
      console.error('❌ Error:', data.message || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Gagal membuat Laporan Kelahiran:', error.message);
    return null;
  }
}

async function testKematian() {
  console.log('\n=== TEST FORM KEMATIAN ===');
  try {
    const payload = {
      jenis: 'Kematian',
      tanggal: '2025-12-12',
      data: {
        nomor_ternak: 'TRK-002',
        penyebab: 'Penyakit',
        detail_penyebab: 'Terserang pneumonia akut',
        tindakan: 'Pemeriksaan post-mortem dilakukan',
        catatan: 'Ternak jantan umur 2 tahun'
      }
    };

    const response = await fetch(`${BASE_URL}/laporan`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const laporan = data.data || data;
      console.log('✅ Laporan Kematian berhasil dibuat');
      console.log('   ID:', laporan.id);
      console.log('   Jenis:', laporan.jenis);
      return laporan.id;
    } else {
      console.error('❌ Error:', data.message || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Gagal membuat Laporan Kematian:', error.message);
    return null;
  }
}

async function testKurbanAqiqah() {
  console.log('\n=== TEST FORM KURBAN-AQIQAH ===');
  try {
    const payload = {
      jenis: 'Kurban-Aqiqah',
      tanggal: '2025-12-12',
      data: {
        nomor_ternak: 'TRK-003',
        umur: 24,
        bobot: 35.5,
        jenis_kelamin: 'Jantan',
        kondisi_kesehatan: 'Sehat',
        status_siap: 'Siap',
        catatan: 'Ternak berkualitas, memenuhi standar kurban'
      }
    };

    const response = await fetch(`${BASE_URL}/laporan`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const laporan = data.data || data;
      console.log('✅ Laporan Kurban-Aqiqah berhasil dibuat');
      console.log('   ID:', laporan.id);
      console.log('   Jenis:', laporan.jenis);
      return laporan.id;
    } else {
      console.error('❌ Error:', data.message || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Gagal membuat Laporan Kurban-Aqiqah:', error.message);
    return null;
  }
}

async function testBudidayaPakan() {
  console.log('\n=== TEST FORM BUDIDAYA - PAKAN ===');
  try {
    const payload = {
      jenis: 'Budidaya',
      tanggal: '2025-12-12',
      data: {
        kategori: 'Pakan',
        jenis_pakan: 'Konsentrat Premium',
        jumlah: 50.5,
        sumber_pakan: 'Toko Pakan ABC',
        catatan: 'Pakan berkualitas tinggi, semua ternak menyukai'
      }
    };

    const response = await fetch(`${BASE_URL}/laporan`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const laporan = data.data || data;
      console.log('✅ Laporan Budidaya - Pakan berhasil dibuat');
      console.log('   ID:', laporan.id);
      console.log('   Jenis:', laporan.jenis);
      return laporan.id;
    } else {
      console.error('❌ Error:', data.message || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Gagal membuat Laporan Budidaya - Pakan:', error.message);
    return null;
  }
}

async function testBudidayaKandang() {
  console.log('\n=== TEST FORM BUDIDAYA - KANDANG ===');
  try {
    const payload = {
      jenis: 'Budidaya',
      tanggal: '2025-12-12',
      data: {
        kategori: 'Kandang',
        kondisi_kandang: 'Baik',
        kebersihan: 'Bersih',
        kapasitas: 50,
        jumlah_ternak: 35,
        catatan: 'Kandang baru direnovasi, ventilasi baik'
      }
    };

    const response = await fetch(`${BASE_URL}/laporan`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const laporan = data.data || data;
      console.log('✅ Laporan Budidaya - Kandang berhasil dibuat');
      console.log('   ID:', laporan.id);
      console.log('   Jenis:', laporan.jenis);
      return laporan.id;
    } else {
      console.error('❌ Error:', data.message || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Gagal membuat Laporan Budidaya - Kandang:', error.message);
    return null;
  }
}

async function testBudidayaKesehatan() {
  console.log('\n=== TEST FORM BUDIDAYA - KESEHATAN ===');
  try {
    const payload = {
      jenis: 'Budidaya',
      tanggal: '2025-12-12',
      data: {
        kategori: 'Kesehatan',
        kondisi_kesehatan: 'Sehat',
        program_vaksinasi: 'Vaksin ND, PMK (Bulan Desember)',
        penyakit: 'Tidak ada penyakit terdeteksi',
        tindakan_pengobatan: 'Pemeriksaan rutin dilakukan',
        catatan: 'Semua ternak dalam kondisi optimal'
      }
    };

    const response = await fetch(`${BASE_URL}/laporan`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const laporan = data.data || data;
      console.log('✅ Laporan Budidaya - Kesehatan berhasil dibuat');
      console.log('   ID:', laporan.id);
      console.log('   Jenis:', laporan.jenis);
      return laporan.id;
    } else {
      console.error('❌ Error:', data.message || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Gagal membuat Laporan Budidaya - Kesehatan:', error.message);
    return null;
  }
}

async function verifyLaporanFetched() {
  console.log('\n=== VERIFIKASI FETCH SEMUA LAPORAN ===');
  try {
    const response = await fetch(`${BASE_URL}/laporan`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    const laporanList = data.data || data;
    console.log(`✅ Total laporan kelompok1: ${laporanList.length}`);
    laporanList.slice(0, 3).forEach((lap, idx) => {
      console.log(`   ${idx + 1}. Jenis: ${lap.jenis}, Tanggal: ${lap.tanggal}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Gagal fetch laporan:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Mulai test semua form laporan...\n');

  if (!await login()) return;

  const ids = [];
  ids.push(await testKelahiran());
  ids.push(await testKematian());
  ids.push(await testKurbanAqiqah());
  ids.push(await testBudidayaPakan());
  ids.push(await testBudidayaKandang());
  ids.push(await testBudidayaKesehatan());

  await verifyLaporanFetched();

  console.log('\n' + '='.repeat(50));
  console.log('✅ SEMUA TEST SELESAI!');
  console.log('='.repeat(50));
  console.log(`Total laporan berhasil dibuat: ${ids.filter(id => id).length}/6`);
}

main().catch(console.error);
