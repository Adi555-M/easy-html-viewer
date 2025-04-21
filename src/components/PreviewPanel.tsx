
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileText } from 'lucide-react';
import { ClipboardPaste } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import FullResultModal from "./FullResultModal";

interface PreviewPanelProps {
  html: string;
  css: string;
  javascript: string;
  mode: 'html-only' | 'full';
}

export default function PreviewPanel({ html, css, javascript, mode }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  // Generate the full HTML document
  const generateFullHtml = () => {
    if (mode === "html-only") {
      return html;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
<script>
${javascript}
</script>
</body>
</html>
    `;
  };

  // Update the iframe content using srcdoc instead of direct document manipulation
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generateFullHtml();
    }
  }, [html, css, javascript, mode]);

  // Copy code to clipboard
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateFullHtml());
      toast({
        title: "Code copied!",
        description: "Your code is now in your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Try again.",
        variant: "destructive",
      });
    }
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Emit a custom event so editors can handle paste
      window.dispatchEvent(new CustomEvent("editor-paste", { detail: text }));
      toast({
        title: "Paste successful!",
        description: "Pasted code into the editor.",
      });
    } catch {
      toast({
        title: "Paste failed",
        description: "Clipboard access denied.",
        variant: "destructive",
      });
    }
  };

  // Download as PDF (code, not result)
  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });
    const code = generateFullHtml();
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(code, pageWidth);
    let y = margin;
    lines.forEach((line, i) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 12;
    });
    doc.save("code.pdf");
    toast({
      title: "PDF downloaded!",
      description: "Your code was saved as code.pdf.",
    });
  };

  // Download as HTML file
  const downloadHtml = () => {
    const blob = new Blob([generateFullHtml()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "HTML file downloaded",
      description: "Code saved as code.html",
    });
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="bg-secondary p-2 rounded-t-lg flex flex-col sm:flex-row justify-between gap-2 items-center">
        <h3 className="font-medium">Preview</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="h-4 w-4 mr-1" />
            Copy Code
          </Button>
          <Button variant="outline" size="sm" onClick={handlePaste}>
            <ClipboardPaste className="h-4 w-4 mr-1" />
            Paste
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPdf}>
            <Download className="h-4 w-4 mr-1" />
            Download PDF (Code)
          </Button>
          {mode === "full" && (
            <Button variant="outline" size="sm" onClick={downloadHtml}>
              <FileText className="h-4 w-4 mr-1" />
              Download HTML
            </Button>
          )}
          <Button variant="default" size="sm" onClick={() => setModalOpen(true)}>
            Show Full Result
          </Button>
        </div>
      </div>
      <div className="flex-grow border border-border rounded-b-lg bg-white overflow-hidden min-h-[300px]">
        <iframe
          ref={iframeRef}
          title="Code Preview"
          className="w-full h-full min-h-[300px]"
          sandbox="allow-scripts"
          srcDoc=""
        ></iframe>
      </div>
      <FullResultModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        html={html}
        css={css}
        javascript={javascript}
        mode={mode}
      />
    </div>
  );
}

