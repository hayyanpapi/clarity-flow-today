
import { useState } from 'react';
import { Plus, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { TaskReminder } from '@/hooks/useTasks';

interface TaskRemindersProps {
  taskId: string;
  reminders: TaskReminder[];
  onAddReminder: (taskId: string, reminderTime: string, label?: string) => Promise<void>;
  onDeleteReminder: (reminderId: string, taskId: string) => Promise<void>;
}

export function TaskReminders({ taskId, reminders, onAddReminder, onDeleteReminder }: TaskRemindersProps) {
  const [newReminderDate, setNewReminderDate] = useState<Date>();
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderLabel, setNewReminderLabel] = useState('');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  const handleAddReminder = async () => {
    if (!newReminderDate || !newReminderTime) return;

    const [hours, minutes] = newReminderTime.split(':');
    const reminderDateTime = new Date(newReminderDate);
    reminderDateTime.setHours(parseInt(hours), parseInt(minutes));

    await onAddReminder(taskId, reminderDateTime.toISOString(), newReminderLabel || undefined);
    
    // Reset form
    setNewReminderDate(undefined);
    setNewReminderTime('');
    setNewReminderLabel('');
    setIsAddingReminder(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Reminders ({reminders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length > 0 && (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(reminder.reminder_time), "MMM dd, yyyy 'at' HH:mm")}
                    </Badge>
                    {reminder.label && (
                      <span className="text-sm text-muted-foreground">
                        {reminder.label}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteReminder(reminder.id, taskId)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {!isAddingReminder ? (
          <Button
            variant="outline"
            onClick={() => setIsAddingReminder(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
        ) : (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="reminder-label">Label (optional)</Label>
              <Input
                id="reminder-label"
                placeholder="e.g., 1 hour before, Final reminder"
                value={newReminderLabel}
                onChange={(e) => setNewReminderLabel(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {newReminderDate ? format(newReminderDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newReminderDate}
                    onSelect={setNewReminderDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time">Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddReminder}
                disabled={!newReminderDate || !newReminderTime}
                className="flex-1"
              >
                Add Reminder
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingReminder(false);
                  setNewReminderDate(undefined);
                  setNewReminderTime('');
                  setNewReminderLabel('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
