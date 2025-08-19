"use client";
import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { ApiKeys } from '@/lib/types';
import ModelSelector from '@/components/ModelSelector';

export default function Settings() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useLocalStorage<ApiKeys>('bharat-minds:keys', {});
  const [gemini, setGemini] = useState(keys.gemini || '');
  const [openrouter, setOpenrouter] = useState(keys.openrouter || '');
  const [tab, setTab] = useState<'profile'|'models'|'keys'>('profile');
  const [userName, setUserName] = useState<string>('');
  const [nameSaved, setNameSaved] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>('bharat-minds:selected-models', []);

  const save = () => {
    const next = { gemini: gemini.trim() || undefined, openrouter: openrouter.trim() || undefined };
    setKeys(next);
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  };

  useEffect(() => {
    try {
      const n = localStorage.getItem('bharat-minds:user-name') || '';
      setUserName(n);
      setNameSaved(!!n);
    } catch {}
  }, []);

  function saveName() {
    try {
      const val = userName.trim();
      localStorage.setItem('bharat-minds:user-name', val);
      setNameSaved(!!val);
      // lightweight toast
      const t = document.createElement('div');
      t.textContent = 'Username saved successfully';
      t.className = 'fixed left-1/2 -translate-x-1/2 bottom-6 z-[100] px-4 py-2 rounded bg-blue-600 text-white text-sm shadow-lg';
      document.body.appendChild(t);
      setTimeout(()=>{ t.remove(); }, 1500);
    } catch {}
  }

  // Allow programmatic open from anywhere (e.g., rate-limit CTA)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-settings', handler as EventListener);
    return () => window.removeEventListener('open-settings', handler as EventListener);
  }, []);

  return (
    <div>
      <button onClick={() => setOpen(true)} className="text-sm px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors">⚙️ Preferences</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-gray-900 text-white p-0 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-base font-semibold">Preferences</h2>
              <button onClick={() => setOpen(false)} className="text-sm opacity-75 hover:opacity-100">Close</button>
            </div>
            <div className="flex">
              <div className="w-40 border-r border-white/10 p-3 space-y-1 text-sm">
                <button onClick={() => setTab('profile')} className={`w-full text-left px-3 py-2 rounded ${tab==='profile'?'bg-white/10':''}`}>Profile</button>
                <button onClick={() => setTab('models')} className={`w-full text-left px-3 py-2 rounded ${tab==='models'?'bg-white/10':''}`}>Models</button>
                <button onClick={() => setTab('keys')} className={`w-full text-left px-3 py-2 rounded ${tab==='keys'?'bg-white/10':''}`}>API Keys</button>
              </div>
              <div className="flex-1 p-4">
                {tab==='profile' && (
                  <div className="space-y-3">
                    <div className="text-sm text-zinc-300">Set your display name.</div>
                    <div className="flex items-center gap-2">
                      <input value={userName} onChange={(e)=>setUserName(e.target.value)} placeholder="Your name" className="flex-1 bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-blue-400 focus:outline-none transition-colors" />
                      {!nameSaved && (
                        <button onClick={saveName} className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border border-blue-500/20 transition-colors">Save</button>
                      )}
                      {nameSaved && (
                        <span className="text-xs text-emerald-300">Saved</span>
                      )}
                    </div>
                  </div>
                )}
                {tab==='models' && (
                  <div className="space-y-3">
                    <div className="text-sm text-zinc-300">Choose up to 5 models.</div>
                    <ModelSelector selectedIds={selectedIds} onToggle={(id)=>{
                      setSelectedIds(prev=>{
                        if(prev.includes(id)) return prev.filter(x=>x!==id);
                        if(prev.length>=5) return prev; return [...prev, id];
                      });
                    }} />
                  </div>
                )}
                {tab==='keys' && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-4">Keys are stored locally in your browser via localStorage and sent only with your requests. Do not hardcode keys in code.</p>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Gemini API Key</label>
                      <a href="https://aistudio.google.com/app/u/5/apikey?pli=1" target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-md bg-blue-500 text-white border border-blue-500/20 hover:bg-blue-600 transition-colors">Get API key</a>
                    </div>
                    <input value={gemini} onChange={(e) => setGemini(e.target.value)} placeholder="AIza..." className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 mb-4 focus:border-blue-400 focus:outline-none transition-colors" />
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">OpenRouter API Key</label>
                      <a href="https://openrouter.ai/sign-in?redirect_url=https%3A%2F%2Fopenrouter.ai%2Fsettings%2Fkeys" target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-md bg-blue-500 text-white border border-blue-500/20 hover:bg-blue-600 transition-colors">Get API key</a>
                    </div>
                    <input value={openrouter} onChange={(e) => setOpenrouter(e.target.value)} placeholder="sk-or-..." className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-blue-400 focus:outline-none transition-colors" />
                    <div className="flex gap-3 justify-end mt-6">
                      <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">Close</button>
                      <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border border-blue-500/20 transition-colors">Save Keys</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
