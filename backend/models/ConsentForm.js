const mongoose = require('mongoose');

/**
 * ConsentForm Schema
 * Fully compliant with IRB (Institutional Review Board) and GDPR regulations
 * Ensures ethical research practices and participant rights protection
 */
const consentFormSchema = new mongoose.Schema({
  // Unique experiment identifier this consent is for
  experimentId: {
    type: String,
    required: [true, 'Experiment ID is required'],
    index: true,
    trim: true,
  },

  // Researcher who created this consent form
  researcherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Researcher ID is required'],
    index: true,
  },

  // Study identification
  title: {
    type: String,
    required: [true, 'Study title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },

  // IRB/Ethics approval information
  irbApproval: {
    approved: {
      type: Boolean,
      default: false,
    },
    approvalNumber: {
      type: String,
      trim: true,
    },
    approvalDate: {
      type: Date,
    },
    institution: {
      type: String,
      trim: true,
      default: 'Your Institution Name',
    },
  },

  // Study purpose - GDPR Article 13: Purpose limitation
  studyPurpose: {
    type: String,
    required: [true, 'Study purpose is required'],
    minlength: [50, 'Study purpose must be at least 50 characters'],
    default: 'This study aims to investigate cognitive processes related to [specific topic]. The research will contribute to our understanding of [research area].',
  },

  // Detailed procedures
  procedures: {
    type: String,
    required: [true, 'Procedures description is required'],
    minlength: [100, 'Procedures must be at least 100 characters'],
    default: 'You will be asked to complete a series of tasks on your computer/device. The experiment will take approximately [X] minutes. During the tasks, you will [describe what participants will do]. Your responses will be recorded automatically.',
  },

  // Time commitment
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    default: 15,
  },

  // Potential risks - IRB requirement
  risks: {
    type: String,
    required: [true, 'Risks description is required'],
    default: 'There are no known risks beyond those of everyday computer use. You may experience mild eye strain or fatigue from screen time. You are free to take breaks at any time.',
  },

  // Potential benefits - IRB requirement
  benefits: {
    type: String,
    required: [true, 'Benefits description is required'],
    default: 'There may be no direct benefit to you. However, your participation will contribute to scientific knowledge in [field]. You may gain insight into cognitive research methods.',
  },

  // Compensation/incentives
  compensation: {
    provided: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      default: 'No compensation is provided for this study.',
    },
  },

  // Data handling - GDPR compliance (Articles 5, 13, 32)
  dataHandling: {
    // Storage location and method - GDPR Article 5
    storage: {
      type: String,
      required: [true, 'Data storage method is required'],
      default: 'All data will be stored on secure, encrypted servers. Access is restricted to authorized research personnel only. Data is encrypted both in transit and at rest using industry-standard protocols.',
    },

    // Anonymization - GDPR Article 4(5)
    anonymity: {
      type: Boolean,
      default: true,
      required: true,
    },

    // Anonymization details
    anonymityDescription: {
      type: String,
      default: 'Your data will be completely anonymized. No personally identifiable information will be collected or stored. You will be assigned a random participant ID that cannot be traced back to you.',
    },

    // Data retention period - GDPR Article 5(1)(e)
    retentionPeriod: {
      type: String,
      required: [true, 'Data retention period is required'],
      default: '5 years after study completion, as required by research ethics guidelines, after which all data will be securely deleted.',
    },

    // Who has access to data
    dataAccess: {
      type: String,
      default: 'Only the principal investigator and authorized research team members will have access to the data. Data may be reviewed by the institutional ethics committee or regulatory authorities if required.',
    },

    // Security measures - GDPR Article 32
    securityMeasures: {
      type: String,
      default: 'We implement industry-standard security measures including: encryption (AES-256), secure data transmission (TLS/SSL), access controls, regular security audits, and secure backup procedures.',
    },

    // GDPR - Right to data portability
    dataPortability: {
      type: String,
      default: 'You have the right to request a copy of your data in a structured, commonly used format.',
    },
  },

  // Withdrawal rights - GDPR Article 7(3) & IRB requirement
  withdrawalRights: {
    // Can withdraw at any time - GDPR fundamental right
    canWithdrawAnytime: {
      type: Boolean,
      default: true,
      required: true,
    },

    // How to withdraw
    withdrawalProcedure: {
      type: String,
      required: [true, 'Withdrawal procedure is required'],
      default: 'You may withdraw from this study at any time without penalty by simply closing your browser window. To request deletion of your data after completion, please contact the researcher using the information provided below, including your participant ID.',
    },

    // Consequences of withdrawal
    withdrawalConsequences: {
      type: String,
      default: 'There are no negative consequences for withdrawing from this study. You will not lose any benefits to which you are otherwise entitled.',
    },

    // Data deletion after withdrawal - GDPR Right to erasure (Article 17)
    dataDeletionPolicy: {
      type: String,
      default: 'If you withdraw before completing the study, your partial data will be immediately deleted. If you request deletion after completion, your data will be removed within 30 days, provided it has not been anonymized and aggregated with other data.',
    },

    // Withdrawal deadline
    withdrawalDeadline: {
      type: String,
      default: 'You may withdraw and request data deletion at any time before the data is anonymized and aggregated (typically within 30 days of participation).',
    },
  },

  // Participant rights - GDPR Articles 13-22
  participantRights: {
    rightsDescription: {
      type: String,
      default: `Under GDPR and research ethics guidelines, you have the following rights:
• Right to Access: You can request access to your personal data
• Right to Rectification: You can request correction of inaccurate data
• Right to Erasure: You can request deletion of your data
• Right to Restrict Processing: You can request limitation of data processing
• Right to Data Portability: You can request your data in a portable format
• Right to Object: You can object to data processing
• Right to Withdraw Consent: You can withdraw consent at any time

To exercise these rights, please contact the researcher using the information provided.`,
    },
  },

  // Contact information - GDPR Article 13(1)(a,b)
  contactInfo: {
    // Primary researcher contact
    researcherName: {
      type: String,
      required: [true, 'Researcher name is required'],
      trim: true,
    },

    researcherEmail: {
      type: String,
      required: [true, 'Researcher email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    researcherPhone: {
      type: String,
      trim: true,
    },

    // Institution/organization
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
      default: 'Your Institution Name',
    },

    department: {
      type: String,
      trim: true,
      default: 'Psychology Department',
    },

    // Ethics committee/IRB contact
    ethicsCommitteeName: {
      type: String,
      trim: true,
      default: 'Institutional Review Board',
    },

    ethicsCommitteeEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    ethicsCommitteePhone: {
      type: String,
      trim: true,
    },

    // Data Protection Officer (DPO) - GDPR Article 37 (if applicable)
    dpoEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },

  // Eligibility criteria
  eligibility: {
    minAge: {
      type: Number,
      default: 18,
      min: [0, 'Minimum age cannot be negative'],
    },

    otherCriteria: {
      type: String,
      trim: true,
      default: 'Participants must be fluent in English and have normal or corrected-to-normal vision.',
    },
  },

  // Confidentiality statement
  confidentiality: {
    type: String,
    default: 'Your participation in this study will be kept completely confidential. No identifying information will be collected. Data will be reported only in aggregate form. Published results will not contain any information that could identify you.',
  },

  // Voluntary participation statement
  voluntaryParticipation: {
    type: String,
    default: 'Your participation in this study is completely voluntary. You may choose not to participate or may withdraw at any time without penalty or loss of benefits.',
  },

  // Consent statement - Final agreement text
  consentStatement: {
    text: {
      type: String,
      required: [true, 'Consent statement is required'],
      default: `By clicking "I Consent" below, I confirm that:

• I have read and understood the information about this study
• I have had the opportunity to consider the information and ask questions
• I understand that my participation is completely voluntary
• I understand that I can withdraw at any time without giving a reason and without penalty
• I understand how my data will be collected, used, stored, and protected
• I understand my rights under GDPR, including the right to access, rectify, and erase my data
• I understand that my data will be anonymized and kept confidential
• I am at least 18 years old
• I voluntarily agree to participate in this research study`,
    },

    // Checkbox agreement text
    checkboxText: {
      type: String,
      default: 'I have read the above information and consent to participate in this study',
    },
  },

  // Questions and concerns section
  questionsStatement: {
    type: String,
    default: 'If you have any questions about this research study or your rights as a participant, please contact the researcher using the information provided above. For questions about research ethics, you may contact the ethics committee.',
  },

  // Version control - Important for tracking changes
  version: {
    type: Number,
    default: 1,
    min: 1,
  },

  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  },

  // Metadata
  metadata: {
    totalConsents: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'consentforms',
});

// Indexes for performance
consentFormSchema.index({ researcherId: 1, status: 1 });
consentFormSchema.index({ experimentId: 1 });
consentFormSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps and version
consentFormSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.metadata.lastUpdated = new Date();
  }
  this.updatedAt = new Date();
  next();
});

// Method to activate consent form
consentFormSchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

// Method to archive consent form
consentFormSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Method to increment consent count
consentFormSchema.methods.incrementConsentCount = function() {
  this.metadata.totalConsents += 1;
  return this.save();
};

module.exports = mongoose.model('ConsentForm', consentFormSchema);