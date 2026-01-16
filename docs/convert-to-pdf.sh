#!/bin/bash

# Liphant Documentation - Convert Markdown to PDF
# Requires: pandoc and a LaTeX engine (xelatex recommended)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "📄 Liphant Documentation - PDF Generator"
echo "========================================="

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo -e "${RED}Error: pandoc is not installed${NC}"
    echo "Install with: brew install pandoc (macOS) or apt-get install pandoc (Ubuntu)"
    exit 1
fi

# Create output directory
mkdir -p pdf
mkdir -p pdf/guides

echo -e "\n${YELLOW}Converting documents...${NC}\n"

# Convert main guide
echo "Converting LIPHANT_PRODUCT_GUIDE.md..."
pandoc LIPHANT_PRODUCT_GUIDE.md \
    -o pdf/LIPHANT_PRODUCT_GUIDE.pdf \
    --pdf-engine=xelatex \
    -V geometry:margin=1in \
    -V fontsize=11pt \
    --toc \
    --toc-depth=2 \
    -V colorlinks=true \
    -V linkcolor=blue \
    -V urlcolor=blue \
    && echo -e "${GREEN}✓ LIPHANT_PRODUCT_GUIDE.pdf${NC}" \
    || echo -e "${RED}✗ Failed to convert LIPHANT_PRODUCT_GUIDE.md${NC}"

# Convert quick start guides
for guide in guides/*.md; do
    filename=$(basename "$guide" .md)
    echo "Converting $filename.md..."
    pandoc "$guide" \
        -o "pdf/guides/${filename}.pdf" \
        --pdf-engine=xelatex \
        -V geometry:margin=1in \
        -V fontsize=11pt \
        -V colorlinks=true \
        -V linkcolor=blue \
        -V urlcolor=blue \
        && echo -e "${GREEN}✓ ${filename}.pdf${NC}" \
        || echo -e "${RED}✗ Failed to convert ${filename}.md${NC}"
done

echo -e "\n${GREEN}Done!${NC}"
echo "PDF files are in the ./pdf directory"
echo ""
echo "Files generated:"
ls -la pdf/*.pdf 2>/dev/null
ls -la pdf/guides/*.pdf 2>/dev/null
