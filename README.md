# cryptDash - Crypto Dashboard

A modern, responsive, and feature-rich cryptocurrency dashboard built with React and Tailwind CSS.

**🚀 The project is live here:** [https://crypto.athaahsan.com/](https://crypto.athaahsan.com/)

## Features

- **Live Market Data:** Real-time price updates and candlestick/line charts powered by TradingView's Lightweight Charts and Binance APIs.
- **AI-Powered Technical Analysis:** On-demand technical insights driven by Gemini 3 Flash via OpenRouter. The AI analyzes current market structure, momentum, and indicators to provide a directional probability and reasoning.
- **Crypto News Feed:** A scrolling feed of the latest cryptocurrency news aggregated via the CoinGecko API.
- **Fear & Greed Index:** Real-time tracking of market sentiment (Fear & Greed Index) sourced from Alternative.me, visualized with historical trending dots synced to the chart timeline.
- **Responsive "Cyber-Glass" UI:** Built with DaisyUI and Tailwind CSS, featuring a sleek, fully responsive grid layout that adapts perfectly from mobile screens to ultrawide desktop monitors.
- **Dynamic KPI Ribbon:** A stylish terminal-style ribbon displaying real-time Price, All-Time Highs (with dates), and Period High/Low metrics.

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS, DaisyUI
- **Icons:** Lucide React
- **Charting:** `lightweight-charts`
- **APIs:** Binance (Market Data), Alternative.me (Sentiment), CoinGecko (News), OpenRouter (AI Insights)

## Getting Started

1. Clone the repository
2. Install dependencies using `npm install`
3. Add your OpenRouter API key to your environment variables or Netlify functions
4. Start the development server with `npm run dev` (or `netlify dev` to test serverless functions locally)
