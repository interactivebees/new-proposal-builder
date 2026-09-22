import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { prompt, type, tone } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Connect to real AI API here (e.g. Google Gemini, OpenAI)
    // If no key is configured, return a placeholder:
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        text: `[AI Assistant Not Configured]\n\nPlease configure GEMINI_API_KEY or OPENAI_API_KEY in your environment variables to enable real AI generation.\n\nSimulated Output for "${prompt}":\n\nHere is a draft ${type} in a ${tone} tone...` 
      })
    }

    // Simulated real API response for now
    return NextResponse.json({ 
      text: `[AI Generated - ${tone} ${type}]\n\nBased on your prompt: "${prompt}"\n\nHere is the generated content...` 
    })
  } catch (error) {
    console.error('Error generating AI text:', error)
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 })
  }
}