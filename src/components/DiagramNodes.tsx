import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { AlertTriangle, CheckCircle, Clock, Diamond, Circle, Image as ImageIcon, FileText } from 'lucide-react';

export const TaskNode = memo(({ data, selected }: NodeProps) => {
  const isCritical = data.riskLevel === 'critical';
  const isCompleted = data.status === 'completed';

  return (
    <div className={`px-4 py-3 rounded-xl border-2 transition-all ${
      selected ? 'border-accent shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-105' : 'border-border-main shadow-lg'
    } bg-surface min-w-[180px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-accent border-2 border-surface" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            ) : isCritical ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-accent" />
            )}
            <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest">
              {data.category || 'Task'}
            </span>
          </div>
          {data.hours && (
            <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              {data.hours}h
            </span>
          )}
        </div>

        <div className="text-xs font-bold text-primary-text leading-snug">
          {data.label}
        </div>

        {data.description && (
          <div className="text-[10px] text-secondary-text line-clamp-2 leading-relaxed italic border-l border-border-main pl-2">
            {data.description}
          </div>
        )}

        {data.imageUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-border-main aspect-video bg-black/20">
            <img src={data.imageUrl} alt="Node asset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
        
        <div className="mt-1 pt-1 border-t border-border-main/50 text-[8px] text-secondary-text font-mono uppercase tracking-tighter opacity-50 text-right group">
          <span className="group-hover:text-accent group-hover:opacity-100 transition duration-200">
            Click to edit
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-accent border-2 border-surface" />
    </div>
  );
});

export const StepNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-2.5 rounded-full border-2 transition-all ${
      selected ? 'border-accent bg-accent/10' : 'border-border-main bg-surface'
    } flex items-center justify-center min-w-[120px]`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-accent" />
      <div className="text-[11px] font-semibold text-primary-text">{data.label}</div>
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-secondary-text font-mono uppercase tracking-tighter opacity-40 whitespace-nowrap bg-surface px-1.5 py-0.5 rounded border border-border-main/30 shadow-sm transition hover:opacity-100 hover:border-accent/50 cursor-pointer">
        Add or edit
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-accent" />
    </div>
  );
});

export const DecisionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`w-[100px] h-[100px] flex items-center justify-center relative transition-all duration-300 ${selected ? 'scale-110' : ''}`}>
      <div className={`absolute inset-0 rotate-45 border-2 bg-surface transition-colors ${selected ? 'border-accent shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-border-main shadow-lg'}`} />
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-accent !z-10" />
      <div className="relative z-10 text-[10px] font-bold text-primary-text text-center px-2 transform-none">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-accent !z-10" id="bottom" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 bg-accent !z-10" id="left" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-accent !z-10" id="right" />
    </div>
  );
});

export const StartEndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`px-6 py-2 rounded-3xl border-2 transition-all ${
      selected ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-border-main bg-surface'
    } flex items-center justify-center min-w-[100px]`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-accent" />
      <div className="text-[10px] font-black uppercase tracking-widest text-primary-text">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-accent" />
    </div>
  );
});

export const ImageNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`p-1 rounded-xl border-2 transition-all ${
      selected ? 'border-accent shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-border-main bg-surface'
    } bg-surface overflow-hidden group`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-accent" />
      
      <div className="relative min-w-[150px] min-h-[100px] flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt="Asset" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-secondary-text p-6">
            <ImageIcon className="w-8 h-8 opacity-20" />
            <span className="text-[9px] uppercase font-bold tracking-wider">No Image</span>
          </div>
        )}
        
        {data.label && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1.5 text-center">
            <div className="text-[9px] font-bold text-white truncate">{data.label}</div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-accent" />
    </div>
  );
});
