'use client';

import React, { useState, useRef } from 'react';
import { TextUpload } from './TextUpload';
import { QACard } from './QACard';
import { extractQuestions } from '@/utils/questionExtractor';
import { generateAnswer, generateQuestions } from '@/lib/gemini-api';
import { LoadingBar } from './LoadingBar';
import { marked } from 'marked';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pagination } from './Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { SignIn } from './SignIn';
import { supabase } from '@/lib/supabase';
import { QuizMode } from './QuizMode';
import { FloatingChatbot } from './FloatingChatbot';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload, Search, Book, ArrowLeft } from 'lucide-react';
import { decodeHTMLEntities } from '@/utils/helpers';

interface QAPair {
  question: string;
  answer: string;
  difficulty: string;
  youtubeQuery: string;
}
const convertMarkdownToHtml = (markdown: string): string => {
  return marked.parse(markdown) as string;
};

export function QAGenerator() {
  const { user } = useAuth();
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Record<string, { answer: string; youtubeQuery: string }>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [setName, setSetName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const handleTextSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    const extractedQuestions = await extractQuestions(text);
    const newQAPairs: QAPair[] = [];

    try {
      for (const { question, difficulty } of extractedQuestions) {
        if (question in cache.current) {
          const { answer, youtubeQuery } = cache.current[question];
          const formattedAnswer = marked.parse(answer) as string;
          newQAPairs.push({ question, answer: formattedAnswer, difficulty, youtubeQuery: decodeHTMLEntities(youtubeQuery) });
        } else {
          try {
            const { answer, youtubeQuery } = await generateAnswer(question);
            cache.current[question] = { answer, youtubeQuery };
            const formattedAnswer = marked.parse(answer) as string;
            newQAPairs.push({ question, answer: formattedAnswer, difficulty, youtubeQuery: decodeHTMLEntities(youtubeQuery) });
          } catch (error) {
            if (error instanceof Error && error.message === 'API limit reached') {
              setError('API limit reached. Some questions could not be answered.');
              break;
            } else {
              throw error;
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (newQAPairs.length > 0) {
        setQAPairs(prevPairs => [...prevPairs, ...newQAPairs]);
      }
      if (!error) {
        setError(newQAPairs.length < extractedQuestions.length
          ? 'API limit reached. Some questions could not be answered.'
          : null);
      }
      setIsLoading(false);
    }
  };

  const handleSaveSet = async () => {
    if (!setName) {
      setError('Please enter a name for the Q&A set');
      return;
    }
    try {
      const qaSetData = { 
        name: setName, 
        qa_pairs: qaPairs.map(({ question, answer, difficulty, youtubeQuery }) => ({ question, answer, difficulty, youtubeQuery }))
      };
      console.log('Saving Q&A set:', JSON.stringify(qaSetData, null, 2));
      const { data, error } = await supabase
        .from('qa_sets')
        .insert(qaSetData);
      if (error) throw error;
      console.log('Save response:', data);
      setError('Q&A set saved successfully');
    } catch (err: unknown) {
      console.error('Error saving Q&A set:', err);
      if (err instanceof Error) {
        setError(`Failed to save Q&A set: ${err.message}`);
      } else {
        setError('Failed to save Q&A set: Unknown error');
      }
    }
  };

  const handleLoadSet = async () => {
    try {
      const { data, error } = await supabase
        .from('qa_sets')
        .select('qa_pairs')
        .eq('name', setName)
        .single();
      if (error) throw error;
      setQAPairs(data.qa_pairs.map((pair: any) => ({
        question: pair.question,
        answer: pair.answer,
        difficulty: pair.difficulty || 'Medium',
        youtubeQuery: pair.youtubeQuery
      })));
      setError('Q&A set loaded successfully');
    } catch (err) {
      setError('Failed to load Q&A set');
      console.error(err);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const newMessage = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, newMessage]);
    setChatInput('');

    try {
      const context = qaPairs.map(pair => `Q: ${pair.question}\nA: ${pair.answer}`).join('\n\n');
      const prompt = `Based on the following Q&A pairs:\n\n${context}\n\nUser question: ${chatInput}\n\nProvide a concise answer:`;
      
      const response = await generateAnswer(prompt);
      const aiResponse = { 
        role: 'assistant', 
        content: JSON.stringify(response) // Stringify the response object
      };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating chat response:', error);
      const errorResponse = { role: 'assistant', content: 'Sorry, I encountered an error while generating a response. Please try again.' };
      setChatHistory(prev => [...prev, errorResponse]);
    }
  };

  const filteredQAPairs = qaPairs.filter(
    pair => pair.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pair.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQAPairs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Sign in to use the Q&A Generator</h2>
        <SignIn />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 min-h-screen text-gray-900 dark:text-white">
      <div className="mb-8 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Study Program</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Q&A Generator
        </h1>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          {/* <CardTitle>Upload Questions</CardTitle> */}
        </CardHeader>
        <CardContent>
          <TextUpload onTextSubmit={handleTextSubmit} />
        </CardContent>
      </Card>

      {isLoading && <LoadingBar progress={100} />}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Manage Q&A Sets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="Enter Q&A set name"
              className="flex-grow dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <Button onClick={handleSaveSet} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Set</span>
            </Button>
            <Button onClick={handleLoadSet} className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Load Set</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Search and Quiz Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <div className="relative flex-grow">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions and answers"
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button onClick={() => setIsQuizMode(!isQuizMode)} className="flex items-center space-x-2">
              <Book className="h-4 w-4" />
              <span>{isQuizMode ? 'Exit Quiz Mode' : 'Enter Quiz Mode'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-6">
        {isQuizMode ? (
          <QuizMode qaPairs={currentItems} />
        ) : (
          <>
            {currentItems.map((pair, index) => (
              <QACard key={index} question={pair.question} answer={pair.answer} difficulty={pair.difficulty} youtubeQuery={pair.youtubeQuery} />
            ))}
          </>
        )}
      </div>

      <div className="mt-8">
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={filteredQAPairs.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </div>

      <FloatingChatbot
        chatHistory={chatHistory}
        chatInput={chatInput}
        onChatInputChange={(value) => setChatInput(value)}
        onChatSubmit={handleChatSubmit}
        convertMarkdownToHtml={convertMarkdownToHtml}
      />
    </div>
  );
}