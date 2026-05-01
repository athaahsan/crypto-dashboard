import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export default function CoinSelector({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const getLogoUrl = (sym) => `https://assets.coincap.io/assets/icons/${sym.replace('USDT', '').toLowerCase()}@2x.png`;

  return (
    <div className="relative flex-1 min-w-0" ref={dropdownRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="h-8 w-full hover:cursor-pointer text-lg sm:text-xl font-bold rounded-lg px-2 flex items-center justify-center gap-1.5 transition-colors"
      >
        <img 
          src={getLogoUrl(value)} 
          alt="" 
          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
          onError={(e) => e.target.style.display = 'none'}
        />
        <span className="truncate">{value.replace('USDT', '')}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-3 w-64 bg-base-200/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[350px] animate-fade-in-up origin-top">
          <div className="p-2 border-b border-white/10 sticky top-0 bg-transparent shrink-0 z-10">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coins..."
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-1 focus:ring-accent/50 transition-all placeholder-base-content/40"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3",
                    value === opt
                      ? "bg-accent/20 text-primary-content"
                      : "hover:bg-white/10 text-base-content/80 hover:text-base-content"
                  )}
                >
                  <img 
                    src={getLogoUrl(opt)} 
                    alt="" 
                    className="w-5 h-5 rounded-full"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <span className="flex-1 truncate">{opt.replace('USDT', '')}</span>
                  {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-base-content/50">No coins found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
