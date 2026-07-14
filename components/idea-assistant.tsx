'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, LockKeyhole, BookOpen, Copy, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TRECHO_MARKER = '---TRECHO---';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\* /gm, '— ');
}

export function IdeaAssistant({
  bookId,
  isPremium,
  onUse,
}: {
  bookId: string;
  isPremium: boolean;
  onUse: (text: string) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const generate = async () => {
    const userPrompt = prompt.trim();
    if (!userPrompt) return;
    setLoading(true);
    setStreaming('');
    setPrompt('');

    const newMessages: Message[] = [...messages, { role: 'user', content: userPrompt }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          prompt: userPrompt,
          history: newMessages.slice(-10),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Não foi possível gerar sugestões.');
      }
      const reader = response.body?.getReader?.();
      if (!reader) throw new Error('A resposta não pôde ser iniciada.');
      const decoder = new TextDecoder();
      let partial = '';
      let fullResult = '';
      while (true) {
        const chunk = await reader.read();
        if (chunk?.done) break;
        partial += decoder.decode(chunk?.value, { stream: true });
        const lines = partial.split('\n');
        partial = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data?.status === 'delta') {
              fullResult += String(data?.content ?? '');
              setStreaming(fullResult);
            }
            if (data?.status === 'error')
              throw new Error(String(data?.message ?? 'Falha na geração.'));
          } catch (error) {
            if (error instanceof SyntaxError) continue;
            throw error;
          }
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: fullResult }]);
      setStreaming('');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Falha na geração.');
      setStreaming('');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setStreaming('');
    toast.success('Conversa limpa.');
  };

  const parseAssistantMessage = (text: string) => {
    const cleaned = cleanMarkdown(text);
    const markerIdx = cleaned.indexOf(TRECHO_MARKER);
    if (markerIdx === -1) {
      return { suggestion: cleaned, excerpt: '' };
    }
    return {
      suggestion: cleaned.slice(0, markerIdx).trim(),
      excerpt: cleaned.slice(markerIdx + TRECHO_MARKER.length).trim(),
    };
  };

  const handleAddExcerpt = (text: string) => {
    if (!text.trim()) {
      toast.error('Nenhum trecho disponível para adicionar.');
      return;
    }
    onUse(text);
    toast.success('Trecho adicionado ao capítulo!');
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success('Copiado!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Não foi possível copiar.');
    }
  };

  if (!isPremium)
    return (
      <div className="rounded-xl bg-violet-50 p-5 text-center">
        <LockKeyhole className="mx-auto text-violet-700" />
        <h3 className="mt-3 font-bold">Muse IA é Premium</h3>
        <p className="mt-1 text-sm text-stone-500">
          Destrave ideias de cenas, personagens e diálogos.
        </p>
        <a
          href="/planos"
          className="mt-4 inline-block rounded-lg bg-violet-700 px-4 py-2 text-sm font-bold text-white"
        >
          Conhecer Premium
        </a>
      </div>
    );

  const displayContent = streaming || '';
  const currentParsed = displayContent ? parseAssistantMessage(displayContent) : null;

  return (
    <div className="flex h-full flex-col">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Converse com sua musa
        </label>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-500"
            title="Limpar conversa"
          >
            <Trash2 size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Conversation area */}
      <div
        ref={scrollRef}
        className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1"
        style={{ maxHeight: 'calc(100vh - 340px)', minHeight: '200px' }}
      >
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="text-violet-300" size={32} />
            <p className="mt-3 text-sm text-stone-400">
              Descreva o que precisa e a Muse vai ajudar.<br />
              A conversa tem memória — continue de onde parou.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-violet-700 px-4 py-2.5 text-sm text-white">
                  {msg.content}
                </div>
              </div>
            );
          }

          const { suggestion, excerpt } = parseAssistantMessage(msg.content);
          return (
            <div key={i} className="space-y-2">
              {suggestion && (
                <div className="rounded-2xl rounded-bl-md bg-stone-100 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                    {suggestion}
                  </p>
                  <button
                    onClick={() => handleCopy(suggestion, `sug-${i}`)}
                    className="mt-2 flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600"
                  >
                    {copied === `sug-${i}` ? <Check size={12} /> : <Copy size={12} />}
                    Copiar sugestão
                  </button>
                </div>
              )}
              {excerpt && (
                <div className="rounded-2xl border-2 border-violet-200 bg-[#f5f0e7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-violet-600">
                    <BookOpen size={12} /> Trecho pronto
                  </div>
                  <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-stone-800">
                    {excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => handleAddExcerpt(excerpt)}
                      className="flex items-center gap-2 rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-800"
                    >
                      <Sparkles size={13} /> Adicionar ao capítulo
                    </button>
                    <button
                      onClick={() => handleCopy(excerpt, `exc-${i}`)}
                      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700"
                    >
                      <Copy size={12} /> Copiar
                    </button>
                  </div>
                </div>
              )}
              {!excerpt && suggestion && (
                <button
                  onClick={() => handleAddExcerpt(suggestion)}
                  className="flex items-center gap-2 text-xs font-bold text-violet-700 hover:text-violet-900"
                >
                  <Sparkles size={14} /> Usar como trecho
                </button>
              )}
            </div>
          );
        })}

        {/* Streaming response */}
        {streaming && (
          <div className="space-y-2">
            {currentParsed?.suggestion && (
              <div className="rounded-2xl rounded-bl-md bg-stone-100 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                  {currentParsed.suggestion}
                </p>
              </div>
            )}
            {currentParsed?.excerpt && (
              <div className="rounded-2xl border-2 border-violet-200 bg-[#f5f0e7] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-violet-600">
                  <BookOpen size={12} /> Trecho pronto
                </div>
                <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-stone-800">
                  {currentParsed.excerpt}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-violet-500">
              <Loader2 className="animate-spin" size={12} /> Muse está escrevendo...
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="mt-3 border-t border-stone-200 pt-3">
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e?.target?.value ?? '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generate();
              }
            }}
            className="min-h-[60px] flex-1 resize-none rounded-xl bg-stone-100 p-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Peça ideias, reviravoltas, diálogos..."
          />
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="flex h-[60px] w-[50px] items-center justify-center rounded-xl bg-violet-700 text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Send size={17} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
