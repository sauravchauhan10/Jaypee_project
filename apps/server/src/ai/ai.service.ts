import OpenAI from 'openai';
import type { Response } from 'express';

// Initialize OpenAI client. Requires OPENAI_API_KEY environment variable.
const openai = new (OpenAI as any)();

const SYSTEM_PROMPT = `You are a helpful, empathetic, and highly accurate medical information assistant for patients. 
Your goal is to provide clear, simple, and educational information about diseases, conditions, and medications.
Follow these strict rules:
1. Empathy first: Always maintain a supportive and calm tone.
2. Simplicity: Explain medical terms in plain English that a 10-year-old could understand.
3. NO DIAGNOSING: Never attempt to diagnose the user based on symptoms. If they list symptoms, tell them what conditions they *might* relate to, but insist they see a doctor.
4. NO PRESCRIBING: Never suggest specific dosages or recommend taking a specific prescription drug.
5. REQUIRED DISCLAIMER: You must append the following exact sentence at the very end of your response: "Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your doctor."`;

export const streamPatientAssistantResponse = async (query: string, res: Response) => {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective and fast model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
      stream: true,
      max_tokens: 500,
    });

    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // We write the raw content to the stream, clients will read it directly
        res.write(content);
      }
    }

    // End the response cleanly
    res.end();
  } catch (error) {
    console.error('OpenAI Stream Error:', error);
    // If headers are not sent, we could return a 500 JSON, but if streaming started, we just end it with an error string.
    res.write("\n\n[Error: Unable to connect to the AI service. Please try again later.]");
    res.end();
  }
};
