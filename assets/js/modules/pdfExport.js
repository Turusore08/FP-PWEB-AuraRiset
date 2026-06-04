// --- AURARISET PDF REPORT GENERATOR ENGINE ---

/**
 * Helper to get active user metadata
 */
function getActiveUser() {
  return window.USER_SESSION ? window.USER_SESSION.username : 'Mahasiswa';
}

/**
 * Format timestamp into standard Indonesian date-time format
 */
function formatDateTime(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Draws a professional header banner with AuraRiset branding
 */
function drawHeader(doc, titleText) {
  // Add a dark navy top bar
  doc.setFillColor(11, 19, 43); // Navy #0b132b
  doc.rect(0, 0, 210, 25, 'F');

  // Brand Name in Gold
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(212, 175, 55); // Gold #d4af37
  doc.text("AuraRiset", 15, 16);

  // Brand Subtitle
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(240, 240, 240);
  doc.text("Automated Research Gap Analysis Platform", 43, 15);

  // Document Title Header on the right side of banner
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(titleText, 210 - 15, 16, { align: 'right' });

  // Accent Gold Line underneath the banner
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(0, 25, 210, 25);
}

/**
 * Draws a professional footer at the bottom of the page
 */
function drawFooter(doc, pageNum, pageCount) {
  const timestamp = formatDateTime();
  const pageHeight = doc.internal.pageSize.height;

  // Thin separator line
  doc.setDrawColor(226, 232, 240); // light gray #e2e8f0
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 15, 210 - 15, pageHeight - 15);

  // Footer text
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Muted text color
  doc.text("Dibuat otomatis oleh AuraRiset. Dokumen diverifikasi secara sistem.", 15, pageHeight - 10);
  doc.text(`Dicetak: ${timestamp}`, 105, pageHeight - 10, { align: 'center' });
  doc.text(`Halaman ${pageNum} dari ${pageCount}`, 210 - 15, pageHeight - 10, { align: 'right' });
}

/**
 * 1. Exports a single SOTA Research Gap Analysis details to PDF
 */
export function exportResearchGapPDF(topic, results, author = null) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const docTitle = "RESEARCH GAP ANALYSIS REPORT";
  drawHeader(doc, docTitle);

  // 1. Metadata Block
  const authorName = author || getActiveUser();
  const dateStr = formatDateTime();

  doc.setFillColor(248, 250, 252); // light slate background
  doc.rect(15, 33, 180, 28, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(15, 33, 180, 28, 'S');

  // Metadata Labels
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 19, 43);
  doc.text("Topik Riset  :", 20, 39);
  doc.text("Peneliti        :", 20, 47);
  doc.text("Tanggal       :", 20, 55);

  // Metadata Values
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  
  // Topic text auto wrap in metadata box
  const splitTopic = doc.splitTextToSize(topic, 130);
  doc.text(splitTopic, 42, 39);
  doc.text(authorName, 42, 47);
  doc.text(dateStr, 42, 55);

  // Section Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(11, 19, 43);
  doc.text("Matriks State-of-the-Art (SOTA) & Kesenjangan Penelitian", 15, 71);

  // 2. Table Data
  const headers = [["Tahun", "Metode Penelitian", "Celah Riset (Gap) Yang Diidentifikasi", "Ringkasan Integrasi AI"]];
  const data = results.map(row => [
    row.year,
    row.method,
    row.gap,
    row.summary
  ]);

  doc.autoTable({
    startY: 75,
    head: headers,
    body: data,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    headStyles: {
      fillColor: [11, 19, 43], // Deep Navy
      textColor: [212, 175, 55], // Gold
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50],
      valign: 'top'
    },
    columnStyles: {
      0: { cellWidth: 15 }, // Year
      1: { cellWidth: 40 }, // Method
      2: { cellWidth: 60 }, // Gap
      3: { cellWidth: 65 }  // Summary
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 4
    },
    didDrawPage: (data) => {
      // Add footer for each page
      const pageCount = doc.internal.getNumberOfPages();
      drawFooter(doc, data.pageNumber, pageCount);
    }
  });

  // Save Document
  const fileName = `ResearchGap_${topic.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * 2. Exports the list of all Recent Scans to PDF
 */
export function exportRecentScansPDF(scans) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const docTitle = "RECENT RESEARCH SCANS SUMMARY";
  drawHeader(doc, docTitle);

  // Metadata / Summary Panel
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 33, 180, 18, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(15, 33, 180, 18, 'S');

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 19, 43);
  doc.text("Laporan Ringkasan Histori Pemindaian", 20, 40);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Menampilkan ${scans.length} aktivitas analisis riset terakhir yang tersimpan di sistem database.`, 20, 46);

  // Table Data
  const headers = [["No", "Judul / Topik Penelitian", "Tanggal Scan", "Peneliti", "Jumlah Paper"]];
  const data = scans.map((item, idx) => [
    idx + 1,
    item.topic,
    new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    item.author || 'Mahasiswa',
    item.results ? item.results.length : 3
  ]);

  doc.autoTable({
    startY: 60,
    head: headers,
    body: data,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    headStyles: {
      fillColor: [11, 19, 43], // Deep Navy
      textColor: [212, 175, 55], // Gold
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 100 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 15 }
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 3
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      drawFooter(doc, data.pageNumber, pageCount);
    }
  });

  doc.save("RecentResearchHistory.pdf");
}

