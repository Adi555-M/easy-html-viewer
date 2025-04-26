
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CodeEditor from './CodeEditor';
import PreviewPanel from './PreviewPanel';
import { Copy, Download, ClipboardPaste, Edit } from 'lucide-react';
import { toast } from "sonner";
import { Brain } from 'lucide-react';
import FullScreenEditor from './FullScreenEditor';

export default function HTMLRunner() {
  const [htmlCode, setHtmlCode] = useState('<h1>Hello World!</h1>\n<p>Start editing to see your changes</p>');
  const [cssCode, setCssCode] = useState('body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n\nh1 {\n  color: #0066cc;\n}');
  const [jsCode, setJsCode] = useState('// Your JavaScript code here\nconsole.log("Script loaded");\n\n// Example: Add a click event\ndocument.addEventListener("click", function() {\n  console.log("Document clicked");\n});');

  const [previewHtml, setPreviewHtml] = useState(htmlCode);
  const [previewCss, setPreviewCss] = useState(cssCode);
  const [previewJs, setPreviewJs] = useState(jsCode);

  const [mode, setMode] = useState<'html-only' | 'full'>('html-only');
  
  const [fullscreenEditorOpen, setFullscreenEditorOpen] = useState(false);
  const [currentEditSection, setCurrentEditSection] = useState<'html' | 'css' | 'js'>('html');

  const handleSectionCopy = async (section: 'html' | 'css' | 'js') => {
    const content = {
      html: htmlCode,
      css: cssCode,
      js: jsCode
    }[section];
    
    await navigator.clipboard.writeText(content);
    toast.success(`${section.toUpperCase()} code copied to clipboard`);
  };

  const handleSectionPaste = async (section: 'html' | 'css' | 'js') => {
    try {
      const text = await navigator.clipboard.readText();
      
      if (!text) {
        toast.error("No text found in clipboard");
        return;
      }
      
      switch(section) {
        case 'html':
          setHtmlCode(text);
          break;
        case 'css':
          setCssCode(text);
          break;
        case 'js':
          setJsCode(text);
          break;
      }
      
      // Dispatch a custom event to notify editors about the paste
      const customEvent = new CustomEvent('editor-paste', { detail: text });
      window.dispatchEvent(customEvent);
      
      toast.success(`Pasted into ${section.toUpperCase()} editor`);
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
            switch(section) {
              case 'html':
                setHtmlCode(text);
                break;
              case 'css':
                setCssCode(text);
                break;
              case 'js':
                setJsCode(text);
                break;
            }
            
            // Dispatch custom event
            const customEvent = new CustomEvent('editor-paste', { detail: text });
            window.dispatchEvent(customEvent);
            
            toast.success(`Pasted into ${section.toUpperCase()} editor`);
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

  const handleSectionDownload = (section: 'html' | 'css' | 'js') => {
    const content = {
      html: htmlCode,
      css: cssCode,
      js: jsCode
    }[section];
    
    const filename = {
      html: 'code.html',
      css: 'styles.css',
      js: 'script.js'
    }[section];
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success(`Downloaded ${section.toUpperCase()} code as ${filename}`);
  };

  const handleFullscreenEdit = (section: 'html' | 'css' | 'js') => {
    setCurrentEditSection(section);
    setFullscreenEditorOpen(true);
  };

  const handleSaveFullscreenEdit = (code: string) => {
    switch(currentEditSection) {
      case 'html':
        setHtmlCode(code);
        break;
      case 'css':
        setCssCode(code);
        break;
      case 'js':
        setJsCode(code);
        break;
    }
  };

  const runCode = () => {
    setPreviewHtml(htmlCode);
    setPreviewCss(cssCode);
    setPreviewJs(jsCode);
  };

  const getCurrentEditCode = () => {
    switch(currentEditSection) {
      case 'html':
        return htmlCode;
      case 'css':
        return cssCode;
      case 'js':
        return jsCode;
      default:
        return '';
    }
  };

  return (
    <div className="container py-4 relative">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">HTML Runner Tool</h1>

      <Tabs
        defaultValue="html-only"
        className="w-full"
        onValueChange={(value) => setMode(value as 'html-only' | 'full')}
      >
        <div className="flex justify-center mb-4 md:mb-6">
          <TabsList>
            <TabsTrigger value="html-only">HTML Only</TabsTrigger>
            <TabsTrigger value="full">HTML + CSS + JavaScript</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4 flex flex-col h-full">
            <TabsContent value="html-only" className="mt-0 animate-fade-in">
              <div className="space-y-2">
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">HTML</h3>
                </div>
                <div className="flex flex-col gap-2 items-start px-2 py-2 bg-muted border-b border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={() => handleSectionCopy('html')}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSectionPaste('html')}>
                      <ClipboardPaste className="h-4 w-4 mr-1" />
                      Paste
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSectionDownload('html')}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFullscreenEdit('html')}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Full
                    </Button>
                  </div>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden min-h-[200px] max-h-[50vh]">
                  <CodeEditor
                    language="html"
                    value={htmlCode}
                    onChange={setHtmlCode}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="full" className="mt-0 space-y-4 animate-fade-in">
              <div className="space-y-2">
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">HTML</h3>
                </div>
                <div className="flex flex-col gap-2 items-start px-2 py-2 bg-muted border-b border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={() => handleSectionCopy('html')}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSectionPaste('html')}>
                      <ClipboardPaste className="h-4 w-4 mr-1" />
                      Paste
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSectionDownload('html')}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFullscreenEdit('html')}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Full
                    </Button>
                  </div>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden min-h-[200px] max-h-[27vh]">
                  <CodeEditor language="html" value={htmlCode} onChange={setHtmlCode} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">CSS</h3>
                </div>
                <div className="flex flex-col gap-2 items-start px-2 py-2 bg-muted border-b border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={() => handleSectionCopy('css')}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSectionPaste('css')}>
                      <ClipboardPaste className="h-4 w-4 mr-1" />
                      Paste
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSectionDownload('css')}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFullscreenEdit('css')}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Full
                    </Button>
                  </div>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden min-h-[130px] max-h-[27vh]">
                  <CodeEditor language="css" value={cssCode} onChange={setCssCode} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">JavaScript</h3>
                </div>
                <div className="flex flex-col gap-2 items-start px-2 py-2 bg-muted border-b border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={() => handleSectionCopy('js')}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSectionPaste('js')}>
                      <ClipboardPaste className="h-4 w-4 mr-1" />
                      Paste
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSectionDownload('js')}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFullscreenEdit('js')}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Full
                    </Button>
                  </div>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden min-h-[130px] max-h-[27vh]">
                  <CodeEditor language="javascript" value={jsCode} onChange={setJsCode} />
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-center sticky bottom-0 bg-background py-2 z-10">
              <Button onClick={runCode} size="lg" className="w-full max-w-xs">
                Run
              </Button>
            </div>
          </div>

          <div className="min-h-[400px] h-full flex flex-col">
            <PreviewPanel
              html={previewHtml}
              css={previewCss}
              javascript={previewJs}
              mode={mode}
            />
          </div>
        </div>
      </Tabs>

      <FullScreenEditor 
        open={fullscreenEditorOpen}
        onOpenChange={setFullscreenEditorOpen}
        code={getCurrentEditCode()}
        language={currentEditSection === 'js' ? 'javascript' : currentEditSection as 'html' | 'css' | 'javascript'}
        onSave={handleSaveFullscreenEdit}
      />

      <div className="mt-8 text-center">
        <div className="bg-soft-purple-100 rounded-lg py-3 px-4 inline-block mx-auto">
          <p className="text-sm text-secondary-purple flex items-center justify-center gap-2">
            <span>Made with</span>
            <Brain className="h-4 w-4 text-vivid-purple" />
            <span>by</span>
            <a 
              href="https://github.com/mr-marb" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold text-vivid-purple hover:underline"
            >
              Mr. Marb
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
