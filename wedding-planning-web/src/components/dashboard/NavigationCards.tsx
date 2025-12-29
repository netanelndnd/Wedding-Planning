'use client';

import { memo } from 'react';

interface NavigationCard {
  path: string;
  title: string;
  description: string;
  color: string;
  bgImage: string;
  animationDelay: string;
  icon: JSX.Element;
}

interface NavigationCardsProps {
  onNavigate: (path: string) => void;
}

/**
 * NavigationCards Component
 * -------------------------
 * Grid of navigation cards for different sections of the app with hero backgrounds
 */
function NavigationCards({ onNavigate }: NavigationCardsProps) {
  const cards: NavigationCard[] = [
    {
      path: '/tasks',
      title: 'משימות',
      description: 'ניהול משימות ותכנון',
      color: '#6D28D9',
      bgImage: 'linear-gradient(135deg, rgba(109,40,217,0.08) 0%, rgba(190,24,93,0.05) 100%)',
      animationDelay: '0.4s',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      path: '/guests',
      title: 'אורחים',
      description: 'ניהול רשימת אורחים',
      color: '#BE185D',
      bgImage: 'linear-gradient(135deg, rgba(190,24,93,0.08) 0%, rgba(109,40,217,0.05) 100%)',
      animationDelay: '0.5s',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      path: '/vendors',
      title: 'ספקים',
      description: 'ניהול ספקים ותשלומים',
      color: '#D4AF37',
      bgImage: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(109,40,217,0.05) 100%)',
      animationDelay: '0.6s',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      path: '/timeline',
      title: 'לוח זמנים',
      description: 'תכנון לוח הזמנים',
      color: '#87A878',
      bgImage: 'linear-gradient(135deg, rgba(135,168,120,0.08) 0%, rgba(109,40,217,0.05) 100%)',
      animationDelay: '0.7s',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card) => (
        <button
          key={card.path}
          onClick={() => onNavigate(card.path)}
          className="group p-8 rounded-2xl shadow-lg card-hover text-right border-2 hover:border-[#6D28D9]/40 animate-fadeIn relative overflow-hidden transition-all duration-300"
          style={{ 
            animationDelay: card.animationDelay,
            background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
            borderColor: `${card.color}40`,
            boxShadow: `0 4px 20px ${card.color}15, 0 2px 8px rgba(0,0,0,0.08)`,
          }}
        >
          {/* Hero background overlay */}
          <div 
            className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 80% 20%, ${card.color}30 0%, transparent 50%)`,
            }}
          />
          
          <div className="relative z-10">
            <div 
              className="p-3 rounded-xl inline-block mb-4 transition-colors duration-300"
              style={{ backgroundColor: `${card.color}15` }}
            >
              <div style={{ color: card.color }}>{card.icon}</div>
            </div>
            <h3 
              className="text-2xl font-serif font-bold text-[#2D2A32] mb-2 group-hover:text-[#6D28D9] transition-colors duration-300"
            >
              {card.title}
            </h3>
            <p className="text-[#6B6573] font-sans">{card.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default memo(NavigationCards);

