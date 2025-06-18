
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface PomodoroTimerProps {
  compact?: boolean;
}

type TimerMode = 'work' | 'break';

export function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = currentMode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            const nextMode = currentMode === 'work' ? 'break' : 'work';
            const nextTime = nextMode === 'work' ? workMinutes * 60 : breakMinutes * 60;
            setCurrentMode(nextMode);
            setTimeLeft(nextTime);
            
            toast({
              title: currentMode === 'work' ? 'Work session complete!' : 'Break time over!',
              description: currentMode === 'work' ? 'Time for a break' : 'Back to work',
            });
            
            return nextTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentMode, workMinutes, breakMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,

)}:${secs.toString().padStart(2, 
)}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const resetTime = currentMode === 'work' ? workMinutes * 60 : breakMinutes * 60;
    setTimeLeft(resetTime);
  };

  const updateSettings = (newWorkMinutes: number, newBreakMinutes: number) => {
    setWorkMinutes(newWorkMinutes);
    setBreakMinutes(newBreakMinutes);
    setIsRunning(false);
    const newTime = currentMode === 'work' ? newWorkMinutes * 60 : newBreakMinutes * 60;
    setTimeLeft(newTime);
    setIsSettingsOpen(false);
  };

  if (compact) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl font-mono font-bold text-foreground">
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Button onClick={toggleTimer} size="sm">
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground capitalize">
          {currentMode} Mode
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <span>Pomodoro Timer</span>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
                <DialogDescription>
                  Customize your work and break intervals
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="work-minutes">Work Minutes</Label>
                  <Input
                    id="work-minutes"
                    type="number"
                    min="1"
                    max="60"
                    defaultValue={workMinutes}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 60) {
                        updateSettings(value, breakMinutes);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break-minutes">Break Minutes</Label>
                  <Input
                    id="break-minutes"
                    type="number"
                    min="1"
                    max="30"
                    defaultValue={breakMinutes}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 30) {
                        updateSettings(workMinutes, value);
                      }
                    }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="space-y-2">
          <div className="text-6xl font-mono font-bold text-foreground">
            {formatTime(timeLeft)}
          </div>
          <div className="text-lg text-muted-foreground capitalize">
            {currentMode} Mode
          </div>
        </div>

        <Progress value={progress} className="w-full" />

        <div className="flex justify-center space-x-4">
          <Button onClick={toggleTimer} size="lg">
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
