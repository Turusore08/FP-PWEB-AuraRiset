// --- AI GAP SCANNER & UPLOAD ENGINE FEATURE ---

import { events } from '../core/events.js';
import { store } from '../core/store.js';
import { ToastFactory } from '../components/toast.js';

// Simulated Research Database
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
    
    // Expose injectNewResults globally so that view click handlers from the history tab can invoke it
    window.injectNewResults = Research.injectNewResults;
  }

  /**
   * Initialize Drag & Drop PDF Uploader
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

      let progress = 0;
      const uploadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(uploadInterval);
          ToastFactory.show('Success', 'File berhasil diunggah. Mulai analisis...', 'success');
          
          setTimeout(() => {
            progressContainer.style.display = 'none';
            Research.runAIScanner(file.name.replace('.pdf', ''));
          }, 800);
        }
        progressBarFill.style.width = `${progress}%`;
        progressPercent.textContent = `${progress}%`;
      }, 100);
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
   * Simulated AI scanner overlay overlay
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

    // Emit event that scanning has started (Observer Pattern Event)
    events.publish('research:started', topicName);

    const steps = [
      { text: "Menginisiasi analisis kesenjangan pustaka...", percent: 15, delay: 800, log: "Initializing research pipeline...", type: "info" },
      { text: "Mengekstrak konsep kunci dan relasi taksonomi...", percent: 35, delay: 1500, log: `Concept extraction started for: "${topicName}"`, type: "info" },
      { text: "Mencocokkan paper terindex dari IEEE, ACM, dan Scopus...", percent: 60, delay: 2400, log: "Scraping databases... 42 relevant papers retrieved.", type: "success" },
      { text: "Mengalkulasi matriks perbedaan metode...", percent: 80, delay: 3500, log: "Cross-referencing methods & year of publications...", type: "info" },
      { text: "Merumuskan OpenAI Integrated Summary...", percent: 95, delay: 4600, log: "Querying OpenAI API model for research gap synthesis...", type: "success" },
      { text: "Analisis berhasil dituntaskan!", percent: 100, delay: 5500, log: "System success! Writing results to local dashboard database.", type: "success" }
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
          setTimeout(() => {
            overlay.classList.remove('open');
            Research.injectNewResults(topicName);
            ToastFactory.show('Sukses', 'Analisis gap selesai ditambahkan ke dashboard!', 'success');
          }, 1000);
        }
      }, step.delay);
    });
  }

  /**
   * Injecting matching topic results into DOM tables and structures.
   * Handles local DOM injection, State Store modifications, and Event Publishes.
   */
  static injectNewResults(topicName) {
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

    // 1. Update Histori Terbaru Table
    const historyTbody = document.querySelector('.recent-table tbody');
    if (historyTbody) {
      const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const tr = document.createElement('tr');
      tr.className = 'stagger-row stagger-init';
      tr.innerHTML = `
        <td class="research-title-cell" title="${match.topic}">${match.topic}</td>
        <td class="date-cell">${today}</td>
        <td>
          <div class="status-pill-container">
            <div class="table-progress-bar"><div class="table-progress-fill" style="width: 100%"></div></div>
            <span class="status-label status-complete">Completed</span>
          </div>
        </td>
      `;
      historyTbody.insertBefore(tr, historyTbody.firstChild);
      setTimeout(() => tr.classList.add('visible'), 50);

      if (historyTbody.children.length > 5) {
        historyTbody.removeChild(historyTbody.lastChild);
      }
    }

    // 2. Update Table Perbandingan Paper
    const comparisonTbody = document.querySelector('.comparison-table tbody');
    if (comparisonTbody) {
      comparisonTbody.innerHTML = '';
      match.results.forEach((res, i) => {
        const tr = document.createElement('tr');
        tr.className = 'stagger-row stagger-init';
        tr.innerHTML = `
          <td class="year-cell">${res.year}</td>
          <td class="method-cell">${res.method}</td>
          <td class="gap-cell">${res.gap}</td>
          <td class="ai-summary-cell">${res.summary}</td>
        `;
        comparisonTbody.appendChild(tr);
        setTimeout(() => tr.classList.add('visible'), (i + 1) * 150);
      });
    }

    // 3. Update Histori View List tab
    const historyCardGrid = document.querySelector('.history-card-grid');
    if (historyCardGrid) {
      const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const countRand = Math.floor(Math.random() * 4) + 3;

      const card = document.createElement('div');
      card.className = 'history-item-card stagger-row stagger-init';
      card.innerHTML = `
        <div class="h-card-left">
          <div class="h-card-icon"><i class="fas fa-file-invoice"></i></div>
          <div class="h-card-info">
            <h3>${match.topic}</h3>
            <div class="h-card-meta">
              <span><i class="far fa-calendar-alt"></i> ${today}</span>
              <span><i class="fas fa-cubes"></i> ${countRand} Papers</span>
              <span><i class="fas fa-circle" style="color: var(--color-gold); font-size: 0.5rem;"></i> Completed</span>
            </div>
          </div>
        </div>
        <div class="h-card-actions">
          <button class="btn-icon view-history-btn" title="Lihat Ulang"><i class="fas fa-eye"></i></button>
          <button class="btn-icon delete" title="Hapus"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;

      historyCardGrid.insertBefore(card, historyCardGrid.firstChild);
      setTimeout(() => card.classList.add('visible'), 50);

      // Bind Hapus trigger
      card.querySelector('.delete').addEventListener('click', (e) => {
        e.stopPropagation();
        card.style.transform = 'translateX(-20px)';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 400);
        ToastFactory.show('Dihapus', 'Histori berhasil dihapus dari arsip.', 'info');
        
        // Dec stats gap via Central State Store
        const currentStats = store.getState().stats;
        store.updateState({
          stats: { newGaps: Math.max(0, currentStats.newGaps - 1) }
        });
      });

      // Bind Lihat Ulang trigger
      card.querySelector('.view-history-btn').addEventListener('click', () => {
        const dashBtn = document.querySelector('.sidebar-menu-btn[data-view="dashboard"]');
        if (dashBtn) dashBtn.click();
        Research.injectNewResults(match.topic);
      });
    }

    // 4. Update Stats variables in Central Store (Reactive Store notifies events)
    const currentStats = store.getState().stats;
    store.updateState({
      stats: {
        totalResearch: currentStats.totalResearch + 1,
        papersScanned: currentStats.papersScanned + 3,
        newGaps: currentStats.newGaps + 1
      }
    });

    // Emit event that research is completed (Observer Pattern Event)
    events.publish('research:completed', match);
  }
}
