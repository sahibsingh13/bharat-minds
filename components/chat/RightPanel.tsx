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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bharat-minds:user-name');
      if (stored) setUserName(stored);
    } catch {}
  }, []);

  function saveName() {
    try { localStorage.setItem('bharat-minds:user-name', userName.trim()); } catch {}
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
    <div className={`fixed right-0 top-0 h-full w-full sm:w-[380px] z-40 transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm sm:hidden" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[380px] bg-black border-l border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-semibold">Models & Settings</div>
          <button onClick={onClose} className="p-2 rounded bg-white/10 hover:bg-white/15 cursor-pointer"><X size={16} /></button>
        </div>
        <div className="p-3 space-y-4 overflow-y-auto">
          <div>
            <div className="text-xs uppercase opacity-60 mb-1">Welcome</div>
            <div className="flex items-center gap-2">
              <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your name"
                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <button onClick={saveName} className="text-xs px-3 py-2 rounded bg-blue-500 text-white border border-blue-500/20 hover:bg-blue-600 cursor-pointer">Save</button>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase opacity-60 mb-1">Chats</div>
            <div className="space-y-1">
              <button onClick={newChat} className="w-full text-left text-xs px-3 py-2 rounded bg-blue-500/15 border border-blue-400/20 hover:bg-blue-500/25 cursor-pointer inline-flex items-center gap-2">
                <Plus size={14} /> New Chat
              </button>
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1">
                {threads.map((t) => (
                  <div key={t.id} className={`group flex items-center gap-1 rounded ${t.id===activeId ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                    <button onClick={() => setActiveId(t.id)} className="flex-1 text-left px-2 py-2 text-sm">
                      {t.title || 'Untitled'}
                    </button>
                    <button onClick={() => deleteChat(t.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

