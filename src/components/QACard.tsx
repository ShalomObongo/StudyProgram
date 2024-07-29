import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Youtube } from 'lucide-react';
import { decodeHTMLEntities } from '@/utils/helpers';

interface QACardProps {
  question: string;
  answer: string;
  showAnswer?: boolean;
  difficulty?: string;
  youtubeQuery?: string;
}

export function QACard({ question, answer, showAnswer = true, difficulty, youtubeQuery }: QACardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-gradient-to-r from-green-400 to-green-500';
      case 'Medium': return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 'Hard': return 'bg-gradient-to-r from-red-400 to-red-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  return (
    <Card className="mb-6 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{question}</CardTitle>
          <div className="flex items-center space-x-2">
            {difficulty && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={toggleExpand} className="text-white hover:bg-white/20">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 bg-white dark:bg-gray-800">
          {showAnswer ? (
            <>
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: answer }} />
              {youtubeQuery && (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(decodeHTMLEntities(youtubeQuery))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-600"
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Watch related videos on YouTube
                </a>
              )}
            </>
          ) : (
            <p className="italic text-gray-500">Answer hidden</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}