import express from 'express';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';

// Ensure env vars are loaded
dotenv.config();

const router = express.Router();

/**
 * List available Gemini models
 * GET /api/ai/models
 */
router.get('/models', authenticate, async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'API key not configured' });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const data = await response.json();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

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
                error: 'AI service not configured. Please add GEMINI_API_KEY to server environment.',
            });
        }

        console.log('🔑 API Key present:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
        console.log('📝 Request:', { prompt: prompt.substring(0, 50), tone, variablesCount: variables?.length || 0 });

        // Build the AI prompt
        const variablesList = variables?.length > 0 
            ? variables.map(v => `{{${v}}}`).join(', ')
            : '{{name}}, {{email}}';

        const systemPrompt = `You are an expert cold email copywriter. Generate a professional cold email based on the user's requirements.

Purpose: ${prompt}
Tone: ${tone || 'professional'}
Available personalization variables: ${variablesList}

Requirements:
- Write a compelling subject line (use variables if appropriate, especially for personalization)
- Write a concise email body (150-250 words max)
- Use the variables naturally for personalization (e.g., "Hi {{name}}," for greeting)
- Include a clear call-to-action
- Keep it professional and engaging
- Do NOT use placeholder text like [Your Name] - the email should be ready to send

Return ONLY a valid JSON object with this exact format:
{"subject": "your subject line here", "body": "your email body here"}`;

        // Try different model names (100% FREE models from your API key)
        const modelNames = [
            'gemini-2.5-flash',          // Latest stable model - BEST
            'gemini-flash-latest',       // Always latest flash
            'gemini-2.0-flash',          // Stable 2.0
            'gemini-2.5-flash-lite',     // Lighter version
            'gemini-2.0-flash-lite'      // Lighter 2.0
        ];

        let response;
        let lastError;

        for (const modelName of modelNames) {
            try {
                response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: systemPrompt }] }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 1024,
                            },
                        }),
                    }
                );

                if (response.ok) {
                    console.log(`✓ Successfully using model: ${modelName}`);
                    break; // Success, exit loop
                }

                const errorData = await response.json().catch(() => ({}));
                lastError = errorData;
                console.log(`✗ Model ${modelName} failed:`, errorData.error?.message);
            } catch (err) {
                console.log(`✗ Model ${modelName} error:`, err.message);
                lastError = err;
            }
        }

        if (!response || !response.ok) {
            console.error('❌ All models failed. Last error:', lastError);
            return res.status(500).json({
                success: false,
                error: 'All AI models failed. Please check your API key at https://aistudio.google.com/app/apikey'
            });
        }
            
        const data = await response.json();
        console.log('📥 AI Response structure:', JSON.stringify(data, null, 2));
        
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.error('❌ No text in response. Full response:', JSON.stringify(data, null, 2));
            return res.status(500).json({
                success: false,
                error: 'No response from AI service. Response structure: ' + JSON.stringify(data.candidates?.[0] || 'No candidates'),
            });
        }
        
        console.log('✅ Generated text length:', generatedText.length);

        // Parse the JSON response
        let result;
        try {
            // Remove markdown code blocks if present
            let cleanText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            
            // Try to extract JSON from the response
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
                console.log('✅ Parsed JSON successfully:', { 
                    hasSubject: !!result.subject, 
                    hasBody: !!result.body,
                    subjectLength: result.subject?.length || 0,
                    bodyLength: result.body?.length || 0
                });
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.log('⚠️ JSON parse failed:', parseError.message);
            console.log('Raw text:', generatedText.substring(0, 200));
            
            // Fallback: try to extract subject and body manually
            const lines = generatedText.split('\n');
            let subject = '';
            let body = '';
            let inBody = false;

            for (const line of lines) {
                if (line.toLowerCase().includes('subject:')) {
                    subject = line.replace(/subject:/i, '').trim().replace(/^["']|["']$/g, '');
                } else if (line.toLowerCase().includes('body:') || inBody) {
                    inBody = true;
                    if (!line.toLowerCase().includes('body:')) {
                        body += line + '\n';
                    }
                }
            }

            if (!subject && !body) {
                // Last resort: Split the response into subject and body
                const firstLine = generatedText.split('\n')[0];
                result = {
                    subject: firstLine.substring(0, 100) || 'Your Email Subject',
                    body: generatedText,
                };
            } else {
                result = { subject, body: body.trim() };
            }
        }
        
        // Clean up the parsed result
        if (result.subject) {
            result.subject = result.subject.replace(/^["']|["']$/g, '').trim();
        }
        if (result.body) {
            result.body = result.body.replace(/^["']|["']$/g, '').trim();
        }

        // Final validation
        const finalSubject = result.subject || 'Your Email Subject';
        const finalBody = result.body || 'Email content could not be generated.';
        
        console.log('📤 Sending response:', {
            subject: finalSubject.substring(0, 50) + '...',
            bodyLength: finalBody.length
        });

        res.json({
            success: true,
            data: {
                subject: finalSubject,
                body: finalBody,
            },
        });

    } catch (error) {
        console.error('❌ AI generation error:', error.message);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: `Failed to generate template: ${error.message}`,
        });
    }
});

export default router;
