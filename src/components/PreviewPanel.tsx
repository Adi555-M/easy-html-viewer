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

  // Update the iframe content using srcdoc
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generateFullHtml();
    }
  }, [html, css, javascript, mode]);

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="bg-secondary p-2 rounded-t-lg flex flex-col sm:flex-row justify-between gap-2 items-center">
        <h3 className="font-medium">Preview</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="default" size="sm" onClick={() => setModalOpen(true)}>
            Show Full Result
          </Button>
        </div>
      </div>
      <div
        className="
          flex-grow
          border border-border
          rounded-b-lg
          bg-white
          overflow-auto
          min-h-[320px]
          max-h-[65vh]
          transition-all
          "
        style={{height: "100%"}}
      >
        <iframe
          ref={iframeRef}
          title="Code Preview"
          className="w-full min-h-[300px] lg:min-h-[420px]"
          style={{
            minHeight: "300px",
            height: "65vh",
            border: "none",
            background: "white",
            borderRadius: "0 0 0.75rem 0.75rem"
          }}
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
