'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Player, Room, GameState, Card as CardType } from '@/types/game';
import { createDeck, calculateHandScore } from '@/lib/gameLogic';
import PlayerHand from '@/components/PlayerHand';
import GameControls from '@/components/GameControls';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);

  // Oda ve oyuncuları yükle
  const loadRoomData = async () => {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (roomError || !roomData) {
        throw new Error('Oda bulunamadı');
      }

      setRoom(roomData);

      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id)
        .order('position');

      setPlayers(playersData || []);

      // Mevcut oyuncuyu bul (sadece ilk yüklemede)
      if (!currentPlayerId) {
        const name = localStorage.getItem('playerName');
        if (name) {
          setPlayerName(name);
          const currentPlayer = playersData?.find(p => p.name === name);
          if (currentPlayer) {
            setCurrentPlayerId(currentPlayer.id);
          }
        }
      }

      // Oyun state'ini yükle
      const { data: gameData } = await supabase
        .from('game_state')
        .select('*')
        .eq('room_id', roomData.id)
        .single();

      if (gameData) {
        setGameState(gameData);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadRoomData();
  }, [roomCode]);

  // Polling: Her 2 saniyede bir veriyi güncelle
  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(() => {
      loadRoomData();
    }, 2000); // 2 saniye

    return () => clearInterval(interval);
  }, [polling, roomCode]);

  // Oyunu başlat
  const startGame = async () => {
    if (!room || players.length < 3) return;

    try {
      const deck = createDeck();
      const dealerHand: CardType[] = [
        deck[0],
        { ...deck[1], isHidden: true }, // Kasanın ikinci kartı kapalı
      ];
      
      let deckIndex = 2;

      // Oyuncuları position'a göre sırala
      const sortedPlayers = [...players].sort((a, b) => a.position - b.position);

      // Her oyuncuya 2 kart dağıt (sırayla)
      for (const player of sortedPlayers) {
        const hand = [deck[deckIndex++], deck[deckIndex++]];
        const score = calculateHandScore(hand);
        
        await supabase
          .from('players')
          .update({
            hand,
            score,
            is_active: true,
            is_stand: false,
            is_bust: false,
          })
          .eq('id', player.id);
      }

      // Game state oluştur
      await supabase.from('game_state').insert({
        room_id: room.id,
        dealer_hand: dealerHand,
        dealer_score: calculateHandScore([dealerHand[0]]), // Sadece açık kartı hesapla
        dealer_stand: false,
        deck: deck.slice(deckIndex),
        current_player_index: 0,
        game_phase: 'player_turns',
        ai_message: 'Hadi bakalım, şansınızı deneyin! 🎰',
      });

      // Oda durumunu güncelle
      await supabase
        .from('rooms')
        .update({ status: 'playing', current_turn: 0 })
        .eq('id', room.id);

    } catch (err: any) {
      setError('Oyun başlatılamadı: ' + err.message);
    }
  };

  // Hit
  const handleHit = async () => {
    if (!gameState || !room || !currentPlayerId) return;

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    if (!currentPlayer || currentPlayer.is_stand || currentPlayer.is_bust) return;

    try {
      const newCard = gameState.deck[0];
      const newHand = [...currentPlayer.hand, newCard];
      const newScore = calculateHandScore(newHand);
      const isBust = newScore > 21;

      await supabase
        .from('players')
        .update({
          hand: newHand,
          score: newScore,
          is_bust: isBust,
        })
        .eq('id', currentPlayerId);

      await supabase
        .from('game_state')
        .update({
          deck: gameState.deck.slice(1),
        })
        .eq('room_id', room.id);

      // Eğer bust olduysa otomatik olarak sırayı geç
      if (isBust) {
        setTimeout(() => moveToNextPlayer(), 1000);
      }
    } catch (err: any) {
      console.error('Hit hatası:', err);
    }
  };

  // Stand
  const handleStand = async () => {
    if (!gameState || !room || !currentPlayerId) return;

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return;

    try {
      await supabase
        .from('players')
        .update({ is_stand: true })
        .eq('id', currentPlayerId);

      // Sırayı geç
      setTimeout(() => moveToNextPlayer(), 500);
    } catch (err: any) {
      console.error('Stand hatası:', err);
    }
  };

  // Bir sonraki oyuncuya geç
  const moveToNextPlayer = async () => {
    if (!gameState || !room) return;

    try {
      // Tüm oyuncuları kontrol et - kimler hala aktif?
      const { data: allPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .order('position');

      if (!allPlayers) return;

      // Tüm oyuncular stand veya bust mu?
      const allDone = allPlayers.every(p => p.is_stand || p.is_bust);

      if (allDone) {
        // Tüm oyuncular bitti, dealer sırası
        await handleDealerTurn();
      } else {
        // Bir sonraki aktif oyuncuyu bul
        let nextIndex = gameState.current_player_index + 1;
        
        // Sıralamayı dağıtma (0, 1, 2 gibi)
        while (nextIndex < allPlayers.length) {
          const nextPlayer = allPlayers[nextIndex];
          if (!nextPlayer.is_stand && !nextPlayer.is_bust) {
            // Bu oyuncu aktif, sırayı ona ver
            await supabase
              .from('game_state')
              .update({ current_player_index: nextIndex })
              .eq('room_id', room.id);
            return;
          }
          nextIndex++;
        }

        // Eğer buraya geldiyse, baştan başlayıp tekrar kontrol et
        // Ama bu durumda zaten allDone true olmalıydı
        await handleDealerTurn();
      }
    } catch (err: any) {
      console.error('Sıra geçiş hatası:', err);
    }
  };

  // Dealer sırası
  const handleDealerTurn = async () => {
    if (!gameState || !room) return;

    try {
      await supabase
        .from('game_state')
        .update({ game_phase: 'dealer_turn' })
        .eq('room_id', room.id);

      // Kapalı kartı aç
      const dealerHand = gameState.dealer_hand.map(c => ({ ...c, isHidden: false }));
      let dealerScore = calculateHandScore(dealerHand);

      await supabase
        .from('game_state')
        .update({
          dealer_hand: dealerHand,
          dealer_score: dealerScore,
        })
        .eq('room_id', room.id);

      // Dealer 17'ye kadar kart çeker (basit kural)
      let currentDeck = [...gameState.deck];
      let currentHand = [...dealerHand];

      while (dealerScore < 17) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newCard = currentDeck[0];
        currentHand.push(newCard);
        currentDeck = currentDeck.slice(1);
        dealerScore = calculateHandScore(currentHand);

        await supabase
          .from('game_state')
          .update({
            dealer_hand: currentHand,
            dealer_score: dealerScore,
            deck: currentDeck,
            ai_message: dealerScore > 21 ? 'Battım! 😔' : 'Bir tane daha! 🎲',
          })
          .eq('room_id', room.id);
      }

      // Oyunu bitir
      await supabase
        .from('game_state')
        .update({
          game_phase: 'finished',
          dealer_stand: true,
          ai_message: dealerScore > 21 ? 'Kaybettim! Tebrikler! 🎉' : 'Hadi bakalım kim kazandı? 🤔',
        })
        .eq('room_id', room.id);

      await supabase
        .from('rooms')
        .update({ status: 'finished' })
        .eq('id', room.id);

    } catch (err: any) {
      console.error('Dealer turn hatası:', err);
    }
  };

  // Yeni oyun
  const handleNewGame = async () => {
    if (!room) return;

    try {
      // Oyuncuları sıfırla
      for (const player of players) {
        await supabase
          .from('players')
          .update({
            hand: [],
            score: 0,
            is_stand: false,
            is_bust: false,
            is_active: true,
          })
          .eq('id', player.id);
      }

      // Game state'i sil
      await supabase
        .from('game_state')
        .delete()
        .eq('room_id', room.id);

      // Oda durumunu sıfırla
      await supabase
        .from('rooms')
        .update({ status: 'waiting', current_turn: 0 })
        .eq('id', room.id);

      setGameState(null);
    } catch (err: any) {
      setError('Yeni oyun başlatılamadı: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-casino-darkgreen via-casino-green to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-casino-darkgreen via-casino-green to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => router.push('/lobby')}
            className="bg-casino-gold text-black px-6 py-2 rounded-lg font-bold"
          >
            Lobiye Dön
          </button>
        </div>
      </div>
    );
  }

  const isWaiting = room?.status === 'waiting';
  const isPlaying = room?.status === 'playing';
  const isFinished = room?.status === 'finished';
  const isRoomOwner = room?.creator_name === playerName;
  const currentPlayer = players.find(p => p.position === gameState?.current_player_index);
  const isMyTurn = currentPlayer?.id === currentPlayerId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-darkgreen via-casino-green to-gray-900 p-4">
      {/* Başlık */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-casino-gold/30">
          <div>
            <h1 className="text-2xl font-bold text-casino-gold">🃏 BLACKJACK</h1>
            <p className="text-white text-sm">Oda: {roomCode}</p>
          </div>
          <div className="text-right">
            <p className="text-white text-sm">Oyuncular: {players.length}/3</p>
            <p className="text-gray-300 text-xs">
              {isWaiting && 'Bekleniyor...'}
              {isPlaying && 'Oyun Devam Ediyor'}
              {isFinished && 'Oyun Bitti'}
            </p>
          </div>
        </div>
      </div>

      {/* Oyun Alanı */}
      <div className="max-w-7xl mx-auto">
        {isWaiting ? (
          <div className="text-center bg-black/40 backdrop-blur-sm rounded-2xl p-12 border-2 border-casino-gold/30">
            <h2 className="text-3xl font-bold text-casino-gold mb-6">
              Oyuncular Bekleniyor...
            </h2>
            <div className="space-y-3 mb-8">
              {players.map((player, idx) => (
                <div key={player.id} className="text-xl text-white flex items-center justify-center gap-2">
                  <span>{idx + 1}. {player.name}</span>
                  {player.name === room?.creator_name && (
                    <span className="text-casino-gold text-sm">👑 Oda Sahibi</span>
                  )}
                  <span>✅</span>
                </div>
              ))}
              {[...Array(3 - players.length)].map((_, idx) => (
                <div key={idx} className="text-xl text-gray-500">
                  {players.length + idx + 1}. Boş Slot...
                </div>
              ))}
            </div>
            {players.length === 3 && isRoomOwner && (
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-casino-gold to-yellow-600 text-black font-bold px-12 py-4 rounded-xl text-xl hover:from-yellow-600 hover:to-casino-gold transform hover:scale-105 transition-all shadow-xl"
              >
                🎮 Oyunu Başlat
              </button>
            )}
            {players.length === 3 && !isRoomOwner && (
              <p className="text-casino-gold text-lg animate-pulse">
                ⏳ Oda sahibi oyunu başlatacak...
              </p>
            )}
            {players.length < 3 && (
              <p className="text-gray-300">
                Oyunu başlatmak için {3 - players.length} oyuncu daha gerekli
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dealer (AI Kasa) */}
            {gameState && (
              <PlayerHand
                player={{
                  id: 'dealer',
                  name: 'Kasa (AI)',
                  room_id: room!.id,
                  hand: gameState.dealer_hand,
                  score: gameState.dealer_score,
                  is_stand: gameState.dealer_stand,
                  is_bust: gameState.dealer_score > 21,
                  is_active: true,
                  position: -1,
                }}
                isCurrentTurn={gameState.game_phase === 'dealer_turn'}
                isDealer={true}
                aiMessage={gameState.ai_message}
              />
            )}

            {/* Oyuncular */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {players.map((player) => (
                <PlayerHand
                  key={player.id}
                  player={player}
                  isCurrentTurn={isPlaying && gameState?.current_player_index === player.position}
                />
              ))}
            </div>

            {/* Kontroller */}
            {isPlaying && gameState?.game_phase === 'player_turns' && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border-2 border-casino-gold/30">
                <GameControls
                  onHit={handleHit}
                  onStand={handleStand}
                  disabled={!isMyTurn || currentPlayer?.is_stand || currentPlayer?.is_bust}
                  isPlayerTurn={isMyTurn}
                />
              </div>
            )}

            {/* Oyun Sonu */}
            {isFinished && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border-2 border-casino-gold/30 text-center">
                <h2 className="text-3xl font-bold text-casino-gold mb-6">
                  🎉 Oyun Bitti!
                </h2>
                <div className="space-y-2 mb-6">
                  {players.map(player => {
                    const dealerScore = gameState?.dealer_score || 0;
                    const dealerBust = dealerScore > 21;
                    const playerWon = !player.is_bust && (dealerBust || player.score > dealerScore);
                    const tie = !player.is_bust && !dealerBust && player.score === dealerScore;

                    return (
                      <div key={player.id} className="text-xl text-white">
                        {player.name}: {player.score} puan -{' '}
                        {player.is_bust ? '❌ Bust!' : playerWon ? '🏆 Kazandı!' : tie ? '🤝 Berabere' : '😔 Kaybetti'}
                      </div>
                    );
                  })}
                </div>
                {isRoomOwner ? (
                  <button
                    onClick={handleNewGame}
                    className="bg-gradient-to-r from-casino-gold to-yellow-600 text-black font-bold px-8 py-3 rounded-xl hover:from-yellow-600 hover:to-casino-gold transform hover:scale-105 transition-all shadow-xl"
                  >
                    🔄 Yeni Oyun
                  </button>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Oda sahibi yeni oyun başlatabilir
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alt Butonlar */}
      <div className="max-w-7xl mx-auto mt-6 text-center">
        <button
          onClick={() => router.push('/lobby')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Lobiye Dön
        </button>
      </div>
    </div>
  );
}
