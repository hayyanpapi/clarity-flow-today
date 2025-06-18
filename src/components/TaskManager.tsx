import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from '@/hooks/use-toast';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  reminderTime?: Date;
  createdAt: Date;
}

interface TaskManagerProps {
  compact?: boolean;
}

export function TaskManager({ compact = false }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState<Date>();
  const [newReminderTime, setNewReminderTime] = useState<Date>();
  
  const { scheduleNotification, requestPermission, permission } = useNotifications();

  useEffect(() => {
    const savedTasks = localStorage.getItem('focusflow-tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
        createdAt: new Date(task.createdAt),
      }));
      setTasks(parsedTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('focusflow-tasks', JSON.stringify(tasks));
    
    // Schedule notifications for tasks with reminder times
    tasks.forEach(task => {
      if (task.reminderTime && !task.completed && task.reminderTime > new Date()) {
        const delay = task.reminderTime.getTime() - new Date().getTime();
        scheduleNotification(
          'Task Reminder',
          `Don't forget: ${task.text}`,
          delay
        );
      }
    });
  }, [tasks, scheduleNotification]);

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        priority: newPriority,
        dueDate: newDueDate,
        reminderTime: newReminderTime,
        createdAt: new Date(),
      };
      setTasks([task, ...tasks]);
      setNewTask('');
      setNewDueDate(undefined);
      setNewReminderTime(undefined);
      
      if (newReminderTime && permission !== 'granted') {
        toast({
          title: "Enable Notifications",
          description: "Allow notifications to receive task reminders.",
        });
      }
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleReminder = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.reminderTime) {
      // Remove reminder
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, reminderTime: undefined } : t
      ));
    } else {
      // Set reminder for 1 hour before due date, or 1 hour from now if no due date
      const reminderTime = task.dueDate 
        ? new Date(task.dueDate.getTime() - 60 * 60 * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);
      
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, reminderTime } : t
      ));
      
      if (permission !== 'granted') {
        requestPermission();
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const displayTasks = compact ? tasks.slice(0, 3) : tasks;

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Select value={newPriority} onValueChange={(value: 'high' | 'medium' | 'low') => setNewPriority(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {newDueDate ? format(newDueDate, "PPP") : "Due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newDueDate}
                  onSelect={setNewDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Bell className="w-4 h-4 mr-2" />
                  {newReminderTime ? format(newReminderTime, "MMM dd, HH:mm") : "Reminder"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Reminder Date & Time</label>
                    <Calendar
                      mode="single"
                      selected={newReminderTime}
                      onSelect={(date) => {
                        if (date) {
                          const time = newReminderTime || new Date();
                          date.setHours(time.getHours(), time.getMinutes());
                          setNewReminderTime(date);
                        }
                      }}
                      className="pointer-events-auto"
                    />
                  </div>
                  <div>
                    <Input
                      type="time"
                      value={newReminderTime ? format(newReminderTime, "HH:mm") : ""}
                      onChange={(e) => {
                        if (e.target.value && newReminderTime) {
                          const [hours, minutes] = e.target.value.split(':');
                          const newTime = new Date(newReminderTime);
                          newTime.setHours(parseInt(hours), parseInt(minutes));
                          setNewReminderTime(newTime);
                        }
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={addTask} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {displayTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No tasks yet. Add one above!</p>
            </CardContent>
          </Card>
        ) : (
          displayTasks.map((task) => (
            <Card key={task.id} className={cn("transition-all hover:shadow-md", getPriorityClass(task.priority))}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate", task.completed && "line-through text-muted-foreground")}>
                      {task.text}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="outline" className="text-xs">
                          {format(task.dueDate, "MMM dd")}
                        </Badge>
                      )}
                      {task.reminderTime && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          🔔 {format(task.reminderTime, "MMM dd, HH:mm")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!compact && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReminder(task.id)}
                        className={task.reminderTime ? "text-blue-600" : "text-muted-foreground"}
                      >
                        {task.reminderTime ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {compact && tasks.length > 3 && (
        <p className="text-sm text-muted-foreground text-center">
          And {tasks.length - 3} more tasks...
        </p>
      )}
    </div>
  );
}
