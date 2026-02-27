# Multiplayer Blackjack 🃏

Modern ve eğlenceli bir çok oyunculu Blackjack web uygulaması.

## 🎮 Özellikler

- **3 Gerçek Oyuncu + 1 AI Kasa**
- **Multiplayer**: Supabase Database ile oyun senkronizasyonu (otomatik polling)
- **Akıllı AI Kasa**: Gemini API ile esprili yorumlar yapan AI
- **Modern UI**: Tailwind CSS ile animasyonlu arayüz
- **Oda Sistemi**: 6 haneli kod ile özel odalar oluşturun

## 🚀 Teknolojiler

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (Animasyonlar dahil)
- **Supabase** (PostgreSQL Database)
- **Gemini API** (AI)

## 📦 Kurulum

1. **Bağımlılıkları yükleyin:**

```bash
npm install
```

2. **Environment değişkenlerini ayarlayın:**

`.env.local.example` dosyasını `.env.local` olarak kopyalayın ve değerleri doldurun:

```bash
cp .env.local.example .env.local
```

Gerekli değerler:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase proje URL'niz
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key'iniz
- `GEMINI_API_KEY`: Google Gemini API key'iniz

3. **Supabase tablolarını oluşturun:**

Aşağıdaki SQL kodunu Supabase SQL Editor'de çalıştırın.

4. **Geliştirme sunucusunu başlatın:**

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🎲 Nasıl Oynanır?

1. İsminizi girin
2. Oda oluşturun veya mevcut odaya katılın
3. 3 oyuncu toplandığında oyunu başlatın
4. Sırayla kartlarınızı çekin (Hit) veya pas geçin (Stand)
5. Kasayı yenmeye çalışın!

## 📊 Supabase Tablo Yapısı

Tablolar için SQL kodları:

### rooms
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_turn INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### players
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  hand JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  is_stand BOOLEAN DEFAULT FALSE,
  is_bust BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### game_state
```sql
CREATE TABLE game_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  dealer_hand JSONB DEFAULT '[]',
  dealer_score INTEGER DEFAULT 0,
  dealer_stand BOOLEAN DEFAULT FALSE,
  deck JSONB DEFAULT '[]',
  current_player_index INTEGER DEFAULT 0,
  game_phase TEXT DEFAULT 'dealing',
  ai_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## � Veri Senkronizasyonu

Uygulama, Supabase Realtime yerine **otomatik polling** kullanır:
- Her 2 saniyede bir database'den güncel veri çeker
- Daha basit ve performanslı
- Realtime subscription gerektirmez

## 🤖 Gemini API

Google AI Studio'dan ücretsiz API key alın:
https://makersuite.google.com/app/apikey

## 📝 Lisans

MIT

## 🎉 Geliştirici

Eğlenceli bir proje! İyi oyunlar! 🎰
