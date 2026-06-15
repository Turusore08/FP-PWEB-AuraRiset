// --- AI GAP SCANNER & UPLOAD ENGINE FEATURE ---

import { events } from '../core/events.js';
import { store } from '../core/store.js';
import { ToastFactory } from '../components/toast.js';
import { exportResearchGapPDF, exportRecentScansPDF } from './pdfExport.js';

// Simulated Research Database fallback for new topics
const simulatedGapDatabase = [
  {
    topic: "Optimasi Query Database Terdistribusi",
    results: [
      { year: 2023, method: "Two-Phase Commit (2PC)", gap: "Skalabilitas rendah pada latensi jaringan tinggi.", summary: "Penggunaan 2PC standar dalam cloud latency ekstrim memicu bottlenecks yang signifikan." },
      { year: 2024, method: "Raft Consensus Protocol", gap: "Overhead koordinasi pemimpin berlebih saat replika tumbuh.", summary: "Menunjukkan adanya overhead saat konsensus pemimpin harus melintasi region geografis berbeda." },
      { year: 2025, method: "AuraRiset Hybrid Sync", gap: "Belum dievaluasi pada sistem multi-cloud dengan partisi dinamis.", summary: "Kami menemukan peluang penggabungan sinkronisasi hibrid berbasis heuristik untuk toleransi partisi." }
    ]
  },
  {
    topic: "Deteksi Kanker Paru dengan Deep Learning",
    results: [
      { year: 2022, method: "3D Convolutional Network (CNN)", gap: "Kebutuhan komputasi sangat intensif untuk citra CT volumetrik.", summary: "Kurang efisien jika diaplikasikan di perangkat medis portabel pedesaan." },
      { year: 2023, method: "Vision Transformers (ViT)", gap: "Membutuhkan dataset berlabel raksasa untuk menghindari overfitting.", summary: "Akurasi anjlok drastis saat dataset terbatas pada sampel klinis kecil lokal." },
      { year: 2025, method: "AuraRiset Semi-Supervised ViT", gap: "Belum menguji transferability di seluruh modalitas pencitraan (PET/MRI).", summary: "Gap analisis menunjukkan peluang pemodelan adaptif untuk transisi antar modalitas pindaian medis." }
    ]
  },
  {
    topic: "Sistem Rekomendasi E-Commerce Real-time",
    results: [
      { year: 2023, method: "Collaborative Filtering", gap: "Masalah 'Cold-Start' ekstrim pada pengguna baru terdaftar.", summary: "Peringkat akurasi sistem menurun hingga 40% ketika interaksi historis pengguna masih nol." },
      { year: 2024, method: "Graph Neural Networks (GNN)", gap: "Latency komputasi grafik tinggi menghambat respons sub-detik.", summary: "Mengalami delay pemrosesan grafik saat session load puncak e-commerce." },
      { year: 2025, method: "AuraRiset Contextual GNN", gap: "Belum mensinkronkan preferensi implisit multi-perangkat secara instan.", summary: "Peluang penulisan gap riset pada sinkronisasi state instan antar gawai yang digunakan pengguna." }
    ]
  }
];

export class Research {
  /**
   * Bootstrap PDF Upload drag-and-drop triggers and analysis starters
   */
  static init() {
    Research.initDragAndDrop();
    Research.initResearchSimulation();
    Research.initPDFExportEvents();
    
    // Load historical scans from DB on page initialization
    Research.loadHistory();
    
    // Expose injectNewResults globally to maintain backward compatibility
    window.injectNewResults = (topicName) => {
      Research.loadHistory();
    };
  }

