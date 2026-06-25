import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
  onUploadImage?: (file: File) => Promise<string | null>;
}

export function BlogEditor({ content, onChange, onUploadImage }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: "Escreva o artigo…" }),
    ],
    content,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: "blog-editor-content",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "<p></p>", false);
    }
  }, [content, editor]);

  const addImage = () => {
    if (!onUploadImage) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const url = await onUploadImage(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  };

  if (!editor) return <p className="page-sub">Carregando editor…</p>;

  return (
    <div className="blog-editor">
      <div className="blog-editor-toolbar">
        <button type="button" className="btn btn-ghost" onClick={() => editor.chain().focus().toggleBold().run()}>
          Negrito
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Itálico
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Lista
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numerada
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            const url = window.prompt("URL do link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>
        {onUploadImage && (
          <button type="button" className="btn btn-ghost" onClick={() => void addImage()}>
            Imagem
          </button>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
