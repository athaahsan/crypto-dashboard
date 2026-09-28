# CryptDash

CryptDash is a responsive cryptocurrency market dashboard that brings live price action, technical indicators, market sentiment, crypto news, and AI-generated trading context into one focused interface.

**Live site:** [https://crypto.athaahsan.com/](https://crypto.athaahsan.com/)

## Highlights

- **Live crypto market tracking:** Monitors selected USDT pairs with Binance kline and ticker data.
- **Realtime-first data flow:** Streams Binance WebSocket updates with a polling fallback for less reliable environments.
- **Interactive chart experience:** Switch between candlestick, line, and area views with chart overlays and indicators.
- **Technical analysis toolkit:** Includes volume, EMA, MA, Bollinger Bands, MACD, RSI, ADX, and directional index calculations.
- **AI-powered market insight:** Converts the latest technical payload into structured buy, hold, and sell confidence through an OpenRouter-backed Netlify function.
- **Sentiment at a glance:** Displays the Fear & Greed Index history from Alternative.me alongside market context.
- **Crypto news feed:** Surfaces recent Cointelegraph RSS items directly in the dashboard.
- **Responsive dark interface:** Built as a polished, mobile-friendly trading dashboard with Tailwind CSS, DaisyUI, and Lucide icons.

## Tech Stack

- **Frontend:** React 19, Vite
- **Styling:** Tailwind CSS 4, DaisyUI
- **Charts:** TradingView Lightweight Charts
- **Icons:** Lucide React
- **Serverless:** Netlify Functions
- **Data sources:** Binance, Alternative.me, Cointelegraph RSS, OpenRouter

## Disclaimer

CryptDash is built for market research and educational use. AI-generated insights and technical indicators are not financial advice.
