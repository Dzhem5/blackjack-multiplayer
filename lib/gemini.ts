import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card, Player, GeminiResponse } from '@/types/game';
import { calculateHandScore } from './gameLogic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function getAIAction(
  dealerHand: Card[],
  players: Player[]
): Promise<GeminiResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const dealerScore = calculateHandScore(dealerHand.map(c => ({ ...c, isHidden: false })));
    
    const playersInfo = players
      .filter(p => !p.is_bust)
      .map(p => `${p.name}: ${p.score} puan`)
      .join(', ');
    
    const prompt = `Sen bir Blackjack oyununda Kasa (Dealer) rolündesin. Türkçe konuşuyorsun ve esprili yorumlar yapıyorsun.

Mevcut Durum:
- Senin elin: ${dealerScore} puan
- Oyuncular: ${playersInfo}

Blackjack kuralları:
- 17 veya üzerinde stand yapmalısın
- 16 ve altında hit yapmalısın

Lütfen aşağıdaki JSON formatında cevap ver (sadece JSON, başka hiçbir şey yazma):
{
  "action": "hit" veya "stand",
  "message": "Kısa, esprili bir yorum (max 60 karakter)"
}

Mesajın örnekleri:
- "Vay canına, güzel risk!"
- "Bu el benim!"
- "Benden korkun!"
- "Hadi bakalım, şansınızı deneyin!"
- "Ben kazanacağım gibi hissediyorum!"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON'u çıkar
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        action: parsed.action,
        message: parsed.message || 'Hadi bakalım!',
      };
    }
    
    // Fallback: Basit kural tabanlı
    return {
      action: dealerScore < 17 ? 'hit' : 'stand',
      message: dealerScore < 17 ? 'Bir tane daha alayım!' : 'Pas geçiyorum!',
    };
  } catch (error) {
    console.error('Gemini API hatası:', error);
    
    // Hata durumunda basit kural tabanlı karar
    const dealerScore = calculateHandScore(dealerHand.map(c => ({ ...c, isHidden: false })));
    return {
      action: dealerScore < 17 ? 'hit' : 'stand',
      message: 'Hadi bakalım!',
    };
  }
}
