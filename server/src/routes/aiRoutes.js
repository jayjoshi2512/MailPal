import express from 'express';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';

// Ensure env vars are loaded
dotenv.config();

const router = express.Router();

// Helper function to clean and parse AI response
const parseAIResponse = (rawText) => {
    try {
        // Step 1: Remove all markdown code blocks
        let cleanText = rawText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
        
        // Step 2: Extract JSON object
        const jsonMatch = cleanText.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s);
        if (!jsonMatch) {
            throw new Error('No JSON object found');
        }
        
        // Step 3: Parse JSON
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Step 4: Clean subject and body
        const subject = (parsed.subject || '')
            .replace(/^["'`]+|["'`]+$/g, '')
            .replace(/\\n/g, ' ')
            .trim();
            
        const body = (parsed.body || '')
            .replace(/^["'`]+|["'`]+$/g, '')
            .replace(/\\n/g, '\n')
            .trim();
        
        return {
            success: true,
            subject: subject || 'Your Email Subject',
            body: body || 'Email body could not be generated.'
        };
    } catch (error) {
        // Fallback: Manual extraction
        const lines = rawText.split('\n').filter(line => line.trim());
        let subject = '';
        let body = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.toLowerCase().includes('"subject"') || line.toLowerCase().includes('subject:')) {
                // Extract subject value
                const match = line.match(/[:"]\s*([^"]+)["]/);
                if (match) subject = match[1];
            } else if (line.toLowerCase().includes('"body"') || line.toLowerCase().includes('body:')) {
                // Extract body value - collect all following lines
                const match = line.match(/[:"]\s*(.+)/);
                if (match) {
                    body = match[1].replace(/^["']|["']$/g, '');
                    // Collect continuation
                    for (let j = i + 1; j < lines.length; j++) {
                        if (lines[j].includes('}')) break;
                        body += '\n' + lines[j].replace(/^["']|["']$/g, '');
                    }
                }
            }
        }
        
        return {
            success: false,
            subject: subject || 'Your Email Subject',
            body: body || rawText.substring(0, 500)
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
