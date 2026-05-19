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

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #000;
    background: #fff;
    padding: 0.75in;
    max-width: 8.5in;
    margin: 0 auto;
    line-height: 1.6;
  }
    @page {
  size: A4;
  margin: 0.75in;
}

@media print {
  @page {
    margin-top: 0.75in;
    margin-bottom: 0.75in;
  }
}
  .header { text-align: center; margin-bottom: 20px; }
  .header img { width: 70px; height: 70px; object-fit: contain; }
  .header h1 { font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 4px 0; }
  .header h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 2px 0; }
  .header p { font-size: 10pt; margin: 1px 0; }
  .divider { border-top: 3px double #000; margin: 10px 0; }
  .doc-title {
    text-align: center;
    font-size: 15pt;
    font-weight: bold;
    text-transform: uppercase;
    text-decoration: underline;
    margin: 16px 0 20px;
    letter-spacing: 2px;
  }
  .body-text { text-align: justify; margin-bottom: 12px; }
  .body-text .name {
    font-weight: bold;
    text-transform: uppercase;
    text-decoration: underline;
  }
  .signature-section {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .signature-block { text-align: center; }
  .signature-line { border-top: 1px solid #000; width: 220px; margin: 0 auto 4px; }
  .signature-name { font-weight: bold; text-transform: uppercase; font-size: 11pt; }
  .signature-title { font-size: 10pt; }
  .footer-note {
    margin-top: 30px;
    font-size: 9pt;
    text-align: center;
    color: #555;
    border-top: 1px solid #ccc;
    padding-top: 8px;
  }
  .control-number {
    text-align: right;
    font-size: 9pt;
    margin-bottom: 8px;
    color: #333;
  }
  .not-valid { font-style: italic; font-size: 10pt; }
  @media print {
    body { padding: 0.5in; }
    .no-print { display: none; }
  }
`;

function fullName(r: DocumentData["resident"]) {
  return `${r.firstName} ${r.middleName ? r.middleName + " " : ""}${r.lastName}${r.suffix ? " " + r.suffix : ""}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function sharedHeader(data: DocumentData) {
  return `
    <div class="header">
      <p>Republic of the Philippines</p>
      <h1>Barangay ${data.barangay.name}</h1>
      <h2>${data.barangay.municipality}, ${data.barangay.province}</h2>
      <p>${data.barangay.region}</p>
    </div>
    <div class="divider"></div>
  `;
}

function sharedSignature(data: DocumentData) {
  return `
    <div class="signature-section">
      <div class="signature-block">
        <div class="signature-line"></div>
        <p class="signature-name">${data.captain?.name ?? "PUNONG BARANGAY"}</p>
        <p class="signature-title">Punong Barangay</p>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 1. Barangay Clearance
// ---------------------------------------------------------------------------

export function generateBarangayClearance(data: DocumentData): string {
  const name = fullName(data.resident);
  const age = formatAge(data.resident.birthDate);
  const issued = formatDate(data.issuedAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Barangay Clearance - ${name}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="control-number">Control No.: ${data.controlNumber}</div>
  ${sharedHeader(data)}
  <div class="doc-title">Barangay Clearance</div>

  <p class="body-text">TO WHOM IT MAY CONCERN:</p>

  <p class="body-text">
    This is to certify that <span class="name">${name}</span>,
    ${age} years of age, ${data.resident.civilStatus}, Filipino citizen,
    and a bonafide resident of ${data.resident.address},
    Barangay ${data.barangay.name}, ${data.barangay.municipality},
    ${data.barangay.province}, is personally known to me and has been
    residing in this barangay for a considerable period of time.
  </p>

  <p class="body-text">
    This further certifies that he/she is of good moral character, law-abiding,
    and has no derogatory record on file in this office.
  </p>

  <p class="body-text">
    This clearance is issued upon the request of the above-named person for
    <strong>${data.purpose}</strong> and for whatever legal purpose it may serve.
  </p>

  <p class="body-text">
    Issued this <strong>${issued}</strong> at Barangay ${data.barangay.name},
    ${data.barangay.municipality}, ${data.barangay.province}, Philippines.
  </p>

  ${sharedSignature(data)}

  <div class="footer-note">
    <span class="not-valid">Not valid without official dry seal of Barangay ${data.barangay.name}</span>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 2. Certificate of Residency
// ---------------------------------------------------------------------------

export function generateCertificateOfResidency(data: DocumentData): string {
  const name = fullName(data.resident);
  const age = formatAge(data.resident.birthDate);
  const issued = formatDate(data.issuedAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate of Residency - ${name}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="control-number">Control No.: ${data.controlNumber}</div>
  ${sharedHeader(data)}
  <div class="doc-title">Certificate of Residency</div>

  <p class="body-text">TO WHOM IT MAY CONCERN:</p>

  <p class="body-text">
    This is to certify that <span class="name">${name}</span>,
    ${age} years of age, ${data.resident.civilStatus}, is a bonafide resident of
    <strong>${data.resident.address}</strong>,
    Barangay ${data.barangay.name}, ${data.barangay.municipality},
    ${data.barangay.province}, Philippines.
  </p>

  <p class="body-text">
    This certification is issued upon the request of the above-named person for
    <strong>${data.purpose}</strong> and for whatever legal purpose it may serve.
  </p>

  <p class="body-text">
    Issued this <strong>${issued}</strong> at Barangay ${data.barangay.name},
    ${data.barangay.municipality}, ${data.barangay.province}, Philippines.
  </p>

  ${sharedSignature(data)}

  <div class="footer-note">
    <span class="not-valid">Not valid without official dry seal of Barangay ${data.barangay.name}</span>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 3. Certificate of Indigency
// ---------------------------------------------------------------------------

export function generateCertificateOfIndigency(data: DocumentData): string {
  const name = fullName(data.resident);
  const age = formatAge(data.resident.birthDate);
  const issued = formatDate(data.issuedAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate of Indigency - ${name}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="control-number">Control No.: ${data.controlNumber}</div>
  ${sharedHeader(data)}
  <div class="doc-title">Certificate of Indigency</div>

  <p class="body-text">TO WHOM IT MAY CONCERN:</p>

  <p class="body-text">
    This is to certify that <span class="name">${name}</span>,
    ${age} years of age, ${data.resident.civilStatus}, a resident of
    ${data.resident.address}, Barangay ${data.barangay.name},
    ${data.barangay.municipality}, ${data.barangay.province},
    belongs to an indigent family and cannot afford to pay for
    his/her needs due to financial constraints.
  </p>

  <p class="body-text">
    This certification is issued upon the request of the above-named person for
    <strong>${data.purpose}</strong> and for whatever legal purpose it may serve.
  </p>

  <p class="body-text">
    Issued this <strong>${issued}</strong> at Barangay ${data.barangay.name},
    ${data.barangay.municipality}, ${data.barangay.province}, Philippines.
  </p>

  ${sharedSignature(data)}

  <div class="footer-note">
    <span class="not-valid">Not valid without official dry seal of Barangay ${data.barangay.name}</span>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 4. Good Moral Certificate
// ---------------------------------------------------------------------------

export function generateGoodMoralCertificate(data: DocumentData): string {
  const name = fullName(data.resident);
  const age = formatAge(data.resident.birthDate);
  const issued = formatDate(data.issuedAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Good Moral Certificate - ${name}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="control-number">Control No.: ${data.controlNumber}</div>
  ${sharedHeader(data)}
  <div class="doc-title">Certificate of Good Moral Character</div>

  <p class="body-text">TO WHOM IT MAY CONCERN:</p>

  <p class="body-text">
    This is to certify that <span class="name">${name}</span>,
    ${age} years of age, ${data.resident.civilStatus}, a resident of
    ${data.resident.address}, Barangay ${data.barangay.name},
    ${data.barangay.municipality}, ${data.barangay.province},
    is personally known to this office and is certified to be of
    <strong>good moral character</strong> and <strong>good standing</strong>
    in our community.
  </p>

  <p class="body-text">
    He/She has no pending criminal case or any derogatory record on file in this barangay.
  </p>

  <p class="body-text">
    This certification is issued upon the request of the above-named person for
    <strong>${data.purpose}</strong> and for whatever legal purpose it may serve.
  </p>

  <p class="body-text">
    Issued this <strong>${issued}</strong> at Barangay ${data.barangay.name},
    ${data.barangay.municipality}, ${data.barangay.province}, Philippines.
  </p>

  ${sharedSignature(data)}

  <div class="footer-note">
    <span class="not-valid">Not valid without official dry seal of Barangay ${data.barangay.name}</span>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 5. Business Clearance
// ---------------------------------------------------------------------------

export function generateBusinessClearance(data: DocumentData): string {
  const name = fullName(data.resident);
  const issued = formatDate(data.issuedAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Business Clearance - ${name}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="control-number">Control No.: ${data.controlNumber}</div>
  ${sharedHeader(data)}
  <div class="doc-title">Barangay Business Clearance</div>

  <p class="body-text">TO WHOM IT MAY CONCERN:</p>

  <p class="body-text">
    This is to certify that <span class="name">${name}</span>,
    a bonafide resident of ${data.resident.address},
    Barangay ${data.barangay.name}, ${data.barangay.municipality},
    ${data.barangay.province}, has been granted clearance to operate
    a business/establishment within the jurisdiction of this barangay.
  </p>

  <p class="body-text">
    Purpose: <strong>${data.purpose}</strong>
  </p>

  <p class="body-text">
    This clearance is issued upon request and for whatever legal purpose it may serve.
  </p>

  <p class="body-text">
    Issued this <strong>${issued}</strong> at Barangay ${data.barangay.name},
    ${data.barangay.municipality}, ${data.barangay.province}, Philippines.
  </p>

  ${sharedSignature(data)}

  <div class="footer-note">
    <span class="not-valid">Not valid without official dry seal of Barangay ${data.barangay.name}</span>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Master generator
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
