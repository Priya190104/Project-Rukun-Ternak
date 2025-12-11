import { createReport, getReportById, getReports } from './reportService';

describe('reportService (localStorage fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('createReport -> getReportById', async () => {
    const r = await createReport({ tanggal: '2025-12-01', jenis: 'Kelahiran', jumlah: 3, keterangan: 'test', createdBy: 'user-1' });
    expect(r).toBeDefined();
    expect(r.id).toBeTruthy();

    const loaded = await getReportById(r.id);
    expect(loaded).toBeDefined();
    expect(loaded.id).toBe(r.id);
    expect(loaded.jenis).toBe('Kelahiran');
  });

  test('getReports returns only user reports for kelompok role', async () => {
    await createReport({ tanggal: '2025-12-01', jenis: 'Kelahiran', jumlah: 2, keterangan: '', createdBy: 'user-1' });
    await createReport({ tanggal: '2025-12-02', jenis: 'Kematian', jumlah: 1, keterangan: '', createdBy: 'user-2' });

    const allAdmin = await getReports({ role: 'admin' });
    expect(allAdmin.length).toBe(2);

    const user1 = await getReports({ role: 'kelompok', userId: 'user-1' });
    expect(user1.length).toBe(1);
    expect(user1[0].createdBy).toBe('user-1');
  });
});
