import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CodeEditor from './CodeEditor';
import PreviewPanel from './PreviewPanel';

export default function HTMLRunner() {
  const [htmlCode, setHtmlCode] = useState('<h1>Hello World!</h1>\n<p>Start editing to see your changes</p>');
  const [cssCode, setCssCode] = useState('body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n\nh1 {\n  color: #0066cc;\n}');
  const [jsCode, setJsCode] = useState('// Your JavaScript code here\nconsole.log("Script loaded");\n\n// Example: Add a click event\ndocument.addEventListener("click", function() {\n  console.log("Document clicked");\n});');
  
  const [previewHtml, setPreviewHtml] = useState(htmlCode);
  const [previewCss, setPreviewCss] = useState(cssCode);
  const [previewJs, setPreviewJs] = useState(jsCode);
  
  const [mode, setMode] = useState<'html-only' | 'full'>('html-only');

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
          <div className="space-y-4">
            <TabsContent value="html-only" className="mt-0 animate-fade-in">
              <div className="bg-secondary p-2 rounded-t-lg">
                <h3 className="font-medium">HTML</h3>
              </div>
              <div className="border border-border rounded-b-lg overflow-hidden">
                <CodeEditor 
                  language="html" 
                  value={htmlCode} 
                  onChange={setHtmlCode} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="full" className="mt-0 space-y-4 animate-fade-in">
              <div>
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">HTML</h3>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden">
                  <CodeEditor 
                    language="html" 
                    value={htmlCode} 
                    onChange={setHtmlCode} 
                  />
                </div>
              </div>
              
              <div>
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">CSS</h3>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden">
                  <CodeEditor 
                    language="css" 
                    value={cssCode} 
                    onChange={setCssCode} 
                  />
                </div>
              </div>
              
              <div>
                <div className="bg-secondary p-2 rounded-t-lg">
                  <h3 className="font-medium">JavaScript</h3>
                </div>
                <div className="border border-border rounded-b-lg overflow-hidden">
                  <CodeEditor 
                    language="javascript" 
                    value={jsCode} 
                    onChange={setJsCode} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <div className="flex justify-center">
              <Button onClick={runCode} size="lg">
                Run
              </Button>
            </div>
          </div>
          
          <div className="h-full min-h-[300px]">
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
