# Netlify Deployment Guide 🚀

## Hazırlık Tamamlandı ✅

Netlify için gerekli tüm dosyalar oluşturuldu:
- `netlify.toml` - Build ayarları
- `public/_redirects` - SPA routing
- `next.config.mjs` - Static export config

## Deployment Adımları

### Yöntem 1: GitHub + Netlify (ÖNERİLEN)

1. **GitHub repo oluşturun ve push edin:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <YOUR_REPO_URL>
   git push -u origin main
   ```

2. **Netlify'da:**
   - https://app.netlify.com/ 'a gidin
   - "Add new site" > "Import an existing project"
   - GitHub'ı seçin ve repo'nuzu bulun
   - Build settings otomatik algılanacak
   - **Environment variables** ekleyin:
     - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
     - `GEMINI_API_KEY` = Your Gemini API key
   - "Deploy site" tıklayın

### Yöntem 2: Manuel Build + Drag & Drop

Eğer SWC hatası devam ediyorsa, bu adımları deneyin:

1. **SWC modülünü yeniden yükleyin:**
   ```powershell
   npm uninstall @next/swc-win32-x64-msvc
   npm install @next/swc-win32-x64-msvc --force
   ```

2. **Build çalıştırın:**
   ```powershell
   npm run build
   ```

3. **out/ klasörünü Netlify'a sürükleyin:**
   - https://app.netlify.com/drop adresine gidin
   - `out` klasörünü sürükleyip bırakın

4. **Environment variables ekleyin:**
   - Site settings > Environment variables
   - Yukarıdaki 3 değişkeni ekleyin

## Supabase Migration

Netlify'a deploy etmeden önce, Supabase'de şu SQL'i çalıştırın:

```sql
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS creator_name TEXT;
```

## Sorun Giderme

### Build Hatası
Eğer `@next/swc-win32-x64-msvc` hatası alıyorsanız:
```powershell
rm -r -fo node_modules
rm package-lock.json
npm install
npm run build
```

### Dynamic Route Hatası
Static export'ta dynamic route'lar çalışmayabilir. Bu durumda:
- GitHub yöntemiyle deploy edin (Netlify otomatik Next.js runtime kullanır)
- Veya Vercel kullanın (Next.js'in kendi platformu)

## Test

Deploy sonrası:
1. Ana sayfaya gidin ve isim girin
2. Oda oluşturun
3. Başka tarayıcılarda odaya katılın
4. Sadece oda sahibi oyunu başlatabilmeli ✅
5. Turn sistemi doğru çalışmalı ✅

---

**Not:** GitHub yöntemi çok daha kolay ve sorunsuz çalışır! 🎯
