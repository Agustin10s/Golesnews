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
import { Extension } from '@tiptap/core';
import { useRef, useState, useCallback } from 'react';

// ── Custom FontSize ───────────────────────────────────────────
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

const FONTS = [
  { label: 'Normal',           value: '' },
  { label: 'Barlow Condensed', value: "'Barlow Condensed',sans-serif" },
  { label: 'Georgia',          value: 'Georgia,serif' },
  { label: 'Courier',          value: "'Courier New',monospace" },
];
const SIZES = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];

// ── Upload helper ─────────────────────────────────────────────
async function uploadFile(file: File): Promise<string | null> {
  const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'];
  if (!allowed.includes(file.type)) return null;
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res  = await fetch('/api/cms/media/upload', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string };
    return data.url || null;
  } catch {
    return null;
  }
}

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: Props) {
  const fileRef        = useRef<HTMLInputElement>(null);
  const [dragging,     setDragging]     = useState(false);
  const [uploading,    setUploading]    = useState(false);

  // ── Insert image helper ───────────────────────────────────
  const insertImageUrl = useCallback((editorInstance: ReturnType<typeof useEditor>, url: string) => {
    editorInstance?.chain().focus().setImage({ src: url }).run();
  }, []);

  const handleUploadAndInsert = useCallback(async (
    editorInstance: ReturnType<typeof useEditor>,
    file: File,
  ) => {
    if (!editorInstance) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) insertImageUrl(editorInstance, url);
    setUploading(false);
  }, [insertImageUrl]);

  // ── TipTap setup ──────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Youtube.configure({ width: 640, height: 360 }),
      Placeholder.configure({ placeholder: 'Comenzá a escribir tu nota aquí... (arrastrá imágenes para insertarlas)' }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        style: 'min-height:420px;outline:none;padding:16px;font-size:15px;line-height:1.75;color:#e8e8e8',
      },
      // ── Drag & drop images INTO the editor content ──────
      handleDrop(view, event, _slice, moved) {
        if (moved) return false; // let TipTap handle internal moves
        const files = Array.from(event.dataTransfer?.files ?? []);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (!imageFiles.length) return false;

        event.preventDefault();

        // Position cursor at drop point
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords);
        if (pos) view.dispatch(view.state.tr.setSelection(
          // @ts-expect-error — TextSelection import not needed at runtime
          view.state.selection.constructor.near(view.state.doc.resolve(pos.pos))
        ));

        imageFiles.forEach(async file => {
          setUploading(true);
          const url = await uploadFile(file);
          if (url) view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.image.create({ src: url })
            )
          );
          setUploading(false);
        });

        return true;
      },
      // ── Paste images from clipboard (Ctrl+V / screenshot) ──
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (!imageFiles.length) return false;

        event.preventDefault();
        imageFiles.forEach(async file => {
          setUploading(true);
          const url = await uploadFile(file);
          if (url) view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.image.create({ src: url })
            )
          );
          setUploading(false);
        });
        return true;
      },
    },
  });

  if (!editor) return null;

  // ── Toolbar helpers ───────────────────────────────────────
  const btn = (active: boolean, onClick: () => void, label: string, title?: string) => (
    <button
      key={label + title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title || label}
      style={{
        padding: '4px 8px', fontSize: 12, cursor: 'pointer',
        background: active ? '#e8353a' : '#1a1a1a',
        color:      active ? '#fff'    : '#bbb',
        border: '1px solid #2a2a2a', borderRadius: 4,
      }}
    >
      {label}
    </button>
  );

  function insertImageByUrl() {
    const url = prompt('URL de la imagen:');
    if (url) insertImageUrl(editor, url);
  }

  async function uploadFromInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) await handleUploadAndInsert(editor, file);
    e.target.value = '';
  }

  function insertYoutube() {
    const url = prompt('URL del video de YouTube:');
    if (url && editor) editor.commands.setYoutubeVideo({ src: url });
  }

  function insertLink() {
    if (!editor) return;
    const prev = editor.isActive('link') ? editor.getAttributes('link').href as string : '';
    const url  = prompt('URL del enlace:', prev);
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else if (prev) editor.chain().focus().unsetLink().run();
  }

  // ── Drag over the outer wrapper (shows visual hint) ───────
  function onWrapperDragOver(e: React.DragEvent) {
    if (Array.from(e.dataTransfer.items).some(i => i.type.startsWith('image/'))) {
      e.preventDefault();
      setDragging(true);
    }
  }
  function onWrapperDrop(e: React.DragEvent) {
    setDragging(false);
    // TipTap's handleDrop already processes it; this just clears the overlay
    e.stopPropagation();
  }

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div
      onDragOver={onWrapperDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={onWrapperDrop}
      style={{
        border:       `1px solid ${dragging ? '#e8353a' : '#2a2a2a'}`,
        borderRadius: 8,
        overflow:     'hidden',
        background:   '#111',
        transition:   'border-color .15s',
        position:     'relative',
      }}
    >
      {/* ── Drag overlay ─────────────────────────────────── */}
      {dragging && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: 'rgba(232,53,58,.08)',
          border: '2px dashed #e8353a',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>🖼</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, color: '#e8353a' }}>
              Soltá la imagen para insertarla
            </div>
          </div>
        </div>
      )}

      {/* ── Upload spinner ────────────────────────────────── */}
      {uploading && (
        <div style={{
          position: 'absolute', top: 8, right: 10, zIndex: 30,
          background: 'rgba(0,0,0,.7)', borderRadius: 6,
          padding: '5px 12px', fontSize: 11, color: '#aaa',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #555', borderTopColor: '#e8353a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Subiendo imagen...
        </div>
      )}

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div style={{
        background: '#161616', borderBottom: '1px solid #2a2a2a',
        padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center',
      }}>
        {btn(false, () => editor.chain().focus().undo().run(), '↩', 'Deshacer')}
        {btn(false, () => editor.chain().focus().redo().run(), '↪', 'Rehacer')}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {btn(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      'N',  'Negrita')}
        {btn(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    'I',  'Cursiva')}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'S',  'Subrayado')}
        {btn(editor.isActive('strike'),    () => editor.chain().focus().toggleStrike().run(),    '~~', 'Tachado')}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {([1,2,3] as const).map(l =>
          btn(editor.isActive('heading', { level: l }), () => editor.chain().focus().toggleHeading({ level: l }).run(), `H${l}`)
        )}
        {btn(editor.isActive('paragraph'), () => editor.chain().focus().setParagraph().run(), 'P', 'Párrafo')}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  '• Lista')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. Lista')}
        {btn(editor.isActive('blockquote'),  () => editor.chain().focus().toggleBlockquote().run(),  '❝', 'Cita')}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {['left','center','right','justify'].map(a =>
          btn(editor.isActive({ textAlign: a }), () => editor.chain().focus().setTextAlign(a).run(),
            a === 'left' ? '⬅' : a === 'center' ? '↔' : a === 'right' ? '➡' : '≡', `Alinear ${a}`)
        )}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {/* Font family */}
        <select onChange={e => {
          if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run();
          else editor.chain().focus().unsetFontFamily().run();
        }} style={{ fontSize: 11, background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a', borderRadius: 4, padding: '3px 6px', cursor: 'pointer' }}>
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Font size */}
        <select onChange={e => {
          if (e.target.value) (editor.commands as unknown as { setFontSize: (s:string)=>void }).setFontSize(e.target.value);
        }} defaultValue="" style={{ fontSize: 11, background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a', borderRadius: 4, padding: '3px 6px', cursor: 'pointer' }}>
          <option value="">Tamaño</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Text color */}
        <input type="color" defaultValue="#ffffff"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          title="Color de texto"
          style={{ width: 28, height: 28, padding: 2, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, cursor: 'pointer' }}
        />
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {/* Media buttons */}
        {btn(false, insertImageByUrl, '🖼 URL',     'Insertar imagen por URL')}
        {btn(false, () => fileRef.current?.click(), '⬆ Subir',   'Subir imagen desde archivo')}
        {btn(false, insertYoutube,                  '▶ YouTube', 'Insertar video de YouTube')}
        {btn(editor.isActive('link'), insertLink,   '🔗',        'Insertar / editar enlace')}
        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), '—', 'Separador')}

        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={uploadFromInput} />
      </div>

      {/* ── Editor content area ───────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Footer ───────────────────────────────────────── */}
      <div style={{
        background: '#161616', borderTop: '1px solid #2a2a2a',
        padding: '5px 12px', display: 'flex', gap: 16,
        fontSize: 10, color: '#444', alignItems: 'center',
      }}>
        <span>{wordCount} palabras · {charCount} caracteres</span>
        <span style={{ marginLeft: 'auto', color: '#333' }}>
          💡 Arrastrá imágenes · Pegá con Ctrl+V · Subí con ⬆ Subir
        </span>
      </div>
    </div>
  );
}
