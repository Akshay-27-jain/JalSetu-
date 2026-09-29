import React from 'react';
import { Waves, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  className?: string;
  dark?: boolean;
}

const sizeMap = {
  sm: { box: 'h-7 w-7', icon: 'h-4 w-4', text: 'text-lg' },
  md: { box: 'h-9 w-9', icon: 'h-5 w-5', text: 'text-xl' },
  lg: { box: 'h-11 w-11', icon: 'h-6 w-6', text: 'text-2xl' },
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', to = '/', className = '', dark = false }) => {
  const s = sizeMap[size];
  const content = (
    <span className={`inline-flex items-center gap-2.5 font-display font-bold tracking-tight ${className}`}>
      <span
        className={`flex ${s.box} items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-aqua-500 to-teal-400 text-white shadow-glow`}
      >
        <Waves className={s.icon} />
      </span>
      <span className={`font-display font-extrabold tracking-tight ${s.text} ${dark ? 'text-white' : 'text-slate-900'}`}>
        Jal<span className="bg-gradient-to-r from-aqua-400 to-brand-500 bg-clip-text text-transparent">Setu</span>
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex transition-opacity hover:opacity-95" aria-label="JalSetu home">
        {content}
      </Link>
    );
  }
  return content;
};
