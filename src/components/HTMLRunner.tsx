
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CodeEditor from './CodeEditor';
import PreviewPanel from './PreviewPanel';
import { Copy, Download, ClipboardPaste } from 'lucide-react';
import { toast } from "sonner";

export default function HTMLRunner() {
  const [htmlCode, setHtmlCode] = useState('<h1>Hello World!</h1>\n<p>Start editing to see your changes</p>');
  const [cssCode, setCssCode] = useState('body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n\nh1 {\n  color: #0066cc;\n}');
  const [jsCode, setJsCode] = useState('// Your JavaScript code here\nconsole.log("Script loaded");\n\n// Example: Add a click event\ndocument.addEventListener("click", function() {\n  console.log("Document clicked");\n});');

  const [previewHtml, setPreviewHtml] = useState(htmlCode);
  const [previewCss, setPreviewCss] = useState(cssCode);
  const [previewJs, setPreviewJs] = useState(jsCode);

  const [mode, setMode] = useState<'html-only' | 'full'>('html-only');

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
      toast.success(`Pasted into ${section.toUpperCase()} editor`);
    } catch (err) {
      toast.error('Failed to paste from clipboard');
    }
  };

  const handleSectionDownload = async (section: 'html' | 'css' | 'js') => {
    const { jsPDF } = await import("jspdf");
    const content = {
      html: htmlCode,
      css: cssCode,
      js: jsCode
    }[section];
    
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(content, pageWidth);
    let y = margin;
    lines.forEach(line => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 12;
    });
    doc.save(`code-${section}.pdf`);
    toast.success(`Downloaded ${section.toUpperCase()} code as PDF`);
  };

  const runCode = () => {
    setPreviewHtml(htmlCode);
    setPreviewCss(cssCode);
    setPreviewJs(jsCode);
  };

  return (
    <div className="container py-4">
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
                <div className="flex flex-wrap gap-2 items-center px-2 py-2 bg-muted border-b border-border">
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
                    Download PDF
                  </Button>
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
                <div className="flex flex-wrap gap-2 items-center px-2 py-2 bg-muted border-b border-border">
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
                    Download PDF
                  </Button>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden min-h-[200px] max-h-[27vh]">
                  <CodeEditor language="html" value={htmlCode} onChange={setHtmlCode} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">CSS</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center px-2 py-2 bg-muted border-b border-border">
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
                    Download PDF
                  </Button>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden min-h-[130px] max-h-[27vh]">
                  <CodeEditor language="css" value={cssCode} onChange={setCssCode} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">JavaScript</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center px-2 py-2 bg-muted border-b border-border">
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
                    Download PDF
                  </Button>
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

          <div className="min-h-[320px] h-full flex flex-col">
            <PreviewPanel
              html={previewHtml}
              css={previewCss}
              javascript={previewJs}
              mode={mode}
            />
          </div>
        </div>
      </Tabs>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Created by Mr. Marb
      </div>
    </div>
  );
}
