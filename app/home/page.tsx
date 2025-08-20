"use client";
import { useMemo, useState } from "react";
import { Trash2, Cog } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import Logo from "@/components/Logo";
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
  const [welcomeShown, setWelcomeShown] = useLocalStorage<boolean>("bharat-minds:welcome-shown", false);
  const [userName, setUserName] = useState<string>("");
  
  // auto-scroll helper on new content
  function scrollToBottom() {
    try { document.getElementById('messages-bottom')?.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch {}
  }

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
    scrollToBottom();
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

  // Load stored user name
  if (typeof window !== 'undefined' && !userName) {
    try { const n = localStorage.getItem('bharat-minds:user-name'); if (n) setUserName(n); } catch {}
  }

  // Welcome message on revisit
  if (typeof window !== 'undefined' && !welcomeShown) {
    try {
      const first = localStorage.getItem('bharat-minds:user-name');
      if (first) {
        setWelcomeShown(true);
        const t = ensureThread();
        const msg: ChatMessage = { role: 'assistant', content: `Welcome back, ${first}! Ask me anything.`, ts: Date.now(), modelId: 'system' };
        setThreads(prev => prev.map(x => x.id === t.id ? { ...x, messages: [...(x.messages||[]), msg] } : x));
      }
    } catch {}
  }

  return (
    <div className="min-h-screen w-full bg-white text-black flex">
      {/* Left sidebar: chats */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <Logo size={18} />
          <button
            onClick={() => setRightOpen(true)}
            className="relative h-8 w-8 rounded-full border border-blue-400/30 overflow-hidden cursor-pointer"
            title="Open settings"
          >
            <span className="absolute inset-0 animate-pulse bg-blue-500/20" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 && <div className="text-xs opacity-60 p-2">No chats yet</div>}
          {threads.map(t => {
            const isActive = t.id === activeId;
            return (
              <div key={t.id} className={`group flex items-center gap-1 rounded-md ${isActive ? 'bg-blue-100' : 'bg-transparent hover:bg-gray-100'}`}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className={`flex-1 text-left px-2 py-2 text-xs rounded-md cursor-pointer ${isActive ? 'text-blue-900' : 'text-gray-700'}`}
                  title={t.title || 'Untitled'}
                >
                  {t.title || 'Untitled'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setThreads(prev => prev.filter(x => x.id !== t.id)); if (activeId === t.id) setActiveId(null); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 cursor-pointer"
                  title="Delete chat"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-dvh">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-200 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              
              
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setRightOpen(v => !v)} className="h-8 w-8 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer inline-flex items-center justify-center" title="Settings">
                <Cog size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-4" id="messages-container">
          {turns.length === 0 && selectedModels.length === 0 && (
            <div className="max-w-2xl mx-auto text-center text-gray-500 mt-10">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 border border-blue-200 overflow-hidden">
                <div className="w-full h-full animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
              <div className="mt-3 text-sm">Start a conversation from the settings panel and compare answers.</div>
            </div>
          )}
          {turns.length === 0 && selectedModels.length > 0 && (
            <div className="max-w-2xl mx-auto text-center text-gray-500 mt-10">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 border border-blue-200 overflow-hidden">
                <div className="w-full h-full animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
              <div className="mt-3 text-sm">Models selected. Ask your first question to get started.</div>
            </div>
          )}
          <div className="max-w-3xl mx-auto space-y-4">
            {turns.map((row, idx) => (
              <div key={idx} className="space-y-2">
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                  <div className="text-xs text-gray-600"><span className="opacity-60">You:</span> {row.user.content}</div>
                </div>
                {/* Answers inline tabs when 2+ models selected */}
                {row.answers.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative inline-flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                      </span>
                      <span className="text-gray-600">Waiting for responses…</span>
                    </div>
                  </div>
                ) : selectedModels.length > 1 ? (
                  <div>
                    <div className="flex gap-2 mb-2">
                      {selectedModels.map((m, i) => (
                        <a key={m.id} href={`#turn-${idx}-${m.id}`} className="text-[10px] px-2 py-1 rounded bg-gray-100 border border-gray-200 hover:bg-gray-200">
                          {m.label}
                        </a>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {selectedModels.map((m) => {
                        const ans = row.answers.find(a => a.modelId === m.id);
                        return (
                          <div id={`turn-${idx}-${m.id}`} key={m.id} className="rounded-lg p-3 ring-1 bg-gray-50 ring-gray-200">
                            <div className="mb-2 text-[10px] inline-flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full border border-gray-300 text-gray-700">{m.label}</span>
                            </div>
                            <div className="prose prose-sm max-w-none text-xs">
                              <MarkdownLite text={ans?.content || '…'} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  row.answers.map((ans) => {
                    const m = MODEL_CATALOG.find(x => x.id === ans.modelId);
                    const isLoading = ans.content.toLowerCase().includes("error:") === false && loadingIds.includes(ans.modelId || "");
                    return (
                      <div key={`${idx}-${ans.modelId}-${ans.ts}`} className={`rounded-lg p-3 ring-1 ${m?.good ? 'bg-amber-50 ring-amber-200' : 'bg-gray-50 ring-gray-200'}`}>
                        <div className="mb-2 text-[10px] inline-flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full border ${m?.good ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700'}`}>{m?.label || ans.modelId}</span>
                          {isLoading && <span className="text-blue-600">Thinking…</span>}
                        </div>
                        <div className="prose prose-sm max-w-none text-xs">
                          <MarkdownLite text={ans.content} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ))}
            <div id="messages-bottom" />
          </div>
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur border-t border-gray-200 p-3">
          <div className="max-w-3xl mx-auto">
            <AiInput onSubmit={(t, img) => send(t, img)} loading={anyLoading} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <RightPanel
        open={rightOpen}
        onClose={() => setRightOpen(false)}
        selectedIds={selectedIds}
        onToggle={toggleModel}
        threads={threads}
        activeId={activeId}
        setActiveId={setActiveId}
        setThreads={setThreads}
      />
    </div>
  );
}

