
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import CodeEditor from './CodeEditor';
import { ArrowLeft, Save, ClipboardPaste, Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';

interface FullScreenEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  language: 'html' | 'css' | 'javascript';
  onSave: (code: string) => void;
}

export default function FullScreenEditor({
  open,
  onOpenChange,
  code,
  language,
  onSave,
}: FullScreenEditorProps) {
  const [editedCode, setEditedCode] = useState(code);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  // Update internal state when code prop changes
  useEffect(() => {
    setEditedCode(code);
  }, [code, open]);

  // Handle body overflow to prevent scrolling behind modal
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Search functionality
  useEffect(() => {
    if (searchTerm && editedCode) {
      const matches: number[] = [];
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      
      while ((match = regex.exec(editedCode)) !== null) {
        matches.push(match.index);
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
      
      setSearchMatches(matches);
      setCurrentMatchIndex(0);
      
      if (matches.length > 0) {
        // Dispatch event to highlight current match in editor
        const highlightEvent = new CustomEvent('editor-highlight', { 
          detail: { 
            matches, 
            currentIndex: 0,
            searchTerm 
          } 
        });
        window.dispatchEvent(highlightEvent);
      }
    } else {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      // Clear highlights
      const clearEvent = new CustomEvent('editor-clear-highlight');
      window.dispatchEvent(clearEvent);
    }
  }, [searchTerm, editedCode]);

  const handleSave = () => {
    onSave(editedCode);
    toast.success(`${language.toUpperCase()} code updated`);
    onOpenChange(false);
  };
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setEditedCode(text);
      
      // Dispatch a custom event to notify the editor about the paste operation
      const customEvent = new CustomEvent('editor-paste', { detail: text });
      window.dispatchEvent(customEvent);
      
      toast.success('Code pasted from clipboard');
    } catch (err) {
      console.error('Paste error:', err);
      
      // Try an alternative approach for mobile devices
      if (navigator.clipboard && typeof navigator.clipboard.read === 'function') {
        try {
          const clipboardItems = await navigator.clipboard.read();
          const clipboardItem = clipboardItems[0];
          const textBlob = await clipboardItem.getType('text/plain');
          const text = await textBlob.text();
          
          if (text) {
            setEditedCode(text);
            // Dispatch custom event
            const customEvent = new CustomEvent('editor-paste', { detail: text });
            window.dispatchEvent(customEvent);
            toast.success('Code pasted from clipboard');
            return;
          }
        } catch (clipboardReadErr) {
          console.error('Clipboard read error:', clipboardReadErr);
        }
      }
      
      toast("To paste: tap in the editor and use your device's paste function", {
        description: "Browser security restrictions may prevent direct clipboard access"
      });
    }
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm('');
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      // Clear highlights
      const clearEvent = new CustomEvent('editor-clear-highlight');
      window.dispatchEvent(clearEvent);
    }
  };

  const handleNextMatch = () => {
    if (searchMatches.length > 0) {
      const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
      setCurrentMatchIndex(nextIndex);
      
      // Dispatch event to highlight current match
      const highlightEvent = new CustomEvent('editor-highlight', { 
        detail: { 
          matches: searchMatches, 
          currentIndex: nextIndex,
          searchTerm 
        } 
      });
      window.dispatchEvent(highlightEvent);
    }
  };

  const handlePrevMatch = () => {
    if (searchMatches.length > 0) {
      const prevIndex = currentMatchIndex === 0 ? searchMatches.length - 1 : currentMatchIndex - 1;
      setCurrentMatchIndex(prevIndex);
      
      // Dispatch event to highlight current match
      const highlightEvent = new CustomEvent('editor-highlight', { 
        detail: { 
          matches: searchMatches, 
          currentIndex: prevIndex,
          searchTerm 
        } 
      });
      window.dispatchEvent(highlightEvent);
    }
  };

  const languageTitle = {
    html: 'HTML',
    css: 'CSS',
    javascript: 'JavaScript'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] p-0 bg-background rounded-md overflow-hidden m-0">
        <DialogHeader className="p-4 border-b border-border flex flex-col gap-2 sticky top-0 z-10">
          <div className="flex flex-row justify-between items-center">
            <DialogTitle className="text-lg font-medium">Editing {languageTitle[language]} Code</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSearchToggle}>
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
              <Button variant="outline" size="sm" onClick={handlePaste}>
                <ClipboardPaste className="h-4 w-4 mr-1" />
                Paste
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          </div>
          
          {showSearch && (
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
              <Input
                placeholder="Search in code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                autoFocus
              />
              {searchMatches.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>{currentMatchIndex + 1} of {searchMatches.length}</span>
                  <Button variant="ghost" size="sm" onClick={handlePrevMatch}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleNextMatch}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={handleSearchToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogHeader>
        <div className="w-full h-[calc(100vh-8rem)] relative overflow-hidden p-4">
          <CodeEditor
            language={language}
            value={editedCode}
            onChange={setEditedCode}
            fullscreen={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
