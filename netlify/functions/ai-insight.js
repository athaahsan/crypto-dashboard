const SYSTEM_PROMPT = `
You are a professional crypto technical analyst.

STRICT RULES:
- Analyze ONLY provided data
- Do NOT assume external market context
- Be consistent and deterministic in reasoning.
`;

const MODELS = [
  "google/gemini-3.8-flash",
  "google/gemini-3.7-flash",
  "google/gemini-3.6-flash",
  "google/gemini-3.5-flash"
];

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
- bollinger_middle_20_2: Middle Bollinger Band using SMA(20) of closing prices.
- bollinger_upper_20_2: Upper Bollinger Band at SMA(20) + 2 standard deviations.
- bollinger_lower_20_2: Lower Bollinger Band at SMA(20) - 2 standard deviations.
- bollinger_percent_b_20_2: Relative price position within the Bollinger Bands. 0 means at the lower band, 0.5 at the middle band, and 1 at the upper band. Values outside 0-1 mean price is outside the bands.
- bollinger_bandwidth_percent_20_2: Band width as a percentage of the middle band, indicating recent volatility expansion or compression.
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

export const handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);

    const openRouterApiKey = globalThis.process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing API Key" }) };
    }

    const requestBody = {
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
    };

    const errors = [];

    for (const model of MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            ...requestBody
          })
        });

        if (!response.ok) {
          const details = await response.text();
          throw new Error(`OpenRouter returned ${response.status}: ${details}`);
        }

        const data = await response.json();

        if (data.error || !Array.isArray(data.choices) || data.choices.length === 0) {
          throw new Error(data.error?.message || "OpenRouter returned no completion choices");
        }

        const content = data.choices[0]?.message?.content;

        if (typeof content !== "string") {
          throw new Error("OpenRouter returned no completion content");
        }

        JSON.parse(content);

        return {
          statusCode: 200,
          body: JSON.stringify({
            ...data,
            model_used: model
          })
        };
      } catch (error) {
        errors.push({ model, error: error.message });
        console.error(`AI insight request failed for ${model}:`, error);
      }
    }

    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "All AI insight models failed",
        details: errors
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
