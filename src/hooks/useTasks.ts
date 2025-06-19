
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface TaskReminder {
  id: string;
  task_id: string;
  reminder_time: string;
  label?: string;
  created_at: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  reminder_time?: string; // Keep for backward compatibility
  created_at: string;
  updated_at: string;
  user_id: string;
  reminders?: TaskReminder[];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_reminders (
            id,
            task_id,
            reminder_time,
            label,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedTasks = (data || []).map(task => ({
        ...task,
        priority: task.priority as 'high' | 'medium' | 'low',
        reminders: task.task_reminders || []
      })) as Task[];
      
      setTasks(typedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'reminders'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      const typedTask = {
        ...data,
        priority: data.priority as 'high' | 'medium' | 'low',
        reminders: []
      } as Task;
      
      setTasks(prev => [typedTask, ...prev]);
      return typedTask;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const typedTask = {
        ...data,
        priority: data.priority as 'high' | 'medium' | 'low'
      } as Task;
      
      setTasks(prev => prev.map(task => task.id === id ? { ...typedTask, reminders: task.reminders || [] } : task));
      return typedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const addReminder = async (taskId: string, reminderTime: string, label?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('task_reminders')
        .insert([{ task_id: taskId, reminder_time: reminderTime, label }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, reminders: [...(task.reminders || []), data] }
          : task
      ));

      return data;
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: "Error",
        description: "Failed to add reminder",
        variant: "destructive",
      });
    }
  };

  const deleteReminder = async (reminderId: string, taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('task_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, reminders: (task.reminders || []).filter(reminder => reminder.id !== reminderId) }
          : task
      ));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addReminder,
    deleteReminder,
    refetch: fetchTasks,
  };
}
