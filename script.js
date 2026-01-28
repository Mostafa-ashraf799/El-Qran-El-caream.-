// Quran Audio Player - Direct Links Version
// ============================================

let surahsData = [];
let currentSurah = null;
let currentVerse = 1;
let currentReciter = "yasser-dosari";
let audioPlayer = null;
let isPlaying = false;

// ============================================
// روابط مباشرة لجميع السور (114 سورة)
// ============================================
const DIRECT_AUDIO_LINKS = {
    // ياسر الدوسري - جميع السور
    "yasser-dosari": {
        name: "ياسر الدوسري",
        surahs: {}
    },
    
    // عبد الباسط عبد الصمد - جميع السور
    "abdul-basit": {
        name: "عبد الباسط عبد الصمد",
        surahs: {}
    },
    
    // محمود خليل الحصري - جميع السور
    "husary": {
        name: "محمود خليل الحصري",
        surahs: {}
    },
    
    // سعد الغامدي - جميع السور
    "saad": {
        name: "سعد الغامدي",
        surahs: {}
    },
    
    // مشاري العفاسي - جميع السور
    "afasy": {
        name: "مشاري العفاسي",
        surahs: {}
    },
    
    // محمد صديق المنشاوي
    "minshawi": {
        name: "محمد صديق المنشاوي",
        surahs: {}
    },
    
    // ماهر المعيقلي
    "maher": {
        name: "ماهر المعيقلي",
        surahs: {}
    },
    
    // أحمد العجمي
    "ahmad-ajamy": {
        name: "أحمد العجمي",
        surahs: {}
    }
};

// ============================================
// تعبئة الروابط تلقائياً لجميع السور
// ============================================
function initializeAudioLinks() {
    const baseUrls = {
        "yasser-dosari": "https://server8.mp3quran.net/dsry/",
        "abdul-basit": "https://server8.mp3quran.net/abdulbasit/",
        "husary": "https://server8.mp3quran.net/husr/",
        "saad": "https://server8.mp3quran.net/saad/",
        "afasy": "https://server8.mp3quran.net/afasy/",
        "minshawi": "https://server8.mp3quran.net/minsh/",
        "maher": "https://server8.mp3quran.net/maher/",
        "ahmad-ajamy": "https://server8.mp3quran.net/ajamy/"
    };
    
    // تعبئة روابط جميع السور لكل قارئ
    for (const [reciter, baseUrl] of Object.entries(baseUrls)) {
        for (let surahId = 1; surahId <= 114; surahId++) {
            const surahNum = String(surahId).padStart(3, '0');
            DIRECT_AUDIO_LINKS[reciter].surahs[surahId] = `${baseUrl}${surahNum}.mp3`;
        }
    }
    
    console.log("✅ تم تحميل روابط جميع السور (114 سورة × 8 قراء)");
}

// ============================================
// روابط مباشرة لصور المصحف (604 صفحة)
// ============================================
const DIRECT_IMAGE_LINKS = {};

// تعبئة روابط صور المصحف
function initializeImageLinks() {
    // صور المصحف من Tanzil (604 صفحة)
    for (let page = 1; page <= 604; page++) {
        const pageNum = String(page).padStart(3, '0');
        DIRECT_IMAGE_LINKS[page] = `https://www.tanzil.net/docs/images/${pageNum}.png`;
    }
    
    console.log("✅ تم تحميل روابط صور المصحف (604 صفحة)");
}

// ============================================
// الحصول على رابط الصوت المباشر
// ============================================
function getDirectAudioUrl(surahId, reciterName) {
    // التحقق من وجود القارئ
    if (!DIRECT_AUDIO_LINKS[reciterName]) {
        console.warn(`القارئ ${reciterName} غير متوفر، استخدام ياسر الدوسري`);
        reciterName = "yasser-dosari";
    }
    
    // التحقق من وجود السورة
    if (!DIRECT_AUDIO_LINKS[reciterName].surahs[surahId]) {
        console.warn(`السورة ${surahId} غير متوفرة للقارئ ${reciterName}`);
        // استخدام رابط بديل
        return `https://server8.mp3quran.net/${reciterName}/${String(surahId).padStart(3, '0')}.mp3`;
    }
    
    return DIRECT_AUDIO_LINKS[reciterName].surahs[surahId];
}

// ============================================
// الحصول على رابط الصورة المباشر
// ============================================
function getDirectImageUrl(pageNum) {
    if (DIRECT_IMAGE_LINKS[pageNum]) {
        return DIRECT_IMAGE_LINKS[pageNum];
    }
    
    // رابط بديل إذا لم توجد الصورة
    const pageStr = String(pageNum).padStart(3, '0');
    return `https://cdn.islamic.network/quran/images/${pageStr}.png`;
}

