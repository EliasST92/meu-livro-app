'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import ImageExt from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback, useRef } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Heading2, ImageIcon, Minus,
} from 'lucide-react';
import { toast } from 'sonner';

type RichEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onWordCount: (count: number) => void;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textColor: string;
  bgColor: string;
  textIndent: number;
  paragraphSpacing: number;
  maxWidth: number;
};

// Convert plain text (legacy) to HTML
function textToHtml(text: string): string {
  if (!text) return '<p></p>';
  // Already HTML?
  if (text.trim().startsWith('<')) return text;
  // Convert [IMAGEM: url] markers to <img> tags
  let result = text.replace(/\[IMAGEM:\s*(https?:\/\/[^\]]+)\]/g, '<img src="$1" />');
  // Convert paragraphs
  result = result
    .split(/\n\n+/)
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<img ')) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('');
  return result || '<p></p>';
}

export function RichEditor({
  content,
  onChange,
  onWordCount,
  fontFamily,
  fontSize,
  lineHeight,
  textColor,
  bgColor,
  textIndent,
  paragraphSpacing,
  maxWidth,
}: RichEditorProps) {
  const initialContent = useRef(textToHtml(content));
  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ImageExt.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rich-editor-image',
        },
      }),
      Placeholder.configure({
        placeholder: 'Escreva a próxima frase da sua história...',
      }),
    ],
    content: initialContent.current,
    editorProps: {
      attributes: {
        class: 'rich-editor-content outline-none min-h-[calc(100vh-260px)]',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (isExternalUpdate.current) return;
      const html = ed.getHTML();
      onChange(html);
      const text = ed.state.doc.textContent ?? '';
      const words = (text.trim().match(/\S+/g) ?? []).length;
      onWordCount(words);
    },
  });

  // Sync content from outside (chapter switch)
  useEffect(() => {
    if (!editor) return;
    const newHtml = textToHtml(content);
    const current = editor.getHTML();
    if (newHtml !== current) {
      isExternalUpdate.current = true;
      editor.commands.setContent(newHtml);
      isExternalUpdate.current = false;
      const text = editor.state.doc.textContent ?? '';
      onWordCount((text.trim().match(/\S+/g) ?? []).length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 5 MB.'); return; }
      try {
        const prep = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
        });
        const data = await prep.json().catch(() => ({}));
        if (!prep.ok) throw new Error(data?.error ?? 'Falha no upload.');
        await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        const url = data.publicUrl ?? data.uploadUrl?.split('?')?.[0] ?? '';
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
          toast.success('Imagem inserida!');
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Falha ao inserir imagem.');
      }
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  const Btn = ({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg p-2 transition ${active ? 'bg-violet-100 text-violet-700' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'}`}
    >
      {children}
    </button>
  );

  return (
    <div>
      {/* Formatting toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-0.5 rounded-xl bg-white/80 p-1.5 shadow-sm backdrop-blur" style={{ maxWidth: `${maxWidth}px`, margin: '0 auto 1rem' }}>
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito">
          <Bold size={16} />
        </Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Itálico">
          <Italic size={16} />
        </Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado">
          <UnderlineIcon size={16} />
        </Btn>
        <div className="mx-1 h-5 w-px bg-stone-200" />
        <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título">
          <Heading2 size={16} />
        </Btn>
        <div className="mx-1 h-5 w-px bg-stone-200" />
        <Btn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Esquerda">
          <AlignLeft size={16} />
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centralizado">
          <AlignCenter size={16} />
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Direita">
          <AlignRight size={16} />
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justificado">
          <AlignJustify size={16} />
        </Btn>
        <div className="mx-1 h-5 w-px bg-stone-200" />
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separador">
          <Minus size={16} />
        </Btn>
        <Btn onClick={handleImageUpload} title="Inserir imagem">
          <ImageIcon size={16} />
        </Btn>
      </div>

      {/* Editor content */}
      <style>{`
        .rich-editor-content {
          font-family: ${fontFamily};
          font-size: ${fontSize}px;
          line-height: ${lineHeight};
          color: ${textColor};
        }
        .rich-editor-content p {
          text-indent: ${textIndent}px;
          margin-bottom: ${paragraphSpacing}px;
        }
        .rich-editor-content h2 {
          font-size: 1.75em;
          font-weight: 700;
          margin: 1em 0 0.5em;
          text-indent: 0;
        }
        .rich-editor-content h3 {
          font-size: 1.35em;
          font-weight: 600;
          margin: 0.8em 0 0.4em;
          text-indent: 0;
        }
        .rich-editor-content .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: ${textColor}40;
          pointer-events: none;
          height: 0;
        }
        .rich-editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem auto;
          display: block;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        .rich-editor-image.ProseMirror-selectednode {
          outline: 3px solid #7c3aed;
          outline-offset: 3px;
        }
        .rich-editor-content hr {
          border: none;
          border-top: 2px solid ${textColor}20;
          margin: 2em 0;
        }
        .rich-editor-content blockquote {
          border-left: 3px solid #7c3aed;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          opacity: 0.85;
        }
      `}</style>

      <div style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
