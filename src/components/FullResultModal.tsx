
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
  <style>${css}</style>
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
      <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] p-0 bg-background rounded-xl overflow-hidden">
        <DialogHeader className="p-4 border-b flex flex-row justify-between items-center bg-secondary/30 sticky top-0 z-10">
          <DialogTitle>Full Result</DialogTitle>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="w-full h-[calc(90vh-4rem)] bg-white dark:bg-background relative">
          <iframe
            srcDoc={generateFullHtml()}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-popups allow-forms"
            title="Full Result"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
