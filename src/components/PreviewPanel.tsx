
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PreviewPanelProps {
  html: string;
  css: string;
  javascript: string;
  mode: 'html-only' | 'full';
}

export default function PreviewPanel({ html, css, javascript, mode }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Generate the full HTML document
  const generateFullHtml = () => {
    if (mode === 'html-only') {
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
      // Using srcdoc attribute instead of accessing contentDocument directly
      iframeRef.current.srcdoc = generateFullHtml();
    }
  }, [html, css, javascript, mode]);

  // Copy code to clipboard
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateFullHtml());
      toast({
        title: "Code copied to clipboard",
        description: "You can now paste it anywhere",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Download as HTML file
  const downloadHtml = () => {
    const blob = new Blob([generateFullHtml()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML file downloaded",
      description: "Code saved as code.html",
    });
  };

  // Download as PDF
  const downloadPdf = () => {
    // Using html2pdf or similar would be implemented here
    // For now, we'll just show a toast message
    toast({
      title: "PDF Export",
      description: "This feature will be implemented soon!",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-secondary p-2 rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">Preview</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="h-4 w-4 mr-2" />
            {mode === 'html-only' ? 'Copy Code' : 'Copy All Code'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={downloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          {mode === 'full' && (
            <Button variant="outline" size="sm" onClick={downloadHtml}>
              <FileText className="h-4 w-4 mr-2" />
              Download HTML
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-grow border border-border rounded-b-lg bg-white overflow-hidden">
        <iframe 
          ref={iframeRef}
          title="Code Preview"
          className="w-full h-full"
          sandbox="allow-scripts"
          srcDoc=""
        ></iframe>
      </div>
    </div>
  );
}
