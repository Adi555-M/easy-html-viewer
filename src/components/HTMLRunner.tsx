
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CodeEditor from './CodeEditor';
import PreviewPanel from './PreviewPanel';

// Move code actions here for clarity
import { Copy, Download } from 'lucide-react';
import { ClipboardPaste } from 'lucide-react';

export default function HTMLRunner() {
  const [htmlCode, setHtmlCode] = useState('<h1>Hello World!</h1>\n<p>Start editing to see your changes</p>');
  const [cssCode, setCssCode] = useState('body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n\nh1 {\n  color: #0066cc;\n}');
  const [jsCode, setJsCode] = useState('// Your JavaScript code here\nconsole.log("Script loaded");\n\n// Example: Add a click event\ndocument.addEventListener("click", function() {\n  console.log("Document clicked");\n});');

  const [previewHtml, setPreviewHtml] = useState(htmlCode);
  const [previewCss, setPreviewCss] = useState(cssCode);
  const [previewJs, setPreviewJs] = useState(jsCode);

  const [mode, setMode] = useState<'html-only' | 'full'>('html-only');

  // For mobile-friendly code actions, move to their own bar
  const handleCopy = async () => {
    await navigator.clipboard.writeText(mode === "html-only" ? htmlCode : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview</title>
  ${mode === "full" ? `<style>${cssCode}</style>` : ""}
</head>
<body>
${htmlCode}
${mode === "full" ? `<script>${jsCode}</script>` : ""}
</body>
</html>
    `.trim());
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setHtmlCode(text);
  };

  const handleDownload = async () => {
    // Download code as PDF, similar to PreviewPanel's original behavior
    const { jsPDF } = await import("jspdf");
    let code = mode === "html-only" ? htmlCode : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview</title>
  ${mode === "full" ? `<style>${cssCode}</style>` : ""}
</head>
<body>
${htmlCode}
${mode === "full" ? `<script>${jsCode}</script>` : ""}
</body>
</html>
    `.trim();

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(code, pageWidth);
    let y = margin;
    lines.forEach(line => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 12;
    });
    doc.save("code.pdf");
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
              <div className="bg-secondary p-2 rounded-t-lg">
                <h3 className="font-medium">HTML</h3>
              </div>
              {/* Code action bar for mobile and desktop */}
              <div className="flex gap-2 items-center px-2 py-2 bg-muted border-b border-border sticky top-0 z-10 rounded-t-lg md:rounded-t-none">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Code
                </Button>
                <Button variant="outline" size="sm" onClick={handlePaste}>
                  <ClipboardPaste className="h-4 w-4 mr-1" />
                  Paste
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF (Code)
                </Button>
              </div>
              <div className="border border-border rounded-b-lg overflow-hidden min-h-[200px] max-h-[50vh]">
                <CodeEditor
                  language="html"
                  value={htmlCode}
                  onChange={setHtmlCode}
                />
              </div>
            </TabsContent>

            <TabsContent value="full" className="mt-0 space-y-4 animate-fade-in">
              <div>
                <div className="bg-secondary p-2 rounded-t-lg"><h3 className="font-medium">HTML</h3></div>
                <div className="flex gap-2 items-center px-2 py-2 bg-muted border-b border-border sticky top-0 z-10 rounded-t-lg md:rounded-t-none">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePaste}>
                    <ClipboardPaste className="h-4 w-4 mr-1" />
                    Paste
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF (Code)
                  </Button>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden min-h-[200px] max-h-[40vh]">
                  <CodeEditor language="html" value={htmlCode} onChange={setHtmlCode} />
                </div>
              </div>
              <div>
                <div className="bg-secondary p-2 rounded-t-lg"><h3 className="font-medium">CSS</h3></div>
                <div className="border border-border rounded-b-lg overflow-hidden min-h-[130px] max-h-[27vh]">
                  <CodeEditor language="css" value={cssCode} onChange={setCssCode} />
                </div>
              </div>
              <div>
                <div className="bg-secondary p-2 rounded-t-lg"><h3 className="font-medium">JavaScript</h3></div>
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
    </div>
  );
}
