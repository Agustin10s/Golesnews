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
import { useRef } from 'react';

// Custom FontSize extension
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
  { label: 'Normal', value: '' },
  { label: 'Barlow Condensed', value: "'Barlow Condensed',sans-serif" },
  { label: 'Georgia', value: 'Georgia,serif' },
  { label: 'Courier', value: "'Courier New',monospace" },
];

const SIZES = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

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
      Placeholder.configure({ placeholder: 'Comenzá a escribir tu nota aquí...' }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style: 'min-height:400px;outline:none;padding:16px;font-size:15px;line-height:1.7;color:#e8e8e8',
      },
    },
  });

  if (!editor) return null;

  const btn = (active: boolean, onClick: () => void, label: string, title?: string) => (
    <button
      key={label}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title || label}
      style={{
        padding: '4px 8px', fontSize: 12, cursor: 'pointer',
        background: active ? '#e8353a' : '#1a1a1a',
        color: active ? '#fff' : '#bbb',
        border: '1px solid #2a2a2a', borderRadius: 4,
      }}
    >
      {label}
    </button>
  );

  async function insertImage() {
    if (!editor) return;
    const url = prompt('URL de la imagen:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editor) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/cms/media/upload', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string };
    if (data.url) editor.chain().focus().setImage({ src: data.url }).run();
    e.target.value = '';
  }

  function insertYoutube() {
    if (!editor) return;
    const url = prompt('URL del video de YouTube:');
    if (url) editor.commands.setYoutubeVideo({ src: url });
  }

  function insertLink() {
    if (!editor) return;
    const url = prompt('URL del enlace:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div style={{ border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'hidden', background: '#111' }}>
      {/* Toolbar */}
      <div style={{ background: '#161616', borderBottom: '1px solid #2a2a2a', padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
        {/* History */}
        {btn(false, () => editor.chain().focus().undo().run(), '↩', 'Deshacer')}
        {btn(false, () => editor.chain().focus().redo().run(), '↪', 'Rehacer')}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {/* Text format */}
        {btn(editor.isActive('bold'),          () => editor.chain().focus().toggleBold().run(),          'N',  'Negrita')}
        {btn(editor.isActive('italic'),        () => editor.chain().focus().toggleItalic().run(),        'I',  'Cursiva')}
        {btn(editor.isActive('underline'),     () => editor.chain().focus().toggleUnderline().run(),     'S',  'Subrayado')}
        {btn(editor.isActive('strike'),        () => editor.chain().focus().toggleStrike().run(),        '~~', 'Tachado')}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {/* Headings */}
        {([1,2,3] as const).map(l =>
          btn(editor.isActive('heading', { level: l }), () => editor.chain().focus().toggleHeading({ level: l }).run(), `H${l}`)
        )}
        {btn(editor.isActive('paragraph'), () => editor.chain().focus().setParagraph().run(), 'P', 'Párrafo')}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {/* Lists */}
        {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  '• Lista')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. Lista')}
        {btn(editor.isActive('blockquote'),  () => editor.chain().focus().toggleBlockquote().run(),  '❝', 'Cita')}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {/* Alignment */}
        {['left','center','right','justify'].map(a =>
          btn(editor.isActive({ textAlign: a }), () => editor.chain().focus().setTextAlign(a).run(),
            a === 'left' ? '⬅' : a === 'center' ? '↔' : a === 'right' ? '➡' : '≡', `Alinear ${a}`)
        )}
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {/* Font family */}
        <select
          onChange={e => {
            if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
          style={{ fontSize: 11, background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a', borderRadius: 4, padding: '3px 6px', cursor: 'pointer' }}
        >
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Font size */}
        <select
          onChange={e => {
            if (e.target.value) (editor.commands as unknown as { setFontSize: (s:string)=>void }).setFontSize(e.target.value);
          }}
          defaultValue=""
          style={{ fontSize: 11, background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a', borderRadius: 4, padding: '3px 6px', cursor: 'pointer' }}
        >
          <option value="">Tamaño</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Color */}
        <input
          type="color" defaultValue="#ffffff"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          title="Color de texto"
          style={{ width: 28, height: 28, padding: 2, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, cursor: 'pointer' }}
        />
        <span style={{ width: 1, background: '#333', height: 20, margin: '0 4px' }} />

        {/* Media */}
        {btn(false, insertImage, '🖼 URL', 'Insertar imagen por URL')}
        {btn(false, () => fileRef.current?.click(), '⬆ Subir', 'Subir imagen')}
        {btn(false, insertYoutube, '▶ YouTube', 'Insertar video')}
        {btn(editor.isActive('link'), insertLink, '🔗', 'Insertar enlace')}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadImage} />
        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), '—', 'Separador')}
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div style={{ background: '#161616', borderTop: '1px solid #2a2a2a', padding: '6px 12px', display: 'flex', gap: 16, fontSize: 11, color: '#555' }}>
        <span>{wordCount} palabras</span>
        <span>{charCount} caracteres</span>
        <span style={{ marginLeft: 'auto' }}>TipTap Editor</span>
      </div>
    </div>
  );
}
