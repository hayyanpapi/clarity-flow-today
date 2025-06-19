
-- Create a separate table for task reminders to support multiple reminders per task
CREATE TABLE public.task_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  reminder_time timestamp with time zone NOT NULL,
  label text, -- optional label for the reminder (e.g., "1 hour before", "Final reminder")
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.task_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for task_reminders (users can only access reminders for their own tasks)
CREATE POLICY "Users can view reminders for own tasks" ON public.task_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_reminders.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reminders for own tasks" ON public.task_reminders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_reminders.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reminders for own tasks" ON public.task_reminders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_reminders.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reminders for own tasks" ON public.task_reminders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_reminders.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Migrate existing reminder_time data from tasks table to task_reminders table
INSERT INTO public.task_reminders (task_id, reminder_time, label)
SELECT id, reminder_time, 'Migrated reminder'
FROM public.tasks 
WHERE reminder_time IS NOT NULL;

-- Remove the old reminder_time column from tasks table (optional, for cleanup)
-- ALTER TABLE public.tasks DROP COLUMN reminder_time;
