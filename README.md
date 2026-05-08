# Student Coaching Platform

Öğrenci koçluk sistemi için React + Vite frontend ve Express tabanlı yerel backend.

## Kurulum

Frontend:

```bash
cd frontend
npm install
npm run dev -- --host
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Varsayılan adresler

- Frontend: http://localhost:3000/student-coaching-platform/
- Backend API: http://localhost:4000/api

## Özellikler

- Ana sayfa ve kurs listeleme
- Kayıt ve giriş akışı
- Dashboard ve profil ekranı
- Ödeme formu ve ödeme geçmişi
- JWT tabanlı korumalı rotalar

## Not

Backend artık SQLite ile kalıcı veri kullanır. Veriler `backend/data/app.db` içinde tutulur ve sunucu yeniden başlasa da korunur.

## GitHub Pages

Frontend GitHub Pages'e açılabilir. Bu sürümde rota yapısı HashRouter ile uyumludur.

### Otomatik Yayınlama

GitHub Actions workflow (`/.github/workflows/deploy.yml`) ayarlandı. Her push'ta frontend otomatik olarak build edilerek GitHub Pages'e yayınlanacak.

**Yayım adresi:** https://ultimate-09.github.io/student-coaching-platform/

### Canlı Backend Bağlantısı

Frontend'in canlı backend API'ye bağlanması için GitHub Pages ortam değişkenini ayarlaman gerekir:

1. GitHub reposu → **Settings** → **Environments** → **github-pages**
2. **Environment variables** bölümüne yeni bir değişken ekle:
   - Adı: `VITE_API_URL`
   - Değeri: `https://your-backend-domain.com/api` (kendi backend adresin)

Ya da `.env.production` dosyası oluştur:
```bash
cp frontend/.env.example frontend/.env.production
# Sonra VITE_API_URL'i canlı backend adresine güncelle
```

### Test Etme

Yerelde:
- `VITE_API_URL` tanımlı değilse istekler `/api` üzerinden lokal backend'e gider
- Build: `cd frontend && npm run build`
- Preview: `npm run preview`

### Not

GitHub Pages sadece statik frontend sunar. Backend'i ayrı bir sunucu/servis olarak yayınlamalısın (Heroku, Railway, Vercel, AWS, vb.).
