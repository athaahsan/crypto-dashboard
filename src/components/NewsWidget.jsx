import React from 'react';
import { Newspaper } from 'lucide-react';

export default function NewsWidget({ news }) {
  if (!news || news.length === 0) return null;

  return (
    <div className="bg-base-200 border border-base-300 rounded-2xl shadow-sm p-4 flex flex-col h-full min-h-0 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Newspaper className="w-5 h-5" />
        </div>
        <h3 className="text-sm md:text-base font-bold text-base-content/80">Latest News</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {news.map((item, i) => (
          <a 
            key={i} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex gap-3 p-3 bg-base-100 rounded-xl hover:bg-base-300 transition-colors duration-200 border border-base-300"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-base-300 border border-base-300">
              <img src={item.thumb_2x || item.thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <h4 className="text-sm font-bold text-base-content leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-base-content/50 font-medium truncate pr-2">{item.news_site || item.author}</span>
                <span className="text-[10px] text-base-content/40 shrink-0">
                  {new Date(item.created_at * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
