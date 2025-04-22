
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FullResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
  css: string;
  javascript: string;
  mode: "html-only" | "full";
}

export default function FullResultModal({
  open,
  onOpenChange,
  html,
  css,
  javascript,
  mode,
}: FullResultModalProps) {
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
  <title>Result</title>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] p-0 bg-[#f8f9fc] rounded-xl overflow-hidden">
        <DialogHeader className="p-4 border-b border-[#e2e8f0] flex flex-row justify-between items-center bg-white sticky top-0 z-10">
          <DialogTitle className="text-[#1a1f2c]">Full Result</DialogTitle>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="text-[#1a1f2c] hover:bg-[#f8f9fc]">Close</Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="w-full h-[calc(90vh-4rem)] bg-white relative">
          <iframe
            srcDoc={generateFullHtml()}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
            title="Full Result"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
