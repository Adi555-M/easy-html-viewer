
import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { EditorState } from '@codemirror/state';

interface CodeEditorProps {
  language: 'html' | 'css' | 'javascript';
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorView) {
      editorView.destroy();
    }

    let languageExtension;
    switch (language) {
      case 'html':
        languageExtension = html();
        break;
      case 'css':
        languageExtension = css();
        break;
      case 'javascript':
        languageExtension = javascript();
        break;
      default:
        languageExtension = html();
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          languageExtension,
          EditorView.theme({
            "&": {
              height: "100%",
              maxHeight: "100%",
              fontSize: "14px",
              backgroundColor: "transparent"
            },
            ".cm-scroller": {
              overflow: "auto",
              fontFamily: "monospace",
              padding: "0.5rem",
              scrollbarWidth: "thin", // For Firefox
              scrollbarColor: "rgba(155, 155, 155, 0.5) transparent" // For Firefox
            },
            ".cm-content": {
              padding: "10px",
              minHeight: "100%",
              caretColor: "hsl(var(--primary))"
            },
            ".cm-line": {
              padding: "0 4px",
              lineHeight: "1.6"
            },
            "&.cm-focused": {
              outline: "none"
            },
            // Improved scrollbar styling for webkit browsers
            "&::-webkit-scrollbar, .cm-scroller::-webkit-scrollbar": {
              width: "8px",
              height: "8px"
            },
            "&::-webkit-scrollbar-track, .cm-scroller::-webkit-scrollbar-track": {
              background: "transparent"
            },
            "&::-webkit-scrollbar-thumb, .cm-scroller::-webkit-scrollbar-thumb": {
              background: "rgba(155, 155, 155, 0.5)",
              borderRadius: "4px"
            }
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: editorRef.current,
    });

    setEditorView(view);

    return () => {
      view.destroy();
    };
  }, [language]);

  useEffect(() => {
    if (editorView && value !== editorView.state.doc.toString()) {
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: value }
      });
    }
  }, [value]);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      if (typeof event.detail === "string" && event.detail.length) {
        onChange(event.detail);
      }
    };
    window.addEventListener("editor-paste", handler as EventListener);
    return () => {
      window.removeEventListener("editor-paste", handler as EventListener);
    };
  }, [onChange]);

  return (
    <div className="editor-container h-full" ref={editorRef}></div>
  );
}
