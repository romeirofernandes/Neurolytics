import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.config';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the page the user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBackendAuth = async (firebaseUser) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: firebaseUser.displayName || formData.email.split('@')[0],
          email: firebaseUser.email,
          firebaseId: firebaseUser.uid
        })
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          name: data.user.name,
          email: data.user.email,
          mongoId: data.user.mongoId,
          firebaseId: data.user.firebaseId
        };
        login(userData);
        navigate(from, { replace: true });
      } else {
        setError(data.message || 'Failed to authenticate with server');
      }
    } catch (error) {
      console.error('Backend auth error:', error);
      setError('Failed to connect to server');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await handleBackendAuth(userCredential.user);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleBackendAuth(result.user);
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Back to Dashboard Button */}
      <div className="absolute top-6 left-6">
        <Button 
          variant="outline" 
          asChild
          className="gap-2 border-border hover:bg-accent hover:text-accent-foreground"
        >
          <Link to="/" className="no-underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-2 shadow-xl bg-card">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Welcome Back
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-6">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-semibold border-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground font-semibold">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 border-2 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 border-2 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border-2 border-destructive/50 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:text-primary/80 font-bold hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
 