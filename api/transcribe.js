/**
 * Vercel Serverless Function - Audio Transcription via OpenAI Whisper
 * 
 * This endpoint handles audio file uploads and transcribes them using
 * OpenAI's Whisper API. Includes rate limiting to prevent abuse.
 * 
 * Accepts JSON with base64-encoded audio to avoid multipart form parsing issues.
 */

import FormData from 'form-data';

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
        
        // Create FormData for OpenAI
        const formData = new FormData();
        
        // Append file as a buffer with proper options
        formData.append('file', audioBuffer, {
            filename: fname,
            contentType: contentType,
            knownLength: audioBuffer.length
        });
        
        // Append other fields
        formData.append('model', model || 'whisper-1');
        formData.append('language', language || 'en');
        
        // Get headers from form-data (includes Content-Type with boundary)
        const headers = formData.getHeaders();
        
        console.log('Sending to OpenAI:', {
            filename: fname,
            contentType,
            fileSize: audioBuffer.length,
            model: model || 'whisper-1',
            language: language || 'en'
        });
        
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...headers,
            },
            body: formData,
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
