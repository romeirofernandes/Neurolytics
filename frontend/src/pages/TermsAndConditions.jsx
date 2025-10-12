import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';

const TermsAndConditions = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button and Theme Toggle */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Terms & Conditions</h1>
            <p className="text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Introduction</h2>
            <p className="text-foreground leading-relaxed">
              Welcome to Neurolytics. These Terms and Conditions ("Terms") govern your access to and use of our 
              platform, services, and related features. By accessing or using Neurolytics, you agree to be bound 
              by these Terms. If you do not agree with these Terms, please do not use our platform.
            </p>
          </section>

          {/* Platform Purpose */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Platform Purpose</h2>
            <p className="text-foreground leading-relaxed">
              Neurolytics is a web-based platform designed exclusively for creating, hosting, and managing 
              behavioral and cognitive science experiments for legitimate research purposes. The platform is 
              intended for use by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>Researchers:</strong> Academic researchers, scientists, and institutions conducting ethical behavioral and cognitive studies</li>
              <li><strong>Participants:</strong> Individuals voluntarily participating in approved research experiments</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              Any use of the platform for purposes other than legitimate scientific research is strictly prohibited.
            </p>
          </section>

          {/* User Accounts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. User Accounts & Registration</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>To access certain features of the platform, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security and confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
                <li>Accept responsibility for all activities conducted under your account</li>
              </ul>
              <p className="mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in 
                prohibited activities.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. User Responsibilities</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Researchers are responsible for:</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground">
                  <li><strong>Ethical Approval:</strong> Obtaining necessary ethical approval from an Institutional Review Board (IRB), ethics committee, or equivalent authority before collecting participant data</li>
                  <li><strong>Informed Consent:</strong> Ensuring participants are fully informed about the nature of the experiment and obtaining explicit consent before data collection</li>
                  <li><strong>Data Anonymization:</strong> Using anonymized or pseudonymized data collection methods whenever possible</li>
                  <li><strong>Data Protection:</strong> Complying with all applicable data protection laws and regulations (e.g., GDPR, CCPA)</li>
                  <li><strong>Participant Rights:</strong> Respecting participants' rights to withdraw from experiments at any time without penalty</li>
                  <li><strong>Accurate Representation:</strong> Providing truthful and transparent information about the experiment purpose and procedures</li>
                  <li><strong>Data Management:</strong> Securely managing, storing, and eventually deleting collected data in accordance with ethical guidelines</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Participants must:</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground">
                  <li>Provide responses voluntarily and honestly</li>
                  <li>Not share, reproduce, or misuse experiment materials or content</li>
                  <li>Respect the integrity of the research process</li>
                  <li>Not attempt to manipulate, hack, or interfere with experiment functionality</li>
                  <li>Withdraw from participation if they feel uncomfortable or do not wish to continue</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Prohibited Uses</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>You agree not to use the platform for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Deceptive Practices:</strong> Conducting experiments involving deception without proper debriefing procedures and ethical approval</li>
                <li><strong>Sensitive Data Collection:</strong> Collecting sensitive personal data (health information, biometric data, racial or ethnic origin, religious beliefs, etc.) without explicit consent and ethical approval</li>
                <li><strong>Harmful Content:</strong> Creating or distributing experiments containing:
                  <ul className="list-circle pl-6 mt-2 space-y-1">
                    <li>Harmful, threatening, abusive, or harassing content</li>
                    <li>Illegal, defamatory, or fraudulent content</li>
                    <li>Content that violates intellectual property rights</li>
                    <li>Malicious code, viruses, or malware</li>
                  </ul>
                </li>
                <li><strong>Unauthorized Access:</strong> Attempting to gain unauthorized access to platform systems, other user accounts, or data</li>
                <li><strong>Interference:</strong> Disrupting, degrading, or interfering with platform functionality or other users' access</li>
                <li><strong>Commercial Exploitation:</strong> Using the platform for commercial purposes without explicit authorization</li>
                <li><strong>Data Mining:</strong> Scraping, crawling, or automated data collection without permission</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Intellectual Property Rights</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <h3 className="text-lg font-semibold">Platform Ownership:</h3>
              <p>
                Neurolytics owns all rights, title, and interest in the platform, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Software code, algorithms, and architecture</li>
                <li>User interface designs and components</li>
                <li>Infrastructure and technology</li>
                <li>Trademarks, logos, and branding</li>
                <li>Documentation and educational materials</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">Researcher Ownership:</h3>
              <p>Researchers retain ownership of:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Experiment content and designs they create</li>
                <li>Data collected through their experiments</li>
                <li>Research findings and publications derived from platform use</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">Restrictions:</h3>
              <p>Users may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reverse-engineer, decompile, or disassemble the platform</li>
                <li>Copy, modify, or create derivative works of the platform</li>
                <li>Resell, sublicense, or distribute the platform or its components</li>
                <li>Remove or alter any proprietary notices or labels</li>
              </ul>
            </div>
          </section>

          {/* Platform Access */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Platform Access</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>
                Neurolytics is currently provided as a free platform for legitimate research purposes. 
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify platform features and functionality at any time</li>
                <li>Implement usage limits or restrictions to ensure fair access for all users</li>
                <li>Introduce paid features or subscription models in the future with advance notice</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">Account Termination:</h3>
              <p>
                If your account is terminated for any reason:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your data will be retained for 30 days to allow for export</li>
                <li>After 30 days, your data may be permanently deleted</li>
                <li>You will receive email notifications before permanent deletion</li>
              </ul>
            </div>
          </section>

          {/* Liability Disclaimer */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Disclaimer of Warranties</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>
                THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                <li>Guarantees of uninterrupted, error-free, or secure operation</li>
                <li>Accuracy, reliability, or completeness of data or results</li>
                <li>Compatibility with all devices, browsers, or networks</li>
              </ul>
              <p className="mt-4">
                We do not guarantee that the platform will meet your specific research requirements or that 
                results obtained through the platform will be accurate or reliable.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEUROLYTICS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Research outcomes, data quality, or scientific validity of experiments</li>
                <li>Data loss, corruption, or unauthorized access despite our security measures</li>
                <li>Ethics violations, legal violations, or misconduct by researchers or participants</li>
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Service interruptions, technical failures, or platform downtime</li>
              </ul>
              <p className="mt-4">
                AS THE PLATFORM IS CURRENTLY PROVIDED FREE OF CHARGE, OUR LIABILITY IS LIMITED TO THE MAXIMUM 
                EXTENT PERMITTED BY LAW.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Indemnification</h2>
            <p className="text-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Neurolytics, its officers, directors, employees, 
              and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
              arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Your violation of these Terms</li>
              <li>Your use or misuse of the platform</li>
              <li>Your experiments, research practices, or data collection methods</li>
              <li>Your violation of any laws, regulations, or ethical guidelines</li>
              <li>Infringement of third-party intellectual property or privacy rights</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Termination of Access</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>We reserve the right to suspend or terminate your access to the platform if:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You violate these Terms or our policies</li>
                <li>You engage in unethical, illegal, or fraudulent conduct</li>
                <li>You attempt to harm the platform or other users</li>
                <li>We are required to do so by law or regulatory authority</li>
              </ul>
              <p className="mt-4">
                Upon termination, you must immediately cease using the platform. You may export your data 
                before termination, but we are not obligated to retain your data after account closure.
              </p>
            </div>
          </section>

          {/* Data Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Data Privacy</h2>
            <p className="text-foreground leading-relaxed">
              Your use of the platform is also governed by our{' '}
              <Link to="/privacy-policy" className="text-primary hover:underline font-semibold">
                Privacy Policy
              </Link>
              , which explains how we collect, use, and protect your data. By using the platform, you consent 
              to our data practices as described in the Privacy Policy.
            </p>
          </section>

          {/* Modifications */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Modifications to Terms</h2>
            <p className="text-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Posting the updated Terms on the platform with a new "Last Updated" date</li>
              <li>Sending an email notification to your registered email address</li>
              <li>Displaying a prominent notice on the platform</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              Your continued use of the platform after such modifications constitutes acceptance of the updated 
              Terms. If you do not agree with the changes, you must stop using the platform.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">13. Governing Law & Dispute Resolution</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to conflict of law principles.
              </p>
              
              <h3 className="text-lg font-semibold mt-4">Dispute Resolution:</h3>
              <p>
                Any disputes arising from these Terms or your use of the platform shall be resolved through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informal Negotiation:</strong> We encourage you to contact us first to attempt to resolve disputes informally</li>
                <li><strong>Arbitration:</strong> If informal resolution fails, disputes shall be resolved through binding arbitration in accordance with [Arbitration Rules]</li>
                <li><strong>Jurisdiction:</strong> If arbitration is not applicable, disputes shall be resolved in the courts of [Your Jurisdiction]</li>
              </ul>
            </div>
          </section>

          {/* Severability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">14. Severability</h2>
            <p className="text-foreground leading-relaxed">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining 
              provisions shall continue in full force and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">15. Entire Agreement</h2>
            <p className="text-foreground leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and 
              Neurolytics regarding your use of the platform and supersede all prior agreements and understandings.
            </p>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">16. Contact Information</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>
                If you have any questions or concerns about these Terms, please contact us:
              </p>
              <div className="bg-muted p-6 rounded-lg space-y-2">
                <p><strong>Neurolytics Support</strong></p>
                <p>Email: <a href="mailto:support@neurolytics.com" className="text-primary hover:underline">support@neurolytics.com</a></p>
                <p>Email: <a href="mailto:legal@neurolytics.com" className="text-primary hover:underline">legal@neurolytics.com</a></p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            By using Neurolytics, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
