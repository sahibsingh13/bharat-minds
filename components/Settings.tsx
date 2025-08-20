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

  // Update local state when keys change or modal opens
  useEffect(() => {
    if (open) {
      setGemini(keys.gemini || '');
      setOpenrouter(keys.openrouter || '');
    }
  }, [keys, open]);

  // Load username when modal opens
  useEffect(() => {
    if (open) {
      try {
        const n = localStorage.getItem('bharat-minds:user-name') || '';
        setUserName(n);
        setNameSaved(!!n);
      } catch {}
    }
  }, [open]);

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

  function saveName() {
    try {
      const val = userName.trim();
      localStorage.setItem('bharat-minds:user-name', val);
      setNameSaved(!!val);
      // lightweight toast
      const t = document.createElement('div');
      t.textContent = 'Username saved successfully';
      t.className = 'fixed left-1/2 -translate-x-1/2 bottom-6 z-[100] px-4 py-2 rounded bg-blue-600 text-white text-xs shadow-lg';
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
      <button onClick={() => setOpen(true)} className="text-xs mobile-text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors">⚙️ Preferences</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-xl h-[80dvh] sm:h-[70dvh] rounded-lg border border-gray-200 bg-white text-gray-900 p-0 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <h2 className="text-sm mobile-text-sm font-semibold">Preferences</h2>
              <button onClick={() => setOpen(false)} className="text-xs mobile-text-xs opacity-75 hover:opacity-100">Close</button>
            </div>
            <div className="flex h-[calc(100%-40px)]">
              <div className="w-32 border-r border-gray-200 p-2 space-y-1 text-xs mobile-text-xs shrink-0">
                <button onClick={() => setTab('profile')} className={`w-full text-left px-2 py-1.5 rounded ${tab==='profile'?'bg-blue-50 text-blue-600':''}`}>Profile</button>
                <button onClick={() => setTab('models')} className={`w-full text-left px-2 py-1.5 rounded ${tab==='models'?'bg-blue-50 text-blue-600':''}`}>Models</button>
                <button onClick={() => setTab('keys')} className={`w-full text-left px-2 py-1.5 rounded ${tab==='keys'?'bg-blue-50 text-blue-600':''}`}>API Keys</button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto">
                {tab==='profile' && (
                  <div className="space-y-2">
                    <div className="text-xs mobile-text-xs text-gray-600">Set your display name.</div>
                    <div className="flex items-center gap-2">
                      <input value={userName} onChange={(e)=>setUserName(e.target.value)} placeholder="Your name" className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs mobile-text-xs focus:border-blue-400 focus:outline-none transition-colors" />
                      {!nameSaved && (
                        <button onClick={saveName} className="px-2 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border border-blue-500/20 transition-colors text-xs mobile-text-xs">Save</button>
                      )}
                      {nameSaved && (
                        <span className="text-xs mobile-text-xs text-emerald-600">Saved</span>
                      )}
                    </div>
                  </div>
                )}
                {tab==='models' && (
                  <div className="space-y-2">
                    <div className="text-xs mobile-text-xs text-gray-600">Choose up to 5 models.</div>
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
                    <p className="text-xs mobile-text-xs text-gray-500 mb-3">Keys are stored locally in your browser via localStorage and sent only with your requests. Do not hardcode keys in code.</p>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs mobile-text-xs font-medium">Gemini API Key</label>
                      <a href="https://aistudio.google.com/app/u/5/apikey?pli=1" target="_blank" rel="noopener noreferrer" className="text-xs mobile-text-xs px-2 py-1 rounded-md bg-blue-500 text-white border border-blue-500/20 hover:bg-blue-600 transition-colors">Get API key</a>
                    </div>
                    <input value={gemini} onChange={(e) => setGemini(e.target.value)} placeholder="AIza..." className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 mb-3 text-xs mobile-text-xs focus:border-blue-400 focus:outline-none transition-colors" />
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs mobile-text-xs font-medium">OpenRouter API Key</label>
                      <a href="https://openrouter.ai/sign-in?redirect_url=https%3A%2F%2Fopenrouter.ai%2Fsettings%2Fkeys" target="_blank" rel="noopener noreferrer" className="text-xs mobile-text-xs px-2 py-1 rounded-md bg-blue-500 text-white border border-blue-500/20 hover:bg-blue-600 transition-colors">Get API key</a>
                    </div>
                    <input value={openrouter} onChange={(e) => setOpenrouter(e.target.value)} placeholder="sk-or-..." className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs mobile-text-xs focus:border-blue-400 focus:outline-none transition-colors" />
                    <div className="flex gap-2 justify-end mt-4">
                      <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors text-xs mobile-text-xs">Close</button>
                      <button onClick={save} className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border border-blue-500/20 transition-colors text-xs mobile-text-xs">Save Keys</button>
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
