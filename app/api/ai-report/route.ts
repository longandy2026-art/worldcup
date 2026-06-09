import { NextResponse } from 'next/server'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function POST(request: Request) {
  try {
    const { matchId, homeTeam, awayTeam, version = 'overseas' } = await request.json()

    const systemPrompt = version === 'overseas'
      ? `You are SportMind AI, a world-class football tactical analyst. Analyze the upcoming match using data-driven insights. Include: team comparison (Elo, form, squad value), tactical breakdown, score prediction with confidence level, and key betting insights (odds, value bets). Keep it sharp, professional, and under 800 words.`
      : `你是 SportMind AI 首席赛事数据分析师。请基于球队数据生成赛事前瞻报告。严禁出现任何博彩相关词汇。使用"市场信心指数"替代赔率相关表述。包含：纸面战力对比、战术推演、比分预测与置信度、核心看点。专业但不枯燥，800字以内。`

    const userPrompt = version === 'overseas'
      ? `Generate an AI match intelligence report for ${homeTeam} vs ${awayTeam} (Match #${matchId}). Use the 2026 World Cup context. Provide specific data points and a score prediction.`
      : `生成 ${homeTeam} vs ${awayTeam} 的2026世界杯AI赛事前瞻报告。基于两队Elo评分、近期战绩、阵容身价进行深度分析。给出推荐比分和战力置信度。`

    const apiKey = process.env.DEEPSEEK_API_KEY || ''
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 })
    }

    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `AI API error: ${err}` }, { status: 502 })
    }

    const json = await res.json()
    const content = json.choices?.[0]?.message?.content || 'Report generation failed.'

    return NextResponse.json({ content, matchId, version })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
