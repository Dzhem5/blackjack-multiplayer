import { Card, Rank, Suit } from '@/types/game';

const suits: Suit[] = ['♠', '♥', '♦', '♣'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 2 deste (104 kart) oluştur
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (let i = 0; i < 2; i++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
  }
  
  return shuffleDeck(deck);
}

// Desteli karıştır (Fisher-Yates algoritması)
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Kart değerini hesapla
export function getCardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank);
}

// El skorunu hesapla (As'ı 1 veya 11 olarak değerlendir)
export function calculateHandScore(hand: Card[]): number {
  let score = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.isHidden) continue;
    
    if (card.rank === 'A') {
      aces++;
      score += 11;
    } else {
      score += getCardValue(card.rank);
    }
  }
  
  // As'ları 1 olarak değerlendir (gerekirse)
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

// Blackjack kontrolü (ilk 2 kart ile 21)
export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHandScore(hand) === 21;
}

// Rastgele 6 haneli oda kodu oluştur
export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
