import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParticipant } from '../../context/ParticipantContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { HiClipboard, HiClipboardCheck, HiArrowRight } from 'react-icons/hi';

const ParticipantRegister = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    education: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [participantId, setParticipantId] = useState('');
  const [participantData, setParticipantData] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useParticipant();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      console.log('✅ Participant ID copied to clipboard:', text);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('❌ Failed to copy to clipboard:', err);
    }
  };

  const handleGoToDashboard = () => {
    console.log('🚀 Navigating to dashboard with participant data:', participantData);
    login(participantData);
    navigate('/participant/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('========== PARTICIPANT REGISTRATION ATTEMPT ==========');
    console.log('Form data:', {
      password: formData.password ? '***' : '',
      confirmPassword: formData.confirmPassword ? '***' : '',
      age: formData.age,
      gender: formData.gender,
      education: formData.education,
      city: formData.city
    });

    // Validate required fields
    if (!formData.password || !formData.age || !formData.gender || !formData.education) {
      console.log('❌ Validation failed: Missing required fields');
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Validation failed: Passwords do not match');
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate age
    if (formData.age < 1 || formData.age > 120) {
      console.log('❌ Validation failed: Invalid age');
      setError('Please enter a valid age');
      setLoading(false);
      return;
    }

    const requestBody = {
      password: formData.password,
      age: parseInt(formData.age),
      gender: formData.gender,
      education: formData.education,
      city: formData.city || undefined
    };

    console.log('📤 Sending registration request to backend...');
    console.log('Request body:', { ...requestBody, password: '***' });
    console.log('API URL: http://localhost:8000/api/participants/register');

    try {
      const response = await fetch('http://localhost:8000/api/participants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.log('❌ Registration failed:', data.message);
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      console.log('✅ Registration successful!');
      console.log('Participant ID:', data.participant.id);
      console.log('Full Participant Data:', data.participant);
      
      setParticipantId(data.participant.id);
      setParticipantData(data.participant);
      setSuccess(`Registration successful! Your Participant ID has been copied to clipboard.`);
      
      // Automatically copy ID to clipboard
      copyToClipboard(data.participant.id);
      
      // Reset form
      setFormData({
        password: '',
        confirmPassword: '',
        age: '',
        gender: '',
        education: '',
        city: ''
      });
    } catch (err) {
      console.error('❌ ERROR during registration:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
      console.log('Registration process completed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Participant Registration
          </CardTitle>
          <CardDescription className="text-center">
            Create your participant account to join research experiments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                disabled={loading}
                required
                min="1"
                max="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education *</Label>
              <Input
                id="education"
                name="education"
                type="text"
                placeholder="e.g., Bachelor's, Master's, PhD"
                value={formData.education}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            {success && participantId && (
              <div className="p-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md space-y-3">
                <p className="font-semibold text-center">{success}</p>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-center text-muted-foreground">
                    Save this ID - you'll need it to login:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-xs bg-white dark:bg-gray-800 p-3 rounded border border-green-300 dark:border-green-700 break-all">
                      {participantId}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(participantId)}
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <HiClipboardCheck className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <HiClipboard className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Go to Dashboard
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
            {!participantId && (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link to="/participant/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ParticipantRegister;
