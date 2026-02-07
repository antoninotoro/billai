import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiApiKey: hasApiKey ? '✓ set' : '✗ missing',
  });
}
