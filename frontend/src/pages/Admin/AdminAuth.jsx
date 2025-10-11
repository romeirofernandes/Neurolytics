import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { HiArrowLeft, HiShieldCheck } from 'react-icons/hi';

const AdminAuth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple frontend validation
    if (formData.username === 'admin' && formData.password === 'admin123') {
      setTimeout(() => {
        navigate('/admin/dashboard');
        setLoading(false);
      }, 500);
    } else {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Button 
          variant="outline" 
          asChild
          className="gap-2 border-border hover:bg-accent hover:text-accent-foreground"
        >
          <Link to="/" className="no-underline">
            <HiArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-2 shadow-xl bg-card">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <HiShieldCheck className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Admin Access
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin"
                  value={formData.username}
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
                    Authenticating...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
