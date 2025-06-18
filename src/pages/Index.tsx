
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TaskManager } from '@/components/TaskManager';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { CalendarView } from '@/components/CalendarView';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { Header } from '@/components/Header';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'tasks':
        return <TaskManager />;
      case 'timer':
        return <PomodoroTimer />;
      case 'calendar':
        return <CalendarView />;
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-effect rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Tasks</h2>
                <TaskManager compact />
              </div>
              <div className="glass-effect rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Focus Timer</h2>
                <PomodoroTimer compact />
              </div>
            </div>
            <div className="glass-effect rounded-2xl p-6">
              <MotivationalQuote />
            </div>
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Upcoming</h2>
              <CalendarView compact />
            </div>
          </div>
        );
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="focusflow-theme">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar activeView={activeView} setActiveView={setActiveView} />
          <main className="flex-1 flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto animate-fade-in">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Index;
