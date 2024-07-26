'use client';

import React, { useState, useRef } from 'react';
import { TextUpload } from './TextUpload';
import { QACard } from './QACard';
import { extractQuestions } from '@/utils/questionExtractor';
import { generateAnswer } from '@/lib/gemini-api';
import { LoadingBar } from './LoadingBar';
import { marked } from 'marked';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pagination } from './Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { SignIn } from './SignIn';
import { supabase } from '@/lib/supabase';

interface QAPair {
  question: string;
  answer: string;
}

export function QAGenerator() {
  const { user } = useAuth();
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [setName, setSetName] = useState('');

  const handleTextSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    const questions = extractQuestions(text);
    const newQAPairs: QAPair[] = [];

    try {
      for (const question of questions) {
        let answer: string;
        if (question in cache.current) {
          answer = cache.current[question];
        } else {
          answer = await generateAnswer(question);
          cache.current[question] = answer;
        }
        const formattedAnswer = await marked(answer);
        newQAPairs.push({ question, answer: formattedAnswer });
      }
      setQAPairs(prevPairs => [...prevPairs, ...newQAPairs]);
    } catch (err) {
      setError('An error occurred while generating answers. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSet = async () => {
    if (!setName) {
      setError('Please enter a name for the Q&A set');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('qa_sets')
        .insert({ name: setName, qa_pairs: qaPairs });
      if (error) throw error;
      setError('Q&A set saved successfully');
    } catch (err) {
      setError('Failed to save Q&A set');
      console.error(err);
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
      setQAPairs(data.qa_pairs);
      setError('Q&A set loaded successfully');
    } catch (err) {
      setError('Failed to load Q&A set');
      console.error(err);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = qaPairs.slice(indexOfFirstItem, indexOfLastItem);

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
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Link href="/">
          <Button variant="outline">Back to Study Program</Button>
        </Link>
      </div>
      <TextUpload onTextSubmit={handleTextSubmit} />
      {isLoading && <LoadingBar progress={100} />}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          value={setName}
          onChange={(e) => setSetName(e.target.value)}
          placeholder="Enter Q&A set name"
          className="flex-grow p-2 border rounded-md"
        />
        <Button onClick={handleSaveSet}>Save Set</Button>
        <Button onClick={handleLoadSet}>Load Set</Button>
      </div>
      <div className="mt-8">
        {currentItems.map((pair, index) => (
          <QACard key={index} question={pair.question} answer={pair.answer} />
        ))}
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={qaPairs.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
}