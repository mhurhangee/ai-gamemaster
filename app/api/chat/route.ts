import { kv } from '@vercel/kv';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText, generateObject } from 'ai';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// Allow streaming responses up to 10 seconds
export const maxDuration = 10;

// Create per-user rate limit
const userRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:user',
});

// Create global rate limit
const globalRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'ratelimit:global',
});

// Create bad response rate limit
const badResponseRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(3, '24 h'),
  prefix: 'ratelimit:badresponse',
});


// Define types for messages
type Role = 'user' | 'assistant' | 'system';

interface Message {
  role: Role;
  content: string;
}

async function isContentAppropriate(messages: Message[]): Promise<boolean> {
  const lastFewMessages = messages.slice(-5); // Get the last 3 messages
  const checkResult = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      isAppropriate: z.boolean(),
    }),
    prompt: `Check if the following conversation is appropriate for an 8-bit video game assistant. Only flag as inappropriate if it's clearly unrelated to 8-bit games or contains offensive content. Here are the last few messages:\n\n${JSON.stringify(lastFewMessages)}\n\nRespond with a boolean 'isAppropriate' and if it's not appropriate.`,
  });

  return checkResult.object.isAppropriate;
}

export async function POST(req: NextRequest) {
  const ip = req.ip ?? 'ip';

  // Check user rate limit
  const userLimit = await userRatelimit.limit(ip);
  if (!userLimit.success) {
    return new Response('Rate limit exceeded. Please try again later.', { status: 429 });
  }

  // Check global rate limit
  const globalLimit = await globalRatelimit.limit('global');
  if (!globalLimit.success) {
    return new Response('Server is busy. Please try again later.', { status: 429 });
  }

  const { messages } = await req.json();

  // Check if content is appropriate
  const appropriate = await isContentAppropriate(messages);

  console.log('Is content appropriate?', appropriate);

  if (!appropriate) {
    // Increment bad response count
    const badResponseLimit = await badResponseRatelimit.limit(ip);
    if (!badResponseLimit.success) {
      return new Response('Too many inappropriate requests. You are temporarily blocked.', { status: 429 });
    }
    return new Response('I cannot respond to that as it may not be appropriate for an 8-bit video game assistant. Refresh the page to try again!', { status: 400 });
  }

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are a helpful assistant who is an expert and hugely enthuastic about 8-bit video games. Only answer questions relating to 8-bit video games. Keep your responses short: max 3 sentences. Be funny, upbeat, witty and ecentric. Only plaintext responses. No markdown.',
    messages: convertToCoreMessages(messages),
    temperature: 0.8,
    maxTokens: 512,
  });

  return result.toDataStreamResponse();
}