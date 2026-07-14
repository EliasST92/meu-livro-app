'use client';
import { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function CoverPanel({ bookId }: { bookId: string }) {
  const [coverUrl, setCoverUrl] = useState('');
  const [backCoverUrl, setBackCoverUrl] = useState('');
  const [loadingCover, setLoadingCover] = useState(false);
  const [loadingBack, setLoadingBack] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/books/${bookId}/covers`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.coverUrl) setCoverUrl(data.coverUrl);
        if (data?.backCoverUrl) setBackCoverUrl(data.backCoverUrl);
      })
      .catch(() => {});
  }, [bookId]);

  const uploadCover = async (file: File, type: 'cover' | 'backCover') => {
    const setLoading = type === 'cover' ? setLoadingCover : setLoadingBack;
    const setUrl = type === 'cover' ? setCoverUrl : setBackCoverUrl;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são aceitas.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5 MB.');
      return;
    }

    setLoading(true);
    try {
      // Get presigned URL
      const prep = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      const data = await prep.json().catch(() => ({}));
      if (!prep.ok) throw new Error(data?.error ?? 'Falha no upload.');

      // Upload
      const uploaded = await fetch(data?.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploaded.ok) throw new Error('Falha ao enviar.');

      // Save to book
      const save = await fetch(`/api/books/${bookId}/covers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          cloud_storage_path: data?.cloud_storage_path,
          contentType: file.type,
        }),
      });
      if (!save.ok) throw new Error('Falha ao salvar.');

      const publicUrl = data?.publicUrl ?? data?.uploadUrl?.split('?')?.[0] ?? '';
      setUrl(publicUrl);
      toast.success(type === 'cover' ? 'Capa atualizada!' : 'Contracapa atualizada!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Falha no upload.');
    } finally {
      setLoading(false);
    }
  };

  const removeCover = async (type: 'cover' | 'backCover') => {
    const setUrl = type === 'cover' ? setCoverUrl : setBackCoverUrl;
    try {
      await fetch(`/api/books/${bookId}/covers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, cloud_storage_path: null, contentType: null }),
      });
      setUrl('');
      toast.success('Imagem removida.');
    } catch {
      toast.error('Falha ao remover.');
    }
  };

  const CoverSlot = ({
    label,
    url,
    loading,
    inputRef,
    type,
  }: {
    label: string;
    url: string;
    loading: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
    type: 'cover' | 'backCover';
  }) => (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</p>
      {url ? (
        <div className="relative mt-2 overflow-hidden rounded-xl shadow-md">
          <div className="aspect-[2/3] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex-1 rounded-lg bg-white/20 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/30"
            >
              Trocar
            </button>
            <button
              onClick={() => removeCover(type)}
              className="rounded-lg bg-red-500/80 px-3 py-2 text-xs font-bold text-white hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 py-10 text-stone-400 transition hover:border-violet-400 hover:text-violet-600"
          style={{ aspectRatio: '2/3' }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={28} />
          ) : (
            <>
              <ImageIcon size={28} />
              <span className="text-xs font-semibold">Enviar imagem</span>
              <span className="text-[10px]">JPG, PNG ou WebP · máx 5 MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadCover(file, type);
          e.target.value = '';
        }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-stone-500">
        Adicione imagens que serão usadas na capa e contracapa do seu livro na prévia e exportação.
      </p>
      <CoverSlot
        label="Capa"
        url={coverUrl}
        loading={loadingCover}
        inputRef={coverInputRef}
        type="cover"
      />
      <CoverSlot
        label="Contracapa"
        url={backCoverUrl}
        loading={loadingBack}
        inputRef={backInputRef}
        type="backCover"
      />
    </div>
  );
}
