import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Import hooks
import { gql } from 'graphql-request'; // Import gql
import { gqlClient } from './lib/graphqlClient'; // Import client
import { supabase } from './lib/supabase'; // Import frontend supabase client
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import type { Session } from '@supabase/supabase-js';
import './App.css';

// Define the health query
const HEALTH_QUERY = gql`
  query {
    health
  }
`;

const ME_QUERY = gql`
  query {
    me {
      id
      email
    }
  }
`;

// Interface for the 'me' query result
interface MeQueryResult {
  me: {
    id: string;
    email?: string; // Email might be null depending on Supabase settings
  } | null;
}

// Placeholder Components
function HomePage() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [userInfo, setUserInfo] = useState<string>('Fetching...');

  useEffect(() => {
    // Fetch health status
    gqlClient.request(HEALTH_QUERY)
      .then((data: any) => setHealthStatus(data.health || 'Unknown'))
      .catch((error) => {
        console.error('Error fetching health:', error);
        setHealthStatus('Error');
      });

    // Fetch user info
    gqlClient.request<MeQueryResult>(ME_QUERY)
      .then((data) => {
        if (data.me) {
          setUserInfo(`Logged in as: ${data.me.email} (ID: ${data.me.id})`);
        } else {
          setUserInfo('Not logged in (backend)');
        }
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
        setUserInfo('Error fetching user info');
      });

  }, []); 

  return (
    <div>
      <h2>Home Page</h2>
      <p>Welcome to the CRM!</p>
      <p>
        <strong>API Health:</strong> {healthStatus}
      </p>
      <p>
        <strong>User Status:</strong> {userInfo}
      </p>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <h2>About Page</h2>
      <p>This is a custom CRM system.</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div>
      <h2>404 - Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}

// --- Component for Logged-In State ---
function AppContent() {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="App">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <button onClick={handleSignOut}>Sign Out</button>
          </li>
        </ul>
      </nav>

      <hr />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route */} 
        </Routes>
      </main>
    </div>
  );
}

// --- Main App Component with Auth Logic ---
function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    // Render Supabase Auth UI if not logged in
    return (
      <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }} // Optional theme
          providers={['google', 'github']} // Example providers
          // Add other options as needed (e.g., socialLayout)
        />
      </div>
    );
  } else {
    // Render the main application content if logged in
    return <AppContent />;
  }
}

export default App;