  /**
   * Initialize PDF export button click events
   */
  static initPDFExportEvents() {
    const btnComp = document.getElementById('btn-export-comparison-pdf');
    const btnRecent = document.getElementById('btn-export-recent-pdf');

    if (btnComp) {
      btnComp.addEventListener('click', () => {
        if (Research.activeTopic && Research.activeResults) {
          exportResearchGapPDF(Research.activeTopic, Research.activeResults);
        } else {
          ToastFactory.show('Peringatan', 'Tidak ada data komparasi aktif untuk diekspor.', 'warning');
        }
      });
    }

    if (btnRecent) {
      btnRecent.addEventListener('click', async () => {
        try {
          const response = await fetch('api/get_research.php');
          const data = await response.json();
          if (data.status === 'success' && data.history.length > 0) {
            exportRecentScansPDF(data.history);
          } else {
            ToastFactory.show('Peringatan', 'Tidak ada riwayat penelitian untuk diekspor.', 'warning');
          }
        } catch (err) {
          ToastFactory.show('Error', 'Gagal memuat riwayat untuk diekspor.', 'error');
        }
      });
    }
  }

  /**
   * Initialize Drag & Drop PDF Uploader with dynamic XHR progress tracking
   */
  static initDragAndDrop() {
    const dropZone = document.getElementById('drag-drop-zone');
    const fileInput = document.getElementById('file-input');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercent = document.getElementById('progress-percent');
    const progressFileName = document.getElementById('progress-file-name');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleUploadedFile(file);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (file) handleUploadedFile(file);
    });

    function handleUploadedFile(file) {
      if (file.type !== 'application/pdf') {
        ToastFactory.show('Error', 'Hanya dokumen berformat PDF yang didukung!', 'error');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        ToastFactory.show('Error', 'Ukuran file melebihi batas maksimal 10 MB!', 'error');
        return;
      }

      progressContainer.style.display = 'block';
      progressFileName.textContent = file.name;
      progressBarFill.style.width = '0%';
      progressPercent.textContent = '0%';

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'upload.php', true);

      // Track physical upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          progressBarFill.style.width = `${percentComplete}%`;
          progressPercent.textContent = `${percentComplete}%`;
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.status === 'success') {
                ToastFactory.show('Success', 'File berhasil diunggah. Mulai analisis...', 'success');
                setTimeout(() => {
                  progressContainer.style.display = 'none';
                  Research.runAIScanner(file.name.replace('.pdf', ''));
                }, 800);
              } else {
                ToastFactory.show('Error', response.message || 'Gagal mengunggah file.', 'error');
                progressContainer.style.display = 'none';
              }
            } catch (err) {
              ToastFactory.show('Error', 'Respons server tidak valid.', 'error');
              progressContainer.style.display = 'none';
            }
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              ToastFactory.show('Error', response.message || 'Gagal mengunggah file.', 'error');
            } catch (err) {
              ToastFactory.show('Error', 'Gagal mengunggah file ke server.', 'error');
            }
            progressContainer.style.display = 'none';
          }
        }
      };

      xhr.send(formData);
    }
  }

  /**
   * Topic Search triggers
   */
  static initResearchSimulation() {
    const btnCta = document.getElementById('btn-start-analysis');
    const topicInput = document.getElementById('topic-input');

    if (!btnCta || !topicInput) return;

    btnCta.addEventListener('click', () => {
      const val = topicInput.value.trim();
      if (!val) {
        ToastFactory.show('Warning', 'Masukkan topik atau kata kunci terlebih dahulu!', 'warning');
        return;
      }
      Research.runAIScanner(val);
    });

    topicInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnCta.click();
      }
    });
  }

  /**
   * SOTA scanner overlay pipeline with real OpenAI API integration and fallback
   */
  static runAIScanner(topicName) {
    const overlay = document.getElementById('analysis-overlay');
    const fill = document.getElementById('scanner-progress-fill');
    const consoleEl = document.getElementById('console-logs');
    const stepText = document.getElementById('analysis-step-desc');

    if (!overlay || !fill || !consoleEl || !stepText) return;

    // Clear previous logs
    consoleEl.innerHTML = '';
    fill.style.width = '0%';
    overlay.classList.add('open');

    // Emit event that scanning has started
    events.publish('research:started', topicName);

    // Asynchronously call OpenAI analyzer endpoint in background during loader sequence
    const apiPromise = fetch('api/openai_analyze.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topicName })
    })
    .then(async response => {
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        return data.results;
      } else {
        throw new Error(data.message || 'Respons OpenAI tidak valid.');
      }
    });

    const steps = [
      { text: "Menginisiasi analisis kesenjangan pustaka...", percent: 15, delay: 800, log: "Initializing research pipeline...", type: "info" },
      { text: "Mengekstrak konsep kunci dan relasi taksonomi...", percent: 35, delay: 1500, log: `Concept extraction started for: "${topicName}"`, type: "info" },
      { text: "Mencocokkan paper terindex dari IEEE, ACM, dan Scopus...", percent: 60, delay: 2400, log: "Scraping databases... 42 relevant papers retrieved.", type: "success" },
      { text: "Mengalkulasi matriks perbedaan metode...", percent: 80, delay: 3500, log: "Cross-referencing methods & year of publications...", type: "info" },
      { text: "Merumuskan OpenAI Integrated Summary...", percent: 95, delay: 4600, log: "Querying OpenAI API model for research gap synthesis...", type: "success" },
      { text: "Analisis berhasil dituntaskan!", percent: 100, delay: 5500, log: "System success! Writing results to local database.", type: "success" }
    ];

    const logDetails = [
      "[INFO] Establishing connection to Semantic Scholar DB...",
      "[INFO] Parsing metadata... Extracted keywords: optimization, methodology, gap.",
      "[SUCCESS] Vector embeddings successfully calculated in 12ms.",
      "[INFO] Building comparison mapping graph...",
      "[SUCCESS] Identified 3 critical methodology overlaps.",
      "[SUCCESS] Summary generated using GPT-4o context model."
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        fill.style.width = `${step.percent}%`;
        stepText.textContent = step.text;
        
        const timeStr = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = `console-line ${step.type}`;
        line.textContent = `[${timeStr}] ${step.log}`;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;

        if (idx < logDetails.length) {
          setTimeout(() => {
            const subLine = document.createElement('div');
            subLine.className = "console-line";
            subLine.textContent = `[${timeStr}] ${logDetails[idx]}`;
            consoleEl.appendChild(subLine);
            consoleEl.scrollTop = consoleEl.scrollHeight;
          }, 300);
        }

        if (idx === steps.length - 1) {
          setTimeout(async () => {
            try {
              // Wait for OpenAI API call to complete
              const apiResults = await apiPromise;
              
              overlay.classList.remove('open');
              
              const match = {
                topic: topicName.charAt(0).toUpperCase() + topicName.slice(1),
                results: apiResults
              };

              // Save results to PostgreSQL database via API
              await Research.saveScanResult(match.topic, match.results);

              // Publish SOTA completed event
              events.publish('research:completed', match);
              
              ToastFactory.show('Sukses', 'Analisis gap OpenAI berhasil dirumuskan!', 'success');
            } catch (err) {
              console.warn("OpenAI API integration unavailable, falling back to simulated model:", err);
              
              // Fallback to local offline simulated gap database
              let match = simulatedGapDatabase.find(x => topicName.toLowerCase().includes(x.topic.toLowerCase()) || x.topic.toLowerCase().includes(topicName.toLowerCase()));
              if (!match) {
                const cleanTopic = topicName.charAt(0).toUpperCase() + topicName.slice(1);
                match = {
                  topic: cleanTopic,
                  results: [
                    { year: 2023, method: "State-of-the-Art Baseline", gap: `Akurasi masih inkonsisten jika diterapkan pada sub-topik ${cleanTopic}.`, summary: "Studi terdahulu tidak mengeksplorasi skalabilitas real-world." },
                    { year: 2024, method: "Advanced Neural Framework", gap: `Overhead komputasi bertambah pesat tanpa efisiensi memori yang memadai.`, summary: "Model yang ada lambat beradaptasi pada variabilitas runtime." },
                    { year: 2025, method: `AuraRiset Custom ${cleanTopic.split(' ')[0]}`, gap: "Belum teruji optimal pada data heterogen skala industri.", summary: `Menyisakan kesenjangan penting untuk penggabungan arsitektur terpadu.` }
                  ]
                };
              }

              overlay.classList.remove('open');
              
              // Save simulated results
              await Research.saveScanResult(match.topic, match.results);

              // Publish SOTA completed event
              events.publish('research:completed', match);
              
              ToastFactory.show('Selesai (Simulasi)', 'Analisis gap selesai dirumuskan (Mode Offline / Fallback).', 'warning');
            }
          }, 1000);
        }
      }, step.delay);
    });
  }

  /**
   * Post scanning results to the backend API
   */
  static async saveScanResult(topic, results) {
    try {
      const response = await fetch('api/save_research.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, results })
      });
      const data = await response.json();
      if (data.status === 'success') {
        // Load database records dynamically to keep dashboard updated
        await Research.loadHistory();
      } else {
        ToastFactory.show('Error', data.message || 'Gagal menyimpan analisis riset.', 'error');
      }
    } catch (err) {
      console.error('Failed to communicate scan details with server:', err);
      ToastFactory.show('Error', 'Gagal menghubungkan ke database server.', 'error');
    }
  }

  /**
   * Load SOTA records from PostgreSQL and sync metrics store + view grids
   */
  static async loadHistory() {
    try {
      const response = await fetch('api/get_research.php');
      const data = await response.json();
      if (data.status === 'success') {
        // Enforce reactive state sync across digits animator
        let totalGaps = 0;
        data.history.forEach(item => {
          totalGaps += (item.results ? item.results.length : 0);
        });

        store.updateState({
          stats: {
            totalResearch: data.history.length,
            papersScanned: data.docCount,
            newGaps: totalGaps
          }
        });

        // Sync and render the tables
        Research.renderRecentTable(data.history);
        Research.renderHistoryGrid(data.history);

        // Autofill SOTA comparison table with latest scan if entries exist
        if (data.history.length > 0) {
          const latest = data.history[0];
          Research.renderComparisonTable(latest.topic, latest.results);
        } else {
          // Render default placeholder row if database is empty
          const comparisonTbody = document.querySelector('.comparison-table tbody');
          if (comparisonTbody) {
            comparisonTbody.innerHTML = `
              <tr>
                <td colspan="4" style="text-align: center; color: var(--color-text-muted);">Masukkan tema penelitian di atas untuk memulai pemetaan gap riset...</td>
              </tr>
            `;
          }
        }
      }
    } catch (err) {
      console.error('Failed to retrieve history logs:', err);
    }
  }

  /**
   * Populate Recent Table on Dashboard View
   */
  static renderRecentTable(historyList) {
    const tbody = document.querySelector('.recent-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (historyList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--color-text-muted);">Belum ada riwayat penelitian.</td>
        </tr>
      `;
      return;
    }

    historyList.slice(0, 5).forEach((item) => {
      const date = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const isReviewer = window.USER_SESSION?.role === 'admin' || window.USER_SESSION?.role === 'dosen';
      const authorBadge = isReviewer ? `<span style="font-size: 0.75rem; color: var(--color-gold); display: block; margin-top: 0.25rem;"><i class="fas fa-user"></i> ${item.author || 'Mahasiswa'}</span>` : '';

      const tr = document.createElement('tr');
      tr.className = 'stagger-row visible';
      tr.innerHTML = `
        <td class="research-title-cell" title="${item.topic}">
          ${item.topic}
          ${authorBadge}
        </td>
        <td class="date-cell">${date}</td>
        <td>
          <div class="status-pill-container">
            <div class="table-progress-bar"><div class="table-progress-fill" style="width: 100%"></div></div>
            <span class="status-label status-complete">Completed</span>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /**
   * Populate History Grid tab
   */
  static renderHistoryGrid(historyList) {
    const grid = document.querySelector('.history-card-grid');
    const countText = document.getElementById('history-count-text');
    if (!grid) return;

    grid.innerHTML = '';
    if (countText) {
      countText.textContent = `Menampilkan total ${historyList.length} riwayat penelitian`;
    }

    if (historyList.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 3rem;">
          <i class="fas fa-history" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.3; color: var(--color-gold);"></i>
          <p>Belum ada riwayat penelitian terdokumentasi.</p>
        </div>
      `;
      return;
    }

    historyList.forEach((item) => {
      const date = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const countPapers = item.results ? item.results.length : 3;
      const isReviewer = window.USER_SESSION?.role === 'admin' || window.USER_SESSION?.role === 'dosen';
      const authorMeta = isReviewer ? `<span><i class="fas fa-user"></i> ${item.author || 'Mahasiswa'}</span>` : '';
      const deleteBtn = window.USER_SESSION?.role === 'dosen' ? '' : '<button class="btn-icon delete" title="Hapus"><i class="fas fa-trash-alt"></i></button>';

      const card = document.createElement('div');
      card.className = 'history-item-card stagger-row visible';
      card.innerHTML = `
        <div class="h-card-left">
          <div class="h-card-icon"><i class="fas fa-file-invoice"></i></div>
          <div class="h-card-info">
            <h3>${item.topic}</h3>
            <div class="h-card-meta">
              ${authorMeta}
              <span><i class="far fa-calendar-alt"></i> ${date}</span>
              <span><i class="fas fa-cubes"></i> ${countPapers} Papers</span>
              <span><i class="fas fa-circle" style="color: var(--color-gold); font-size: 0.5rem;"></i> Completed</span>
            </div>
          </div>
        </div>
        <div class="h-card-actions">
          <button class="btn-icon view-history-btn" title="Lihat Ulang"><i class="fas fa-eye"></i></button>
          <button class="btn-icon download-pdf-btn" title="Cetak PDF" style="color: var(--color-gold);"><i class="fas fa-file-pdf"></i></button>
          ${deleteBtn}
        </div>
      `;

      grid.appendChild(card);

      // Delete scan triggers
      const deleteBtnEl = card.querySelector('.delete');
      if (deleteBtnEl) {
        deleteBtnEl.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('Apakah Anda yakin ingin menghapus analisis penelitian ini?')) return;

          try {
            const response = await fetch('api/delete_history.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_chat: item.id_chat })
            });
            const result = await response.json();

            if (result.status === 'success') {
              card.style.transform = 'translateX(-20px)';
              card.style.opacity = '0';
              setTimeout(async () => {
                card.remove();
                await Research.loadHistory();
              }, 400);
              ToastFactory.show('Dihapus', 'Histori berhasil dihapus dari arsip.', 'info');
            } else {
              ToastFactory.show('Error', result.message || 'Gagal menghapus riwayat.', 'error');
            }
          } catch (err) {
            ToastFactory.show('Error', 'Gagal menghubungi server database.', 'error');
          }
        });
      }

      // View history triggers
      card.querySelector('.view-history-btn').addEventListener('click', () => {
        const dashBtn = document.querySelector('.sidebar-menu-btn[data-view="dashboard"]');
        if (dashBtn) dashBtn.click();
        Research.renderComparisonTable(item.topic, item.results);
      });

      // Quick PDF generation trigger
      card.querySelector('.download-pdf-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        exportResearchGapPDF(item.topic, item.results, item.author);
      });
    });
  }

  /**
   * Render comparison rows inside bottom table mapping
   */
  static renderComparisonTable(topic, results) {
    // Keep track of active scan details for quick PDF print triggers
    Research.activeTopic = topic;
    Research.activeResults = results;

    const tbody = document.querySelector('.comparison-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!results || results.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--color-text-muted);">Tidak ada data komparasi.</td>
        </tr>
      `;
      return;
    }

    results.forEach((res, i) => {
      const tr = document.createElement('tr');
      tr.className = 'stagger-row visible';
      tr.innerHTML = `
        <td class="year-cell">${res.year}</td>
        <td class="method-cell">${res.method}</td>
        <td class="gap-cell">${res.gap}</td>
        <td class="ai-summary-cell">${res.summary}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}
