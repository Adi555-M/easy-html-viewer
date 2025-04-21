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

    // Clean up any existing editor
    if (editorView) {
      editorView.destroy();
    }

    // Set up the language extension based on the language prop
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

    // Create a new editor view
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          languageExtension,
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
  }, [language]); // Re-initialize when language changes

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorView && value !== editorView.state.doc.toString()) {
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: value }
      });
    }
  }, [value]);

  // Paste event listener for global paste event initiated from PreviewPanel
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      if (typeof event.detail === "string" && event.detail.length) {
        onChange(event.detail);
      }
    };
    // Listen for editor-paste events
    window.addEventListener("editor-paste", handler as EventListener);
    return () => {
      window.removeEventListener("editor-paste", handler as EventListener);
    };
  }, [onChange]);

  return <div className="editor-container" ref={editorRef}></div>;
}
