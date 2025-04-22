
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
  <base target="_blank">
  <title>HTML Preview</title>
  <style>
    :root {
      --primary-bg: #f8f9fc;
      --primary-text: #1a1f2c;
      --accent-blue: #33C3F0;
    }
    body {
      margin: 0;
      padding: 1rem;
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--primary-bg);
      color: var(--primary-text);
    }
    a {
      color: var(--accent-blue);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    button {
      cursor: pointer;
    }
${css}
  </style>
</head>
<body>
${html}
<script>${javascript}</script>
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
      <div className="bg-[#f8f9fc] p-4 rounded-t-lg flex flex-col sm:flex-row justify-between gap-2 items-center sticky top-0 z-10 border-b border-[#e2e8f0]">
        <h3 className="font-medium text-[#1a1f2c]">Preview</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setModalOpen(true)}
            className="bg-[#33C3F0] hover:bg-[#33C3F0]/90 text-white"
          >
            Show Full Result
          </Button>
        </div>
      </div>
      <div className="flex-grow border border-[#e2e8f0] rounded-b-lg bg-white overflow-hidden relative">
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
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
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
