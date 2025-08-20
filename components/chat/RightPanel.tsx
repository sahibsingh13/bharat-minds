"use client";
import { X, Trash2, Plus } from "lucide-react";
import ModelSelector from "@/components/ModelSelector";
import Settings from "@/components/Settings";
import { useEffect, useState } from "react";
import { ChatThread } from "@/lib/types";

export default function RightPanel({
  open,
  onClose,
  selectedIds,
  onToggle,
  threads,
  activeId,
  setActiveId,
  setThreads,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggle: (id: string) => void;
  threads: ChatThread[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  setThreads: (updater: (prev: ChatThread[]) => ChatThread[]) => void;
}) {
  const [userName, setUserName] = useState<string>("");

  // Load username when panel opens
  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('bharat-minds:user-name');
        if (stored) setUserName(stored);
      } catch {}
    }
  }, [open]);

  function saveName() {
    try { 
      localStorage.setItem('bharat-minds:user-name', userName.trim()); 
      // Show a brief success indicator
      const button = document.querySelector('[data-save-name]') as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Saved!';
        button.disabled = true;
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 1000);
      }
    } catch {}
  }

  function newChat() {
    const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
  }

  function deleteChat(chatId: string) {
    setThreads((prev) => prev.filter((t) => t.id !== chatId));
    if (activeId === chatId) setActiveId(null);
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-full sm:w-[320px] z-40 transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm sm:hidden" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[320px] bg-white border-l border-gray-200 flex flex-col">
        <div className="p-2 border-b border-gray-200 flex items-center justify-between">
          <div className="text-xs mobile-text-xs font-semibold text-gray-900">Models & Settings</div>
          <button onClick={onClose} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"><X size={14} /></button>
        </div>
        <div className="p-2 space-y-3 overflow-y-auto">
          <div>
            <div className="text-xs mobile-text-xs uppercase opacity-60 mb-1 text-gray-600">Welcome</div>
            <div className="flex items-center gap-2">
              <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your name"
                className="flex-1 bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs mobile-text-xs focus:outline-none focus:border-blue-400" />
              <button 
                onClick={saveName} 
                data-save-name
                className="text-xs mobile-text-xs px-2 py-1.5 rounded bg-blue-500 text-white border border-blue-500/20 hover:bg-blue-600 cursor-pointer transition-colors"
              >
                Save
              </button>
            </div>
          </div>
          <div>
            <div className="text-xs mobile-text-xs uppercase opacity-60 mb-1 text-gray-600">Chats</div>
            <div className="space-y-1">
              <button onClick={newChat} className="w-full text-left text-xs mobile-text-xs px-2 py-1.5 rounded bg-blue-500/15 border border-blue-400/20 hover:bg-blue-500/25 cursor-pointer inline-flex items-center gap-2">
                <Plus size={12} /> New Chat
              </button>
              <div className="max-h-[180px] overflow-y-auto pr-1 space-y-1">
                {threads.map((t) => (
                  <div key={t.id} className={`group flex items-center gap-1 rounded ${t.id===activeId ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <button onClick={() => setActiveId(t.id)} className="flex-1 text-left px-2 py-1.5 text-xs mobile-text-xs text-gray-700">
                      {t.title || 'Untitled'}
                    </button>
                    <button onClick={() => deleteChat(t.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs mobile-text-xs uppercase opacity-60 mb-1 text-gray-600">Models</div>
            <ModelSelector selectedIds={selectedIds} onToggle={onToggle} />
          </div>
          <div>
            <div className="text-xs mobile-text-xs uppercase opacity-60 mb-1 text-gray-600">Settings</div>
            <Settings />
          </div>
        </div>
      </aside>
    </div>
  );
}

