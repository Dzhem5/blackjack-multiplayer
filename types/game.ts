export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  isHidden?: boolean;
}

export interface Player {
  id: string;
  name: string;
  room_id: string;
  hand: Card[];
  score: number;
  is_stand: boolean;
  is_bust: boolean;
  is_active: boolean;
  position: number;
  created_at?: string;
}

export interface Room {
  id: string;
  code: string;
  creator_name: string;
  status: 'waiting' | 'playing' | 'finished';
  current_turn: number;
  created_at?: string;
}

export interface GameState {
  id?: string;
  room_id: string;
  dealer_hand: Card[];
  dealer_score: number;
  dealer_stand: boolean;
  deck: Card[];
  current_player_index: number;
  game_phase: 'dealing' | 'player_turns' | 'dealer_turn' | 'finished';
  ai_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GeminiResponse {
  action: 'hit' | 'stand';
  message: string;
}
