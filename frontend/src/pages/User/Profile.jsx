import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import AppSidebar from '../../components/user/AppSidebar';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [researcherProfile, setResearcherProfile] = useState(null);
  const [formData, setFormData] = useState({
    institution: '',
    designation: '',
    fieldOfStudy: '',
    bio: '',
    orcId: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  console.log('[Profile] Component mounted');
  console.log('[Profile] API_URL:', API_URL);
  console.log('[Profile] Current user:', user);
  console.log('[Profile] User mongoId:', user?.mongoId);
  console.log('[Profile] User _id:', user?._id);

  // Get the correct user ID (check both mongoId and _id)
  const userId = user?.mongoId || user?._id;
  console.log('[Profile] Using userId:', userId);

  // Fetch existing researcher profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        console.log('[Profile] No user ID found, skipping fetch');
        return;
      }

      console.log('[Profile] Fetching profile for user ID:', userId);
      
      try {
        const response = await fetch(`${API_URL}/api/researchers/profile/${userId}`);
        console.log('[Profile] Fetch URL:', `${API_URL}/api/researchers/profile/${userId}`);
        console.log('[Profile] Fetch response status:', response.status);
        
        const data = await response.json();
        console.log('[Profile] Fetch response data:', data);

        if (response.ok && data.success) {
          console.log('[Profile] Profile found:', data.data);
          setResearcherProfile(data.data);
          setFormData({
            institution: data.data.institution || '',
            designation: data.data.designation || '',
            fieldOfStudy: data.data.fieldOfStudy || '',
            bio: data.data.bio || '',
            orcId: data.data.orcId || ''
          });
        } else {
          console.log('[Profile] No existing profile found');
        }
      } catch (error) {
        console.error('[Profile] Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [userId, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('[Profile] Form field changed:', name, '=', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const verifyOrcId = async () => {
    if (!formData.orcId) {
      console.log('[Profile] No ORCID to verify');
      setMessage({ type: 'error', text: 'Please enter an ORCID to verify' });
      return;
    }

    console.log('[Profile] Verifying ORCID:', formData.orcId);
    console.log('[Profile] User name:', user?.name);
    setVerifying(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/researchers/verify-orcid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orcId: formData.orcId,
          userName: user?.name // Pass user's name for verification
        })
      });

      console.log('[Profile] ORCID verify URL:', `${API_URL}/api/researchers/verify-orcid`);
      console.log('[Profile] ORCID verification response status:', response.status);
      const data = await response.json();
      console.log('[Profile] ORCID verification response data:', data);

      if (response.ok && data.success) {
        console.log('[Profile] ORCID verified successfully:', data.data);
        let successMessage = `ORCID verified! Name: ${data.data.givenName} ${data.data.familyName}`;
        
        if (data.nameMatch) {
          successMessage += ` (${data.nameMatch.similarity}% match with your name)`;
        }
        
        setMessage({ 
          type: 'success', 
          text: successMessage
        });
      } else {
        console.log('[Profile] ORCID verification failed:', data.error);
        
        // Handle name mismatch error
        let errorMessage = data.error || 'ORCID verification failed';
        
        if (data.details) {
          console.log('[Profile] Name mismatch details:', data.details);
          errorMessage += `\n\nYour name: ${data.details.userName}\nORCID name: ${data.details.orcIdName}\nSimilarity: ${data.details.similarity}%`;
        }
        
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('[Profile] Error verifying ORCID:', error);
      setMessage({ type: 'error', text: 'Failed to verify ORCID' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Profile] Form submitted');
    console.log('[Profile] Form data:', formData);
    console.log('[Profile] User ID (userId):', userId);

    if (!userId) {
      console.log('[Profile] No user ID found');
      setMessage({ type: 'error', text: 'User not found' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        userId: userId,
        ...formData
      };

      console.log('[Profile] Sending payload:', payload);

      const response = await fetch(`${API_URL}/api/researchers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('[Profile] Submit URL:', `${API_URL}/api/researchers/profile`);
      console.log('[Profile] Submit response status:', response.status);
      const data = await response.json();
      console.log('[Profile] Submit response data:', data);

      if (response.ok && data.success) {
        console.log('[Profile] Profile saved successfully');
        setResearcherProfile(data.data);
        setMessage({ 
          type: 'success', 
          text: researcherProfile ? 'Profile updated successfully!' : 'Profile created successfully!' 
        });
      } else {
        console.log('[Profile] Failed to save profile:', data.message);
        
        // Handle name verification error
        let errorMessage = data.message || 'Failed to save profile';
        
        if (data.error) {
          errorMessage += '\n\n' + data.error;
        }
        
        if (data.details) {
          console.log('[Profile] Name mismatch details:', data.details);
          errorMessage += `\n\nYour name: ${data.details.userName}\nORCID name: ${data.details.orcIdName}\nSimilarity: ${data.details.similarity}%\n\nPlease verify your ORCID before creating profile.`;
        }
        
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('[Profile] Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-semibold text-foreground">Researcher Profile</h1>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="w-full space-y-6">
            {message.text && (
              <div className={`p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <pre className="whitespace-pre-wrap font-sans text-sm">{message.text}</pre>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {researcherProfile ? 'Update your research details below' : 'Fill in your research details to create your profile'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Show existing profile info as non-editable if profile exists */}
                  {researcherProfile && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-4">
                      <h3 className="font-semibold text-sm text-foreground mb-3">Current Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Institution</Label>
                          <p className="text-sm font-medium text-foreground">{researcherProfile.institution}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Designation</Label>
                          <p className="text-sm font-medium text-foreground">{researcherProfile.designation}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Field of Study</Label>
                          <p className="text-sm font-medium text-foreground">{researcherProfile.fieldOfStudy}</p>
                        </div>
                        {researcherProfile.orcId && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">ORCID</Label>
                            <p className="text-sm font-medium font-mono text-foreground">{researcherProfile.orcId}</p>
                          </div>
                        )}
                      </div>
                      {researcherProfile.bio && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Bio</Label>
                          <p className="text-sm text-foreground">{researcherProfile.bio}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Created</Label>
                          <p className="text-sm text-foreground">
                            {new Date(researcherProfile.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Last Updated</Label>
                          <p className="text-sm text-foreground">
                            {new Date(researcherProfile.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Institution */}
                    <div className="space-y-2">
                      <Label htmlFor="institution">
                        Institution <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="institution"
                        name="institution"
                        placeholder="e.g., MIT, Stanford University"
                        value={formData.institution}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                      <Label htmlFor="designation">
                        Designation <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="designation"
                        name="designation"
                        placeholder="e.g., PhD Student, Professor"
                        value={formData.designation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Field of Study */}
                  <div className="space-y-2">
                    <Label htmlFor="fieldOfStudy">
                      Field of Study <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      placeholder="e.g., Cognitive Psychology, Neuroscience"
                      value={formData.fieldOfStudy}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Tell us about your research interests..."
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>

                  {/* ORCID */}
                  <div className="space-y-2">
                    <Label htmlFor="orcId">ORCID (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="orcId"
                        name="orcId"
                        placeholder="0000-0000-0000-0000"
                        value={formData.orcId}
                        onChange={handleChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={verifyOrcId}
                        disabled={verifying || !formData.orcId}
                      >
                        {verifying ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Format: 0000-0000-0000-0000
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : researcherProfile ? 'Update Profile' : 'Create Profile'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Profile;
