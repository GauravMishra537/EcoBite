import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer } from './components';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NotFound from './pages/NotFound/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#1f2937',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Placeholder routes — will be implemented in future commits */}
            <Route path="/restaurants" element={<PlaceholderPage title="Restaurants" emoji="🍽️" />} />
            <Route path="/grocery" element={<PlaceholderPage title="Grocery" emoji="🛒" />} />
            <Route path="/subscription" element={<PlaceholderPage title="Subscription" emoji="💎" />} />
            <Route path="/cart" element={<PlaceholderPage title="Cart" emoji="🛍️" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

/* Temporary placeholder for pages not yet implemented */
const PlaceholderPage = ({ title, emoji }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: '1rem',
    }}
  >
    <span style={{ fontSize: '4rem' }}>{emoji}</span>
    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>{title}</h1>
    <p style={{ color: '#9ca3af' }}>Coming soon...</p>
  </div>
);

export default App;
