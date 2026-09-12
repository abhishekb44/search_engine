import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config()

import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, buildUserMessage, parseAgentResponse } from './lib/promptEngine.js'

const PORT = process.env.PORT || 3001
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022'
const MAX_QUERY_LENGTH = 200

const app = express()
app.use(cors())
app.use(express.json())

const geminiKey = process.env.GEMINI_API_KEY
const anthropicKey = process.env.ANTHROPIC_API_KEY

const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null

const activeProvider = geminiKey ? 'gemini' : anthropicKey ? 'anthropic' : 'none'

if (!geminiKey && !anthropicKey) {
  console.warn(
    '⚠️  No GEMINI_API_KEY found in server/.env. Add GEMINI_API_KEY=your_key to enable live Gemini AI generation.'
  )
} else if (geminiKey) {
  console.log(`✨ Gemini AI agent active using model: ${GEMINI_MODEL}`)
}

// --- tiny in-memory rate limiter (per IP, resets every minute) ---
const RATE_LIMIT = 30
const rateBuckets = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  bucket.count += 1
  return bucket.count > RATE_LIMIT
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    agentReady: Boolean(geminiKey || anthropicKey),
    provider: activeProvider,
    model: geminiKey ? GEMINI_MODEL : anthropicKey ? ANTHROPIC_MODEL : 'none'
  })
})

async function generateWithGemini(query, personality) {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildUserMessage(query, personality),
      config: {
        systemInstruction: buildSystemPrompt(personality),
        responseMimeType: 'application/json',
        temperature: 0.95,
      },
    })

    if (!response.text) throw new Error('Gemini returned empty response')
    return parseAgentResponse(response.text)
  } catch (err) {
    if (GEMINI_MODEL !== 'gemini-2.0-flash') {
      console.warn(`Attempting fallback to gemini-2.0-flash due to: ${err.message}`)
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: buildUserMessage(query, personality),
        config: {
          systemInstruction: buildSystemPrompt(personality),
          responseMimeType: 'application/json',
          temperature: 0.95,
        },
      })

      if (!response.text) throw new Error('Gemini returned empty response', { cause: err })
      return parseAgentResponse(response.text)
    }
    throw err
  }
}

async function generateWithAnthropic(query, personality) {
  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 800,
    system: buildSystemPrompt(personality),
    messages: [{ role: 'user', content: buildUserMessage(query, personality) }],
  })

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock) throw new Error('Agent returned no text content')
  return parseAgentResponse(textBlock.text)
}

app.post('/api/search', async (req, res) => {
  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : ''
  const personality = typeof req.body?.personality === 'string' ? req.body.personality.trim() : 'savage'

  if (!query) {
    return res.status(400).json({ error: 'Query is required.' })
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `Query is too long (max ${MAX_QUERY_LENGTH} chars).` })
  }
  if (isRateLimited(req.ip)) {
    return res.status(429).json({ error: 'Slow down — even a useless engine needs a break.' })
  }

  try {
    let results = null
    let usedProvider = 'gemini'

    if (geminiKey) {
      results = await generateWithGemini(query, personality)
      usedProvider = 'gemini'
    } else if (anthropic) {
      results = await generateWithAnthropic(query, personality)
      usedProvider = 'anthropic'
    } else {
      return res.status(503).json({
        error: 'No AI key configured. Using smart semantic engine.',
        useFallback: true
      })
    }

    res.json({ results, source: 'agent', provider: usedProvider })
  } catch (err) {
    console.error('Search agent error:', err.message)
    res.status(502).json({
      error: 'AI agent quota or network issue. Using intelligent semantic engine.',
      detail: err.message,
      useFallback: true
    })
  }
})

app.listen(PORT, () => {
  console.log(`IDK.exe agent listening on http://localhost:${PORT}`)
})

