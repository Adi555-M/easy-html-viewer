
import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { EditorState } from '@codemirror/state';
import { Decoration, DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

interface CodeEditorProps {
  language: 'html' | 'css' | 'javascript';
  value: string;
  onChange: (value: string) => void;
  fullscreen?: boolean;
}

// Define search highlight effects and state
const addHighlights = StateEffect.define<{matches: number[], searchTerm: string, currentIndex: number}>();
const clearHighlights = StateEffect.define();

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);
    
    for (let effect of tr.effects) {
      if (effect.is(addHighlights)) {
        const { matches, searchTerm, currentIndex } = effect.value;
        const decorations = matches.map((pos, index) => {
          const isCurrentMatch = index === currentIndex;
          return Decoration.mark({
            class: isCurrentMatch ? 'cm-search-current' : 'cm-search-match'
          }).range(pos, pos + searchTerm.length);
        });
        highlights = Decoration.set(decorations);
      } else if (effect.is(clearHighlights)) {
        highlights = Decoration.none;
      }
    }
    
    return highlights;
  },
  provide: f => EditorView.decorations.from(f)
});

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
          highlightField,
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
            },
            ".cm-search-match": {
              backgroundColor: "rgba(255, 255, 0, 0.3)",
              border: "1px solid rgba(255, 255, 0, 0.6)"
            },
            ".cm-search-current": {
              backgroundColor: "rgba(255, 165, 0, 0.5)",
              border: "1px solid rgba(255, 165, 0, 0.8)"
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
  useEffect(() => {
    // Create a custom event listener for the editor
    const pasteHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail === 'string') {
        if (editorView) {
          // Replace the entire content with the pasted content
          editorView.dispatch({
            changes: { from: 0, to: editorView.state.doc.length, insert: customEvent.detail }
          });
          
          // Make sure to call onChange to update parent component state
          onChange(customEvent.detail);
          
          // Focus the editor after pasting
          setTimeout(() => {
            editorView.focus();
          }, 100);
        }
      }
    };

    // Handle search highlighting
    const highlightHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && editorView) {
        const { matches, searchTerm, currentIndex } = customEvent.detail;
        editorView.dispatch({
          effects: addHighlights.of({ matches, searchTerm, currentIndex })
        });
        
        // Scroll to current match
        if (matches.length > 0 && currentIndex < matches.length) {
          const pos = matches[currentIndex];
          editorView.dispatch({
            selection: { anchor: pos, head: pos + searchTerm.length },
            scrollIntoView: true
          });
        }
      }
    };

    // Handle clearing highlights
    const clearHighlightHandler = () => {
      if (editorView) {
        editorView.dispatch({
          effects: clearHighlights.of(null)
        });
      }
    };

    // Add the event listeners to the window object
    window.addEventListener('editor-paste', pasteHandler);
    window.addEventListener('editor-highlight', highlightHandler);
    window.addEventListener('editor-clear-highlight', clearHighlightHandler);
    
    // Clean up the event listeners when the component unmounts
    return () => {
      window.removeEventListener('editor-paste', pasteHandler);
      window.removeEventListener('editor-highlight', highlightHandler);
      window.removeEventListener('editor-clear-highlight', clearHighlightHandler);
    };
  }, [editorView, onChange]);

  return (
    <div className={`editor-container ${fullscreen ? "fullscreen-editor" : ""}`} ref={editorRef}></div>
  );
}
