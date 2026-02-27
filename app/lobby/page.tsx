'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateRoomCode } from '@/lib/gameLogic';

export default function LobbyPage() {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem('playerName');
    if (!name) {
      router.push('/');
      return;
    }
    setPlayerName(name);
  }, [router]);

  const createRoom = async () => {
    setError('');
    setIsCreating(true);

    try {
      const code = generateRoomCode();
      
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          creator_name: playerName,
          status: 'waiting',
          current_turn: 0,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { error: playerError } = await supabase
        .from('players')
        .insert({
          name: playerName,
          room_id: room.id,
          hand: [],
          score: 0,
          is_stand: false,
          is_bust: false,
          is_active: true,
          position: 0,
        });

      if (playerError) throw playerError;

      router.push(`/room/${code}`);
    } catch (err: any) {
      setError(err.message || 'Oda oluşturulamadı');
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Lütfen oda kodunu girin');
      return;
    }

    setError('');
    setIsJoining(true);

    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (roomError || !room) {
        throw new Error('Oda bulunamadı');
      }

      if (room.status !== 'waiting') {
        throw new Error('Bu oda artık oyun kabul etmiyor');
      }

      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id);

      if (existingPlayers && existingPlayers.length >= 3) {
        throw new Error('Oda dolu (3/3)');
      }

      const { error: playerError } = await supabase
        .from('players')
        .insert({
          name: playerName,
          room_id: room.id,
          hand: [],
          score: 0,
          is_stand: false,
          is_bust: false,
          is_active: true,
          position: existingPlayers?.length || 0,
        });

      if (playerError) throw playerError;

      router.push(`/room/${roomCode}`);
    } catch (err: any) {
      setError(err.message || 'Odaya katılınamadı');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-darkgreen via-casino-green to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Başlık */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-casino-gold mb-2">
            Hoş Geldin, {playerName}! 👋
          </h1>
          <p className="text-white/80">Bir oda oluştur veya mevcut odaya katıl</p>
        </div>

        {/* Ana Kartlar */}
        <div className="space-y-4">
          {/* Oda Oluştur */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-casino-gold/30 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-3">🎲 Oda Oluştur</h2>
            <p className="text-gray-300 mb-4 text-sm">
              Yeni bir oda oluştur ve arkadaşlarını bekle
            </p>
            <button
              onClick={createRoom}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-casino-gold to-yellow-600 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-casino-gold transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Oluşturuluyor...' : 'Yeni Oda Oluştur'}
            </button>
          </div>

          {/* Odaya Katıl */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-casino-gold/30 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-3">🚪 Odaya Katıl</h2>
            <p className="text-gray-300 mb-4 text-sm">
              6 haneli oda kodunu gir ve oyuna katıl
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/10 border-2 border-casino-gold/50 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent transition-all"
              />
              <button
                onClick={joinRoom}
                disabled={isJoining || roomCode.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Katılınıyor...' : 'Odaya Katıl'}
              </button>
            </div>
          </div>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mt-4 bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Geri Dön */}
        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← İsim Değiştir
        </button>
      </div>
    </div>
  );
}
