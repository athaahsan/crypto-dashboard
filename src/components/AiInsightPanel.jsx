import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Activity, AlertTriangle, Code, Info } from 'lucide-react';
import clsx from 'clsx';

const syntaxHighlight = (json) => {
  if (!json) return '';
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'text-warning'; // number
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-secondary'; // key
      } else {
        cls = 'text-success'; // string
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-info'; // boolean
    } else if (/null/.test(match)) {
      cls = 'text-base-content/50'; // null
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
};

export default function AiInsightPanel({ payload, symbol }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('insight'); // 'insight' | 'payload'

  const fetchInsight = async () => {
    if (!payload) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights');
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        setInsight(JSON.parse(content));
        setActiveTab('insight');
      } else {
        throw new Error('Invalid response structure from AI');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-200 border border-base-300 rounded-2xl h-full flex flex-col overflow-hidden shadow-xl">
      {/* Header Tabs using daisyUI */}
      <div className="tabs tabs-bordered w-full border-b border-base-300 bg-base-300/30 pt-2 px-2">
        <button
          onClick={() => setActiveTab('insight')}
          className={clsx("tab tab-lg flex-1 gap-2 transition-colors", activeTab === 'insight' && "tab-active font-bold text-primary")}
        >
          <Sparkles className="w-4 h-4" /> Analysis
        </button>
        <button
          onClick={() => setActiveTab('payload')}
          className={clsx("tab tab-lg flex-1 gap-2 transition-colors", activeTab === 'payload' && "tab-active font-bold text-primary")}
        >
          <Code className="w-4 h-4" /> Payload
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col overflow-hidden min-h-0">
        {activeTab === 'payload' ? (
          <div className="flex-1 flex flex-col min-h-0 gap-4">
            <div className="alert bg-base-300 border border-base-300 shadow-sm shrink-0 rounded-xl">
              <Info className="w-5 h-5 text-info shrink-0" />
              <span className="text-xs">
                Exact JSON sent to Gemini 3 Flash, with pre-calculated indicators to guarantee accuracy.
              </span>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar bg-base-300 rounded-xl border border-base-300 p-4 min-h-0 shadow-inner">
              <pre 
                className="text-xs font-mono text-base-content/80"
                dangerouslySetInnerHTML={{
                  __html: payload ? syntaxHighlight(JSON.stringify(payload, null, 2)) : 'Loading data...'
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            {!insight && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <BrainCircuit className="w-16 h-16 text-base-content/20" />
                <div className="space-y-2 max-w-[250px]">
                  <h3 className="text-base-content font-bold text-lg">Ready for Analysis</h3>
                  <p className="text-base-content/60 text-sm">
                    Generate AI-powered technical analysis using the latest indicators for {symbol}.
                  </p>
                </div>
                <button
                  onClick={fetchInsight}
                  disabled={!payload}
                  className="btn btn-primary shadow-lg shadow-primary/20 rounded-xl px-8"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Insight
                </button>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <span className="loading loading-ring w-16 text-primary"></span>
                <div className="space-y-1">
                  <p className="text-primary font-bold text-lg">Analyzing market structure</p>
                  <p className="text-sm text-base-content/50">Processing MACD, RSI, and EMAs...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-error shadow-sm rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="font-bold">Analysis Failed</h3>
                  <div className="text-xs">{error}</div>
                </div>
              </div>
            )}

            {insight && !loading && (
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Directional Probability
                  </h3>
                  
                  <div className="space-y-4 bg-base-300 p-5 rounded-xl border border-base-300 shadow-inner">
                    <ConfidenceMeter label="Buy" value={insight.buy_confidence} color="success" />
                    <ConfidenceMeter label="Hold" value={insight.hold_confidence} color="info" />
                    <ConfidenceMeter label="Sell" value={insight.sell_confidence} color="error" />
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider">AI Reasoning</h3>
                  <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 flex-1 shadow-sm">
                    <p className="text-base-content/90 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {insight.reasoning}
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchInsight}
                  className="btn btn-primary btn-block rounded-xl shadow-sm"
                >
                  Regenerate Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfidenceMeter({ label, value, color }) {
  const percentage = Math.round(value * 100);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-base-content/80">{label}</span>
        <span className="text-sm font-bold text-base-content">{percentage}%</span>
      </div>
      <progress className={`progress progress-${color} w-full`} value={percentage} max="100"></progress>
    </div>
  );
}