
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TaskManager } from '@/components/TaskManager';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { CalendarView } from '@/components/CalendarView';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Welcome back, {user.user_metadata?.full_name || user.email}!</h1>
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
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
