
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

interface PomodoroTimerProps {
  compact?: boolean;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  volume: number;
}

export function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const [settings, setSettings] = useState<TimerSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    volume: 50,
  });

  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentSessionLength = () => {
    switch (currentMode) {
      case 'work':
        return settings.workMinutes * 60;
      case 'shortBreak':
        return settings.shortBreakMinutes * 60;
      case 'longBreak':
        return settings.longBreakMinutes * 60;
      default:
        return settings.workMinutes * 60;
    }
  };

  const totalTime = getCurrentSessionLength();
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return getCurrentSessionLength();
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
  }, [isRunning, timeLeft, currentMode, settings]);

  const handleSessionComplete = () => {
    if (settings.soundEnabled) {
      // Play notification sound (you could implement actual sound here)
      console.log('Session complete sound');
    }

    if (currentMode === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      const shouldTakeLongBreak = newCompletedSessions % settings.sessionsBeforeLongBreak === 0;
      const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
      
      setCurrentMode(nextMode);
      
      toast({
        title: 'Work session complete!',
        description: shouldTakeLongBreak ? 'Time for a long break' : 'Time for a short break',
      });

      if (settings.autoStartBreaks) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      setCurrentMode('work');
      
      toast({
        title: 'Break time over!',
        description: 'Ready to focus again?',
      });

      if (settings.autoStartWork) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentSessionLength());
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentMode('work');
    setCompletedSessions(0);
    setTimeLeft(settings.workMinutes * 60);
  };

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setIsRunning(false);
    setTimeLeft(getCurrentSessionLength());
  };

  const getModeLabel = () => {
    switch (currentMode) {
      case 'work':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
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
        <div className="text-sm text-muted-foreground">
          {getModeLabel()} • Session {completedSessions + 1}
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
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
                <DialogDescription>
                  Customize your Pomodoro timer preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Time Intervals (minutes)</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="work-minutes">Focus Time</Label>
                      <Input
                        id="work-minutes"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.workMinutes}
                        onChange={(e) => updateSettings({ workMinutes: parseInt(e.target.value) || 25 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="short-break">Short Break</Label>
                      <Input
                        id="short-break"
                        type="number"
                        min="1"
                        max="30"
                        value={settings.shortBreakMinutes}
                        onChange={(e) => updateSettings({ shortBreakMinutes: parseInt(e.target.value) || 5 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="long-break">Long Break</Label>
                      <Input
                        id="long-break"
                        type="number"
                        min="5"
                        max="60"
                        value={settings.longBreakMinutes}
                        onChange={(e) => updateSettings({ longBreakMinutes: parseInt(e.target.value) || 15 })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sessions before Long Break</Label>
                  <Select
                    value={settings.sessionsBeforeLongBreak.toString()}
                    onValueChange={(value) => updateSettings({ sessionsBeforeLongBreak: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 sessions</SelectItem>
                      <SelectItem value="3">3 sessions</SelectItem>
                      <SelectItem value="4">4 sessions</SelectItem>
                      <SelectItem value="5">5 sessions</SelectItem>
                      <SelectItem value="6">6 sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Auto-start Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-breaks">Auto-start Breaks</Label>
                      <input
                        id="auto-breaks"
                        type="checkbox"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-work">Auto-start Focus</Label>
                      <input
                        id="auto-work"
                        type="checkbox"
                        checked={settings.autoStartWork}
                        onChange={(e) => updateSettings({ autoStartWork: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Sound Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound-enabled">Enable Sound</Label>
                      <input
                        id="sound-enabled"
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                    {settings.soundEnabled && (
                      <div className="space-y-2">
                        <Label>Volume: {settings.volume}%</Label>
                        <Slider
                          value={[settings.volume]}
                          onValueChange={(value) => updateSettings({ volume: value[0] })}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full"
                >
                  Save Settings
                </Button>
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
          <div className="text-lg text-muted-foreground">
            {getModeLabel()}
          </div>
          <div className="text-sm text-muted-foreground">
            Session {completedSessions + 1} • {completedSessions % settings.sessionsBeforeLongBreak + 1}/{settings.sessionsBeforeLongBreak} until long break
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

        <div className="flex justify-center">
          <Button onClick={resetSession} variant="ghost" size="sm">
            Reset Session Count
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
