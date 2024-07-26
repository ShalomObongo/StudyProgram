import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface QACardProps {
  question: string;
  answer: string;
}

export function QACard({ question, answer }: QACardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setShowAnswer(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{question}</CardTitle>
        <Button variant="ghost" size="sm" onClick={toggleMinimize}>
          {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {!isMinimized && (
        <CardContent>
          {showAnswer ? (
            <>
              <div dangerouslySetInnerHTML={{ __html: answer }} />
              <Button onClick={() => setShowAnswer(false)} className="mt-2">Hide Answer</Button>
            </>
          ) : (
            <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}