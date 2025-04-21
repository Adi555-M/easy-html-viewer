
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
<html lang="en"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Result</title>
  <style>${css}</style>
</head>
<body>
${html}
<script>${javascript}</script>
</body></html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 bg-background rounded-xl">
        <DialogHeader className="p-4 border-b flex flex-row justify-between items-center">
          <DialogTitle>Full Result</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogHeader>
        <div className="w-full min-h-[60vh] bg-white dark:bg-background overflow-auto">
          <iframe
            srcDoc={generateFullHtml()}
            className="w-full h-[60vh] border-none"
            sandbox="allow-scripts"
            title="Full Result"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
