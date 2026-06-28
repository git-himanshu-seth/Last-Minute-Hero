import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Loader2 } from 'lucide-react';

interface AiPolishButtonProps {
  text: string;
  onPolish: (polishedText: string) => void;
  className?: string;
  tooltipText?: string;
}

export const AiPolishButton: React.FC<AiPolishButtonProps> = ({ 
  text, 
  onPolish, 
  className = '', 
  tooltipText = 'AI Grammar Polish' 
}) => {
  const { fixGrammarWithAi, showToast } = useApp();
  const [loading, setLoading] = useState(false);

  const handlePolish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!text.trim()) {
      showToast('Please type some text first for the AI to polish.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const polished = await fixGrammarWithAi(text);
      if (polished) {
        onPolish(polished);
        showToast('Text polished successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Failed to polish text:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePolish}
      disabled={loading}
      title={tooltipText}
      className={`p-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 hover:text-orange-300 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
    </button>
  );
};
