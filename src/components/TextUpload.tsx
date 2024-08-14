import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TextUploadProps {
  onTextSubmit: (text: string) => void;
}

export function TextUpload({ onTextSubmit }: TextUploadProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your questions here..."
            className="w-full h-32 p-2 mb-4 futuristic-input"
          />
          <div className="flex justify-between items-center">
            <Input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="max-w-xs futuristic-input"
            />
            <Button type="submit" className="futuristic-button">Generate Q&A Cards</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}