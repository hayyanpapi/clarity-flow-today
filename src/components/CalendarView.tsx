
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { useTasks } from '@/hooks/useTasks';

interface CalendarViewProps {
  compact?: boolean;
}

export function CalendarView({ compact = false }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { tasks } = useTasks();

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const hasTasksOnDate = (date: Date) => {
    return getTasksForDate(date).length > 0;
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (compact) {
    const upcomingTasks = tasks
      .filter(task => task.due_date && new Date(task.due_date) >= new Date() && !task.completed)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 3);

    return (
      <div className="space-y-3">
        {upcomingTasks.length === 0 ? (
          <p className="text-muted-foreground text-center">No upcoming tasks</p>
        ) : (
          upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{task.text}</p>
                <p className="text-sm text-muted-foreground">
                  {task.due_date && format(new Date(task.due_date), "MMM dd, yyyy")}
                </p>
              </div>
              <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border pointer-events-auto"
            modifiers={{
              hasTasks: (date) => hasTasksOnDate(date),
            }}
            modifiersStyles={{
              hasTasks: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                borderRadius: '50%',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedDateTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tasks for this date
              </p>
            ) : (
              selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className={`truncate font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.text}
                    </p>
                  </div>
                  <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
