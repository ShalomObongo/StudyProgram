import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface CourseCardProps {
  exam: {
    date: string;
    time: string;
    course: string;
    venue: string;
  };
  currentDate: Date;
  studyAidLink?: string;
  onGenerateTips: () => void;
}

export function CourseCard({ exam, currentDate, studyAidLink, onGenerateTips }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const courseName = exam.course.split(': ')[1];
  const examDate = new Date(exam.date);
  const daysUntilExam = Math.ceil((examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{courseName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold text-lg mb-2">
          {daysUntilExam} day{daysUntilExam !== 1 ? 's' : ''} until exam
        </p>
        <p>Date: {exam.date}</p>
        <p>Time: {exam.time}</p>
        {isExpanded && (
          <div className="mt-2">
            <p>Venue: {exam.venue}</p>
            <p>Course Code: {exam.course.split(': ')[0]}</p>
          </div>
        )}
        {studyAidLink && (
          <Link href={studyAidLink} className="mt-2 block">
            <Button variant="outline" size="sm">View Study Aid</Button>
          </Link>
        )}
        <Button variant="outline" size="sm" onClick={onGenerateTips} className="mt-2">
          Generate Study Tips
        </Button>
      </CardContent>
    </Card>
  );
}