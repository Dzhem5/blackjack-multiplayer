'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [playerName, setPlayerName] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName.trim());
      router.push('/lobby');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-darkgreen via-casino-green to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Başlık */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-5xl font-bold text-casino-gold mb-2 drop-shadow-lg">
            BLACKJACK
          </h1>
          <p className="text-white text-lg opacity-90">
            Çok Oyunculu Kasa Oyunu
          </p>
        </div>

        {/* Form */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-casino-gold/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                Adınızı Girin
              </label>
              <input
                type="text"
                id="name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Örn: Ahmet"
                maxLength={20}
                className="w-full px-4 py-3 bg-white/10 border-2 border-casino-gold/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-casino-gold to-yellow-600 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-casino-gold transform hover:scale-105 transition-all shadow-lg"
            >
              Oyuna Başla
            </button>
          </form>

          {/* Alt Bilgi */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>3 Oyuncu + AI Kasa</p>
            <p className="mt-1">🎰 Eğlenceli & Rekabetçi</p>
          </div>
        </div>

        {/* Kurallar */}
        <div className="mt-6 text-center">
          <details className="text-gray-300 text-sm">
            <summary className="cursor-pointer hover:text-casino-gold transition-colors">
              Oyun Kuralları
            </summary>
            <div className="mt-3 bg-black/30 rounded-lg p-4 text-left space-y-2">
              <p>• 2 deste (104 kart) kullanılır</p>
              <p>• Her tur başında karıştırılır</p>
              <p>• 21'i geçmeyin!</p>
              <p>• Kasayı yenin!</p>
              <p>• AI kasa size meydan okur 🤖</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
