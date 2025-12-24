'use client';

import { memo } from 'react';

interface NavigationCard {
  path: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  hoverColor: string;
  borderColor: string;
  animationDelay: string;
}

interface NavigationCardsProps {
  onNavigate: (path: string) => void;
}

/**
 * NavigationCards Component
 * -------------------------
 * Grid of navigation cards for different sections of the app
 */
function NavigationCards({ onNavigate }: NavigationCardsProps) {
  const cards: NavigationCard[] = [
    {
      path: '/tasks',
      icon: '📋',
      title: 'משימות',
      description: 'ניהול משימות ו-Epics',
      color: 'pink',
      hoverColor: 'purple',
      borderColor: 'pink-300',
      animationDelay: '0.4s',
    },
    {
      path: '/guests',
      icon: '👥',
      title: 'אורחים',
      description: 'ניהול רשימת אורחים ו-RSVP',
      color: 'purple',
      hoverColor: 'pink',
      borderColor: 'purple-300',
      animationDelay: '0.5s',
    },
    {
      path: '/vendors',
      icon: '🎤',
      title: 'ספקים',
      description: 'ניהול ספקים וקבלנים',
      color: 'blue',
      hoverColor: 'indigo',
      borderColor: 'blue-300',
      animationDelay: '0.6s',
    },
    {
      path: '/timeline',
      icon: '📅',
      title: 'לוח זמנים',
      description: 'תכנון זמנים ומילונים',
      color: 'green',
      hoverColor: 'teal',
      borderColor: 'green-300',
      animationDelay: '0.7s',
    },
  ];

  const getCardClasses = (card: NavigationCard) => {
    const baseClasses = 'group p-8 glass rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 text-center border-2 border-transparent animate-fadeIn transform hover:-translate-y-1';
    const borderClasses: Record<string, string> = {
      'pink-300': 'hover:border-pink-300',
      'purple-300': 'hover:border-purple-300',
      'blue-300': 'hover:border-blue-300',
      'green-300': 'hover:border-green-300',
    };
    return `${baseClasses} ${borderClasses[card.borderColor] || ''}`;
  };

  const getIconClasses = (color: string) => {
    const colorClasses: Record<string, string> = {
      pink: 'bg-gradient-to-br from-pink-100 to-pink-200',
      purple: 'bg-gradient-to-br from-purple-100 to-purple-200',
      blue: 'bg-gradient-to-br from-blue-100 to-blue-200',
      green: 'bg-gradient-to-br from-green-100 to-green-200',
    };
    return `p-4 ${colorClasses[color] || ''} rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300`;
  };

  const getTextColorClasses = (color: string, hoverColor: string) => {
    const textColors: Record<string, string> = {
      pink: 'text-pink-600',
      purple: 'text-purple-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
    };
    const hoverColors: Record<string, string> = {
      purple: 'group-hover:text-purple-600',
      pink: 'group-hover:text-pink-600',
      indigo: 'group-hover:text-indigo-600',
      teal: 'group-hover:text-teal-600',
    };
    return `mt-4 ${textColors[color] || ''} font-semibold ${hoverColors[hoverColor] || ''} transition-colors duration-300`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card) => (
        <button
          key={card.path}
          onClick={() => onNavigate(card.path)}
          className={getCardClasses(card)}
          style={{ animationDelay: card.animationDelay }}
        >
          <div className={getIconClasses(card.color)}>
            <span className="text-5xl">{card.icon}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">
            {card.title}
          </h3>
          <p className="text-gray-600">{card.description}</p>
          <div className={getTextColorClasses(card.color, card.hoverColor)}>
            לחץ לניהול →
          </div>
        </button>
      ))}
    </div>
  );
}

export default memo(NavigationCards);

