import express from 'express';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';

// Ensure env vars are loaded
dotenv.config();

const router = express.Router();

// Helper function to clean and parse AI response
const parseAIResponse = (rawText) => {
    // Remove ALL markdown artifacts
    let cleanText = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .replace(/^\s*json\s*/i, '')
        .trim();
    
    // Try to find and parse JSON
    try {
        // Find JSON object boundaries
        const startIdx = cleanText.indexOf('{');
        const endIdx = cleanText.lastIndexOf('}');
        
        if (startIdx === -1 || endIdx === -1) {
            throw new Error('No JSON found');
        }
        
        const jsonStr = cleanText.substring(startIdx, endIdx + 1);
        const parsed = JSON.parse(jsonStr);
        
        // Extract and clean subject
        let subject = String(parsed.subject || parsed.Subject || '').trim();
        subject = subject.replace(/^["'`]+|["'`]+$/g, '');
        
        // Extract and clean body - preserve newlines
        let body = String(parsed.body || parsed.Body || '').trim();
        body = body.replace(/^["'`]+|["'`]+$/g, '');
        body = body.replace(/\\n/g, '\n'); // Convert \n to actual newlines
        body = body.replace(/\\"/g, '"'); // Unescape quotes
        
        if (!subject || !body) {
            throw new Error('Missing subject or body');
        }
        
        return {
            subject: subject,
            body: body
        };
        
    } catch (parseError) {
        // Manual extraction as last resort
        let subject = '';
        let body = '';
        
        // Try to extract subject
        const subjectMatch = cleanText.match(/"subject"\s*:\s*"([^"]+)"/i);
        if (subjectMatch) {
            subject = subjectMatch[1];
        }
        
        // Try to extract body
        const bodyMatch = cleanText.match(/"body"\s*:\s*"([\s\S]+?)"\s*}/i);
        if (bodyMatch) {
            body = bodyMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"');
        }
        
        return {
            subject: subject || 'Email Subject',
            body: body || cleanText.substring(0, 500)
        };
    }
};

// Helper function to call Gemini API
const callGeminiAPI = async (apiKey, systemPrompt) => {
    const modelNames = [
        'gemini-2.5-flash',
        'gemini-flash-latest',
        'gemini-2.0-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash-lite'
    ];

    for (const modelName of modelNames) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                            topP: 0.8,
                            topK: 40
                        },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (generatedText) {
                    return { success: true, text: generatedText, model: modelName };
                }
            }
        } catch (err) {
            // Continue to next model
            continue;
        }
    }

    return { success: false, error: 'All AI models failed' };
};

/**
 * Generate email template using Gemini AI
 * POST /api/ai/generate-template
 */
router.post('/generate-template', authenticate, async (req, res) => {
    try {
        const { prompt, tone, variables } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required',
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: 'AI service not configured',
            });
        }

        // Build the AI prompt
        const variablesList = variables?.length > 0 
            ? variables.map(v => `{{${v}}}`).join(', ')
            : '{{name}}, {{email}}';

        const systemPrompt = `You are an expert email copywriter. Generate a professional email based on these requirements:

Purpose: ${prompt}
Tone: ${tone || 'professional'}
Available variables: ${variablesList}

IMPORTANT INSTRUCTIONS:
1. Write a compelling subject line (max 60 characters)
2. Write a concise email body (150-250 words)
3. Use variables naturally (e.g., "Hi {{name}},")
4. Include a clear call-to-action
5. Make it professional and engaging
6. Do NOT use placeholder text like [Your Name]

You MUST return ONLY a valid JSON object in this EXACT format (no markdown, no code blocks):
{"subject": "your subject line", "body": "your email body"}`;

        // Call Gemini API
        const aiResult = await callGeminiAPI(apiKey, systemPrompt);
        
        if (!aiResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate content. Please try again.',
            });
        }

        // Parse the response
        const parsed = parseAIResponse(aiResult.text);

        res.json({
            success: true,
            data: {
                subject: parsed.subject,
                body: parsed.body,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate template. Please try again.',
        });
    }
});

export default router;
