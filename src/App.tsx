import { useEffect, useState } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { CreateEventPage } from './pages/CreateEventPage';
import { CelebrationDetailsPage } from './pages/celebrations/[id]/page';
import { CelebrationsPage } from './pages/CelebrationsPage';
import { EventDetailsPage } from './pages/events/[id]/page';
import { SettingsPage } from './pages/SettingsPage';
import { supabase } from './lib/supabase';
import { ErrorBoundary } from './components/ui/error-boundary';
import { LoadingSpinner } from './components/ui/loading-spinner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Extract event ID from path
  const getEventId = () => {
    const match = currentPath.match(/^\/events\/(.+)$/);
    return match ? match[1] : null;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        {currentPath === '/' && <HomePage onNavigate={setCurrentPath} />}
        {currentPath === '/celebrations' && <CelebrationsPage onNavigate={setCurrentPath} />}
        {currentPath.startsWith('/celebrations/') && <CelebrationDetailsPage />}
        {currentPath === '/create' && <CreatePage onNavigate={setCurrentPath} />}
        {currentPath === '/create-event' && <CreateEventPage onNavigate={setCurrentPath} />}
        {currentPath.startsWith('/events/') && <EventDetailsPage eventId={getEventId()!} onNavigate={setCurrentPath} />}
        {currentPath === '/settings' && <SettingsPage onNavigate={setCurrentPath} />}
      </div>
    </ErrorBoundary>
  );
}

export default App;