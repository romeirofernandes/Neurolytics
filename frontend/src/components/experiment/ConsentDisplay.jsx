import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { 
  FileText, 
  Users, 
  Clock, 
  Shield, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  X 
} from 'lucide-react';

const ConsentDisplay = ({ consentForm, onConsent, onDecline }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConsent = async () => {
    if (!agreedToTerms) {
      alert('Please check the consent box to continue');
      return;
    }

    setSubmitting(true);
    try {
      await onConsent();
    } catch (error) {
      console.error('Error recording consent:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold mb-2">
                  {consentForm.title}
                </CardTitle>
                <p className="text-lg text-muted-foreground">
                  Informed Consent Form
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{consentForm.estimatedDuration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Ages {consentForm.eligibility.minAge}+</span>
                  </div>
                  {consentForm.irbApproval?.approved && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 dark:text-green-400">
                        IRB Approved
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Important Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Please Read Carefully</p>
                  <p>
                    This consent form explains the research study and your rights as a participant. 
                    Please take your time to read through all sections before deciding whether to participate.
                  </p>
                </div>
              </div>
            </div>

            {/* Study Purpose */}
            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Purpose of the Study
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {consentForm.studyPurpose}
              </p>
            </section>

            {/* Procedures */}
            <section className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                What You Will Do
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {consentForm.procedures}
              </p>
            </section>

            {/* Time Commitment */}
            <section className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Time Commitment
              </h3>
              <p className="text-muted-foreground">
                This study will take approximately{' '}
                <strong className="text-foreground">{consentForm.estimatedDuration} minutes</strong>{' '}
                to complete.
              </p>
            </section>

            {/* Risks & Benefits */}
            <div className="grid md:grid-cols-2 gap-4 border-t pt-6">
              <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-100">
                  Potential Risks
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  {consentForm.risks}
                </p>
              </section>

              <section className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-green-900 dark:text-green-100">
                  Potential Benefits
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                  {consentForm.benefits}
                </p>
              </section>
            </div>

            {/* Compensation */}
            {consentForm.compensation?.provided && (
              <section className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  💰 Compensation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {consentForm.compensation.description}
                </p>
              </section>
            )}

            {/* Data Protection */}
            <section className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Your Data & Privacy
              </h3>
              
              <div className="space-y-4">
                {consentForm.dataHandling.anonymity && (
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-sm">Your Data is Anonymous</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {consentForm.dataHandling.anonymityDescription}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm mb-2">Data Storage & Security</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {consentForm.dataHandling.storage}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Data Retention Period</h4>
                  <p className="text-sm text-muted-foreground">
                    {consentForm.dataHandling.retentionPeriod}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Who Can Access Your Data</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {consentForm.dataHandling.dataAccess}
                  </p>
                </div>
              </div>
            </section>

            {/* Withdrawal Rights */}
            <section className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-3">
                Your Right to Withdraw
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  {consentForm.withdrawalRights.withdrawalProcedure}
                </p>
                <p className="leading-relaxed">
                  {consentForm.withdrawalRights.dataDeletionPolicy}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="font-medium text-foreground mb-1">
                    No Penalties for Withdrawal
                  </p>
                  <p>{consentForm.withdrawalRights.withdrawalConsequences}</p>
                </div>
              </div>
            </section>

            {/* Your Rights (GDPR) */}
            <section className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-3">
                Your Rights as a Participant
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Under GDPR and research ethics guidelines, you have the right to:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Access:</strong> Request a copy of your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Rectification:</strong> Correct any inaccurate data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Erasure:</strong> Request deletion of your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Portability:</strong> Receive your data in a portable format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Withdraw Consent:</strong> Withdraw at any time without penalty</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Questions or Concerns?
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">Principal Investigator</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
                      {consentForm.contactInfo.researcherName}
                    </p>
                    <p>{consentForm.contactInfo.institution}</p>
                    <p>{consentForm.contactInfo.department}</p>
                    <p className="text-primary">
                      {consentForm.contactInfo.researcherEmail}
                    </p>
                    {consentForm.contactInfo.researcherPhone && (
                      <p>{consentForm.contactInfo.researcherPhone}</p>
                    )}
                  </div>
                </div>

                {consentForm.contactInfo.ethicsCommitteeEmail && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">Ethics Committee</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">
                        {consentForm.contactInfo.ethicsCommitteeName}
                      </p>
                      <p className="text-primary">
                        {consentForm.contactInfo.ethicsCommitteeEmail}
                      </p>
                      {consentForm.contactInfo.ethicsCommitteePhone && (
                        <p>{consentForm.contactInfo.ethicsCommitteePhone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {consentForm.questionsStatement || 
                  'If you have any questions about this research study or your rights as a participant, please contact the researcher using the information provided above. For questions about research ethics, you may contact the ethics committee.'}
              </p>
            </section>

            {/* IRB Approval */}
            {consentForm.irbApproval?.approved && (
              <section className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold">Ethics Approval</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  This study has been reviewed and approved by {consentForm.irbApproval.institution}.
                  {consentForm.irbApproval.approvalNumber && (
                    <> Approval Number: <strong>{consentForm.irbApproval.approvalNumber}</strong></>
                  )}
                </p>
              </section>
            )}
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-t-2 p-6 flex-col gap-4">
            {/* Consent Agreement */}
            <div className="w-full bg-white dark:bg-slate-800 border-2 border-primary/20 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3">Statement of Consent</h3>
              
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-3">
                  By checking the box below, I confirm that:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I have read and understood the information about this study</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I have had the opportunity to consider the information and ask questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I understand that my participation is completely voluntary</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I understand that I can withdraw at any time without penalty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I understand how my data will be collected, used, stored, and protected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I understand my rights under GDPR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I am at least {consentForm.eligibility.minAge} years old</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>I voluntarily agree to participate in this research study</span>
                  </li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm font-medium">
                  I have read the above information and consent to participate in this study
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-3">
              <Button
                variant="outline"
                onClick={onDecline}
                disabled={submitting}
                className="flex-1 h-12 gap-2 border-2"
              >
                <X className="w-4 h-4" />
                I Do Not Consent
              </Button>
              
              <Button
                onClick={handleConsent}
                disabled={!agreedToTerms || submitting}
                className="flex-1 h-12 gap-2 text-base font-semibold"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    I Consent - Begin Study
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ConsentDisplay;