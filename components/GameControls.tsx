'use client';

interface GameControlsProps {
  onHit: () => void;
  onStand: () => void;
  disabled: boolean;
  isPlayerTurn: boolean;
}

export default function GameControls({
  onHit,
  onStand,
  disabled,
  isPlayerTurn,
}: GameControlsProps) {
  if (!isPlayerTurn) {
    return (
      <div className="text-center text-gray-400 text-lg py-4">
        Bekleniyor...
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={onHit}
        disabled={disabled}
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        🃏 HIT
      </button>
      <button
        onClick={onStand}
        disabled={disabled}
        className="bg-gradient-to-r from-casino-red to-red-700 text-white font-bold px-8 py-4 rounded-xl text-xl hover:from-red-600 hover:to-red-800 transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        ✋ STAND
      </button>
    </div>
  );
}
