
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Ensure the API key is set in your environment variables
});

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Invalid name provided' }, { status: 400 });
  }

  try {
    const chatCompletion = await client.chat.completions.create({
      model: 'gpt-4o', // Adjust model version based on your OpenAI subscription
      messages: [
        {
          role: 'system',
          content:
            'You are a humorous fortune teller. When a user provides their name, predict their future in 2025 in a funny way, making a clever reference to their name and its meaning. Keep it short use emojis, genz terms and keep it friendly',
        },
        {
          role: 'user',
          content: `My name is ${name}`,
        },
      ],
    });

    const fortune = chatCompletion.choices[0]?.message?.content!.trim();

    if (!fortune) {
      throw new Error('Failed to generate a fortune');
    }

    return NextResponse.json({ fortune });
  } catch (error) {
    console.error('Error fetching fortune:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching your fortune. Please try again later.' },
      { status: 500 }
    );
  }
}