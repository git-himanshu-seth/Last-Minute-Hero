import React, { useEffect, useState } from 'react';
import { Monitor, SquareTerminal, Moon, Sun, Cloud, Droplets, Leaf, Zap, AlertTriangle } from 'lucide-react';

type Theme = 'dark' | 'light' | 'soft' | 'ocean' | 'forest' | 'crimson' | 'cyberpunk' | 'mac' | 'windows';

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themes: { id: Theme; label: string; icon: React.FC<any> }[] = [
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'soft', label: 'Soft Lavender', icon: Cloud },
    { id: 'ocean', label: 'Ocean Blue', icon: Droplets },
    { id: 'forest', label: 'Forest Green', icon: Leaf },
    { id: 'crimson', label: 'Crimson Emergency', icon: AlertTriangle },
    { id: 'cyberpunk', label: 'Neon Cyberpunk', icon: Zap },
    { id: 'mac', label: 'macOS UI', icon: Monitor },
    { id: 'windows', label: 'Windows UI', icon: SquareTerminal },
  ];

  return (
    <div className="p-6 glass-panel rounded-2xl">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary-text">
        <Monitor className="w-5 h-5 text-accent" />
        Appearance & Themes
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;
          
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                isActive 
                  ? 'border-accent bg-accent/10 text-accent' 
                  : 'border-border-main hover:border-white/20 text-secondary-text hover:text-primary-text'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-secondary-text'}`} />
              <span className="font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-accent/5 border border-accent/10 rounded-xl">
        <p className="text-xs text-accent/80 leading-relaxed">
          <strong>Tip:</strong> Themes change the global aesthetic including background colors, text contrast, and accent highlights. 
          The MacOS and Windows presets adjust the structural layout feel.
        </p>
      </div>
    </div>
  );
};
