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
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Study Program</h1>
        <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Calendar & Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Courses & Study Tips</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
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

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span>Daily Schedule</span>
                </CardTitle>
                <CardDescription>{currentDate.toDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {schedule.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                          <Clock className="w-4 h-4 text-blue-500 dark:text-blue-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-600 dark:text-gray-300">{item.time}</p>
                          <p className="text-sm">{item.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-green-500" />
                <span>Pomodoro Timer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PomodoroTimer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <CourseCard 
                key={index} 
                exam={exams[index]} 
                currentDate={currentDate} 
                studyAidLink={course === 'OR' ? '/exam-study-aid' : undefined}
                onGenerateTips={() => generateStudyTips(course)}
              />
            ))}
          </div>

          {isLoadingTips && (
            <Card className="mt-6 shadow-lg">
              <CardHeader>
                <CardTitle>Generating Study Tips...</CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingBar progress={loadingProgress} />
              </CardContent>
            </Card>
          )}

          {studyTips && (
            <Card className="mt-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span>Study Tips and Chat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose dark:prose-invert max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: formatStudyTips(studyTips) }}
                />
                <ScrollArea className="h-[200px] mb-4">
                  <div className="space-y-4">
                    {chatHistory.map((message, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        message.role === 'user' ? 'bg-blue-100 dark:bg-blue-900 ml-4' : 'bg-gray-100 dark:bg-gray-800 mr-4'
                      }`}>
                        <strong className={message.role === 'user' ? 'text-blue-600 dark:text-blue-300' : 'text-green-600 dark:text-green-300'}>
                          {message.role === 'user' ? 'You: ' : 'AI: '}
                        </strong>
                        {message.role === 'user' ? (
                          message.content
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(message.content) }} />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder="Ask a question about the study tips..."
                    className="flex-grow"
                  />
                  <Button onClick={handleChatSubmit} className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ProgressTracker exams={exams} currentDate={currentDate} />

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span>Question and Answer Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Generate Q&A cards to help with your study sessions.</p>
          <Link href="/qa-generator">
            <Button className="w-full sm:w-auto">Open Q&A Generator</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}