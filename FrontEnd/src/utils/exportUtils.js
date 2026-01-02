/**
 * Export utilities untuk Laporan
 * Supports: CSV (Excel), PDF (via print)
 */

import * as XLSX from 'xlsx';

export const exportToCSV = (data, filename = 'laporan.xlsx') => {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport');
    return;
  }

  // Prepare data for Excel
  const excelData = data.map(item => ({
    'ID': item.id,
    'Jenis': item.jenis || '-',
    'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
    'Kelompok': item.kelompok_name || item.kelompok || '-',
    'Dibuat Oleh': item.full_name || item.created_by || '-',
    'Keterangan': (item.data && typeof item.data === 'object') 
      ? Object.entries(item.data)
          .slice(0, 2)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')
      : '-'
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = [
    { wch: 10 },  // ID
    { wch: 18 },  // Jenis
    { wch: 16 },  // Tanggal
    { wch: 22 },  // Kelompok
    { wch: 22 },  // Dibuat Oleh
    { wch: 35 }   // Keterangan
  ];
  ws['!cols'] = colWidths;

  // Style header row and all cells
  const headerRange = XLSX.utils.decode_range(ws['!ref']);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, size: 12 },
      fill: { fgColor: { rgb: '059669' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
    };
  }

  // Add borders and alternate row colors
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[address]) continue;
      ws[address].s = ws[address].s || {};
      ws[address].s.border = {
        top: { style: 'thin', color: { rgb: 'CCCCCC' } },
        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
        left: { style: 'thin', color: { rgb: 'CCCCCC' } },
        right: { style: 'thin', color: { rgb: 'CCCCCC' } }
      };
      
      // Alternate row colors (header tetap hijau)
      if (R > 0) {
        if (R % 2 === 0) {
          ws[address].s.fill = { fgColor: { rgb: 'F9FAFB' } };
        }
        ws[address].s.alignment = { vertical: 'center', wrapText: true };
      }
    }
  }

  // Set row height for header
  ws['!rows'] = [{ hpx: 25 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  
  // Add metadata
  wb.Props = {
    Title: 'Laporan Ternak Rukun Ternak',
    Author: 'Rukun Ternak',
    CreatedDate: new Date()
  };

  XLSX.writeFile(wb, filename);
};

export const exportToPDF = (data) => {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport');
    return;
  }

  // Create HTML table
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Laporan Ternak</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background-color: white;
        }
        h1 {
          color: #333;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        thead {
          background-color: #059669;
          color: white;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>Laporan Ternak Rukun Ternak</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Jenis</th>
            <th>Tanggal</th>
            <th>Kelompok</th>
            <th>Dibuat Oleh</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach(item => {
    htmlContent += `
      <tr>
        <td>${item.id}</td>
        <td>${item.jenis || '-'}</td>
        <td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
        <td>${item.kelompok_name || '-'}</td>
        <td>${item.full_name || '-'}</td>
      </tr>
    `;
  });

  htmlContent += `
        </tbody>
      </table>
      <div class="footer">
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <p>© Rukun Ternak - Sistem Manajemen Ternak</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Auto-trigger print dialog
  setTimeout(() => {
    printWindow.print();
  }, 250);
};
