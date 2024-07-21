import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  exams: { date: string; course: string }[];
}

export function CalendarView({ currentDate, onDateChange, exams }: CalendarViewProps) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const isExamDay = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return exams.some(exam => exam.date === dateString);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={prevMonth}><ChevronLeft /></Button>
        <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <Button onClick={nextMonth}><ChevronRight /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isSelected = day === currentDate.getDate();
          const isExam = isExamDay(day);
          return (
            <Button
              key={day}
              onClick={() => selectDate(day)}
              variant={isSelected ? 'default' : 'outline'}
              className={`${isExam ? 'bg-red-100 hover:bg-red-200' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
            >
              {day}
            </Button>
          );
        })}
      </div>
    </div>
  );
}