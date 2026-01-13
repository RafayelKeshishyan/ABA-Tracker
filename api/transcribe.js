/**
 * Vercel Serverless Function - Audio Transcription via OpenAI Whisper
 * 
 * This endpoint handles audio file uploads and transcribes them using
 * OpenAI's Whisper API. Includes rate limiting to prevent abuse.
 */

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT = 15; // requests per IP per day
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if request is within rate limits
 * @param {string} ip - Client IP address
 * @returns {{ allowed: boolean, remaining: number }}
 */
function checkRateLimit(ip) {
    const key = `transcribe:${ip}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);
    
    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(key, { count: 1, timestamp: now });
        return { allowed: true, remaining: RATE_LIMIT - 1 };
    }
    
    if (record.count >= RATE_LIMIT) {
        return { allowed: false, remaining: 0 };
    }
    
    record.count++;
    return { allowed: true, remaining: RATE_LIMIT - record.count };
}

/**
 * Get client IP from request headers
 * @param {import('@vercel/node').VercelRequest} req
 * @returns {string}
 */
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.headers['x-real-ip'] || 'unknown';
}

// Disable body parsing to handle raw multipart form data
export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * Main handler for audio transcription
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Check API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OPENAI_API_KEY not configured');
        return res.status(500).json({ error: 'Server not configured. OPENAI_API_KEY is missing.' });
    }
    
    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(ip);
    
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
    
    if (!rateLimit.allowed) {
        return res.status(429).json({ 
            error: 'Rate limit exceeded. Please try again tomorrow.',
            retryAfter: '24 hours'
        });
    }
    
    try {
        // Read the raw body
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        // Validate content type
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
            return res.status(400).json({ error: 'Invalid content type. Expected multipart/form-data.' });
        }
        
        // Forward request to OpenAI Whisper API
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': contentType,
            },
            body: buffer,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API error:', response.status, errorData);
            return res.status(response.status).json({ 
                error: errorData.error?.message || `Transcription failed (${response.status})` 
            });
        }
        
        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Transcription error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}



