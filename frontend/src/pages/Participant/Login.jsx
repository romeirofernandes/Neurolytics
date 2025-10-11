import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParticipant } from '../../context/ParticipantContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

const ParticipantLogin = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useParticipant();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!id || !password) {
      console.log('Validation failed: Missing ID or password');
      setError('Please enter both ID and password');
      setLoading(false);
      return;
    }

    const requestBody = { id, password };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/participants/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.log('Login failed:', data.message);
        throw new Error(data.message || 'Login failed');
      }

      login(data.participant);
      console.log('Navigating to dashboard...');
      navigate('/participant/dashboard');
    } catch (err) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
      console.log('Login process completed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Participant Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your ID and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">Participant ID</Label>
              <Input
                id="id"
                type="text"
                placeholder="Enter your participant ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <Link to="/participant/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ParticipantLogin;
