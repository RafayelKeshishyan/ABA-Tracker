/**
 * Vercel Serverless Function - ABC Parsing via OpenAI GPT
 * 
 * This endpoint accepts transcribed incident text and uses OpenAI's GPT
 * to parse it into ABC (Antecedent-Behavior-Consequence) format.
 */

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000;

/**
 * Check if request is within rate limits
 * @param {string} ip - Client IP address
 * @returns {{ allowed: boolean, remaining: number }}
 */
function checkRateLimit(ip) {
    const key = `parse:${ip}`;
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

// System prompt for ABC parsing
const SYSTEM_PROMPT = `You are an expert at parsing behavior incident descriptions for special education professionals using the ABC (Antecedent-Behavior-Consequence) model.

Given a description of a behavioral incident, extract and organize the information into:
- Antecedent: What happened BEFORE the behavior? What triggered it? (context, demands, events)
- Behavior: What did the student DO? The observable action or behavior.
- Consequence: What happened AFTER the behavior? How did others respond?
- Intervention: What strategy or intervention was used, if mentioned? (optional)
- Notes: Any additional relevant information that doesn't fit the above categories (optional)

Respond ONLY with a valid JSON object in this exact format:
{
  "antecedent": "...",
  "behavior": "...",
  "consequence": "...",
  "intervention": "...",
  "notes": "..."
}

If a field is not mentioned or unclear, use an empty string for that field.
Write in clear, professional language appropriate for educational documentation.`;

/**
 * Main handler for ABC parsing
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
        const { transcription } = req.body;
        
        if (!transcription || typeof transcription !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid transcription text' });
        }
        
        if (transcription.length > 5000) {
            return res.status(400).json({ error: 'Transcription too long. Maximum 5000 characters.' });
        }
        
        // Call OpenAI Chat API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: transcription }
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API error:', response.status, errorData);
            return res.status(response.status).json({ 
                error: errorData.error?.message || `Parsing failed (${response.status})` 
            });
        }
        
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
            return res.status(500).json({ error: 'No response from AI parser' });
        }
        
        // Parse JSON from response
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return res.status(200).json({ parsed });
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return res.status(500).json({ error: 'Failed to parse AI response' });
        }
        
    } catch (error) {
        console.error('Parse error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}