// ============================================
// تحميل سورة مع الصوت المباشر
// ============================================
function loadSurahWithDirectAudio(surahId) {
    if (!currentSurah || currentSurah.id !== surahId) {
        const surah = surahsData.find(s => s.id === surahId);
        if (!surah) {
            console.error("السورة غير موجودة:", surahId);
            return;
        }
        currentSurah = surah;
    }
    
    // الحصول على الرابط المباشر للصوت
    const audioUrl = getDirectAudioUrl(surahId, currentReciter);
    
    console.log(`🎵 تحميل الصوت من: ${audioUrl}`);
    
    // تحميل الصوت
    if (audioPlayer) {
        audioPlayer.src = audioUrl;
        audioPlayer.load();
        
        // إضافة حدث عند تحميل الصوت
        audioPlayer.oncanplaythrough = function() {
            console.log("✅ الصوت جاهز للتشغيل");
            showToast(`تم تحميل سورة ${currentSurah.arabic_name}`, "success");
        };
        
        // حدث عند الخطأ
        audioPlayer.onerror = function() {
            console.error("❌ خطأ في تحميل الصوت");
            showToast("تعذر تحميل الصوت، جاري المحاولة بمصدر بديل", "error");
            
            // محاولة مصدر بديل
            setTimeout(() => {
                const backupUrl = `https://everyayah.com/data/${currentReciter}/${String(surahId).padStart(3, '0')}.mp3`;
                audioPlayer.src = backupUrl;
            }, 1000);
        };
    }
    
    // تحديث واجهة المستخدم
    updateSurahInfo(currentSurah);
    updateCurrentVerseDisplay();
}

// ============================================
// تحميل صفحة مصحف مباشرة
// ============================================
function loadMushafPageDirect(pageNum) {
    if (pageNum < 1 || pageNum > 604) return;
    
    currentPage = pageNum;
    
    // تحديث عناصر واجهة المستخدم
    const currentPageEl = document.getElementById('current-page');
    const pageSlider = document.getElementById('page-slider');
    const pageJumpInput = document.getElementById('page-jump-input');
    
    if (currentPageEl) currentPageEl.textContent = pageNum;
    if (pageSlider) pageSlider.value = pageNum;
    if (pageJumpInput) pageJumpInput.value = pageNum;
    
    // الحصول على رابط الصورة المباشر
    const imageUrl = getDirectImageUrl(pageNum);
    const mushafImage = document.getElementById('mushaf-image');
    
    if (mushafImage) {
        // إضافة مؤشر تحميل
        mushafImage.style.opacity = "0.5";
        mushafImage.src = imageUrl;
        
        // عند تحميل الصورة
        mushafImage.onload = function() {
            mushafImage.style.opacity = "1";
            console.log(`🖼️ تم تحميل صفحة المصحف ${pageNum}`);
        };
        
        // عند حدوث خطأ
        mushafImage.onerror = function() {
            console.warn(`⚠️ خطأ في تحميل الصورة ${pageNum}، استخدام صورة بديلة`);
            mushafImage.src = `https://via.placeholder.com/800x1200/0a5c36/ffffff?text=صفحة+${pageNum}`;
        };
    }
}

// ============================================
// التهيئة الرئيسية
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log("🚀 بدء تحميل المصحف الشريف...");
    
    // إخفاء شاشة التحميل
    setTimeout(() => {
        const loading = document.getElementById('loading');
        const mainContent = document.getElementById('main-content');
        if (loading) loading.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
    }, 1500);
    
    // تهيئة الروابط المباشرة
    initializeAudioLinks();
    initializeImageLinks();
    
    // تهيئة مشغل الصوت
    audioPlayer = document.getElementById('quran-audio');
    if (!audioPlayer) {
        console.error("❌ عنصر مشغل الصوت غير موجود!");
        audioPlayer = document.createElement('audio');
        audioPlayer.id = 'quran-audio';
        document.body.appendChild(audioPlayer);
    }
    
    // تحميل بيانات السور
    await loadSurahsData();
    
    // تهيئة الواجهة
    initializeUI();
    
    // تحميل سورة من الرابط إذا كان موجوداً
    const urlParams = new URLSearchParams(window.location.search);
    const surahParam = urlParams.get('surah');
    const reciterParam = urlParams.get('reciter');
    
    if (surahParam) {
        const surahId = parseInt(surahParam);
        if (surahId >= 1 && surahId <= 114) {
            if (reciterParam && DIRECT_AUDIO_LINKS[reciterParam]) {
                currentReciter = reciterParam;
            }
            loadSurahWithDirectAudio(surahId);
        } else {
            loadSurahWithDirectAudio(1); // الفاتحة افتراضياً
        }
    } else {
        loadSurahWithDirectAudio(1); // الفاتحة افتراضياً
    }
    
    // إعداد الأحداث
    setupEventListeners();
    
    console.log("✅ تم تهيئة مشغل القرآن بنجاح!");
});