/**
 * 3. Exports the list of all Student Research Evaluations to PDF (for Dosen / Admin)
 */
export function exportEvaluationsPDF(historyList) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const docTitle = "STUDENT RESEARCH EVALUATIONS";
  drawHeader(doc, docTitle);

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 33, 180, 20, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(15, 33, 180, 20, 'S');

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 19, 43);
  doc.text("Laporan Evaluasi & Pemetaan Kesenjangan Riset Mahasiswa", 20, 40);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Total ${historyList.length} draf pemetaan kesenjangan literatur terdaftar untuk dievaluasi oleh dosen reviewer.`, 20, 47);

  // Table
  const headers = [["No", "Nama Peneliti / Mahasiswa", "Tema Utama / Topik Penelitian", "Tanggal Pengajuan", "Status"]];
  const data = historyList.map((item, idx) => [
    idx + 1,
    item.author || 'Mahasiswa',
    item.topic,
    new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    "Selesai / Terverifikasi"
  ]);

  doc.autoTable({
    startY: 62,
    head: headers,
    body: data,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    headStyles: {
      fillColor: [11, 19, 43], // Deep Navy
      textColor: [212, 175, 55], // Gold
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { cellWidth: 80 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 }
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 3
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      drawFooter(doc, data.pageNumber, pageCount);
    }
  });

  doc.save("StudentEvaluationsReport.pdf");
}

/**
 * 4. Exports User Directory to PDF (for Admin)
 */
export function exportUsersPDF(users) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const docTitle = "USER MANAGEMENT DIRECTORY";
  drawHeader(doc, docTitle);

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 33, 180, 20, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(15, 33, 180, 20, 'S');

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 19, 43);
  doc.text("Laporan Audit Hak Akses Pengguna", 20, 40);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Menampilkan status audit terbaru dari ${users.length} akun pengguna yang terdaftar pada platform AuraRiset.`, 20, 47);

  // Table
  const headers = [["ID", "Nama Pengguna (Username)", "Alamat Email", "Hak Akses / Role"]];
  const data = users.map(user => [
    user.id,
    user.username,
    user.email,
    user.role.toUpperCase()
  ]);

  doc.autoTable({
    startY: 62,
    head: headers,
    body: data,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    headStyles: {
      fillColor: [11, 19, 43], // Deep Navy
      textColor: [212, 175, 55], // Gold
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 55 },
      2: { cellWidth: 70 },
      3: { cellWidth: 40 }
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 3.5
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      drawFooter(doc, data.pageNumber, pageCount);
    }
  });

  doc.save("UsersDirectoryReport.pdf");
}
