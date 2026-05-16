export type AuditTableConfig = {
  labels?: Record<string, string>;
  hiddenFields?: string[];
};

export const DEFAULT_HIDDEN_FIELDS = [
  "id",
  "createdAt",
  "updatedAt",
  "password",
  "passwordHash",
  "pendingProfileUpdate",
];

export const AUDIT_CONFIG: Record<string, AuditTableConfig> = {
  // ---------------------------------------------------------------------------
  // Barangays
  // ---------------------------------------------------------------------------

  barangays: {
    labels: {
      name: "Barangay Name",
      municipality: "Municipality",
      province: "Province",
      region: "Region",
      zipCode: "ZIP Code",
      contactNumber: "Contact Number",
      email: "Email",
      isActive: "Status",
    },
  },

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  users: {
    labels: {
      authId: "Auth ID",
      role: "Role",
      barangayId: "Barangay",
      firstName: "First Name",
      middleName: "Middle Name",
      lastName: "Last Name",
      suffix: "Suffix",
      email: "Email",
      phoneNumber: "Phone Number",
      isActive: "Status",
    },
  },

  // ---------------------------------------------------------------------------
  // Households
  // ---------------------------------------------------------------------------

  households: {
    labels: {
      barangayId: "Barangay",
      houseNumber: "House Number",
      streetPurok: "Street / Purok",
      headResidentId: "Head Resident",
    },
  },

  // ---------------------------------------------------------------------------
  // Residents
  // ---------------------------------------------------------------------------

  residents: {
    hiddenFields: ["pendingProfileUpdate"],

    labels: {
      userId: "Portal User",
      barangayId: "Barangay",
      householdId: "Household",

      firstName: "First Name",
      middleName: "Middle Name",
      lastName: "Last Name",
      suffix: "Suffix",

      sex: "Sex",
      birthDate: "Birth Date",
      birthPlace: "Birth Place",
      civilStatus: "Civil Status",
      nationality: "Nationality",
      religion: "Religion",
      occupation: "Occupation",
      contactNumber: "Contact Number",
      email: "Email",

      isRegisteredVoter: "Registered Voter",
      voterIdNumber: "Voter ID Number",

      isIndigenousPeople: "Indigenous People",
      isSeniorCitizen: "Senior Citizen",
      isPwd: "PWD",
      pwdType: "PWD Type",
      isSoloParent: "Solo Parent",

      isVerified: "Verified",
      isArchived: "Archived",
    },
  },

  // ---------------------------------------------------------------------------
  // Document Requests
  // ---------------------------------------------------------------------------

  document_requests: {
    labels: {
      barangayId: "Barangay",
      residentId: "Resident",
      requestedById: "Requested By",

      docType: "Document Type",
      purpose: "Purpose",
      status: "Status",

      processedById: "Processed By",
      processedAt: "Processed At",
      rejectionReason: "Rejection Reason",
      releasedAt: "Released At",

      orNumber: "OR Number",
      documentPath: "Document File",
      controlNumber: "Control Number",
      remarks: "Remarks",
    },
  },

  // ---------------------------------------------------------------------------
  // Blotter Cases
  // ---------------------------------------------------------------------------

  blotter_cases: {
    labels: {
      barangayId: "Barangay",
      caseNumber: "Case Number",

      filedById: "Filed By",

      complainantId: "Complainant",
      complainantName: "Complainant Name",

      respondentId: "Respondent",
      respondentName: "Respondent Name",

      incidentDate: "Incident Date",
      incidentLocation: "Incident Location",
      narrative: "Narrative",

      status: "Status",
      resolvedAt: "Resolved At",
      resolution: "Resolution",

      isEscalated: "Escalated",
      escalatedAt: "Escalated At",
      escalationReason: "Escalation Reason",

      assignedOfficialId: "Assigned Official",
    },
  },

  // ---------------------------------------------------------------------------
  // Blotter Proceedings
  // ---------------------------------------------------------------------------

  blotter_proceedings: {
    labels: {
      caseId: "Blotter Case",
      recordedById: "Recorded By",
      proceedingDate: "Proceeding Date",
      notes: "Notes",
      nextHearingDate: "Next Hearing Date",
    },
  },

  // ---------------------------------------------------------------------------
  // Barangay Officials
  // ---------------------------------------------------------------------------

  barangay_officials: {
    labels: {
      barangayId: "Barangay",
      residentId: "Resident",
      position: "Position",
      termStart: "Term Start",
      termEnd: "Term End",
      isActive: "Status",
      signature: "Signature",
    },
  },

  // ---------------------------------------------------------------------------
  // Announcements
  // ---------------------------------------------------------------------------

  announcements: {
    labels: {
      postedById: "Posted By",
      barangayId: "Barangay",

      title: "Title",
      body: "Content",

      isPinned: "Pinned",
      expiresAt: "Expires At",
    },
  },

  // ---------------------------------------------------------------------------
  // Financial Records
  // ---------------------------------------------------------------------------

  financial_records: {
    labels: {
      barangayId: "Barangay",
      recordedById: "Recorded By",

      type: "Transaction Type",
      amount: "Amount",
      category: "Category",
      description: "Description",

      referenceNumber: "Reference Number",

      transactionDate: "Transaction Date",
      fiscalYear: "Fiscal Year",
      quarter: "Quarter",
    },
  },

  // ---------------------------------------------------------------------------
  // Programs
  // ---------------------------------------------------------------------------

  programs: {
    labels: {
      barangayId: "Barangay",
      type: "Program Type",
      name: "Program Name",
      description: "Description",
      isActive: "Status",
    },
  },

  // ---------------------------------------------------------------------------
  // Program Beneficiaries
  // ---------------------------------------------------------------------------

  program_beneficiaries: {
    labels: {
      programId: "Program",
      residentId: "Resident",

      enrolledAt: "Enrollment Date",
      removedAt: "Removal Date",
      removalReason: "Removal Reason",
      remarks: "Remarks",
    },
  },

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------

  notifications: {
    labels: {
      userId: "User",
      title: "Title",
      body: "Message",

      isRead: "Read",

      relatedTable: "Related Table",
      relatedId: "Related Record",
    },
  },

  // ---------------------------------------------------------------------------
  // Audit Logs
  // ---------------------------------------------------------------------------

  audit_logs: {
    labels: {
      actorId: "Actor",
      barangayId: "Barangay",

      action: "Action",
      tableName: "Table",
      recordId: "Record ID",

      previousValue: "Previous Value",
      newValue: "New Value",

      ipAddress: "IP Address",
      createdAt: "Created At",
    },
  },
};