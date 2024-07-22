import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const DEFAULT_WORK_TIME = 25 * 60; // 25 minutes in seconds
const DEFAULT_BREAK_TIME = 5 * 60; // 5 minutes in seconds

export function PomodoroTimer() {
  const [workTime, setWorkTime] = useState(DEFAULT_WORK_TIME);
  const [breakTime, setBreakTime] = useState(DEFAULT_BREAK_TIME);
  const [time, setTime] = useState(workTime);
  const [isActive, setIsActive] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      if (isWork) {
        setTime(breakTime);
        setIsWork(false);
      } else {
        setTime(workTime);
        setIsWork(true);
      }
      setIsActive(false);
      playNotification();
      sendNotification();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, isWork, workTime, breakTime]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
      }).catch(error => {
        console.error('Audio playback failed:', error);
      });
    }
  };

  const resetTimer = () => {
    setTime(isWork ? workTime : breakTime);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, isWorkTime: boolean) => {
    const [hours, minutes, seconds] = e.target.value.split(':').map(Number);
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (isWorkTime) {
      setWorkTime(totalSeconds);
      if (isWork) setTime(totalSeconds);
    } else {
      setBreakTime(totalSeconds);
      if (!isWork) setTime(totalSeconds);
    }
  };

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Audio playback failed:', error);
      });
    }
  };

  const sendNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Pomodoro Timer', {
            body: isWork ? 'Time for a break!' : 'Time to work!',
            icon: '/favicon.ico',
          });
        }
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-center mb-4">{formatTime(time)}</div>
        <div className="text-center mb-4">{isWork ? 'Work Time' : 'Break Time'}</div>
        <div className="flex justify-center space-x-2 mb-4">
          <Button onClick={toggleTimer}>{isActive ? 'Pause' : 'Start'}</Button>
          <Button onClick={resetTimer}>Reset</Button>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>
        {isEditing && (
          <div className="flex justify-center space-x-2 mb-4">
            <Input
              type="text"
              value={formatTime(workTime)}
              onChange={(e) => handleTimeChange(e, true)}
              className="w-32"
            />
            <span>Work</span>
            <Input
              type="text"
              value={formatTime(breakTime)}
              onChange={(e) => handleTimeChange(e, false)}
              className="w-32"
            />
            <span>Break</span>
          </div>
        )}
        <div className="mt-4 flex items-center">
          <span className="mr-2">Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
        </div>
        <audio ref={audioRef} src="/notification-sound.mp3" />
      </CardContent>
    </Card>
  );
}