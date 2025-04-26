
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
  fullscreen?: boolean;
}

export default function CodeEditor({ language, value, onChange, fullscreen = false }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  // Create and configure editor on mount
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

    // Create editor view
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          languageExtension,
          EditorView.theme({
            "&": {
              height: fullscreen ? "calc(100vh - 120px)" : "100%",
              maxHeight: "100%",
              fontSize: "14px",
              backgroundColor: "transparent"
            },
            ".cm-scroller": {
              overflow: "auto !important",
              fontFamily: "monospace",
              padding: "0.75rem",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
              height: "100%"
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

    // Cleanup on unmount
    return () => {
      view.destroy();
    };
  }, [language, fullscreen]);

  // Update editor when value prop changes
  useEffect(() => {
    if (editorView && value !== editorView.state.doc.toString()) {
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: value }
      });
    }
  }, [value]);

  // Handle external paste events (from paste button)
  const handleExternalPaste = (pastedContent: string) => {
    if (editorView) {
      // Replace the entire content with the pasted content
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: pastedContent }
      });
      
      // Make sure to call onChange to update parent component state
      onChange(pastedContent);
      
      // Focus the editor after pasting to improve user experience
      editorView.focus();
    }
  };

  // Set up a global event listener for paste events
  useEffect(() => {
    // Create a custom event listener for the editor
    const pasteHandler = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === 'string') {
        handleExternalPaste(event.detail);
      }
    };

    // Add the event listener to the window object
    window.addEventListener('editor-paste', pasteHandler as EventListener);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('editor-paste', pasteHandler as EventListener);
    };
  }, [editorView, onChange]);

  return (
    <div className={`editor-container ${fullscreen ? "fullscreen-editor" : ""}`} ref={editorRef}></div>
  );
}
