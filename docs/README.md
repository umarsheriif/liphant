# Liphant Documentation

## Product Guides

This folder contains product documentation and guides for sharing with users.

### Main Document

- **[LIPHANT_PRODUCT_GUIDE.md](./LIPHANT_PRODUCT_GUIDE.md)** - Complete platform guide covering all features for all user types

### Quick Start Guides

Located in `./guides/`:

| Guide | Audience | Description |
|-------|----------|-------------|
| [PARENT_QUICK_START.md](./guides/PARENT_QUICK_START.md) | Parents | How to find teachers and book sessions |
| [TEACHER_QUICK_START.md](./guides/TEACHER_QUICK_START.md) | Teachers | How to join and start receiving bookings |
| [CENTER_QUICK_START.md](./guides/CENTER_QUICK_START.md) | Centers | How to register and manage your center |
| [LIPHANT_ONE_PAGER.md](./guides/LIPHANT_ONE_PAGER.md) | Everyone | One-page overview for quick sharing |

---

## Converting to PDF

### Option 1: Using Pandoc (Recommended)

Install Pandoc:
```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt-get install pandoc
```

Convert to PDF:
```bash
# Main guide
pandoc LIPHANT_PRODUCT_GUIDE.md -o LIPHANT_PRODUCT_GUIDE.pdf --pdf-engine=xelatex

# Quick start guides
pandoc guides/PARENT_QUICK_START.md -o guides/PARENT_QUICK_START.pdf --pdf-engine=xelatex
pandoc guides/TEACHER_QUICK_START.md -o guides/TEACHER_QUICK_START.pdf --pdf-engine=xelatex
pandoc guides/CENTER_QUICK_START.md -o guides/CENTER_QUICK_START.pdf --pdf-engine=xelatex
pandoc guides/LIPHANT_ONE_PAGER.md -o guides/LIPHANT_ONE_PAGER.pdf --pdf-engine=xelatex
```

### Option 2: Using VS Code

1. Install "Markdown PDF" extension
2. Open the markdown file
3. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
4. Type "Markdown PDF: Export (pdf)"
5. PDF will be generated

### Option 3: Using Online Tools

1. Go to https://md2pdf.netlify.app/ or https://www.markdowntopdf.com/
2. Paste the markdown content
3. Download the PDF

### Option 4: Using GitHub

1. Push these docs to GitHub
2. View the markdown file
3. Print to PDF from browser (Cmd+P / Ctrl+P)

---

## Sharing Guides

### Email/WhatsApp Sharing Strategy

| Audience | Document to Share |
|----------|-------------------|
| Quick overview | LIPHANT_ONE_PAGER.pdf |
| New teachers | TEACHER_QUICK_START.pdf |
| New centers | CENTER_QUICK_START.pdf |
| New parents | PARENT_QUICK_START.pdf |
| Detailed info | LIPHANT_PRODUCT_GUIDE.pdf |

### Suggested Message Templates

**For Teachers:**
```
مرحباً! 👋

نود دعوتك للانضمام إلى Liphant - منصة مصر الأولى لخدمات العلاج لذوي الاحتياجات الخاصة.

✅ وصول لآلاف العائلات
✅ حدد أسعارك ومواعيدك
✅ احصل على شارة التحقق
✅ تتبع أرباحك

ابدأ الآن: liphant.co/register

📄 الدليل المرفق يشرح كل شيء!
```

**For Centers:**
```
مرحباً! 👋

انضم لـ Liphant وحوّل مركزك العلاجي رقمياً!

✅ ملف تعريفي احترافي
✅ حجوزات أونلاين 24/7
✅ إدارة الفريق والخدمات
✅ تحليلات وتقارير

سجّل الآن: liphant.co/register

📄 الدليل المرفق يوضح الخطوات!
```

**For Parents:**
```
مرحباً! 👋

Liphant يساعدك في إيجاد أفضل معلمي ومراكز العلاج لطفلك.

✅ 500+ معلم معتمد
✅ 50+ مركز علاجي
✅ حجز سهل وسريع
✅ تقييمات ومراجعات

ابدأ البحث: liphant.co/teachers

📄 الدليل المرفق يشرح كيفية الاستخدام!
```

---

## Document Versions

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release |

---

## Contact

For questions about these documents:
- Email: support@liphant.co
