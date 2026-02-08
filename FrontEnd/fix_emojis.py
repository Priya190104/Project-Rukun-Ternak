import os
import re

files = [
    'src/pages/ClientPilihJenisLaporan.jsx',
    'src/pages/ClientDashboard.jsx',
    'src/components/layout/AppLayout.jsx',
    'src/components/LaporanProgressCard.jsx',
    'src/components/kelompok/MapPickerKelompok.jsx',
    'src/components/kelompok/ListKelompokMap.jsx'
]

replacements = [
    ('âš ï¸', '⚠️'),
    ('âœ"', '✓'),
    ('âœ…', '✅'),
    ('âŒ', '❌'),
    ('â†'', '↑'),
    ('â„¹ï¸', 'ℹ️'),
    ('â€¢', '•'),
    ('ðŸ"', '📍'),
    ('ðŸ'', '👶'),
    ('ðŸ'°', '💰'),
    ('ðŸ"Š', '📊'),
    ('ðŸ"‹', '📋'),
    ('ðŸŒ±', '🌱'),
    ('ðŸ"'', '🏡'),
    ('ðŸ"Œ', 'ℹ️'),
    ('ðŸ"…', '📅'),
    ('ðŸ'¨', '👨'),
    ('ðŸ ', '🏠'),
    ('ðŸ'¡', '💡'),
    ('ðŸ"§', '📧'),
    ('â™‚ï¸', '♂️'),
    ('â™€ï¸', '♀️'),
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements:
            content = content.replace(old, new)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'✅ Perbaiki: {file_path}')
    else:
        print(f'⚠️ File tidak ditemukan: {file_path}')

print('\n✅ Semua file telah diperbaiki!')
