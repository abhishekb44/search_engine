export const RESULT_COUNT = 1

export function buildSystemPrompt(personality = 'savage') {
  const toneGuides = {
    savage: 'Tone: Direct, blunt, funny sarcasm. Make fun of the question using very simple, everyday words.',
    simple: 'Tone: Extremely simple, plain English truth. Explain the funny reality like I am 5 years old.',
    genz: 'Tone: Casual, funny internet humor (bro, cooked, 💀). Keep vocabulary very simple and clear.',
    professor: 'Tone: A funny teacher who gives a silly, very simple explanation anyone can understand.',
    mystic: 'Tone: A silly fortune teller giving funny simple advice like "the stars say go take a nap".',
    corporate: 'Tone: A tired office worker whose solution to everything is "send an email and go home".',
  }

  const selectedTone = toneGuides[personality] || toneGuides.savage

  return `You write for IDK, a funny parody answer engine.
Your mission: Give exactly ONE simple, clear, and funny answer that is DIRECTLY tied to the user's question!

Tone Guide: ${selectedTone}

CRITICAL RULES FOR SIMPLICITY & CLARITY:
1. USE SIMPLE EVERYDAY ENGLISH: Write at a 5th-grade reading level. NEVER use big words, academic jargon, difficult metaphors, or complex vocabulary. Anyone must be able to read and understand it in 3 seconds.
2. KEEP IT SHORT & CRISP:
   - "title": A short, clear, punchy headline (max 8 simple words).
   - "snippet": 1 to 2 short, simple sentences with plain words explaining the funny answer (max 20 words total).
   - "verdict": A super simple 3 to 6 word takeaway (e.g., "Verdict: Go to sleep and save your money.").
3. DIRECTLY FIT THE TOPIC: Directly mention the exact subject the user asked about in a funny, simple way.
4. Keep it friendly, funny, and safe.

Return ONLY valid JSON in this exact structure:
{"results":[{"title":"string","url":"idk://parody.ans","snippet":"string","verdict":"string","stats":{"usefulness":"1%","confidence":"100%","brainDrain":"90%"}}]}`
}

export function buildUserMessage(query, personality = 'savage') {
  return `User Question: "${query}"\nPersonality Mode: ${personality}\nDeliver a hyper-specific, hilarious, on-topic parody answer in JSON.`
}

export function parseAgentResponse(rawText) {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const parsed = JSON.parse(cleaned)
  if (!parsed || !Array.isArray(parsed.results)) throw new Error('Malformed agent response')

  const results = parsed.results
    .filter(r => r && typeof r.title === 'string' && typeof r.snippet === 'string')
    .slice(0, 1)
    .map(r => ({
      title: r.title.slice(0, 200),
      url: r.url || 'idk.invalid',
      snippet: r.snippet.slice(0, 400),
      verdict: typeof r.verdict === 'string' ? r.verdict.slice(0, 100) : 'Case closed. Reconsider your choices.',
      stats: r.stats && typeof r.stats === 'object' ? r.stats : { usefulness: '1%', confidence: '100%', brainDrain: '88%' }
    }))

  if (!results.length) throw new Error('No usable result')
  return results
}

