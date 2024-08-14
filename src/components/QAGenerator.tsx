"use client";

import React, { useState, useRef } from "react";
import { TextUpload } from "./TextUpload";
import { QACard } from "./QACard";
import { extractQuestions } from "@/utils/questionExtractor";
import { generateAnswer, generateQuestions } from "@/lib/gemini-api";
import { LoadingBar } from "./LoadingBar";
import { marked } from "marked";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pagination } from "./Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { SignIn } from "./SignIn";
import { supabase } from "@/lib/supabase";
import { QuizMode } from "./QuizMode";
import { FloatingChatbot } from "./FloatingChatbot";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save,
  Upload,
  Search,
  Book,
  ArrowLeft,
  Atom,
  Zap,
  Sparkles,
} from "lucide-react";
import { decodeHTMLEntities } from "@/utils/helpers";
import { FuturisticBackground } from "./FuturisticBackground";
// New imports for animations
import { motion, AnimatePresence, animate } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const cache = useRef<
    Record<string, { answer: string; youtubeQuery: string }>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [setName, setSetName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingSet, setIsLoadingSet] = useState(false);
  const [isSavingSet, setIsSavingSet] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [existingSet, setExistingSet] = useState<any>(null);

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
          newQAPairs.push({
            question,
            answer: formattedAnswer,
            difficulty,
            youtubeQuery: decodeHTMLEntities(youtubeQuery),
          });
        } else {
          try {
            const { answer, youtubeQuery } = await generateAnswer(question);
            cache.current[question] = { answer, youtubeQuery };
            const formattedAnswer = marked.parse(answer) as string;
            newQAPairs.push({
              question,
              answer: formattedAnswer,
              difficulty,
              youtubeQuery: decodeHTMLEntities(youtubeQuery),
            });
          } catch (error) {
            if (
              error instanceof Error &&
              error.message === "API limit reached"
            ) {
              setError(
                "API limit reached. Some questions could not be answered."
              );
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
        setQAPairs((prevPairs) => [...prevPairs, ...newQAPairs]);
      }
      if (!error) {
        setError(
          newQAPairs.length < extractedQuestions.length
            ? "API limit reached. Some questions could not be answered."
            : null
        );
      }
      setIsLoading(false);
    }
  };

  const handleSaveSet = async () => {
    if (!setName) {
      setError("Please enter a name for the Q&A set");
      return;
    }
    setIsSavingSet(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("qa_sets")
        .select("*")
        .eq("name", setName)
        .single();

      if (data) {
        setExistingSet(data);
        setIsAlertOpen(true);
        setIsSavingSet(false);
        return;
      }

      await saveSet("new");
    } catch (err) {
      console.error("Error checking for existing set:", err);
      setError("Failed to save Q&A set");
      setIsSavingSet(false);
    }
  };

  const saveSet = async (action: "new" | "replace" | "append") => {
    setIsSavingSet(true);
    try {
      const qaSetData = {
        name: setName,
        qa_pairs: qaPairs.map(
          ({ question, answer, difficulty, youtubeQuery }) => ({
            question,
            answer,
            difficulty,
            youtubeQuery,
          })
        ),
      };

      if (action === "new" || action === "replace") {
        if (action === "replace") {
          // Delete all existing sets with the same name
          const { error: deleteError } = await supabase
            .from("qa_sets")
            .delete()
            .eq("name", setName);

          if (deleteError) throw deleteError;
        }

        // Insert the new set
        const { data, error } = await supabase
          .from("qa_sets")
          .insert(qaSetData);
        if (error) throw error;
      } else if (action === "append") {
        const { data: existingData, error: fetchError } = await supabase
          .from("qa_sets")
          .select("qa_pairs")
          .eq("name", setName)
          .single();
        if (fetchError) throw fetchError;

        const updatedQAPairs = [
          ...existingData.qa_pairs,
          ...qaSetData.qa_pairs,
        ];
        const { data, error } = await supabase
          .from("qa_sets")
          .update({ qa_pairs: updatedQAPairs })
          .eq("name", setName);
        if (error) throw error;
      }

      setError("Q&A set saved successfully");
    } catch (err) {
      console.error("Error saving Q&A set:", err);
      if (err instanceof Error) {
        setError(`Failed to save Q&A set: ${err.message}`);
      } else {
        setError("Failed to save Q&A set: Unknown error");
      }
    } finally {
      setIsSavingSet(false);
      setIsAlertOpen(false);
    }
  };

  const handleLoadSet = async () => {
    setIsLoadingSet(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("qa_sets")
        .select("qa_pairs")
        .eq("name", setName)
        .single();
      if (error) throw error;
      setQAPairs(
        data.qa_pairs.map((pair: any) => ({
          question: pair.question,
          answer: pair.answer,
          difficulty: pair.difficulty || "Medium",
          youtubeQuery: pair.youtubeQuery,
        }))
      );
      setError("Q&A set loaded successfully");
    } catch (err) {
      setError("Failed to load Q&A set");
      console.error(err);
    } finally {
      setIsLoadingSet(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const newMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, newMessage]);
    setChatInput("");

    try {
      const context = qaPairs
        .map((pair) => `Q: ${pair.question}\nA: ${pair.answer}`)
        .join("\n\n");
      const prompt = `Based on the following Q&A pairs:\n\n${context}\n\nUser question: ${chatInput}\n\nProvide an answer:`;

      const response = await generateAnswer(prompt);
      const aiResponse = {
        role: "assistant",
        content: JSON.stringify(response), // Stringify the response object
      };
      setChatHistory((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error generating chat response:", error);
      const errorResponse = {
        role: "assistant",
        content:
          "Sorry, I encountered an error while generating a response. Please try again.",
      };
      setChatHistory((prev) => [...prev, errorResponse]);
    }
  };

  const filteredQAPairs = qaPairs.filter(
    (pair) =>
      pair.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQAPairs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">
          Sign in to use the Q&A Generator
        </h2>
        <SignIn />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FuturisticBackground />
      <motion.div
        className="relative z-10 max-w-6xl mx-auto p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="mb-8 flex justify-between items-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        >
          <Link href="/">
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-transparent border-white text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Study Program</span>
            </Button>
          </Link>
          <motion.h1
            className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            animate={{
              textShadow: ["0 0 4px #fff", "0 0 8px #fff", "0 0 4px #fff"],
              transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          >
            Q&A Generator
          </motion.h1>
        </motion.div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            >
              <div className="text-center">
                <Atom className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-xl font-semibold text-white">
                  Generating Q&A...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLoadingSet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            >
              <div className="text-center">
                <Atom className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-xl font-semibold text-white">
                  Loading Q&A Set...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSavingSet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            >
              <div className="text-center">
                <Save className="w-16 h-16 text-green-400 animate-pulse mx-auto mb-4" />
                <p className="text-xl font-semibold text-white">
                  Saving Q&A Set...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="mb-8 bg-black/30 backdrop-blur-md border-white/20 hover:border-blue-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <TextUpload onTextSubmit={handleTextSubmit} />
            </CardContent>
          </Card>

          {error && (
            <motion.p
              className="text-red-400 mt-4 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {error}
            </motion.p>
          )}

          <Card className="mb-8 bg-black/30 backdrop-blur-md border-white/20 hover:border-purple-400/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                Manage Q&A Sets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="Enter Q&A set name"
                  className="flex-grow bg-white/10 text-white placeholder-white/50 border-white/20 focus:border-blue-400 transition-all duration-300"
                />
                <Button
                  onClick={handleSaveSet}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Set</span>
                </Button>
                <Button
                  onClick={handleLoadSet}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Upload className="h-4 w-4" />
                  <span>Load Set</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-black/30 backdrop-blur-md border-white/20 hover:border-green-400/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-green-400" />
                Search and Quiz Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search questions and answers"
                    className="pl-10 bg-white/10 text-white placeholder-white/50 border-white/20 focus:border-green-400 transition-all duration-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                </div>
                <Button
                  onClick={() => setIsQuizMode(!isQuizMode)}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Book className="h-4 w-4" />
                  <span>
                    {isQuizMode ? "Exit Quiz Mode" : "Enter Quiz Mode"}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <motion.div
            className="mt-8 space-y-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {isQuizMode ? (
              <QuizMode qaPairs={currentItems} />
            ) : (
              <>
                {currentItems.map((pair, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <QACard
                      question={pair.question}
                      answer={pair.answer}
                      difficulty={pair.difficulty}
                      youtubeQuery={pair.youtubeQuery}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredQAPairs.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </motion.div>

          <FloatingChatbot
            chatHistory={chatHistory}
            chatInput={chatInput}
            onChatInputChange={(value) => setChatInput(value)}
            onChatSubmit={handleChatSubmit}
            convertMarkdownToHtml={convertMarkdownToHtml}
          />
        </motion.div>
      </motion.div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Q&A Set Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              A Q&A set with the name "{setName}" already exists. What would you
              like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => saveSet("replace")}>
              Replace
            </AlertDialogAction>
            <AlertDialogAction onClick={() => saveSet("append")}>
              Append
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
