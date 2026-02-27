import { NextRequest, NextResponse } from 'next/server';
import { getAIAction } from '@/lib/gemini';
import { Card, Player } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const { dealerHand, players } = await request.json();

    if (!dealerHand || !players) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await getAIAction(
      dealerHand as Card[],
      players as Player[]
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI action error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
