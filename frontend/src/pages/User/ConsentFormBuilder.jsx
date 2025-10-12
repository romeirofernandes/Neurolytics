import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import templatesData from '../../../templates.json';
import { 
  Save, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Shield,
  Users,
  Clock,
  Mail,
  FlaskConical
} from 'lucide-react';

const ConsentFormBuilder = () => {
  const { experimentId: urlExperimentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [existingFormId, setExistingFormId] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [loadingExperiments, setLoadingExperiments] = useState(true);

  const [formData, setFormData] = useState({
    experimentId: urlExperimentId || '',
    researcherId: user?.mongoId || '',
    title: '',
    studyPurpose: 'This study aims to investigate cognitive processes related to experimental psychology. The research will contribute to our understanding of human cognition and behavior.',
    procedures: 'You will be asked to complete a series of tasks on your computer/device. The experiment will take approximately 15 minutes. During the tasks, you will respond to various stimuli or questions. Your responses and reaction times will be recorded automatically. You may take breaks at any time.',
    estimatedDuration: 15,
    risks: 'There are no known risks beyond those of everyday computer use. You may experience mild eye strain or fatigue from screen time. You are free to take breaks at any time.',
    benefits: 'There may be no direct benefit to you. However, your participation will contribute to scientific knowledge in cognitive science. You may gain insight into cognitive research methods.',
    compensation: {
      provided: false,
      description: 'No compensation is provided for this study.',
    },
    dataHandling: {
      storage: 'All data will be stored on secure, encrypted servers. Access is restricted to authorized research personnel only. Data is encrypted both in transit and at rest using industry-standard protocols.',
      anonymity: true,
      anonymityDescription: 'Your data will be completely anonymized. No personally identifiable information will be collected or stored. You will be assigned a random participant ID that cannot be traced back to you.',
      retentionPeriod: '5 years after study completion, as required by research ethics guidelines, after which all data will be securely deleted.',
      dataAccess: 'Only the principal investigator and authorized research team members will have access to the data. Data may be reviewed by the institutional ethics committee or regulatory authorities if required.',
      securityMeasures: 'We implement industry-standard security measures including: encryption (AES-256), secure data transmission (TLS/SSL), access controls, regular security audits, and secure backup procedures.',
    },
    withdrawalRights: {
      canWithdrawAnytime: true,
      withdrawalProcedure: 'You may withdraw from this study at any time without penalty by simply closing your browser window. To request deletion of your data after completion, please contact the researcher using the information provided below.',
      withdrawalConsequences: 'There are no negative consequences for withdrawing from this study. You will not lose any benefits to which you are otherwise entitled.',
      dataDeletionPolicy: 'If you withdraw before completing the study, your partial data will be immediately deleted. If you request deletion after completion, your data will be removed within 30 days, provided it has not been anonymized and aggregated with other data.',
    },
    contactInfo: {
      researcherName: user?.name || '',
      researcherEmail: user?.email || '',
      researcherPhone: '',
      institution: 'Your Institution Name',
      department: 'Psychology Department',
      ethicsCommitteeName: 'Institutional Review Board',
      ethicsCommitteeEmail: '',
      ethicsCommitteePhone: '',
    },
    eligibility: {
      minAge: 18,
      otherCriteria: 'Participants must be fluent in English and have normal or corrected-to-normal vision.',
    },
    irbApproval: {
      approved: false,
      approvalNumber: '',
      institution: '',
    },
  });

  useEffect(() => {
    if (user?.mongoId) {
      setFormData(prev => ({
        ...prev,
        researcherId: user.mongoId,
        contactInfo: {
          ...prev.contactInfo,
          researcherName: user.name || '',
          researcherEmail: user.email || '',
        }
      }));
      fetchExperiments();
    }
  }, [user]);

  useEffect(() => {
    if (urlExperimentId) {
      setFormData(prev => ({
        ...prev,
        experimentId: urlExperimentId
      }));
      loadConsentForm(urlExperimentId);
    }
  }, [urlExperimentId]);

  const fetchExperiments = async () => {
    try {
      setLoadingExperiments(true);
      
      // Filter templates.json by researcher ID
      const userTemplates = templatesData.filter(template => 
        template.researcher && template.researcher.id === user.mongoId
      );
      
      // Transform templates to match experiment format
      const formattedExperiments = userTemplates.map(template => ({
        _id: template.id, // Use template ID as experiment ID
        title: template.name,
        description: template.shortDescription,
        templateType: template.category,
        researcher: template.researcher,
        experimentId: template.experimentId // Keep reference to original experiment ID if exists
      }));
      
      setExperiments(formattedExperiments);
      
      console.log(`✅ Loaded ${formattedExperiments.length} experiments for researcher ${user.mongoId}`);
    } catch (error) {
      console.error('Error fetching experiments:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load experiments'
      });
    } finally {
      setLoadingExperiments(false);
    }
  };

  const loadConsentForm = async (expId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/consent-forms/experiment/${expId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.consentForm) {
          setFormData(data.consentForm);
          setExistingFormId(data.consentForm._id);
        }
      } else if (response.status === 404) {
        console.log('No existing consent form found, creating new one');
      }
    } catch (error) {
      console.error('Error loading consent form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExperimentChange = (e) => {
    const selectedExpId = e.target.value;
    setFormData(prev => ({
      ...prev,
      experimentId: selectedExpId
    }));
    
    // Load existing consent form for this experiment if it exists
    if (selectedExpId) {
      loadConsentForm(selectedExpId);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split('.');
    
    if (keys.length === 1) {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: type === 'checkbox' ? checked : value,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.experimentId || formData.experimentId === '') {
      setMessage({ 
        type: 'error', 
        text: 'Please select an experiment for this consent form' 
      });
      return;
    }

    if (!formData.title || formData.title.trim() === '') {
      setMessage({ 
        type: 'error', 
        text: 'Please provide a study title' 
      });
      return;
    }

    if (!formData.studyPurpose || formData.studyPurpose.trim().length < 50) {
      setMessage({ 
        type: 'error', 
        text: 'Study purpose must be at least 50 characters long' 
      });
      return;
    }

    if (!formData.procedures || formData.procedures.trim().length < 100) {
      setMessage({ 
        type: 'error', 
        text: 'Procedures description must be at least 100 characters long' 
      });
      return;
    }

    if (!formData.contactInfo.institution || formData.contactInfo.institution.trim() === '' || formData.contactInfo.institution === 'Your Institution Name') {
      setMessage({ 
        type: 'error', 
        text: 'Please provide your institution name' 
      });
      return;
    }

    if (!formData.contactInfo.researcherEmail || !formData.contactInfo.researcherEmail.match(/^\S+@\S+\.\S+$/)) {
      setMessage({ 
        type: 'error', 
        text: 'Please provide a valid researcher email address' 
      });
      return;
    }

    if (!formData.researcherId) {
      setMessage({ 
        type: 'error', 
        text: 'Researcher ID is missing. Please log in again.' 
      });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const url = existingFormId 
        ? `${import.meta.env.VITE_API_URL}/api/consent-forms/${existingFormId}`
        : `${import.meta.env.VITE_API_URL}/api/consent-forms`;
      
      const method = existingFormId ? 'PUT' : 'POST';

      console.log('Submitting consent form:', {
        url,
        method,
        experimentId: formData.experimentId,
        researcherId: formData.researcherId,
        title: formData.title
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: existingFormId ? 'Consent form updated successfully!' : 'Consent form created successfully!' 
        });
        
        if (!existingFormId && data.consentForm?._id) {
          setExistingFormId(data.consentForm._id);
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Failed to save consent form. Please check all required fields.' 
        });
      }
    } catch (error) {
      console.error('Error saving consent form:', error);
      setMessage({ 
        type: 'error', 
        text: 'An error occurred while saving the consent form. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingExperiments) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {loadingExperiments ? 'Loading experiments...' : 'Loading consent form...'}
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-23 shrink-0 items-center justify-between gap-2 border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Consent Form Builder</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.title || !formData.experimentId}
              className="gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {existingFormId ? 'Update' : 'Save'} Consent Form
                </>
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="w-full mx-auto">
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 ">
              {/* Experiment Selection Card */}
              {!urlExperimentId && (
                <Card className="border-2 border-primary/20 bg-primary/5 mx-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" />
                      Select Experiment
                    </CardTitle>
                    <CardDescription>
                      Choose the experiment this consent form is for
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="experiment-select">
                        Experiment <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="experiment-select"
                        value={formData.experimentId}
                        onChange={handleExperimentChange}
                        className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                        required
                      >
                        <option value="">-- Select an Experiment --</option>
                        {experiments.map((exp) => (
                          <option key={exp._id} value={exp._id}>
                            {exp.title} {exp.status === 'draft' ? '(Draft)' : ''}
                          </option>
                        ))}
                      </select>
                      {experiments.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          No experiments found. Please create an experiment first.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Form Builder */}
              <div className="space-y-8 w-full">
                <div className="flex justify-center">
                  <Tabs defaultValue="basic" className="w-full px-2 py-4">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="basic">
                        <FileText className="w-4 h-4 mr-1" />
                        Basic
                      </TabsTrigger>
                      <TabsTrigger value="study">
                        <Users className="w-4 h-4 mr-1" />
                        Study
                      </TabsTrigger>
                      <TabsTrigger value="data">
                        <Shield className="w-4 h-4 mr-1" />
                        Data
                      </TabsTrigger>
                      <TabsTrigger value="contact">
                        <Mail className="w-4 h-4 mr-1" />
                        Contact
                      </TabsTrigger>
                      <TabsTrigger value="ethics">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Ethics
                      </TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Basic Information</CardTitle>
                          <CardDescription>
                            Essential details about your study
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">
                              Study Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="title"
                              name="title"
                              placeholder="e.g., Effects of Sleep on Memory Consolidation"
                              value={formData.title}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="estimatedDuration">
                              Estimated Duration (minutes) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="estimatedDuration"
                              name="estimatedDuration"
                              type="number"
                              min="1"
                              placeholder="15"
                              value={formData.estimatedDuration}
                              onChange={handleChange}
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              How long will participants spend on this study?
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="eligibility.minAge">
                              Minimum Age Requirement
                            </Label>
                            <Input
                              id="eligibility.minAge"
                              name="eligibility.minAge"
                              type="number"
                              min="0"
                              max="120"
                              value={formData.eligibility.minAge}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="eligibility.otherCriteria">
                              Other Eligibility Criteria
                            </Label>
                            <Textarea
                              id="eligibility.otherCriteria"
                              name="eligibility.otherCriteria"
                              rows={3}
                              placeholder="e.g., Must be fluent in English..."
                              value={formData.eligibility.otherCriteria}
                              onChange={handleChange}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Study Details Tab */}
                    <TabsContent value="study" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Study Details</CardTitle>
                          <CardDescription>
                            Purpose, procedures, risks, and benefits
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="studyPurpose">
                              Study Purpose <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="studyPurpose"
                              name="studyPurpose"
                              rows={4}
                              placeholder="Describe the purpose of your research..."
                              value={formData.studyPurpose}
                              onChange={handleChange}
                              required
                              className={formData.studyPurpose.trim().length < 50 ? 'border-amber-300' : 'border-green-300'}
                            />
                            <p className={`text-xs ${formData.studyPurpose.trim().length < 50 ? 'text-amber-600' : 'text-green-600'}`}>
                              {formData.studyPurpose.trim().length}/50 characters minimum (GDPR requirement)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="procedures">
                              Procedures <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="procedures"
                              name="procedures"
                              rows={5}
                              placeholder="Describe what participants will do..."
                              value={formData.procedures}
                              onChange={handleChange}
                              required
                              className={formData.procedures.trim().length < 100 ? 'border-amber-300' : 'border-green-300'}
                            />
                            <p className={`text-xs ${formData.procedures.trim().length < 100 ? 'text-amber-600' : 'text-green-600'}`}>
                              {formData.procedures.trim().length}/100 characters minimum
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="risks">
                              Potential Risks <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="risks"
                              name="risks"
                              rows={3}
                              value={formData.risks}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="benefits">
                              Potential Benefits <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="benefits"
                              name="benefits"
                              rows={3}
                              value={formData.benefits}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="compensation.provided"
                                name="compensation.provided"
                                checked={formData.compensation.provided}
                                onChange={handleChange}
                                className="rounded"
                              />
                              <Label htmlFor="compensation.provided" className="cursor-pointer">
                                Compensation is provided for this study
                              </Label>
                            </div>
                            
                            {formData.compensation.provided && (
                              <div className="space-y-2 mt-3">
                                <Label htmlFor="compensation.description">
                                  Compensation Details
                                </Label>
                                <Textarea
                                  id="compensation.description"
                                  name="compensation.description"
                                  rows={2}
                                  placeholder="Describe the compensation..."
                                  value={formData.compensation.description}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Data Handling Tab */}
                    <TabsContent value="data" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Data Handling & Privacy</CardTitle>
                          <CardDescription>
                            GDPR-compliant data protection information
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-800 dark:text-blue-200">
                              This section ensures GDPR compliance (Articles 5, 13, 32)
                            </span>
                          </div>

                          <div className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="dataHandling.anonymity"
                                name="dataHandling.anonymity"
                                checked={formData.dataHandling.anonymity}
                                onChange={handleChange}
                                className="rounded"
                              />
                              <Label htmlFor="dataHandling.anonymity" className="cursor-pointer font-semibold">
                                Data will be anonymized
                              </Label>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="dataHandling.anonymityDescription">
                                Anonymity Description
                              </Label>
                              <Textarea
                                id="dataHandling.anonymityDescription"
                                name="dataHandling.anonymityDescription"
                                rows={3}
                                value={formData.dataHandling.anonymityDescription}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dataHandling.storage">
                              Data Storage Method <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="dataHandling.storage"
                              name="dataHandling.storage"
                              rows={3}
                              value={formData.dataHandling.storage}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dataHandling.retentionPeriod">
                              Data Retention Period <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="dataHandling.retentionPeriod"
                              name="dataHandling.retentionPeriod"
                              placeholder="e.g., 5 years after study completion"
                              value={formData.dataHandling.retentionPeriod}
                              onChange={handleChange}
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              GDPR Article 5(1)(e) - Storage limitation
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dataHandling.dataAccess">
                              Who Can Access the Data
                            </Label>
                            <Textarea
                              id="dataHandling.dataAccess"
                              name="dataHandling.dataAccess"
                              rows={2}
                              value={formData.dataHandling.dataAccess}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dataHandling.securityMeasures">
                              Security Measures
                            </Label>
                            <Textarea
                              id="dataHandling.securityMeasures"
                              name="dataHandling.securityMeasures"
                              rows={3}
                              value={formData.dataHandling.securityMeasures}
                              onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground">
                              GDPR Article 32 - Security of processing
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="withdrawalRights.withdrawalProcedure">
                              Withdrawal Procedure <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="withdrawalRights.withdrawalProcedure"
                              name="withdrawalRights.withdrawalProcedure"
                              rows={3}
                              value={formData.withdrawalRights.withdrawalProcedure}
                              onChange={handleChange}
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              GDPR Article 7(3) - Right to withdraw consent
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="withdrawalRights.dataDeletionPolicy">
                              Data Deletion Policy
                            </Label>
                            <Textarea
                              id="withdrawalRights.dataDeletionPolicy"
                              name="withdrawalRights.dataDeletionPolicy"
                              rows={3}
                              value={formData.withdrawalRights.dataDeletionPolicy}
                              onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground">
                              GDPR Article 17 - Right to erasure
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Contact Information Tab */}
                    <TabsContent value="contact" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                          <CardDescription>
                            Researcher and ethics committee contacts
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3 p-4 border rounded-lg">
                            <h4 className="font-semibold text-sm">Researcher Information</h4>
                            
                            <div className="space-y-2">
                              <Label htmlFor="contactInfo.researcherName">
                                Researcher Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="contactInfo.researcherName"
                                name="contactInfo.researcherName"
                                value={formData.contactInfo.researcherName}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="contactInfo.researcherEmail">
                                Researcher Email <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="contactInfo.researcherEmail"
                                name="contactInfo.researcherEmail"
                                type="email"
                                value={formData.contactInfo.researcherEmail}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="contactInfo.researcherPhone">
                                Researcher Phone (Optional)
                              </Label>
                              <Input
                                id="contactInfo.researcherPhone"
                                name="contactInfo.researcherPhone"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={formData.contactInfo.researcherPhone}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-3 p-4 border rounded-lg">
                            <h4 className="font-semibold text-sm">Institution Information</h4>
                            
                            <div className="space-y-2">
                              <Label htmlFor="contactInfo.institution">
                                Institution <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="contactInfo.institution"
                                name="contactInfo.institution"
                                placeholder="e.g., Massachusetts Institute of Technology"
                                value={formData.contactInfo.institution}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="contactInfo.department">
                                Department
                              </Label>
                              <Input
                                id="contactInfo.department"
                                name="contactInfo.department"
                                placeholder="e.g., Psychology Department"
                                value={formData.contactInfo.department}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-3 p-4 border rounded-lg">
                            <h4 className="font-semibold text-sm">Ethics Committee / IRB</h4>
                            
                            <div className="space-y-2">
                              <Label htmlFor="contactInfo.ethicsCommitteeName">
                                Committee Name
                              </Label>
                              <Input
                                id="contactInfo.ethicsCommitteeName"
                                name="contactInfo.ethicsCommitteeName"
                                placeholder="e.g., Institutional Review Board"
                                value={formData.contactInfo.ethicsCommitteeName}
                                onChange={handleChange}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="contactInfo.ethicsCommitteeEmail">
                                Committee Email
                              </Label>
                              <Input
                                id="contactInfo.ethicsCommitteeEmail"
                                name="contactInfo.ethicsCommitteeEmail"
                                type="email"
                                placeholder="irb@institution.edu"
                                value={formData.contactInfo.ethicsCommitteeEmail}
                                onChange={handleChange}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="contactInfo.ethicsCommitteePhone">
                                Committee Phone
                              </Label>
                              <Input
                                id="contactInfo.ethicsCommitteePhone"
                                name="contactInfo.ethicsCommitteePhone"
                                type="tel"
                                value={formData.contactInfo.ethicsCommitteePhone}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Ethics Approval Tab */}
                    <TabsContent value="ethics" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>IRB / Ethics Approval</CardTitle>
                          <CardDescription>
                            Institutional review board approval details
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm text-amber-800 dark:text-amber-200">
                              Ensure you have proper IRB approval before publishing your study
                            </span>
                          </div>

                          <div className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="irbApproval.approved"
                                name="irbApproval.approved"
                                checked={formData.irbApproval.approved}
                                onChange={handleChange}
                                className="rounded"
                              />
                              <Label htmlFor="irbApproval.approved" className="cursor-pointer font-semibold">
                                This study has IRB/Ethics approval
                              </Label>
                            </div>

                            {formData.irbApproval.approved && (
                              <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="irbApproval.approvalNumber">
                                    IRB Approval Number
                                  </Label>
                                  <Input
                                    id="irbApproval.approvalNumber"
                                    name="irbApproval.approvalNumber"
                                    placeholder="e.g., IRB-2024-001"
                                    value={formData.irbApproval.approvalNumber}
                                    onChange={handleChange}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="irbApproval.institution">
                                    Approving Institution
                                  </Label>
                                  <Input
                                    id="irbApproval.institution"
                                    name="irbApproval.institution"
                                    placeholder="e.g., MIT IRB"
                                    value={formData.irbApproval.institution}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Live Preview */}
              {showPreview && (
                <div className="lg:sticky lg:top-6 h-fit mx-2">
                  <Card className="border-2">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Live Preview
                      </CardTitle>
                      <CardDescription>
                        This is how participants will see your consent form
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                      <ConsentFormPreview formData={formData} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

// Preview Component
const ConsentFormPreview = ({ formData }) => {
  return (
    <div className="space-y-6 text-sm">
      {/* Title */}
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {formData.title || 'Study Title'}
        </h2>
        <p className="text-muted-foreground">
          Informed Consent Form
        </p>
      </div>

      {/* Study Purpose */}
      <section>
        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Purpose of the Study
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {formData.studyPurpose || 'Study purpose will appear here...'}
        </p>
      </section>

      {/* Procedures */}
      <section>
        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Procedures
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {formData.procedures || 'Study procedures will appear here...'}
        </p>
      </section>

      {/* Time Commitment */}
      <section>
        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Time Commitment
        </h3>
        <p className="text-muted-foreground">
          This study will take approximately <strong>{formData.estimatedDuration}</strong> minutes to complete.
        </p>
      </section>

      {/* Risks */}
      <section className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg">
        <h3 className="font-semibold text-base mb-2">
          Potential Risks
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {formData.risks}
        </p>
      </section>

      {/* Benefits */}
      <section className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
        <h3 className="font-semibold text-base mb-2">
          Potential Benefits
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {formData.benefits}
        </p>
      </section>

      {/* Compensation */}
      {formData.compensation.provided && (
        <section className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
          <h3 className="font-semibold text-base mb-2">
            Compensation
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {formData.compensation.description}
          </p>
        </section>
      )}

      {/* Data Protection */}
      <section className="border-t pt-4">
        <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Data Protection & Privacy
        </h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Anonymity</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {formData.dataHandling.anonymityDescription}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">Data Storage</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {formData.dataHandling.storage}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">Data Retention</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {formData.dataHandling.retentionPeriod}
            </p>
          </div>
        </div>
      </section>

      {/* Withdrawal Rights */}
      <section className="border-t pt-4">
        <h3 className="font-semibold text-base mb-2">
          Your Right to Withdraw
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed mb-2">
          {formData.withdrawalRights.withdrawalProcedure}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {formData.withdrawalRights.dataDeletionPolicy}
        </p>
      </section>

      {/* Contact Information */}
      <section className="border-t pt-4">
        <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Contact Information
        </h3>
        <div className="space-y-2 text-xs">
          <div>
            <p className="font-medium">Researcher</p>
            <p className="text-muted-foreground">{formData.contactInfo.researcherName}</p>
            <p className="text-muted-foreground">{formData.contactInfo.researcherEmail}</p>
          </div>
          <div>
            <p className="font-medium">Institution</p>
            <p className="text-muted-foreground">{formData.contactInfo.institution}</p>
            <p className="text-muted-foreground">{formData.contactInfo.department}</p>
          </div>
          {formData.contactInfo.ethicsCommitteeEmail && (
            <div>
              <p className="font-medium">Ethics Committee</p>
              <p className="text-muted-foreground">{formData.contactInfo.ethicsCommitteeName}</p>
              <p className="text-muted-foreground">{formData.contactInfo.ethicsCommitteeEmail}</p>
            </div>
          )}
        </div>
      </section>

      {/* Consent Statement */}
      <section className="border-t pt-4">
        <div className="bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
          <h3 className="font-semibold text-base mb-3">
            Statement of Consent
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>By clicking "I Consent" below, I confirm that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>I have read and understood the information about this study</li>
              <li>I understand that my participation is completely voluntary</li>
              <li>I understand that I can withdraw at any time without penalty</li>
              <li>I understand how my data will be collected, used, and protected</li>
              <li>I am at least {formData.eligibility.minAge} years old</li>
              <li>I voluntarily agree to participate in this research study</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsentFormBuilder;