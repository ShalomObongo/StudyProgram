'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { ProgressTracker } from './ProgressTracker';
import { CalendarView } from './CalendarView';
import { CourseCard } from './CourseCard';
import { DarkModeToggle } from './DarkModeToggle';
import { PomodoroTimer } from './PomodoroTimer';
import { streamGeminiResponse } from '@/lib/gemini-api';
import { LoadingBar } from './LoadingBar';
import { marked } from 'marked';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, BookOpen, Brain, Send } from 'lucide-react';
import { FuturisticBackground } from './FuturisticBackground';
import { motion, AnimatePresence } from 'framer-motion';

const convertMarkdownToHtml = (markdown: string): string => {
  return marked.parse(markdown, { async: false }) as string;
};

interface Exam {
  date: string;
  time: string;
  course: string;
  venue: string;
}

interface ScheduleItem {
  time: string;
  activity: string;
}

const exams: Exam[] = [
  { date: '2024-07-24', time: '15:30-17:30', course: 'ICS 3106: OR', venue: 'AUDITORIUM' },
  { date: '2024-07-26', time: '13:00-15:00', course: 'ICS 4205: HCI', venue: 'AUDITORIUM' },
  { date: '2024-07-29', time: '10:30-12:30', course: 'ICS 3103: AT', venue: 'BLUE SKY' },
  { date: '2024-07-30', time: '10:30-12:30', course: 'ICS 3111: MP', venue: 'BLUE SKY' },
  { date: '2024-08-01', time: '08:00-10:00', course: 'ICS 3101: ADS', venue: 'BLUE SKY' },
  { date: '2024-08-02', time: '13:00-15:00', course: 'HLE 3105: C3', venue: 'MSB 2' },
];
const courses = exams.map(exam => exam.course.split(': ')[1]);

function generateDetailedStudyPlan(date: Date, exams: Exam[]): ScheduleItem[] {
  const currentDate = new Date(date);
  const nextExam = exams.find(exam => new Date(exam.date) >= currentDate);
  
  if (!nextExam) {
    return [{ time: "All day", activity: "All exams completed. Great job!" }];
  }

  const daysUntilExam = Math.floor((new Date(nextExam.date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const isExamDay = daysUntilExam === 0;
  const isDayBeforeExam = daysUntilExam === 1;

  let schedule: ScheduleItem[] = [];

  if (isExamDay) {
    const [examStartTime, examEndTime] = nextExam.time.split('-');
    const examCourse = nextExam.course.split(': ')[1];
    
    schedule = [
      { time: "06:00 - 06:30", activity: "Wake up and morning routine" },
      { time: "06:30 - 07:00", activity: "Light exercise and shower" },
      { time: "07:00 - 07:30", activity: "Breakfast" },
    ];

    const examStartHour = parseInt(examStartTime.split(':')[0]);
    const examEndHour = parseInt(examEndTime.split(':')[0]);
    
    if (examStartHour > 10) {
      schedule.push(
        { time: "07:30 - 10:00", activity: `Final revision for ${examCourse}` },
        { time: "10:00 - 10:15", activity: "Break" },
        { time: "10:15 - 12:00", activity: `Continue revision for ${examCourse}` },
        { time: "12:00 - 12:45", activity: "Lunch and relaxation" }
      );
    }

    const preExamTime = `${(examStartHour - 2).toString().padStart(2, '0')}:00`;
    schedule.push(
      { time: `${preExamTime} - ${examStartTime}`, activity: `Last-minute review and preparation for ${examCourse}` },
      { time: `${examStartTime} - ${examEndTime}`, activity: `${examCourse} Exam` }
    );

    // Add study time for upcoming exams after the current exam
    const remainingExams = exams.filter(exam => new Date(exam.date) > currentDate);
    if (remainingExams.length > 0) {
      const nextExamToStudy = remainingExams[0];
      const nextExamCourse = nextExamToStudy.course.split(': ')[1];
      const studyStartTime = `${(examEndHour + 1).toString().padStart(2, '0')}:00`;

      schedule.push(
        { time: `${examEndTime} - ${studyStartTime}`, activity: "Rest and refreshment after exam" },
        { time: `${studyStartTime} - 18:00`, activity: `Study session for next exam: ${nextExamCourse}` },
        { time: "18:00 - 19:00", activity: "Dinner and relaxation" },
        { time: "19:00 - 20:00", activity: `Continue studying ${nextExamCourse}` }
      );
    }
  } else if (isDayBeforeExam) {
    const examCourse = nextExam.course.split(': ')[1];
    schedule = [
      { time: "06:00 - 06:30", activity: "Wake up and morning routine" },
      { time: "06:30 - 07:00", activity: "Light exercise and shower" },
      { time: "07:00 - 07:30", activity: "Breakfast" },
      { time: "07:30 - 10:00", activity: `Intensive study for tomorrow's ${examCourse} exam` },
      { time: "10:00 - 10:15", activity: "Break" },
      { time: "10:15 - 12:30", activity: `Continue studying ${examCourse}` },
      { time: "12:30 - 13:15", activity: "Lunch break" },
      { time: "13:15 - 15:30", activity: `Review key concepts for ${examCourse}` },
      { time: "15:30 - 15:45", activity: "Break" },
      { time: "15:45 - 18:00", activity: `Practice problems for ${examCourse}` },
      { time: "18:00 - 19:00", activity: "Dinner and relaxation" },
      { time: "19:00 - 20:30", activity: `Final review of weak areas in ${examCourse}` }
    ];
  } else {
    const remainingExams = exams.filter(exam => new Date(exam.date) >= currentDate);
    const examsToCover = Math.min(remainingExams.length, 3);
    const studySessionDuration = 150; // 2.5 hours in minutes

    schedule = [
      { time: "06:00 - 06:30", activity: "Wake up and morning routine" },
      { time: "06:30 - 07:00", activity: "Light exercise and shower" },
      { time: "07:00 - 07:30", activity: "Breakfast" },
    ];

    for (let i = 0; i < examsToCover; i++) {
      const exam = remainingExams[i];
      const course = exam.course.split(': ')[1];
      const startTime = new Date(currentDate);
      startTime.setHours(7, 30, 0);
      startTime.setMinutes(startTime.getMinutes() + (studySessionDuration + 15) * i);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + studySessionDuration);

      schedule.push(
        { time: `${formatTime(startTime)} - ${formatTime(endTime)}`, activity: `Study session for ${course}` },
        { time: `${formatTime(endTime)} - ${formatTime(new Date(endTime.getTime() + 15 * 60000))}`, activity: "Break" }
      );
    }

    schedule.push(
      { time: "18:00 - 19:00", activity: "Dinner and relaxation" },
      { time: "19:00 - 20:30", activity: "Review and summarize today's studies" }
    );
  }

  schedule.push({ time: "21:00", activity: "Wind down and prepare for bed" });

  return schedule;
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

const formatStudyTips = (tips: string) => {
  return tips.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

export default function StudyProgram() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2024-07-22'));
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [studyTips, setStudyTips] = useState<string>('');
  const [isLoadingTips, setIsLoadingTips] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const schedule = generateDetailedStudyPlan(currentDate, exams);

  const generateStudyTips = async (course: string) => {
    setIsLoadingTips(true);
    setStudyTips('');
    setLoadingProgress(0);
    try {
      const prompt = `Generate 3 concise study tips for the ${course} course. Focus on effective learning strategies. Format the output as a numbered list with each tip on a new line. Use markdown formatting to make important words or phrases bold.`;
      const stream = streamGeminiResponse(prompt);
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setStudyTips(fullResponse);
        setLoadingProgress((prev) => Math.min(prev + 10, 90));
      }
    } catch (error) {
      console.error('Error generating study tips:', error);
      setStudyTips('Failed to generate study tips. Please try again later.');
    } finally {
      setIsLoadingTips(false);
      setLoadingProgress(100);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !studyTips) return;

    const newMessage = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, newMessage]);
    setChatInput('');

    try {
      const prompt = `Based on the following study tips:\n\n${studyTips}\n\nUser question: ${chatInput}\n\nProvide a concise answer using markdown formatting:`;
      const stream = streamGeminiResponse(prompt);
      let fullResponse = '';
      const aiResponse = { role: 'assistant', content: '' };
      setChatHistory(prev => [...prev, aiResponse]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        aiResponse.content = fullResponse;
        setChatHistory(prev => [...prev.slice(0, -1), { ...aiResponse }]);
      }
    } catch (error) {
      console.error('Error generating chat response:', error);
      const errorResponse = { role: 'assistant', content: 'Sorry, I encountered an error while generating a response. Please try again.' };
      setChatHistory(prev => [...prev, errorResponse]);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FuturisticBackground />
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        <motion.div 
          className="flex justify-between items-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
        >
          <motion.h1 
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 neon-text"
          >
            Study Program
          </motion.h1>
          <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </motion.div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/30 backdrop-blur-md rounded-full">
            <TabsTrigger value="calendar" className="flex items-center space-x-2 text-white rounded-full">
              <Calendar className="w-4 h-4" />
              <span>Calendar & Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-2 text-white rounded-full">
              <BookOpen className="w-4 h-4" />
              <span>Courses & Study Tips</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="calendar" key="calendar">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="glassmorphism hover-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span>Exam Calendar</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CalendarView
                      currentDate={currentDate}
                      onDateChange={setCurrentDate}
                      exams={exams}
                    />
                  </CardContent>
                </Card>

                <Card className="glassmorphism hover-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span>Daily Schedule</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">{currentDate.toDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4 futuristic-scrollbar">
                      <motion.div 
                        className="space-y-4"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.1
                            }
                          }
                        }}
                        initial="hidden"
                        animate="show"
                      >
                        {schedule.map((item, index) => (
                          <motion.div
                            key={index}
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              show: { opacity: 1, y: 0 }
                            }}
                            className="flex items-center space-x-4 p-2 rounded-lg bg-white/10 backdrop-blur-md shadow"
                          >
                            <div className="bg-blue-500/20 p-2 rounded-full">
                              <Clock className="w-4 h-4 text-blue-300" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-blue-200">{item.time}</p>
                              <p className="text-sm text-gray-300">{item.activity}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="mt-6 glassmorphism hover-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Brain className="w-5 h-5 text-green-400" />
                      <span>Pomodoro Timer</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PomodoroTimer />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="courses" key="courses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {courses.map((course, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CourseCard 
                      exam={exams[index]} 
                      currentDate={currentDate} 
                      studyAidLink={course === 'OR' ? '/exam-study-aid' : undefined}
                      onGenerateTips={() => generateStudyTips(course)}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {isLoadingTips && (
                <Card className="mt-6 glassmorphism hover-glow">
                  <CardHeader>
                    <CardTitle className="text-white">Generating Study Tips...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LoadingBar progress={loadingProgress} />
                  </CardContent>
                </Card>
              )}

              {studyTips && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Card className="mt-6 glassmorphism hover-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <span>Study Tips and Chat</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose dark:prose-invert max-w-none mb-4 text-gray-300"
                        dangerouslySetInnerHTML={{ __html: formatStudyTips(studyTips) }}
                      />
                      <ScrollArea className="h-[200px] mb-4 futuristic-scrollbar">
                        <motion.div 
                          className="space-y-4"
                          variants={{
                            hidden: { opacity: 0 },
                            show: {
                              opacity: 1,
                              transition: {
                                staggerChildren: 0.1
                              }
                            }
                          }}
                          initial="hidden"
                          animate="show"
                        >
                          {chatHistory.map((message, index) => (
                            <motion.div
                              key={index}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                              }}
                              className={`p-3 rounded-lg ${
                                message.role === 'user' ? 'bg-blue-500/20 ml-4' : 'bg-purple-500/20 mr-4'
                              }`}
                            >
                              <strong className={message.role === 'user' ? 'text-blue-300' : 'text-green-300'}>
                                {message.role === 'user' ? 'You: ' : 'AI: '}
                              </strong>
                              {message.role === 'user' ? (
                                message.content
                              ) : (
                                <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(message.content) }} />
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      </ScrollArea>
                      <div className="flex space-x-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                          placeholder="Ask a question about the study tips..."
                          className="flex-grow futuristic-input"
                        />
                        <Button onClick={handleChatSubmit} className="flex items-center space-x-2 futuristic-button">
                          <Send className="w-4 h-4" />
                          <span>Send</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ProgressTracker exams={exams} currentDate={currentDate} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="glassmorphism hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>Question and Answer Generator</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-300">Generate Q&A cards to help with your study sessions.</p>
              <Link href="/qa-generator">
                <Button className="w-full sm:w-auto futuristic-button">Open Q&A Generator</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}