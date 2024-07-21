'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from './DarkModeToggle';

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

  let schedule = [
    { time: "06:00 - 06:30", activity: "Wake up and morning routine" },
    { time: "06:30 - 07:00", activity: "Light exercise and shower" },
    { time: "07:00 - 07:30", activity: "Breakfast" },
  ];

  if (isExamDay) {
    const examTime = nextExam.time.split('-')[0];
    const examCourse = nextExam.course.split(': ')[1];
    schedule.push(
      { time: "07:30 - 10:00", activity: `Final revision for ${examCourse}` },
      { time: "10:00 - 10:15", activity: "Break" },
      { time: "10:15 - 12:00", activity: `Continue revision for ${examCourse}` },
      { time: "12:00 - 12:45", activity: "Lunch and relaxation" },
      { time: "12:45 - 14:45", activity: `Last-minute review and preparation for ${examCourse}` },
      { time: examTime, activity: `${examCourse} Exam` }
    );
  } else if (isDayBeforeExam) {
    const examCourse = nextExam.course.split(': ')[1];
    schedule.push(
      { time: "07:30 - 10:00", activity: `Intensive study for tomorrow's ${examCourse} exam` },
      { time: "10:00 - 10:15", activity: "Break" },
      { time: "10:15 - 12:30", activity: `Continue studying ${examCourse}` },
      { time: "12:30 - 13:15", activity: "Lunch break" },
      { time: "13:15 - 15:30", activity: `Review key concepts for ${examCourse}` },
      { time: "15:30 - 15:45", activity: "Break" },
      { time: "15:45 - 18:00", activity: `Practice problems for ${examCourse}` },
      { time: "18:00 - 19:00", activity: "Dinner and relaxation" },
      { time: "19:00 - 20:30", activity: `Final review of weak areas in ${examCourse}` }
    );
  } else {
    const remainingExams = exams.filter(exam => new Date(exam.date) >= currentDate);
    const examsToCover = Math.min(remainingExams.length, 3);
    const studySessionDuration = 150; // 2.5 hours in minutes

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

export default function StudyProgram() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2024-07-21'));
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const nextDay = () => {
    setCurrentDate(prevDate => {
      const nextDate = new Date(prevDate);
      nextDate.setDate(prevDate.getDate() + 1);
      return nextDate;
    });
  };

  const previousDay = () => {
    setCurrentDate(prevDate => {
      const prevDateCopy = new Date(prevDate);
      prevDateCopy.setDate(prevDate.getDate() - 1);
      return prevDateCopy;
    });
  };

  const schedule = generateDetailedStudyPlan(currentDate, exams);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Study Program</h1>
        <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Detailed Study Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={previousDay}><ChevronLeft /></Button>
            <h2 className="text-xl font-bold">{currentDate.toDateString()}</h2>
            <Button onClick={nextDay}><ChevronRight /></Button>
          </div>
          <div className="space-y-2">
            {schedule.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-semibold">{item.time}</span>
                <span>{item.activity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        {courses.map((course, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{course}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Exam: {exams[index].date}</p>
              <p>Time: {exams[index].time}</p>
              <p>Venue: {exams[index].venue}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}