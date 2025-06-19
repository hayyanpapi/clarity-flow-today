
import { useState } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, Bell, BellOff, Edit } from 'lucide-react';
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
import { useTasks, Task } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { EditTaskDialog } from '@/components/EditTaskDialog';

interface TaskManagerProps {
  compact?: boolean;
}

export function TaskManager({ compact = false }: TaskManagerProps) {
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState<Date>();
  const [newReminderTime, setNewReminderTime] = useState<Date>();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const { scheduleNotification, requestPermission, permission } = useNotifications();

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to manage your tasks.</p>
        </CardContent>
      </Card>
    );
  }

  const handleAddTask = async () => {
    if (newTask.trim()) {
      await addTask({
        text: newTask.trim(),
        completed: false,
        priority: newPriority,
        due_date: newDueDate?.toISOString(),
        reminder_time: newReminderTime?.toISOString(),
      });
      
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

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const toggleReminder = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.reminder_time) {
      // Remove reminder
      await updateTask(id, { reminder_time: undefined });
    } else {
      // Set reminder for 1 hour before due date, or 1 hour from now if no due date
      const reminderTime = task.due_date 
        ? new Date(new Date(task.due_date).getTime() - 60 * 60 * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);
      
      await updateTask(id, { reminder_time: reminderTime.toISOString() });
      
      if (permission !== 'granted') {
        requestPermission();
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: Partial<Task>) => {
    await updateTask(id, updates);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const displayTasks = compact ? tasks.slice(0, 3) : tasks;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading tasks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
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
            <Button onClick={handleAddTask} className="w-full sm:w-auto">
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
            <Card key={task.id} className="transition-all hover:shadow-md">
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
                      {task.due_date && (
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(task.due_date), "MMM dd")}
                        </Badge>
                      )}
                      {task.reminder_time && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          🔔 {format(new Date(task.reminder_time), "MMM dd, HH:mm")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!compact && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReminder(task.id)}
                        className={task.reminder_time ? "text-blue-600" : "text-muted-foreground"}
                      >
                        {task.reminder_time ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
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

      <EditTaskDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
