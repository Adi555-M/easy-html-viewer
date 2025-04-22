import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import FullResultModal from "./FullResultModal";
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
  const [modalOpen, setModalOpen] = useState(false);

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

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generateFullHtml();
    }
  }, [html, css, javascript, mode]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-secondary p-4 rounded-t-lg flex flex-col sm:flex-row justify-between gap-2 items-center sticky top-0 z-10">
        <h3 className="font-medium">Preview</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="default" size="sm" onClick={() => setModalOpen(true)}>
            Show Full Result
          </Button>
        </div>
      </div>
      <div className="flex-grow border border-border rounded-b-lg bg-white overflow-hidden relative">
        <iframe
          ref={iframeRef}
          title="Code Preview"
          className="w-full h-full"
          style={{
            minHeight: "420px",
            height: "100%",
            border: "none",
            background: "white",
            borderRadius: "0 0 0.75rem 0.75rem"
          }}
          sandbox="allow-scripts allow-forms"
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
