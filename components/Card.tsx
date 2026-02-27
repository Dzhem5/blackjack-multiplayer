'use client';

import { Card as CardType } from '@/types/game';

interface CardProps {
  card: CardType;
  index: number;
  dealAnimation?: boolean;
}

export default function Card({ card, index, dealAnimation = false }: CardProps) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const isHidden = card.isHidden;

  return (
    <div
      className={`relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-lg shadow-xl transition-all duration-500 hover:scale-105 ${
        index > 0 ? '-ml-8 sm:-ml-10 md:-ml-12' : ''
      } ${dealAnimation ? 'animate-card-deal' : ''}`}
      style={{ 
        zIndex: index,
        animationDelay: `${index * 0.2}s`
      }}
    >
      {isHidden ? (
        // Kapalı kart (Arka yüz)
        <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-950 rounded-lg border-2 border-casino-gold flex items-center justify-center">
          <div className="text-casino-gold text-3xl sm:text-4xl">🃏</div>
        </div>
      ) : (
        // Açık kart
        <div className="w-full h-full bg-white rounded-lg border-2 border-gray-300 p-2 flex flex-col justify-between">
          {/* Üst - Rank ve Suit */}
          <div className="flex flex-col items-center">
            <span className={`text-lg sm:text-xl md:text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
              {card.rank}
            </span>
            <span className={`text-xl sm:text-2xl md:text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
              {card.suit}
            </span>
          </div>

          {/* Orta - Büyük Suit */}
          <div className={`text-2xl sm:text-3xl md:text-4xl text-center ${isRed ? 'text-red-600' : 'text-black'}`}>
            {card.suit}
          </div>

          {/* Alt - Rank ve Suit (Ters) */}
          <div className="flex flex-col items-center rotate-180">
            <span className={`text-lg sm:text-xl md:text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
              {card.rank}
            </span>
            <span className={`text-xl sm:text-2xl md:text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
              {card.suit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
