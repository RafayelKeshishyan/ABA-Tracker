/**
 * Vercel Serverless Function - Audio Transcription via OpenAI Whisper
 * 
 * This endpoint handles audio file uploads and transcribes them using
 * OpenAI's Whisper API. Includes rate limiting to prevent abuse.
 */

import FormData from 'form-data';
import busboy from 'busboy';

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
        // Parse multipart form data using busboy
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
            return res.status(400).json({ error: 'Invalid content type. Expected multipart/form-data.' });
        }
        
        return new Promise((resolve, reject) => {
            try {
                const parser = busboy({ 
                    headers: req.headers,
                    defParamCharset: 'utf8'
                });
                
                let audioFile = null;
                let model = 'whisper-1';
                let language = 'en';
                let filename = 'recording.webm';
                
                parser.on('file', (name, file, info) => {
                    if (name === 'file') {
                        const chunks = [];
                        filename = info.filename || 'recording.webm';
                        file.on('data', (chunk) => {
                            chunks.push(chunk);
                        });
                        file.on('end', () => {
                            audioFile = Buffer.concat(chunks);
                        });
                    } else {
                        file.resume();
                    }
                });
                
                parser.on('field', (name, value) => {
                    if (name === 'model') {
                        model = value;
                    } else if (name === 'language') {
                        language = value;
                    }
                });
                
                parser.on('finish', async () => {
                    if (!audioFile) {
                        return resolve(res.status(400).json({ error: 'No audio file found in request' }));
                    }
                    
                    try {
                        const formData = new FormData();
                        formData.append('file', audioFile, {
                            filename: filename,
                            contentType: 'audio/webm'
                        });
                        formData.append('model', model);
                        formData.append('language', language);
                        
                        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${apiKey}`,
                                ...formData.getHeaders(),
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
                            return resolve(res.status(response.status).json({ 
                                error: errorData.error?.message || `Transcription failed (${response.status})` 
                            }));
                        }
                        
                        const data = await response.json();
                        return resolve(res.status(200).json(data));
                    } catch (error) {
                        console.error('Transcription error:', error);
                        return resolve(res.status(500).json({ error: 'Internal server error' }));
                    }
                });
                
                parser.on('error', (error) => {
                    console.error('Busboy parser error:', error);
                    if (!res.headersSent) {
                        resolve(res.status(400).json({ error: 'Could not parse multipart form: ' + error.message }));
                    }
                });
                
                // For Vercel serverless functions, handle the request body
                if (req.on && typeof req.pipe === 'function') {
                    // It's a stream - pipe it directly
                    req.pipe(parser);
                } else if (req.body) {
                    // It might be a buffer - convert to stream
                    const { Readable } = await import('stream');
                    const bodyStream = Readable.from(Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body));
                    bodyStream.pipe(parser);
                } else {
                    return resolve(res.status(400).json({ error: 'No request body received' }));
                }
            } catch (error) {
                console.error('Error setting up parser:', error);
                return resolve(res.status(500).json({ error: 'Internal server error: ' + error.message }));
            }
        });
        
    } catch (error) {
        console.error('Transcription error:', error);
        return res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
}



