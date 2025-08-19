"use client";
import { X } from "lucide-react";
import ModelSelector from "@/components/ModelSelector";
import Settings from "@/components/Settings";

export default function RightPanel({
  open,
  onClose,
  selectedIds,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className={`fixed right-0 top-0 h-full w-full sm:w-[380px] z-40 transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm sm:hidden" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[380px] bg-black border-l border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-semibold">Models & Settings</div>
          <button onClick={onClose} className="p-2 rounded bg-white/10 hover:bg-white/15 cursor-pointer"><X size={16} /></button>
        </div>
        <div className="p-3 space-y-4 overflow-y-auto">
          <div>
            <div className="text-xs uppercase opacity-60 mb-1">Models</div>
            <ModelSelector selectedIds={selectedIds} onToggle={onToggle} />
          </div>
          <div>
            <div className="text-xs uppercase opacity-60 mb-1">Settings</div>
            <Settings />
          </div>
        </div>
      </aside>
    </div>
  );
}

