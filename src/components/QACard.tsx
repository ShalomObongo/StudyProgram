import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
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
      case 'Easy': return 'bg-emerald-900/50 text-emerald-300';
      case 'Medium': return 'bg-amber-900/50 text-amber-300';
      case 'Hard': return 'bg-rose-900/50 text-rose-300';
      default: return 'bg-slate-900/50 text-slate-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-6 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl bg-black/30 backdrop-blur-md border-white/20 hover:border-blue-400/50">
        <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white">{question}</CardTitle>
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
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded && (
            <CardContent className="p-4 bg-black/50 text-white">
              {showAnswer ? (
                <>
                  <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: answer }} />
                  {youtubeQuery && (
                    <motion.a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(decodeHTMLEntities(youtubeQuery))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-blue-400 hover:text-blue-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Youtube className="h-4 w-4 mr-2" />
                      Watch related videos on YouTube
                    </motion.a>
                  )}
                </>
              ) : (
                <p className="italic text-gray-400">Answer hidden</p>
              )}
            </CardContent>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
}