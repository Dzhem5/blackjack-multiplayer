## 📁 Proje Dosya Yapısı

```
bjs/
├── app/
│   ├── api/
│   │   └── ai-action/
│   │       └── route.ts          # Gemini AI API endpoint
│   ├── lobby/
│   │   └── page.tsx              # Lobi sayfası (Oda oluştur/katıl)
│   ├── room/
│   │   └── [code]/
│   │       └── page.tsx          # Oyun odası sayfası (Ana oyun)
│   ├── globals.css               # Global stiller
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Ana sayfa (İsim girişi)
│
├── components/
│   ├── Card.tsx                  # Kart komponenti (Animasyonlu)
│   ├── GameControls.tsx          # Hit/Stand butonları
│   └── PlayerHand.tsx            # Oyuncu eli ve bilgileri
│
├── lib/
│   ├── gameLogic.ts              # Oyun mantığı ve yardımcılar
│   ├── gemini.ts                 # Gemini AI entegrasyonu
│   └── supabase.ts               # Supabase client
│
├── types/
│   └── game.ts                   # TypeScript tipleri
│
├── .env.local.example            # Environment örneği
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md                     # Proje dokümantasyonu
├── supabase-schema.sql           # Supabase SQL kodları
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Özellikler

✅ 3 Gerçek Oyuncu + 1 AI Kasa
✅ Multiplayer (Supabase + Polling)
✅ Animasyonlu Kartlar (CSS)
✅ AI Yorumlar (Gemini API)
✅ Oda Sistemi (6 haneli kod)
✅ Modern Casino Teması
✅ TypeScript + Next.js 15
