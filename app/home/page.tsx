"use client";
import { useMemo, useState } from "react";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { MODEL_CATALOG } from "@/lib/models";
import { AiModel, ApiKeys, ChatMessage, ChatThread } from "@/lib/types";
import { callGemini, callOpenRouter } from "@/lib/client";
import MarkdownLite from "@/components/MarkdownLite";
import { AiInput } from "@/components/AIChatBox";
import RightPanel from "@/components/chat/RightPanel";

export default function HomeChat() {
  const [keys] = useLocalStorage<ApiKeys>("bharat-minds:keys", {});
  const [threads, setThreads] = useLocalStorage<ChatThread[]>("bharat-minds:threads", []);
  const [activeId, setActiveId] = useLocalStorage<string | null>("bharat-minds:active-thread", null);
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>("bharat-minds:selected-models", [
    "gemini-2.5-flash",
    "llama-3.3-70b-instruct",
  ]);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [rightOpen, setRightOpen] = useState<boolean>(false);

  const activeThread = useMemo(() => threads.find(t => t.id === activeId) || null, [threads, activeId]);
  const messages = useMemo(() => activeThread?.messages ?? [], [activeThread]);
  const selectedModels = useMemo(() => MODEL_CATALOG.filter(m => selectedIds.includes(m.id)), [selectedIds]);

  function toggleModel(id: string) {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      const valid = new Set(MODEL_CATALOG.map(m => m.id));
      const currentValidCount = prev.filter(x => valid.has(x)).length;
      if (currentValidCount >= 5) return prev;
      return [...prev, id];
    });
  }

  function ensureThread(): ChatThread {
    if (activeThread) return activeThread;
    const t: ChatThread = { id: crypto.randomUUID(), title: "New Chat", messages: [], createdAt: Date.now() };
    setThreads(prev => [t, ...prev]);
    setActiveId(t.id);
    return t;
  }

  async function send(text: string, imageDataUrl?: string) {
    const prompt = text.trim();
    if (!prompt) return;
    if (selectedModels.length === 0) return alert("Select at least one model.");

    const userMsg: ChatMessage = { role: "user", content: prompt, ts: Date.now() };
    const thread = ensureThread();
    const nextHistory = [...(thread.messages ?? []), userMsg];
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, title: thread.title === "New Chat" ? prompt.slice(0, 40) : t.title, messages: nextHistory } : t));

    setLoadingIds(selectedModels.map(m => m.id));
    await Promise.allSettled(selectedModels.map(async (m: AiModel) => {
      try {
        let res: unknown;
        if (m.provider === "gemini") {
          res = await callGemini({ apiKey: keys.gemini || undefined, model: m.model, messages: nextHistory, imageDataUrl });
        } else {
          res = await callOpenRouter({ apiKey: keys.openrouter || undefined, model: m.model, messages: nextHistory });
        }
        const text = (() => {
          const r = res as { text?: unknown; error?: unknown } | null | undefined;
          const t = r && typeof r === 'object' ? (typeof r.text === 'string' ? r.text : undefined) : undefined;
          const e = r && typeof r === 'object' ? (typeof r.error === 'string' ? r.error : undefined) : undefined;
          return t || e || "No response";
        })();
        const asst: ChatMessage = { role: "assistant", content: String(text).trim(), modelId: m.id, ts: Date.now() };
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: [...(t.messages ?? nextHistory), asst] } : t));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const asst: ChatMessage = { role: "assistant", content: `[${m.label}] Error: ${msg}`.trim(), modelId: m.id, ts: Date.now() };
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: [...(t.messages ?? nextHistory), asst] } : t));
      } finally {
        setLoadingIds(prev => prev.filter(x => x !== m.id));
      }
    }));
  }

  // Group into turns, then render each answer stacked (ChatGPT-like)
  const turns = useMemo(() => {
    const rows: { user: ChatMessage; answers: ChatMessage[] }[] = [];
    let currentUser: ChatMessage | null = null;
    for (const m of messages) {
      if (m.role === "user") { currentUser = m; rows.push({ user: m, answers: [] }); }
      else if (m.role === "assistant" && currentUser) { rows[rows.length - 1]?.answers.push(m); }
    }
    return rows;
  }, [messages]);

  const anyLoading = loadingIds.length > 0;

  return (
    <div className="min-h-screen w-full bg-black text-white flex">
      {/* Left sidebar: chats */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-white/5">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="font-semibold text-sm">Bharat Minds</span>
          </div>
          <button
            onClick={() => {
              const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
              setThreads(prev => [t, ...prev]);
              setActiveId(t.id);
            }}
            className="text-xs px-2 py-1 rounded bg-orange-500/20 border border-orange-400/30 hover:bg-orange-500/30 cursor-pointer"
            title="New chat"
          >
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 && <div className="text-xs opacity-60 p-2">No chats yet</div>}
          {threads.map(t => {
            const isActive = t.id === activeId;
            return (
              <div key={t.id} className={`group flex items-center gap-1 rounded-md ${isActive ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}`}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className={`flex-1 text-left px-2 py-2 text-sm rounded-md cursor-pointer ${isActive ? 'text-white' : 'text-zinc-200'}`}
                  title={t.title || 'Untitled'}
                >
                  {t.title || 'Untitled'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setThreads(prev => prev.filter(x => x.id !== t.id)); if (activeId === t.id) setActiveId(null); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 cursor-pointer"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-black/70 backdrop-blur border-b border-white/10 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
                  setThreads(prev => [t, ...prev]);
                  setActiveId(t.id);
                }}
                className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-orange-500 text-white border border-orange-400/40 hover:bg-orange-600 cursor-pointer"
              >
                <Plus size={14} /> New Chat
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setRightOpen(v => !v)} className="text-xs px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 cursor-pointer">
                Models & Settings
              </button>
            </div>
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {turns.length === 0 && (
            <div className="max-w-2xl mx-auto text-center text-zinc-400 mt-10">
              Start a conversation. Select models in the panel, ask a question, and compare answers.
            </div>
          )}
          <div className="max-w-3xl mx-auto space-y-6">
            {turns.map((row, idx) => (
              <div key={idx} className="space-y-3">
                <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                  <div className="text-sm text-zinc-300"><span className="opacity-60">You:</span> {row.user.content}</div>
                </div>
                {row.answers.length === 0 ? (
                  <div className="rounded-lg border border-white/10 p-4 text-sm text-zinc-400">Waiting for responses…</div>
                ) : (
                  row.answers.map((ans) => {
                    const m = MODEL_CATALOG.find(x => x.id === ans.modelId);
                    const isLoading = ans.content.toLowerCase().includes("error:") === false && loadingIds.includes(ans.modelId || "");
                    return (
                      <div key={`${idx}-${ans.modelId}-${ans.ts}`} className={`rounded-lg p-4 ring-1 ${m?.good ? 'bg-amber-400/10 ring-amber-300/30' : 'bg-white/5 ring-white/10'}`}>
                        <div className="mb-2 text-xs inline-flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full border ${m?.good ? 'border-amber-300/40 text-amber-200' : 'border-white/20 text-zinc-200'}`}>{m?.label || ans.modelId}</span>
                          {isLoading && <span className="text-blue-400">Thinking…</span>}
                        </div>
                        <div className="prose prose-invert max-w-none text-sm">
                          <MarkdownLite text={ans.content} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-black/80 backdrop-blur border-t border-white/10 p-3">
          <div className="max-w-3xl mx-auto">
            <AiInput onSubmit={(t, img) => send(t, img)} loading={anyLoading} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <RightPanel open={rightOpen} onClose={() => setRightOpen(false)} selectedIds={selectedIds} onToggle={toggleModel} />
    </div>
  );
}

