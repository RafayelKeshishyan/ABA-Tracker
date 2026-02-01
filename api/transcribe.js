/**
 * Vercel Serverless Function - Audio Transcription via OpenAI Whisper
 * 
 * This endpoint handles audio file uploads and transcribes them using
 * OpenAI's Whisper API. Includes rate limiting to prevent abuse.
 * 
 * Accepts JSON with base64-encoded audio to avoid multipart form parsing issues.
 */

// Simple in-memory rate limiting (resets on cold start/redeploy)
const rateLimitMap = new Map();
const RATE_LIMIT = 50; // requests per IP per day

/**
 * Get the current date string (YYYY-MM-DD) for rate limit key
 * This ensures rate limits reset at midnight local server time
 * @returns {string}
 */
function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if request is within rate limits
 * @param {string} ip - Client IP address
 * @returns {{ allowed: boolean, remaining: number }}
 */
function checkRateLimit(ip) {
    const today = getTodayKey();
    const key = `transcribe:${ip}:${today}`;
    const record = rateLimitMap.get(key);
    
    // Clean up old entries from previous days
    for (const [k] of rateLimitMap) {
        if (!k.endsWith(today)) {
            rateLimitMap.delete(k);
        }
    }
    
    if (!record) {
        rateLimitMap.set(key, { count: 1 });
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

/**
 * Build multipart form data manually
 * This is more reliable than using libraries across different environments
 */
function buildMultipartFormData(fields, file) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const CRLF = '\r\n';
    
    const parts = [];
    
    // Add regular fields
    for (const [name, value] of Object.entries(fields)) {
        parts.push(
            `--${boundary}${CRLF}` +
            `Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}` +
            `${value}${CRLF}`
        );
    }
    
    // Add file field
    parts.push(
        `--${boundary}${CRLF}` +
        `Content-Disposition: form-data; name="file"; filename="${file.filename}"${CRLF}` +
        `Content-Type: ${file.contentType}${CRLF}${CRLF}`
    );
    
    // Convert string parts to buffer
    const stringPart = Buffer.from(parts.join(''), 'utf8');
    
    // End boundary
    const endBoundary = Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf8');
    
    // Combine all parts: string parts + file data + end boundary
    const body = Buffer.concat([stringPart, file.data, endBoundary]);
    
    return {
        body,
        contentType: `multipart/form-data; boundary=${boundary}`
    };
}

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
    
    console.log('Transcribe endpoint called, API key present:', !!apiKey);
    
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
        // Parse JSON body with base64 audio
        const { audio, filename, mimeType, model, language } = req.body;
        
        if (!audio) {
            return res.status(400).json({ error: 'Missing audio data' });
        }
        
        // Decode base64 audio to buffer
        const audioBuffer = Buffer.from(audio, 'base64');
        
        if (audioBuffer.length === 0) {
            return res.status(400).json({ error: 'Audio data is empty' });
        }
        
        // Determine content type based on filename or provided mimeType
        let contentType = mimeType || 'audio/webm';
        const fname = filename || 'recording.webm';
        
        if (fname.endsWith('.mp4') || fname.endsWith('.m4a')) {
            contentType = 'audio/mp4';
        } else if (fname.endsWith('.mp3')) {
            contentType = 'audio/mpeg';
        } else if (fname.endsWith('.wav')) {
            contentType = 'audio/wav';
        } else if (fname.endsWith('.ogg')) {
            contentType = 'audio/ogg';
        } else if (fname.endsWith('.webm')) {
            contentType = 'audio/webm';
        }
        
        console.log('Sending to OpenAI:', {
            filename: fname,
            contentType,
            fileSize: audioBuffer.length,
            model: model || 'whisper-1',
            language: language || 'en'
        });
        
        // Build multipart form data manually
        const { body: formBody, contentType: formContentType } = buildMultipartFormData(
            {
                model: model || 'whisper-1',
                language: language || 'en'
            },
            {
                filename: fname,
                contentType: contentType,
                data: audioBuffer
            }
        );
        
        console.log('Form body size:', formBody.length, 'Content-Type:', formContentType);
        
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': formContentType,
            },
            body: formBody,
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { error: { message: errorText || `HTTP ${response.status}` } };
            }
            console.error('OpenAI API error:', response.status, errorData);
            return res.status(response.status).json({ 
                error: errorData.error?.message || `Transcription failed (${response.status})` 
            });
        }
        
        const data = await response.json();
        console.log('Transcription successful, text length:', data.text?.length || 0);
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Transcription error:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
}
