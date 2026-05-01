import React from 'react';
import { Globe } from 'lucide-react';
import githubIcon from '../assets/github-light.svg';
import linkedinIcon from '../assets/linkedin-colored.svg';

export default function Footer() {
  return (
    <footer className="w-full mt-8 border-t border-base-300 bg-base-200/60 backdrop-blur-md text-base-content py-4 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        
        {/* Left Side: Logo & Copyright */}
        <aside className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
          <h2 className="text-lg font-black tracking-tighter flex items-baseline select-none">
            <span className="bg-gradient-to-br from-base-content to-base-content/60 bg-clip-text text-transparent">Crypt</span>
            <span className="bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent">Dash</span>
          </h2>
          <span className="hidden md:block w-1 h-1 bg-base-content/20 rounded-full" />
          <p className="text-xs font-medium text-base-content/50">
            Built by <a href="https://athaahsan.com" target="_blank" rel="noopener noreferrer" className="link link-hover font-bold text-base-content transition-colors">Atha</a> © {new Date().getFullYear()}
          </p>
        </aside> 
        
        {/* Right Side: Social Links */}
        <nav className="flex items-center gap-1">
          <a href="https://github.com/athaahsan/crypto-dashboard" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-circle btn-sm hover:scale-110 transition-transform" title="GitHub">
            <img src={githubIcon} alt="GitHub" className="w-4 h-4" />
          </a>
          <a href="https://www.linkedin.com/in/athaahsan" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-circle btn-sm hover:scale-110 transition-transform" title="LinkedIn">
            <img src={linkedinIcon} alt="LinkedIn" className="w-4 h-4" />
          </a>
          <a href="https://athaahsan.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-circle btn-sm hover:text-primary transition-colors" title="Portfolio">
            <Globe className="w-4 h-4" />
          </a>
        </nav>
        
      </div>
    </footer>
  );
}
