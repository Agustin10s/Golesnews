'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import { Extension } from '@tiptap/core';
import { useRef, useState, useCallback } from 'react';

// ── Custom FontSize ──────────────────────────────────────────
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize || null,
          renderHTML: attrs => attrs.fontSize ? { style: `font-size:${attrs.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: { chain: () => { setMark: (n: string, a: Record<string,unknown>) => { run: () => boolean } } }) =>
        chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: { chain: () => { setMark: (n: string, a: Record<string,unknown>) => { removeEmptyTextStyle: () => { run: () => boolean } } } }) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as Record<string, unknown>;
  },
});

const SIZES = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];

// ── Upload helper ────────────────────────────────────────────
async function uploadFile(file: File): Promise<string | null> {
  const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'];
  if (!allowed.includes(file.type)) return null;
  const fd = new FormData(); fd.append('file', file);
  try {
    const d = await fetch('/api/cms/media/upload', { method: 'POST', body: fd }).then(r => r.json()) as { url?: string };
    return d.url || null;
  } catch { return null; }
}

// ── SVG icon helpers ─────────────────────────────────────────
const I = (d: string, w = 14, h = 14) => (
  <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

interface Props { content: string; onChange: (html: string) => void; }

export default function RichEditor({ content, onChange }: Props) {
  const fileRef     = useRef<HTMLInputElement>(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);

  const insertImageUrl = useCallback((editorInstance: ReturnType<typeof useEditor>, url: string) => {
    editorInstance?.chain().focus().setImage({ src: url }).run();
  }, []);

  const handleUploadAndInsert = useCallback(async (editorInstance: ReturnType<typeof useEditor>, file: File) => {
    if (!editorInstance) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) insertImageUrl(editorInstance, url);
    setUploading(false);
  }, [insertImageUrl]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Youtube.configure({ width: 640, height: 360 }),
      Placeholder.configure({ placeholder: 'Comenzá a escribir tu nota aquí...' }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        style: 'min-height:420px;outline:none;padding:18px;font-size:15px;line-height:1.8;color:#e0e0e0',
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (pos) view.dispatch(view.state.tr.setSelection(
          // @ts-expect-error runtime only
          view.state.selection.constructor.near(view.state.doc.resolve(pos.pos))
        ));
        files.forEach(async file => {
          setUploading(true);
          const url = await uploadFile(file);
          if (url) view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })));
          setUploading(false);
        });
        return true;
      },
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        files.forEach(async file => {
          setUploading(true);
          const url = await uploadFile(file);
          if (url) view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })));
          setUploading(false);
        });
        return true;
      },
    },
  });

  if (!editor) return null;

  // ── Toolbar button ───────────────────────────────────────
  const B = (active: boolean, onClick: () => void, children: React.ReactNode, title?: string) => (
    <button
      key={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 26, cursor: 'pointer',
        background: active ? 'rgba(232,53,58,.2)' : 'transparent',
        color: active ? '#e8353a' : '#666',
        border: active ? '1px solid rgba(232,53,58,.3)' : '1px solid transparent',
        borderRadius: 3,
      }}
    >
      {children}
    </button>
  );

  const SEP = () => <span style={{ width: 1, background: '#1e1e1e', height: 18, margin: '0 3px', alignSelf: 'center', display: 'inline-block' }} />;

  function insertImageByUrl() {
    const url = prompt('URL de la imagen:');
    if (url) insertImageUrl(editor, url);
  }
  async function uploadFromInput(e: React.ChangeEvent<HTMLInputElement>) {
    for (const file of Array.from(e.target.files ?? [])) await handleUploadAndInsert(editor, file);
    e.target.value = '';
  }
  function insertYoutube() {
    const url = prompt('URL del video de YouTube:');
    if (url && editor) editor.commands.setYoutubeVideo({ src: url });
  }
  function insertLink() {
    if (!editor) return;
    const prev = editor.isActive('link') ? editor.getAttributes('link').href as string : '';
    const url = prompt('URL del enlace:', prev);
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else if (prev) editor.chain().focus().unsetLink().run();
  }

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div
      onDragOver={e => { if (Array.from(e.dataTransfer.items).some(i => i.type.startsWith('image/'))) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { setDragging(false); e.stopPropagation(); }}
      style={{
        border: `1px solid ${dragging ? '#e8353a' : '#1e1e1e'}`,
        background: '#0a0a0a', transition: 'border-color .15s', position: 'relative',
        borderRadius: 4, overflow: 'hidden',
      }}
    >
      {/* Drag overlay */}
      {dragging && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: 'rgba(232,53,58,.06)', border: '2px dashed #e8353a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e8353a', letterSpacing: .5 }}>Soltá la imagen para insertar</span>
        </div>
      )}

      {/* Upload indicator */}
      {uploading && (
        <div style={{
          position: 'absolute', top: 8, right: 10, zIndex: 30,
          background: 'rgba(0,0,0,.85)', borderRadius: 4, padding: '5px 12px',
          fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 7,
          border: '1px solid #1e1e1e',
        }}>
          <div style={{ width: 12, height: 12, border: '2px solid #333', borderTopColor: '#e8353a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Subiendo...
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        background: '#060606', borderBottom: '1px solid #1a1a1a',
        padding: '6px 10px', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
      }}>
        {/* Undo / Redo */}
        {B(false, () => editor.chain().focus().undo().run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>, 'Deshacer')}
        {B(false, () => editor.chain().focus().redo().run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.13-9.36L23 10"/></svg>, 'Rehacer')}
        <SEP />

        {/* Text style */}
        {B(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      <strong style={{ fontSize: 13 }}>N</strong>, 'Negrita')}
        {B(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    <em style={{ fontSize: 13 }}>I</em>, 'Cursiva')}
        {B(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <span style={{ fontSize: 12, textDecoration: 'underline' }}>U</span>, 'Subrayado')}
        {B(editor.isActive('strike'),    () => editor.chain().focus().toggleStrike().run(),    <span style={{ fontSize: 12, textDecoration: 'line-through' }}>S</span>, 'Tachado')}
        {B(editor.isActive('highlight'), () => editor.chain().focus().toggleHighlight({ color: '#fbbf24' }).run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M9.06 1.93C7.17 1.92 5.33 3.74 6.17 6L11 17l2-2 1.48-1.48-4.71-11.24C9.87 2.15 9.46 1.93 9.06 1.93zM15 9l-5 5-1 4 4-1 5-5-3-3zm5-5a1 1 0 00-.71.29l-2 2 3 3 2-2a1 1 0 000-1.42l-1.58-1.58A1 1 0 0020 4z"/></svg>, 'Resaltar')}
        <SEP />

        {/* Headings */}
        {([1, 2, 3] as const).map(l =>
          B(editor.isActive('heading', { level: l }), () => editor.chain().focus().toggleHeading({ level: l }).run(),
            <span style={{ fontSize: 11, fontWeight: 700 }}>H{l}</span>, `Título ${l}`)
        )}
        {B(editor.isActive('paragraph'), () => editor.chain().focus().setParagraph().run(), <span style={{ fontSize: 11 }}>P</span>, 'Párrafo')}
        <SEP />

        {/* Lists */}
        {B(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>, 'Lista')}
        {B(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>, 'Lista numerada')}
        {B(editor.isActive('blockquote'),  () => editor.chain().focus().toggleBlockquote().run(),
          I('M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z'), 'Cita')}
        <SEP />

        {/* Alignment */}
        {B(editor.isActive({ textAlign: 'left' }),    () => editor.chain().focus().setTextAlign('left').run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>, 'Alinear izquierda')}
        {B(editor.isActive({ textAlign: 'center' }),  () => editor.chain().focus().setTextAlign('center').run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>, 'Centrar')}
        {B(editor.isActive({ textAlign: 'right' }),   () => editor.chain().focus().setTextAlign('right').run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>, 'Alinear derecha')}
        <SEP />

        {/* Font size */}
        <select onChange={e => {
          if (e.target.value) (editor.commands as unknown as { setFontSize: (s: string) => void }).setFontSize(e.target.value);
        }} defaultValue="" title="Tamaño de fuente"
          style={{ fontSize: 11, background: '#111', color: '#666', border: '1px solid #1e1e1e', borderRadius: 3, padding: '3px 5px', cursor: 'pointer', height: 26 }}>
          <option value="">Tamaño</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Color */}
        <input type="color" defaultValue="#ffffff" title="Color de texto"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          style={{ width: 26, height: 26, padding: 2, background: '#111', border: '1px solid #1e1e1e', borderRadius: 3, cursor: 'pointer' }}
        />
        <SEP />

        {/* Media */}
        {B(false, insertImageByUrl,
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>, 'Imagen por URL')}
        {B(false, () => fileRef.current?.click(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, 'Subir imagen')}
        {B(false, insertYoutube,
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02"/></svg>, 'Video YouTube')}
        {B(editor.isActive('link'), insertLink,
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>, 'Insertar enlace')}
        {B(false, () => editor.chain().focus().setHorizontalRule().run(),
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>, 'Separador')}

        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={uploadFromInput} />
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div style={{
        background: '#060606', borderTop: '1px solid #1a1a1a',
        padding: '5px 14px', display: 'flex', gap: 16,
        fontSize: 10, color: '#333', alignItems: 'center',
      }}>
        <span>{wordCount} palabras &nbsp;·&nbsp; {charCount} caracteres</span>
        <span style={{ marginLeft: 'auto', color: '#262626' }}>Arrastrá imágenes · Ctrl+V para pegar</span>
      </div>
    </div>
  );
}
