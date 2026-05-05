import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  /** Valeur initiale à injecter une seule fois à l'initialisation de Quill */
  initialValue?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Saisissez votre texte...",
  minHeight = "150px",
  initialValue,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  // La valeur à injecter au moment de l'initialisation : priorité à initialValue, sinon value
  const seedValue = initialValue !== undefined ? initialValue : value;
  const seedRef = useRef(seedValue);

  // Garder onChangeRef à jour sans recréer l'effet
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!editorRef.current) return;

    let quill: any = null;

    import("quill").then((Quill) => {
      if (!editorRef.current) return;

      quill = new Quill.default(editorRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      });

      // Injecter la valeur initiale directement dans le DOM de l'éditeur
      const seed = seedRef.current;
      if (seed && seed.trim() !== "" && seed !== "<p><br></p>") {
        quill.root.innerHTML = seed;
      }

      quill.on("text-change", () => {
        onChangeRef.current(quill.root.innerHTML);
      });

      quillRef.current = quill;
    });

    return () => {
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionnellement vide : Quill s'initialise une seule fois

  return (
    <div className="rich-text-editor">
      <div ref={editorRef} style={{ minHeight }} />
      <style>{`
        .rich-text-editor .ql-container {
          font-family: inherit;
          font-size: 14px;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
