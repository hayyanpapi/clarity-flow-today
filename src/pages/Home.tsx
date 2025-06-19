
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, Calendar, Target, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">FocusFlow</h1>
            </div>
            <Link to="/auth">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Boost Your Productivity with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              FocusFlow
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate productivity app that combines task management, Pomodoro timer, 
            and calendar integration to help you stay focused and achieve your goals.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/auth">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Stay Productive
          </h3>
          <p className="text-lg text-gray-600">
            Powerful features designed to help you focus and get things done
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CheckSquare className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Smart Task Management</CardTitle>
              <CardDescription>
                Organize your tasks with priorities, due dates, and reminders. 
                Never miss an important deadline again.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Clock className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Pomodoro Timer</CardTitle>
              <CardDescription>
                Stay focused with the proven Pomodoro Technique. 
                Customizable work and break intervals to match your workflow.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Calendar className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>
                View all your tasks and deadlines in a beautiful calendar interface. 
                Plan your days and weeks effectively.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 text-yellow-600 mb-4" />
              <CardTitle>Real-time Sync</CardTitle>
              <CardDescription>
                Your data syncs instantly across all devices. 
                Start on your phone, continue on your computer.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 text-red-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and secure. 
                We respect your privacy and never share your information.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Target className="w-12 h-12 text-indigo-600 mb-4" />
              <CardTitle>Goal Tracking</CardTitle>
              <CardDescription>
                Set and track your productivity goals. 
                Visualize your progress and celebrate achievements.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Productivity?
          </h3>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of users who have already boosted their productivity with FocusFlow
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Start Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="w-6 h-6" />
            <h4 className="text-xl font-bold">FocusFlow</h4>
          </div>
          <p className="text-gray-400">
            Built with ❤️ to help you achieve more
          </p>
        </div>
      </footer>
    </div>
  );
}
