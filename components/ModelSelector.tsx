"use client";
import { useMemo } from 'react';
import { MODEL_CATALOG } from '@/lib/models';
import { AiModel } from '@/lib/types';

export default function ModelSelector({
  selectedIds,
  onToggle,
  max = 5,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  max?: number;
}) {
  const disabledIds = useMemo(() => {
    if (selectedIds.length < max) return new Set<string>();
    return new Set<string>(MODEL_CATALOG.filter(m => !selectedIds.includes(m.id)).map(m => m.id));
  }, [selectedIds, max]);

  return (
    <div className="flex flex-wrap gap-1.5">
      {MODEL_CATALOG.map((m: AiModel) => {
        const selected = selectedIds.includes(m.id);
        const disabled = disabledIds.has(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            disabled={!selected && disabled}
            className={`px-2 py-1 rounded-md border text-xs mobile-text-xs tracking-tight ${selected ? 'bg-blue-500 border-blue-500/50 text-white' : 'bg-gray-100 border-gray-300 text-gray-700'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            title={disabled ? `Max ${max} models at once` : ''}
          >
            {selected ? '✓ ' : ''}{m.label}
          </button>
        );
      })}
    </div>
  );
}
