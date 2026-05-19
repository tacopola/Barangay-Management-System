export type DocumentData = {
  controlNumber: string;
  docType: string;
  purpose: string;
  issuedAt: Date;

  resident: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    birthDate: string;
    civilStatus: string;
    address: string;
    contactNumber: string | null;
  };

  barangay: {
    name: string;
    municipality: string;
    province: string;
    region: string;
  };

  captain: {
    name: string;
  } | null;
};

const BARANGAY_LOGO = "/bangui_logo.png";
const IN_LOGO = "/in_logo.jpg";

const SHARED_STYLES = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  @page {
    size: 8.5in 13in;
    margin: 0.7in;
  }

  html,
  body {
    width: 8.5in;
    min-height: 13in;
    margin: 0 auto;
    padding: 0;
    background: #fff;
    color: #000;
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.8;
  }

  .document-container {
    width: 100%;
  }

  .control-number {
    text-align: right;
    font-size: 9pt;
    margin-bottom: 12px;
    color: #222;
  }

  .header {
    width: 100%;
    margin-bottom: 18px;
  }

  .header-table {
    width: 100%;
    border-collapse: collapse;
  }

  .header-logo {
    width: 90px;
    text-align: center;
    vertical-align: middle;
  }

  .header-logo img {
    width: 78px;
    height: 78px;
    object-fit: contain;
  }

  .header-content {
    text-align: center;
    vertical-align: middle;
  }

  .header-content p {
    font-size: 10pt;
    margin: 0;
  }

  .header-content h1 {
    font-size: 16pt;
    font-weight: bold;
    text-transform: uppercase;
    margin: 2px 0;
  }

  .header-content h2 {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    margin: 2px 0;
  }

  .divider {
    border-top: 3px double #000;
    margin: 14px 0 30px;
  }

  .doc-title {
    text-align: center;
    font-size: 17pt;
    font-weight: bold;
    text-transform: uppercase;
    text-decoration: underline;
    letter-spacing: 1px;
    margin-bottom: 38px;
  }

  .body-text {
    text-align: justify;
    text-indent: 50px;
    margin-bottom: 18px;
  }

  .body-text.no-indent {
    text-indent: 0;
  }

  .name {
    font-weight: bold;
    text-transform: uppercase;
    text-decoration: underline;
  }

  .signature-section {
    margin-top: 70px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .signature-block {
    width: 260px;
    text-align: center;
  }

  .signature-name {
    border-top: 1px solid #000;
    padding-top: 5px;
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .signature-title {
    font-size: 10pt;
  }

  .footer-note {
    margin-top: 60px;
    border-top: 1px solid #999;
    padding-top: 8px;
    text-align: center;
    font-size: 9pt;
    color: #444;
  }

  .not-valid {
    font-style: italic;
  }

  strong {
    font-weight: bold;
  }

  @media print {
    html,
    body {
      width: 100%;
      min-height: auto;
    }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print {
      display: none;
    }
  }
`;

function fullName(r: DocumentData["resident"]) {
  return `${r.firstName} ${
    r.middleName ? r.middleName + " " : ""
  }${r.lastName}${r.suffix ? " " + r.suffix : ""}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

function sharedHeader(data: DocumentData) {
  return `
    <div class="header">

      <table class="header-table">
        <tr>

          <td class="header-logo">
            <img
              src="${BARANGAY_LOGO}"
              alt="Bangui Logo"
            />
          </td>

          <td class="header-content">

            <p>Republic of the Philippines</p>

            <h1>
              Barangay ${data.barangay.name}
            </h1>

            <h2>
              ${data.barangay.municipality},
              ${data.barangay.province}
            </h2>

            <p>${data.barangay.region}</p>

          </td>

          <td class="header-logo">
            <img
              src="${IN_LOGO}"
              alt="IN Logo"
            />
          </td>

        </tr>
      </table>

    </div>

    <div class="divider"></div>
  `;
}

function sharedSignature(data: DocumentData) {
  return `
    <div class="signature-section">
      <div class="signature-block">

        <div class="signature-name">
          ${data.captain?.name ?? "PUNONG BARANGAY"}
        </div>

        <div class="signature-title">
          Punong Barangay
        </div>

      </div>
    </div>
  `;
}

function documentWrapper(
  title: string,
  body: string,
  data: DocumentData,
  residentName: string
) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <title>
    ${title} - ${residentName}
  </title>

  <style>
    ${SHARED_STYLES}
  </style>
</head>

<body>

  <div class="document-container">

    <div class="control-number">
      <strong>Control No.:</strong>
      ${data.controlNumber}
    </div>

    ${sharedHeader(data)}

    <div class="doc-title">
      ${title}
    </div>

    ${body}

    ${sharedSignature(data)}

    <div class="footer-note">
      <span class="not-valid">
        Not valid without the official dry seal of
        Barangay ${data.barangay.name}
      </span>
    </div>

  </div>

</body>
</html>
  `;
}

// ---------------------------------------------------------------------------
// BARANGAY CLEARANCE
// ---------------------------------------------------------------------------

export function generateBarangayClearance(
  data: DocumentData
): string {
  const name = fullName(data.resident);
  const age = formatAge(data.resident.birthDate);
  const issued = formatDate(data.issuedAt);

  const body = `
    <p class="body-text no-indent">
      TO WHOM IT MAY CONCERN:
    </p>

    <p class="body-text">
      This is to certify that
      <span class="name">${name}</span>,
      ${age} years of age, Filipino citizen, and a bonafide resident of
      Barangay ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province},
      is personally known to this office and has been residing
      in this barangay for a considerable period of time.
    </p>

    <p class="body-text">
      This further certifies that he/she is of good moral character,
      law-abiding, and has no derogatory record on file in this office.
    </p>

    <p class="body-text">
      This clearance is issued upon the request of the above-named
      person for whatever legal purpose it may serve.
    </p>

    <p class="body-text">
      Issued this <strong>${issued}</strong> at Barangay
      ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province}, Philippines.
    </p>
  `;

  return documentWrapper(
    "Barangay Clearance",
    body,
    data,
    name
  );
}

// ---------------------------------------------------------------------------
// CERTIFICATE OF RESIDENCY
// ---------------------------------------------------------------------------

export function generateCertificateOfResidency(
  data: DocumentData
): string {
  const name = fullName(data.resident);
  const age = formatAge(data.resident.birthDate);
  const issued = formatDate(data.issuedAt);

  const body = `
    <p class="body-text no-indent">
      TO WHOM IT MAY CONCERN:
    </p>

    <p class="body-text">
      This is to certify that
      <span class="name">${name}</span>,
      ${age} years of age, is a bonafide resident of
      <strong>${data.resident.address}</strong>,
      Barangay ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province}, Philippines.
    </p>

    <p class="body-text">
      This certification is issued upon the request of the above-named
      person for whatever legal purpose it may serve.
    </p>

    <p class="body-text">
      Issued this <strong>${issued}</strong> at Barangay
      ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province}, Philippines.
    </p>
  `;

  return documentWrapper(
    "Certificate of Residency",
    body,
    data,
    name
  );
}

// ---------------------------------------------------------------------------
// CERTIFICATE OF INDIGENCY
// ---------------------------------------------------------------------------

export function generateCertificateOfIndigency(
  data: DocumentData
): string {
  const name = fullName(data.resident);
  const age = formatAge(data.resident.birthDate);
  const issued = formatDate(data.issuedAt);

  const body = `
    <p class="body-text no-indent">
      TO WHOM IT MAY CONCERN:
    </p>

    <p class="body-text">
      This is to certify that
      <span class="name">${name}</span>,
      ${age} years of age, a resident of Barangay
      ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province},
      belongs to an indigent family and cannot adequately support
      his/her financial needs due to economic hardship.
    </p>

    <p class="body-text">
      This certification is issued upon the request of the above-named
      person for whatever legal purpose it may serve.
    </p>

    <p class="body-text">
      Issued this <strong>${issued}</strong> at Barangay
      ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province}, Philippines.
    </p>
  `;

  return documentWrapper(
    "Certificate of Indigency",
    body,
    data,
    name
  );
}

// ---------------------------------------------------------------------------
// GOOD MORAL CERTIFICATE
// ---------------------------------------------------------------------------

export function generateGoodMoralCertificate(
  data: DocumentData
): string {
  const name = fullName(data.resident);
  const age = formatAge(data.resident.birthDate);
  const issued = formatDate(data.issuedAt);

  const body = `
    <p class="body-text no-indent">
      TO WHOM IT MAY CONCERN:
    </p>

    <p class="body-text">
      This is to certify that
      <span class="name">${name}</span>,
      ${age} years of age, and a resident of Barangay
      ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province},
      is personally known to this office and is hereby certified
      to be a person of
      <strong>good moral character</strong>
      and good standing in the community.
    </p>

    <p class="body-text">
      He/She has no pending criminal case nor derogatory record
      on file in this barangay.
    </p>

    <p class="body-text">
      This certification is issued upon the request of the above-named
      person for whatever legal purpose it may serve.
    </p>

    <p class="body-text">
      Issued this <strong>${issued}</strong> at Barangay
      ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province}, Philippines.
    </p>
  `;

  return documentWrapper(
    "Certificate of Good Moral Character",
    body,
    data,
    name
  );
}

// ---------------------------------------------------------------------------
// BUSINESS CLEARANCE
// ---------------------------------------------------------------------------

export function generateBusinessClearance(
  data: DocumentData
): string {
  const name = fullName(data.resident);
  const issued = formatDate(data.issuedAt);

  const body = `
    <p class="body-text no-indent">
      TO WHOM IT MAY CONCERN:
    </p>

    <p class="body-text">
      This is to certify that
      <span class="name">${name}</span>,
      a bonafide resident of Barangay
      ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province},
      has been granted clearance to operate a business or
      establishment within the jurisdiction of this barangay,
      subject to existing laws and barangay ordinances.
    </p>

    <p class="body-text">
      This clearance is issued upon request and for whatever
      legal purpose it may serve.
    </p>

    <p class="body-text">
      Issued this <strong>${issued}</strong> at Barangay
      ${data.barangay.name},
      ${data.barangay.municipality},
      ${data.barangay.province}, Philippines.
    </p>
  `;

  return documentWrapper(
    "Barangay Business Clearance",
    body,
    data,
    name
  );
}

// ---------------------------------------------------------------------------
// MASTER GENERATOR
// ---------------------------------------------------------------------------

export function generateDocument(data: DocumentData): string {
  switch (data.docType) {
    case "barangay_clearance":
      return generateBarangayClearance(data);

    case "certificate_of_residency":
      return generateCertificateOfResidency(data);

    case "certificate_of_indigency":
      return generateCertificateOfIndigency(data);

    case "good_moral_certificate":
      return generateGoodMoralCertificate(data);

    case "business_clearance":
      return generateBusinessClearance(data);

    default:
      return generateBarangayClearance(data);
  }
}