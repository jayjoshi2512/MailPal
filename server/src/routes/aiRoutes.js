import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate email template using Gemini AI
 * POST /api/ai/generate-template
 */
router.post('/generate-template', authenticate, async (req, res) => {
    try {
        const { prompt, tone, variables } = req.body;

        if (!prompt) {
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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API error:', errorData);
            return res.status(500).json({
                success: false,
                error: 'Failed to generate template. Please check your API key.',
            });
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            return res.status(500).json({
                success: false,
                error: 'No response from AI service',
            });
        }

        // Parse the JSON response
        let result;
        try {
            // Try to extract JSON from the response
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            // Fallback: try to extract subject and body manually
            console.log('JSON parse failed, attempting manual extraction');
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
                // Last resort: use the whole response as body
                result = {
                    subject: 'Following up on our conversation',
                    body: generatedText.replace(/```json|```/g, '').trim(),
                };
            } else {
                result = { subject, body: body.trim() };
            }
        }

        res.json({
            success: true,
            data: {
                subject: result.subject || '',
                body: result.body || '',
            },
        });

    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate template. Please try again.',
        });
    }
});

export default router;
