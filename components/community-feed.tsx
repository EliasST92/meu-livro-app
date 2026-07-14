'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, MessageCircle, Send, ImageIcon, Loader2, X, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

type Author = { id: string; name: string; image: string | null };
type Comment = { id: string; content: string; createdAt: string; author: Author };
type Post = {
  id: string; content: string; imageUrl: string | null; createdAt: string;
  author: Author; likesCount: number; commentsCount: number; liked: boolean; isOwner: boolean;
};

export function CommunityFeed({ userName }: { userName: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const imgRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async (cursorId?: string) => {
    try {
      const url = cursorId ? `/api/community?cursor=${cursorId}` : '/api/community';
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error);
      if (cursorId) {
        setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      } else {
        setPosts(data.posts ?? []);
      }
      setCursor(data.nextCursor ?? null);
      setHasMore(!!data.nextCursor);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Apenas imagens.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5 MB.'); return; }
    setUploading(true);
    try {
      const prep = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      const data = await prep.json().catch(() => ({}));
      if (!prep.ok) throw new Error(data?.error ?? 'Falha no upload.');
      await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      setNewImage(data.publicUrl ?? data.uploadUrl?.split('?')?.[0] ?? '');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha no upload.');
    } finally {
      setUploading(false);
    }
  };

  const createPost = async () => {
    if (!newContent.trim() && !newImage) return;
    setPosting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, imageUrl: newImage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error);
      setPosts((prev) => [data.post, ...prev]);
      setNewContent('');
      setNewImage(null);
      toast.success('Publicado!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha ao publicar.');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/${postId}/like`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: data.liked, likesCount: p.likesCount + (data.liked ? 1 : -1) }
            : p
        )
      );
    } catch (e) { console.error(e); }
  };

  const toggleComments = async (postId: string) => {
    if (expandedComments[postId]) {
      setExpandedComments((prev) => { const n = { ...prev }; delete n[postId]; return n; });
      return;
    }
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/community/${postId}/comments`);
      const data = await res.json().catch(() => ({}));
      setExpandedComments((prev) => ({ ...prev, [postId]: data.comments ?? [] }));
    } catch (e) { console.error(e); }
    setLoadingComments((prev) => ({ ...prev, [postId]: false }));
  };

  const postComment = async (postId: string) => {
    const text = (commentInputs[postId] ?? '').trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/community/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error);
      setExpandedComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), data.comment],
      }));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha ao comentar.');
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  const avatar = (author: Author) => (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
      {author.name?.[0]?.toUpperCase() ?? 'A'}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f5f1] lg:pl-[288px]">
      <main className="mx-auto max-w-[680px] px-4 py-8 lg:px-6 lg:py-12">
        <h1 className="font-display text-3xl font-bold tracking-tight">Comunidade</h1>
        <p className="mt-2 text-stone-500">Compartilhe ideias, trechos e inspirações com outros autores.</p>

        {/* Composer */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
              {userName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Compartilhe uma ideia, trecho ou reflexão..."
              className="min-h-[80px] flex-1 resize-none rounded-xl bg-stone-50 p-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              maxLength={5000}
            />
          </div>
          {newImage && (
            <div className="relative ml-[52px] mt-3 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newImage} alt="Preview" className="max-h-48 rounded-lg object-cover" />
              <button onClick={() => setNewImage(null)} className="absolute -right-2 -top-2 rounded-full bg-black/70 p-1 text-white"><X size={14} /></button>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between pl-[52px]">
            <div className="flex gap-2">
              <button
                onClick={() => imgRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                Imagem
              </button>
              <input ref={imgRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
            </div>
            <button
              onClick={createPost}
              disabled={posting || (!newContent.trim() && !newImage)}
              className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50"
            >
              {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Publicar
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-violet-600" /></div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <MessageCircle className="mx-auto text-violet-400" size={40} />
              <h3 className="mt-4 text-lg font-bold">Nenhuma publicação ainda</h3>
              <p className="mt-2 text-sm text-stone-500">Seja o primeiro a compartilhar algo com a comunidade!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="rounded-2xl bg-white p-5 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-3">
                  {avatar(post.author)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{post.author.name}</p>
                    <p className="text-xs text-stone-400">{timeAgo(post.createdAt)}</p>
                  </div>
                </div>

                {/* Content */}
                {post.content && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{post.content}</p>
                )}
                {post.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.imageUrl} alt="Imagem da publicação" className="max-h-[400px] w-full object-cover" loading="lazy" />
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-4 border-t border-stone-100 pt-3">
                  <button onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition ${post.liked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}>
                    <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
                    {post.likesCount > 0 && post.likesCount}
                  </button>
                  <button onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-stone-400 hover:text-violet-600">
                    <MessageCircle size={18} />
                    {post.commentsCount > 0 && post.commentsCount}
                  </button>
                </div>

                {/* Comments */}
                {expandedComments[post.id] !== undefined && (
                  <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
                    {loadingComments[post.id] ? (
                      <Loader2 size={18} className="mx-auto animate-spin text-stone-400" />
                    ) : (
                      <>
                        {(expandedComments[post.id] ?? []).map((c) => (
                          <div key={c.id} className="flex gap-2">
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-stone-200 text-xs font-bold text-stone-600">
                              {c.author.name?.[0]?.toUpperCase() ?? 'A'}
                            </div>
                            <div className="min-w-0 rounded-xl bg-stone-50 px-3 py-2">
                              <p className="text-xs font-bold">{c.author.name} <span className="font-normal text-stone-400">· {timeAgo(c.createdAt)}</span></p>
                              <p className="mt-0.5 text-sm text-stone-700">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input
                            value={commentInputs[post.id] ?? ''}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment(post.id); } }}
                            placeholder="Escreva um comentário..."
                            className="flex-1 rounded-full bg-stone-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                            maxLength={1000}
                          />
                          <button
                            onClick={() => postComment(post.id)}
                            className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-white hover:bg-violet-700"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
          {hasMore && !loading && (
            <button onClick={() => cursor && fetchPosts(cursor)}
              className="mx-auto flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-stone-50">
              Carregar mais
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
