'use client';

import { Player as PlayerType } from '@/types/game';
import Card from './Card';

interface PlayerHandProps {
  player: PlayerType;
  isCurrentTurn: boolean;
  isDealer?: boolean;
  aiMessage?: string;
}

export default function PlayerHand({
  player,
  isCurrentTurn,
  isDealer = false,
  aiMessage,
}: PlayerHandProps) {
  const displayScore = player.hand.filter(c => !c.isHidden).length > 0 ? player.score : '?';

  return (
    <div
      className={`relative p-4 rounded-xl transition-all ${
        isCurrentTurn
          ? 'bg-casino-gold/20 border-4 border-casino-gold shadow-2xl scale-105'
          : 'bg-black/30 border-2 border-white/20'
      } ${player.is_bust ? 'opacity-50' : ''}`}
    >
      {/* Oyuncu Bilgisi */}
      <div className="mb-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          {isDealer && <span className="text-2xl">🤖</span>}
          <h3 className={`font-bold text-lg ${isDealer ? 'text-casino-gold' : 'text-white'}`}>
            {player.name}
          </h3>
        </div>
        
        {/* Skor */}
        <div className={`text-3xl font-bold ${player.is_bust ? 'text-red-500' : 'text-casino-gold'}`}>
          {displayScore}
          {player.is_bust && ' 💥'}
          {player.is_stand && !player.is_bust && ' ✋'}
        </div>

        {/* AI Mesajı */}
        {isDealer && aiMessage && (
          <div className="mt-2 bg-black/50 rounded-lg px-3 py-2 text-sm text-white italic">
            💬 "{aiMessage}"
          </div>
        )}
      </div>

      {/* Kartlar */}
      <div className="flex justify-center items-center min-h-[120px]">
        {player.hand.length > 0 ? (
          player.hand.map((card, index) => (
            <Card key={index} card={card} index={index} dealAnimation={false} />
          ))
        ) : (
          <div className="text-gray-400 text-sm">Kart yok</div>
        )}
      </div>

      {/* Durum İşareti */}
      {isCurrentTurn && !player.is_stand && !player.is_bust && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-casino-gold text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            SIRA SİZDE
          </div>
        </div>
      )}
    </div>
  );
}
