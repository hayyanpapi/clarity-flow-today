
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Quote {
  text: string;
  author: string;
}

const fallbackQuotes: Quote[] = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Unknown"
  },
  {
    text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs"
  },
  {
    text: "Success is not final; failure is not fatal: It is the courage to continue that counts.",
    author: "Winston S. Churchill"
  }
];

export function MotivationalQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.quotable.io/random?tags=motivational,success,inspirational');
      if (response.ok) {
        const data = await response.json();
        setQuote({
          text: data.content,
          author: data.author
        });
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.log('Using fallback quote due to API error:', error);
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomQuote);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10" />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Daily Inspiration</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchQuote}
            disabled={loading}
            className="hover:bg-white/50 dark:hover:bg-black/50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {quote ? (
          <div className="space-y-4">
            <blockquote className="text-lg leading-relaxed text-foreground italic">
              "{quote.text}"
            </blockquote>
            <cite className="text-sm text-muted-foreground font-medium">
              — {quote.author}
            </cite>
          </div>
        ) : (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-1/4"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
