import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
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
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Introduction</h2>
            <p className="text-foreground leading-relaxed">
              At Neurolytics, we are committed to protecting your privacy and ensuring the security of your data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
              use our platform for behavioral and cognitive science research.
            </p>
          </section>

          {/* Purpose */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Purpose of Data Collection</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>
                Our platform collects and processes data exclusively for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Facilitating behavioral and cognitive science research experiments</li>
                <li>Improving platform performance, timing accuracy, and reliability</li>
                <li>Providing researchers with anonymized or pseudonymized experimental data</li>
                <li>Enhancing user experience and platform functionality</li>
              </ul>
              <p className="font-semibold mt-4">
                We emphasize that participant data is collected anonymously or pseudonymously. No personally 
                identifiable information (PII) is collected without explicit consent from participants.
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. What Data We Collect</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">From Researchers:</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground">
                  <li>Name and email address</li>
                  <li>Institutional affiliation</li>
                  <li>Research experiment configurations and settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">From Participants:</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground">
                  <li>Auto-generated random participant ID (for session tracking)</li>
                  <li>Device and browser metadata (e.g., screen resolution, user agent) - only when necessary for experiment control and data validation</li>
                  <li>Behavioral data including:
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>Reaction times and response accuracy</li>
                      <li>Task performance metrics</li>
                      <li>User interactions with experimental stimuli</li>
                      <li>Facial emotion detection data (when explicitly enabled by the researcher)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>No sensitive personal data</strong> (such as health information, race, ethnicity, 
                    gender, religious beliefs, or political opinions) is collected unless:
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>Explicitly stated in the experiment consent form</li>
                      <li>Approved by the researcher's Institutional Review Board (IRB) or ethics committee</li>
                      <li>Participants provide informed consent for such collection</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Data</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>We use the collected data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Execute and manage research experiments as configured by researchers</li>
                <li>Store and provide access to experimental results exclusively to the researcher who created the experiment</li>
                <li>Improve platform timing accuracy, performance, and reliability</li>
                <li>Provide technical support and troubleshooting assistance</li>
                <li>Communicate important updates about the platform or experiments</li>
              </ul>
              <p className="font-semibold mt-4">
                Your data is never sold to third parties or used for advertising purposes.
              </p>
            </div>
          </section>

          {/* Data Storage & Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Data Storage & Security</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption in Transit:</strong> All data transmitted between your device and our servers is encrypted using HTTPS/TLS protocols</li>
                <li><strong>Encryption at Rest:</strong> All data stored in our databases is encrypted using industry-standard encryption algorithms</li>
                <li><strong>Data Segregation:</strong> Participant identifiers are stored separately from experimental data to enhance privacy</li>
                <li><strong>Access Controls:</strong> Strict authentication and authorization protocols ensure only authorized researchers can access their own experiment data</li>
                <li><strong>Secure Backups:</strong> Regular encrypted backups are maintained and stored securely</li>
                <li><strong>Data Retention:</strong> Researchers can export or permanently delete their data at any time through their account dashboard</li>
              </ul>
            </div>
          </section>

          {/* Legal Compliance */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Legal Compliance</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>
                Neurolytics complies with applicable data protection regulations, including the General Data 
                Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and ethical guidelines 
                established by Institutional Review Boards (IRBs).
              </p>
              
              <h3 className="text-lg font-semibold mt-4">Your Rights:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of the data we hold about you</li>
                <li><strong>Right to Deletion:</strong> Request permanent deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw from participation in experiments at any time</li>
                <li><strong>Right to Object:</strong> Object to certain types of data processing</li>
              </ul>

              <p className="mt-4">
                To exercise any of these rights, please contact our Data Protection Officer using the contact 
                information provided below.
              </p>
            </div>
          </section>

          {/* Cookies & Analytics */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Cookies & Session Management</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>We use minimal cookies and session management technologies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication, session management, and platform functionality</li>
              </ul>
              <p className="mt-4">
                You can control cookie preferences through your browser settings. Note that disabling essential 
                cookies will prevent you from using the platform.
              </p>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Data Sharing & Third Parties</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>We do not sell or rent your personal information. We may share data only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With Researchers:</strong> Experimental data is accessible only to the researcher who created the experiment</li>
                <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers (e.g., cloud hosting, database management) who are contractually obligated to protect your data</li>
                <li><strong>Legal Compliance:</strong> We may disclose data if required by law, court order, or regulatory authority</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user data may be transferred (you will be notified of any such change)</li>
              </ul>
            </div>
          </section>

          {/* International Transfers */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. International Data Transfers</h2>
            <p className="text-foreground leading-relaxed">
              Your data may be processed and stored in servers located in different countries. We ensure that 
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy 
              and applicable data protection laws, including the use of Standard Contractual Clauses (SCCs) 
              where required.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Children's Privacy</h2>
            <p className="text-foreground leading-relaxed">
              Our platform is not intended for individuals under the age of 18 unless participating in research 
              that has received appropriate ethical approval and parental/guardian consent. We do not knowingly 
              collect personal information from children without proper authorization.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Changes to This Privacy Policy</h2>
            <p className="text-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
              requirements. We will notify you of any material changes by posting the updated policy on our 
              platform and updating the "Last Updated" date. Continued use of the platform after such changes 
              constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Contact Information</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
                practices, please contact us:
              </p>
              <div className="bg-muted p-6 rounded-lg space-y-2">
                <p><strong>Data Protection Officer</strong></p>
                <p>Email: <a href="mailto:privacy@neurolytics.com" className="text-primary hover:underline">privacy@neurolytics.com</a></p>
                <p>Email: <a href="mailto:support@neurolytics.com" className="text-primary hover:underline">support@neurolytics.com</a></p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                We are committed to resolving any privacy concerns in a timely and transparent manner.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            By using Neurolytics, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
