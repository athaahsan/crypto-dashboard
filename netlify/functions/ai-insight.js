const SYSTEM_PROMPT = `
You are a professional crypto technical analyst.

STRICT RULES:
- Analyze ONLY provided data
- Do NOT assume external market context
- Be consistent and deterministic in reasoning.
`;

function build_user_prompt(payload) {
  const tf = payload.timeframe || '1d (daily)';
  
  return `
You are analyzing crypto technical indicators on the ${tf} timeframe.

OUTPUT RULES:
- buy_confidence + hold_confidence + sell_confidence MUST sum to 1.0
- Higher value = stronger directional bias.

DATA STRUCTURE:
- Any field ending with \`_last_N\` is a LIST ordered chronologically.
- The FIRST element is the OLDEST value.
- The LAST element is the MOST RECENT value.

PAYLOAD FIELD DESCRIPTIONS:
- price_last_14: Closing prices of the last 14 ${tf} candles ordered chronologically.
- ema_20: Latest EMA(20) value representing short-term trend baseline.
- ema_50: Latest EMA(50) value representing mid-term trend baseline.
- ema_100: Latest EMA(100) value representing long-term trend baseline.
- price_vs_ema20_percent: Percentage distance between latest price and EMA(20); positive means price above trend.
- price_vs_ema50_percent: Percentage distance between latest price and EMA(50); positive means price above trend.
- price_vs_ema100_percent: Percentage distance between latest price and EMA(100); positive means price above trend.
- rsi_14_last_7: RSI(14) values from the last 7 candles showing momentum progression.
- macd_histogram_12_26_9_last_7: MACD histogram values showing recent momentum acceleration or deceleration.
- adx_14: ADX(14) value indicating current trend strength regardless of direction.
- positive_di_14: Positive directional index measuring bullish directional pressure.
- negative_di_14: Negative directional index measuring bearish directional pressure.
- di_delta_14: Difference between positive_di_14 and negative_di_14 indicating directional dominance.
- crypto_fng_value: Current Fear & Greed Index numerical sentiment value.
- crypto_fng_class: Text classification of Fear & Greed sentiment state.

CONTEXT:
- Indicators derived from ${tf} candles.
- Latest candle contains live market tick update.
- Use ONLY provided values.

TECHNICAL PAYLOAD:
${JSON.stringify(payload, null, 2)}
`;
}

export const handler = async function (event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing API Key" }) };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: build_user_prompt(payload) }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "crypto_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                buy_confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 1,
                  description: "Probability score favoring a buy decision."
                },
                hold_confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 1,
                  description: "Probability score favoring a hold decision."
                },
                sell_confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 1,
                  description: "Probability score favoring a sell decision."
                },
                reasoning: {
                  type: "string",
                  description: "Brief technical explanation supporting the dominant decision. Keep it concise and signal-focused."
                }
              },
              required: ["buy_confidence", "hold_confidence", "sell_confidence", "reasoning"],
              additionalProperties: false
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: "Failed to fetch from OpenRouter", details: errorText }) };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
