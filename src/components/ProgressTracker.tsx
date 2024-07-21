import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressTrackerProps {
  exams: {
    course: string;
    date: string;
  }[];
  currentDate: Date;
}

export function ProgressTracker({ exams, currentDate }: ProgressTrackerProps) {
  const totalDays = exams.length * 7; // Assuming 7 days of study per exam
  const passedDays = exams.reduce((acc, exam) => {
    const examDate = new Date(exam.date);
    const daysPassed = Math.max(0, Math.floor((currentDate.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24)) + 7);
    return acc + Math.min(daysPassed, 7);
  }, 0);

  const overallProgress = Math.min(100, Math.round((passedDays / totalDays) * 100));

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-1">Overall Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <p className="text-sm mt-1">{overallProgress}% Complete</p>
        </div>
        <div className="space-y-2">
          {exams.map((exam, index) => {
            const examDate = new Date(exam.date);
            const daysPassed = Math.max(0, Math.floor((currentDate.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24)) + 7);
            const progress = Math.min(100, Math.round((daysPassed / 7) * 100));
            return (
              <div key={index}>
                <h4 className="text-sm font-medium mb-1">{exam.course.split(': ')[1]}</h4>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}