// ============================================
// دوال المساعدة
// ============================================
async function loadSurahsData() {
    try {
        const response = await fetch('data/surahs.json');
        if (response.ok) {
            surahsData = await response.json();
            console.log(`📖 تم تحميل بيانات ${surahsData.length} سورة`);
        } else {
            throw new Error('فشل تحميل البيانات');
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل بيانات السور:", error);
        loadDefaultSurahsData();
    }
}

function updateSurahInfo(surah) {
    // تحديث معلومات السورة في الواجهة
    const elements = {
        'current-surah-title': `المصحف الشريف - ${surah.arabic_name}`,
        'current-surah-name': `سورة ${surah.arabic_name}`,
        'surah-type': surah.type,
        'verse-count': surah.verses_count,
        'surah-duration': surah.duration || "00:00"
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    // تحديث عنوان الصفحة
    document.title = `سورة ${surah.arabic_name} - القرآن الكريم`;
}

function updateCurrentVerseDisplay() {
    if (!currentSurah || !currentSurah.verses) return;
    
    const verse = currentSurah.verses.find(v => v.verse_number === currentVerse);
    if (!verse) return;
    
    const verseNumEl = document.getElementById('current-verse-num');
    const verseTextEl = document.getElementById('current-verse-text');
    const verseTransEl = document.getElementById('current-verse-translation');
    
    if (verseNumEl) verseNumEl.textContent = verse.verse_number;
    if (verseTextEl) verseTextEl.textContent = verse.text;
    if (verseTransEl) verseTransEl.textContent = verse.translation || '';
}

function initializeUI() {
    // تعبئة قائمة السور
    const surahSelector = document.getElementById('surah-selector');
    if (surahSelector) {
        surahSelector.innerHTML = '<option value="">اختر سورة للاستماع</option>';
        surahsData.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.id;
            option.textContent = `${surah.id}. ${surah.arabic_name} (${surah.verses_count} آية)`;
            surahSelector.appendChild(option);
        });
    }
    
    // تعبئة قائمة القراء
    const reciterSelector = document.getElementById('reciter-selector');
    if (reciterSelector) {
        reciterSelector.innerHTML = '';
        Object.entries(DIRECT_AUDIO_LINKS).forEach(([key, reciter]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = reciter.name;
            reciterSelector.appendChild(option);
        });
        reciterSelector.value = currentReciter;
    }
}

function setupEventListeners() {
    // تغيير السورة
    const surahSelector = document.getElementById('surah-selector');
    if (surahSelector) {
        surahSelector.addEventListener('change', function() {
            const surahId = parseInt(this.value);
            if (surahId) {
                loadSurahWithDirectAudio(surahId);
            }
        });
    }
    
    // تغيير القارئ
    const reciterSelector = document.getElementById('reciter-selector');
    if (reciterSelector) {
        reciterSelector.addEventListener('change', function() {
            currentReciter = this.value;
            if (currentSurah) {
                loadSurahWithDirectAudio(currentSurah.id);
                showToast(`تم التغيير إلى ${DIRECT_AUDIO_LINKS[currentReciter].name}`, "success");
            }
        });
    }
    
    // زر التشغيل/الإيقاف
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            if (!audioPlayer) return;
            
            if (isPlaying) {
                audioPlayer.pause();
                isPlaying = false;
            } else {
                audioPlayer.play()
                    .then(() => {
                        isPlaying = true;
                        console.log("▶️ بدء التشغيل");
                    })
                    .catch(error => {
                        console.error("❌ خطأ في التشغيل:", error);
                        showToast("تعذر تشغيل الصوت", "error");
                    });
            }
            
            updatePlayButton();
        });
    }
    
    // صفحات المصحف
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageSlider = document.getElementById('page-slider');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => loadMushafPageDirect(currentPage - 1));
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => loadMushafPageDirect(currentPage + 1));
    }
    
    if (pageSlider) {
        pageSlider.addEventListener('input', function() {
            const pageNum = parseInt(this.value);
            if (!isNaN(pageNum)) {
                loadMushafPageDirect(pageNum);
            }
        });
    }
}

function updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (!playBtn) return;
    
    const icon = playBtn.querySelector('i');
    if (!icon) return;
    
    if (isPlaying) {
        icon.className = 'fas fa-pause';
        playBtn.title = 'إيقاف مؤقت';
    } else {
        icon.className = 'fas fa-play';
        playBtn.title = 'تشغيل';
    }
}

function showToast(message, type = "info") {
    // إنشاء عنصر Toast
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // إخفاء بعد 3 ثوان
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ============================================
// CSS للـ Toast
// ============================================
const toastCSS = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

// إضافة CSS للصفحة
const style = document.createElement('style');
style.textContent = toastCSS;
document.head.appendChild(style);

// ============================================
// بيانات افتراضية
// ============================================
function loadDefaultSurahsData() {
    surahsData = [
        {
            "id": 1,
            "name": "الفاتحة",
            "arabic_name": "الفاتحة",
            "english_name": "Al-Fatiha",
            "type": "مكية",
            "verses_count": 7,
            "duration": "03:45",
            "revelation_order": 5,
            "meaning": "الفاتحة (أم القرآن)",
            "description": "أول سورة في القرآن، تسمى أم الكتاب والسبع المثاني، يجب قراءتها في كل ركعة من الصلاة.",
            "verses": [
                {
                    "id": 1,
                    "surah_id": 1,
                    "verse_number": 1,
                    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                    "translation": "بسم الله الرحمن الرحيم",
                    "tafseer": "البدء بذكر اسم الله تعالى، وهو الاستعانة به في كل أمر..."
                }
            ]
        }
    ];
}
