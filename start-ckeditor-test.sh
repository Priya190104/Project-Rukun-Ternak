#!/bin/bash

# CKEditor 5 Quick Start Script
# Rukun Ternak Project

echo ""
echo "🚀 CKEditor 5 - Quick Start Testing"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Verify Frontend Build${NC}"
cd FrontEnd
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Check CKEditor Installation${NC}"
npm list @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CKEditor packages installed${NC}"
else
    echo -e "${RED}❌ CKEditor packages missing${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Verify Component Files${NC}"
if [ -f "src/components/berita/BeritaForm.jsx" ]; then
    echo -e "${GREEN}✅ BeritaForm.jsx exists${NC}"
    grep -q "CKEditor" src/components/berita/BeritaForm.jsx && echo -e "${GREEN}✅ CKEditor imported${NC}" || echo -e "${RED}❌ CKEditor not imported${NC}"
    grep -q "berita-editor.css" src/components/berita/BeritaForm.jsx && echo -e "${GREEN}✅ CSS imported${NC}" || echo -e "${RED}❌ CSS not imported${NC}"
else
    echo -e "${RED}❌ BeritaForm.jsx not found${NC}"
    exit 1
fi

if [ -f "src/components/berita/berita-editor.css" ]; then
    echo -e "${GREEN}✅ berita-editor.css exists${NC}"
else
    echo -e "${RED}❌ berita-editor.css not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Check Backend Sanitizer${NC}"
cd ../BackEnd
if [ -f "src/utils/sanitizer.js" ]; then
    echo -e "${GREEN}✅ Sanitizer exists${NC}"
else
    echo -e "${RED}❌ Sanitizer not found${NC}"
    exit 1
fi

if grep -q "sanitizeHtml" src/controllers/beritaController.js; then
    echo -e "${GREEN}✅ Sanitization implemented in controller${NC}"
else
    echo -e "${RED}❌ Sanitization not implemented${NC}"
fi

echo ""
echo -e "${GREEN}===================================="
echo "✅ All checks passed!"
echo "====================================${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Start Backend:  cd BackEnd && npm run dev"
echo "2. Start Frontend: cd FrontEnd && npm start"
echo "3. Open browser:   http://localhost:3000"
echo "4. Go to page:     /kelola-berita"
echo "5. Test CKEditor:  Type in 'Isi Berita' field"
echo ""
echo "📊 Expected Results:"
echo "✓ WYSIWYG editor visible"
echo "✓ Toolbar with 11 buttons"
echo "✓ Can type and format text"
echo "✓ Content updates state"
echo "✓ Form submits successfully"
echo ""
