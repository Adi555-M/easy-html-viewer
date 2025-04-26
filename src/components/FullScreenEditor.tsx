
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import CodeEditor from './CodeEditor';
import { ArrowLeft, Save, ClipboardPaste } from 'lucide-react';
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

  const languageTitle = {
    html: 'HTML',
    css: 'CSS',
    javascript: 'JavaScript'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] p-0 bg-background rounded-md overflow-hidden m-0">
        <DialogHeader className="p-4 border-b border-border flex flex-row justify-between items-center sticky top-0 z-10">
          <DialogTitle className="text-lg font-medium">Editing {languageTitle[language]} Code</DialogTitle>
          <div className="flex items-center gap-2">
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
