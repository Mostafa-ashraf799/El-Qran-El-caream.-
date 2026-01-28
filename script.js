// Quran Audio Player with External Links
// script.js - النسخة المعدلة مع جميع القراء

// ============================================
// بيانات السور (مختصرة للذاكرة)
// ============================================
let surahsData = [];
let currentSurah = null;
let currentVerse = 1;
let currentReciter = "yasser-dosari"; // القارئ الافتراضي
let audioPlayer = null;
let isPlaying = false;
let isRepeating = false;
let currentPage = 1;
const totalPages = 604;

// ============================================
// روابط التسجيلات الخارجية - mp3quran.net
// ============================================
const AUDIO_SOURCES = {
    // ياسر الدوسري
    "yasser-dosari": {
        name: "ياسر الدوسري",
        baseUrl: "https://server8.mp3quran.net/dsry/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // عبد الباسط عبد الصمد (مرتل)
    "abdul-basit": {
        name: "عبد الباسط عبد الصمد",
        baseUrl: "https://server8.mp3quran.net/abdulbasit/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // محمود خليل الحصري (مرتل)
    "husary": {
        name: "محمود خليل الحصري",
        baseUrl: "https://server8.mp3quran.net/husr/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // سعد الغامدي (مجود)
    "saad": {
        name: "سعد الغامدي",
        baseUrl: "https://server8.mp3quran.net/saad/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // مشاري العفاسي (مجود)
    "afasy": {
        name: "مشاري العفاسي",
        baseUrl: "https://server8.mp3quran.net/afasy/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // المنشاوي (مرتل)
    "minshawi": {
        name: "محمد صديق المنشاوي (مرتل)",
        baseUrl: "https://server8.mp3quran.net/minsh/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // المنشاوي (مجود)
    "minshawi-mujawwad": {
        name: "المنشاوي (مجود)",
        baseUrl: "https://server8.mp3quran.net/minsh_mjwd/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // ماهر المعيقلي
    "maher": {
        name: "ماهر المعيقلي",
        baseUrl: "https://server8.mp3quran.net/maher/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // أحمد العجمي
    "ahmad-ajamy": {
        name: "أحمد العجمي",
        baseUrl: "https://server8.mp3quran.net/ajamy/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // محمد أيوب
    "mohammad-ayyoub": {
        name: "محمد أيوب",
        baseUrl: "https://server8.mp3quran.net/ayyoub/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // عبد الرحمن السديس
    "sudais": {
        name: "عبد الرحمن السديس",
        baseUrl: "https://server8.mp3quran.net/sudais/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // ناصر القطامي
    "nasser-alqatami": {
        name: "ناصر القطامي",
        baseUrl: "https://server8.mp3quran.net/qatami/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // علي جابر
    "ali-jaber": {
        name: "علي جابر",
        baseUrl: "https://server8.mp3quran.net/jbr/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    }
};

// ============================================
// روابط صور المصحف
// ============================================
const MUSHAF_IMAGES = {
    "uthmani": {
        baseUrl: "https://www.tanzil.net/docs/images/",
        format: "png",
        fullUrl: function(pageNum) {
            const pageStr = String(pageNum).padStart(3, '0');
            return `${this.baseUrl}${pageStr}.png`;
        }
    }
};

// ============================================
// التهيئة الرئيسية
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 جاري تحميل المصحف...');
    
    // إخفاء شاشة التحميل بعد 1.5 ثانية
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    }, 1500);
    
    // تهيئة مشغل الصوت
    audioPlayer = document.getElementById('quran-audio');
    
    // تحميل بيانات السور
    await loadSurahsData();
    
    // تهيئة الواجهة
    initializeUI();
    
    // تحميل سورة الفاتحة افتراضياً
    loadSurah(1);
    
    // إعداد الأحداث
    setupEventListeners();
    
    // تحميل الوضع الليلي/النهاري المحفوظ
    loadSavedTheme();
});

// ============================================
// تحميل بيانات السور
// ============================================
async function loadSurahsData() {
    try {
        // جلب البيانات من ملف JSON المحلي
        const response = await fetch('data/surahs.json');
        if (!response.ok) {
            throw new Error('لا يمكن تحميل بيانات السور');
        }
        surahsData = await response.json();
        console.log(`✅ تم تحميل بيانات ${surahsData.length} سورة`);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل بيانات السور:', error);
        // استخدام بيانات افتراضية
        loadDefaultSurahsData();
    }
}

// ============================================
// تحميل سورة
// ============================================
function loadSurah(surahId) {
    const surah = surahsData.find(s => s.id === surahId);
    if (!surah) {
        console.error('❌ السورة غير موجودة:', surahId);
        showToast('السورة غير موجودة', 'error');
        return;
    }
    
    currentSurah = surah;
    currentVerse = 1;
    
    // تحديث واجهة المستخدم
    updateSurahInfo(surah);
    
    // تحميل الصوت من الرابط الخارجي
    loadExternalAudio(surahId);
    
    // عرض الآيات
    displayVersesList();
    
    // تحميل التفسير
    loadTafseer();
    
    // حفظ آخر سورة تمت زيارتها
    localStorage.setItem('lastSurah', surahId);
    
    console.log(`📖 تم تحميل سورة ${surah.arabic_name}`);
}

// ============================================
// تحميل الصوت من رابط خارجي
// ============================================
function loadExternalAudio(surahId) {
    if (!audioPlayer) {
        console.error('❌ مشغل الصوت غير موجود');
        return;
    }
    
    // إيقاف التشغيل الحالي
    audioPlayer.pause();
    isPlaying = false;
    updatePlayButton();
    
    // الحصول على رابط الصوت
    const audioUrl = getAudioUrl(surahId, currentReciter);
    
    console.log(`🔊 جاري تحميل: ${audioUrl}`);
    
    // إضافة مؤشر تحميل
    showToast(`جاري تحميل سورة ${currentSurah ? currentSurah.arabic_name : '...'}`, 'info');
    
    // تعيين مصدر الصوت
    audioPlayer.src = audioUrl;
    
    // إعادة تعيين شريط التقدم
    const progressSlider = document.getElementById('progress-slider');
    const progressFill = document.getElementById('progress-fill');
    if (progressSlider) progressSlider.value = 0;
    if (progressFill) progressFill.style.width = '0%';
    
    // تحديث الوقت عند تحميل الملف
    audioPlayer.onloadedmetadata = function() {
        updateTimeDisplay();
        if (!isNaN(audioPlayer.duration) && progressSlider) {
            progressSlider.max = Math.floor(audioPlayer.duration);
        }
        showToast(`تم تحميل التلاوة (${formatTime(audioPlayer.duration)})`, 'success');
    };
    
    // في حالة الخطأ
    audioPlayer.onerror = function() {
        console.error('❌ خطأ في تحميل الصوت');
        showToast('تعذر تحميل التلاوة. جاري المحاولة بمصدر بديل...', 'error');
        
        // محاولة مصدر بديل
        setTimeout(() => {
            const backupUrl = getBackupAudioUrl(surahId, currentReciter);
            if (backupUrl && backupUrl !== audioUrl) {
                audioPlayer.src = backupUrl;
                showToast('جاري المحاولة بمصدر بديل...', 'info');
            }
        }, 2000);
    };
}

// ============================================
// الحصول على رابط الصوت الرئيسي
// ============================================
function getAudioUrl(surahId, reciterName) {
    const reciter = AUDIO_SOURCES[reciterName];
    if (!reciter) {
        console.warn(`❌ القارئ ${reciterName} غير متوفر، استخدام ياسر الدوسري`);
        return AUDIO_SOURCES["yasser-dosari"].fullUrl(surahId);
    }
    
    return reciter.fullUrl(surahId);
}

// ============================================
// الحصول على رابط صوت بديل
// ============================================
function getBackupAudioUrl(surahId, reciterName) {
    const surahNum = String(surahId).padStart(3, '0');
    
    // مصادر بديلة
    const backupSources = [
        `https://everyayah.com/data/${reciterName}/${surahNum}.mp3`,
        `https://download.quranicaudio.com/quran/${reciterName}/${surahNum}.mp3`,
        `https://cdn.islamic.network/quran/audio/128/${reciterName}/${surahNum}.mp3`
    ];
    
    return backupSources[0]; // العودة لأول مصدر
}

// ============================================
// تحديث معلومات السورة
// ============================================
function updateSurahInfo(surah) {
    const elements = {
        title: document.getElementById('current-surah-title'),
        name: document.getElementById('current-surah-name'),
        type: document.getElementById('surah-type'),
        count: document.getElementById('verse-count'),
        duration: document.getElementById('surah-duration'),
        selector: document.getElementById('surah-selector')
    };
    
    if (elements.title) elements.title.textContent = `المصحف الشريف - ${surah.arabic_name}`;
    if (elements.name) elements.name.textContent = `سورة ${surah.arabic_name}`;
    if (elements.type) elements.type.textContent = surah.type;
    if (elements.count) elements.count.textContent = surah.verses_count;
    if (elements.duration) elements.duration.textContent = surah.duration || "00:00";
    if (elements.selector) elements.selector.value = surah.id;
    
    // تحديث عنوان الصفحة
    document.title = `سورة ${surah.arabic_name} - القرآن الكريم مع التفسير`;
}

// ============================================
// عرض قائمة الآيات
// ============================================
function displayVersesList() {
    const versesList = document.getElementById('verses-list');
    if (!versesList) return;
    
    versesList.innerHTML = '';
    
    if (!currentSurah || !currentSurah.verses) return;
    
    currentSurah.verses.forEach(verse => {
        const verseItem = document.createElement('div');
        verseItem.className = 'verse-item';
        if (verse.verse_number === currentVerse) {
            verseItem.classList.add('active');
        }
        
        verseItem.innerHTML = `
            <span class="verse-num">${verse.verse_number}</span>
            <span class="verse-text">${verse.text}</span>
        `;
        
        verseItem.addEventListener('click', () => {
            // تحديث الآية النشطة
            document.querySelectorAll('.verse-item').forEach(item => {
                item.classList.remove('active');
            });
            verseItem.classList.add('active');
            
            // تحديث الآية الحالية
            currentVerse = verse.verse_number;
            updateCurrentVerseDisplay();
            
            // فتح النافذة المنبثقة
            openVerseModal(verse);
        });
        
        versesList.appendChild(verseItem);
    });
    
    // تحديث عرض الآية الحالية
    updateCurrentVerseDisplay();
}

// ============================================
// تحديث عرض الآية الحالية
// ============================================
function updateCurrentVerseDisplay() {
    if (!currentSurah || !currentSurah.verses) return;
    
    const verse = currentSurah.verses.find(v => v.verse_number === currentVerse);
    if (!verse) return;
    
    const verseNum = document.getElementById('current-verse-num');
    const verseText = document.getElementById('current-verse-text');
    const verseTranslation = document.getElementById('current-verse-translation');
    
    if (verseNum) verseNum.textContent = verse.verse_number;
    if (verseText) verseText.textContent = verse.text;
    if (verseTranslation) verseTranslation.textContent = verse.translation || '';
}

// ============================================
// تحميل التفسير
// ============================================
function loadTafseer() {
    const tafseerContent = document.getElementById('tafseer-content');
    if (!tafseerContent) return;
    
    tafseerContent.innerHTML = '';
    
    if (!currentSurah || !currentSurah.verses) return;
    
    const sourceId = document.getElementById('tafseer-source') ? document.getElementById('tafseer-source').value : "1";
    const sourceName = getTafseerSourceName(sourceId);
    
    // عرض أول 10 آيات فقط (لتحسين الأداء)
    const versesToShow = currentSurah.verses.slice(0, Math.min(10, currentSurah.verses.length));
    
    versesToShow.forEach(verse => {
        const tafseerItem = document.createElement('div');
        tafseerItem.className = 'tafseer-item';
        
        tafseerItem.innerHTML = `
            <h4>
                <i class="fas fa-verse"></i>
                الآية ${verse.verse_number}
                <span class="verse-ref">${currentSurah.arabic_name}:${verse.verse_number}</span>
            </h4>
            <p class="arabic-text">${verse.text}</p>
            <p class="tafseer-text"><strong>${sourceName}:</strong> ${verse.tafseer || 'يتم تحميل التفسير...'}</p>
        `;
        
        tafseerContent.appendChild(tafseerItem);
    });
}

// ============================================
// إعداد واجهة المستخدم
// ============================================
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
        
        Object.keys(AUDIO_SOURCES).forEach(reciterKey => {
            const option = document.createElement('option');
            option.value = reciterKey;
            option.textContent = AUDIO_SOURCES[reciterKey].name;
            reciterSelector.appendChild(option);
        });
        
        // تعيين القارئ الافتراضي
        reciterSelector.value = currentReciter;
    }
    
    // إعداد شريط التقدم
    setupProgressBar();
    
    // تحديث الوقت العرضي
    setInterval(updateTimeDisplay, 1000);
}

// ============================================
// إعداد مستمعي الأحداث
// ============================================
function setupEventListeners() {
    // تغيير السورة
    const surahSelector = document.getElementById('surah-selector');
    if (surahSelector) {
        surahSelector.addEventListener('change', function() {
            const surahId = parseInt(this.value);
            if (surahId) {
                loadSurah(surahId);
            }
        });
    }
    
    // تغيير القارئ
    const reciterSelector = document.getElementById('reciter-selector');
    if (reciterSelector) {
        reciterSelector.addEventListener('change', function() {
            currentReciter = this.value;
            if (currentSurah) {
                loadExternalAudio(currentSurah.id);
                const reciterName = AUDIO_SOURCES[currentReciter] ? AUDIO_SOURCES[currentReciter].name : currentReciter;
                showToast(`تم التغيير إلى ${reciterName}`, 'success');
            }
        });
    }
    
    // زر التشغيل/الإيقاف
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', togglePlayback);
    }
    
    // التحكم في الصوت
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            if (audioPlayer) {
                audioPlayer.volume = this.value;
            }
        });
    }
    
    // السورة السابقة
    const prevBtn = document.getElementById('prev-surah-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentSurah && currentSurah.id > 1) {
                loadSurah(currentSurah.id - 1);
            }
        });
    }
    
    // السورة التالية
    const nextBtn = document.getElementById('next-surah-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentSurah && currentSurah.id < surahsData.length) {
                loadSurah(currentSurah.id + 1);
            }
        });
    }
    
    // البحث في الآيات
    const searchInput = document.getElementById('verse-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim().toLowerCase();
            const verseItems = document.querySelectorAll('.verse-item');
            
            verseItems.forEach(item => {
                const verseText = item.querySelector('.verse-text').textContent.toLowerCase();
                if (verseText.includes(searchTerm) || searchTerm === '') {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // التنقل بين الأقسام
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // تحديث الروابط النشطة
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.remove('active');
            });
            this.classList.add('active');
            
            // إظهار/إخفاء الأقسام
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const sectionId = this.dataset.section + '-section';
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // كتم الصوت
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            if (!audioPlayer) return;
            audioPlayer.muted = !audioPlayer.muted;
            
            const icon = this.querySelector('i');
            if (audioPlayer.muted) {
                icon.className = 'fas fa-volume-mute';
                this.title = 'إعادة الصوت';
                showToast('تم كتم الصوت', 'info');
            } else {
                icon.className = 'fas fa-volume-up';
                this.title = 'كتم الصوت';
                showToast('تم إعادة الصوت', 'info');
            }
        });
    }
    
    // التكرار
    const repeatBtn = document.getElementById('repeat-btn');
    if (repeatBtn) {
        repeatBtn.addEventListener('click', function() {
            isRepeating = !isRepeating;
            
            const icon = this.querySelector('i');
            if (isRepeating) {
                icon.style.color = 'var(--primary-color)';
                this.title = 'إيقاف التكرار';
                showToast('تم تفعيل وضع التكرار', 'info');
            } else {
                icon.style.color = '';
                this.title = 'تكرار الآية الحالية';
                showToast('تم إيقاف وضع التكرار', 'info');
            }
        });
    }
    
    // التراجع والتقديم
    const rewindBtn = document.getElementById('rewind-btn');
    if (rewindBtn) {
        rewindBtn.addEventListener('click', function() {
            if (!audioPlayer) return;
            audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
        });
    }
    
    const forwardBtn = document.getElementById('forward-btn');
    if (forwardBtn) {
        forwardBtn.addEventListener('click', function() {
            if (!audioPlayer) return;
            if (!isNaN(audioPlayer.duration)) {
                audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
            }
        });
    }
}

// ============================================
// دوال المساعدة
// ============================================
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getTafseerSourceName(sourceId) {
    const sources = {
        "1": "التفسير الميسر",
        "2": "تفسير السعدي",
        "3": "تفسير ابن كثير",
        "4": "التفسير الوسيط"
    };
    return sources[sourceId] || "التفسير الميسر";
}

function togglePlayback() {
    if (!audioPlayer) {
        showToast('مشغل الصوت غير جاهز', 'error');
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        // محاولة التشغيل
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('❌ خطأ في تشغيل الصوت:', error);
                showToast('تعذر تشغيل الصوت. تأكد من اتصال الإنترنت.', 'error');
                isPlaying = false;
                updatePlayButton();
            });
        }
    }
    
    isPlaying = !isPlaying;
    updatePlayButton();
}

function updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (!playBtn) return;
    
    const playIcon = playBtn.querySelector('i');
    if (!playIcon) return;
    
    if (isPlaying) {
        playIcon.className = 'fas fa-pause';
        playBtn.title = 'إيقاف مؤقت';
    } else {
        playIcon.className = 'fas fa-play';
        playBtn.title = 'تشغيل';
    }
}

function updateTimeDisplay() {
    if (!audioPlayer) return;
    
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const progressSlider = document.getElementById('progress-slider');
    const progressFill = document.getElementById('progress-fill');
    
    // الوقت الحالي
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
    
    // الوقت الكلي
    if (totalTimeEl && !isNaN(audioPlayer.duration)) {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }
    
    // شريط التقدم
    if (progressSlider && progressFill && !isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressSlider.value = progress;
        progressFill.style.width = `${progress}%`;
    }
}

function setupProgressBar() {
    const progressSlider = document.getElementById('progress-slider');
    if (!progressSlider) return;
    
    progressSlider.addEventListener('input', function() {
        if (!audioPlayer || isNaN(audioPlayer.duration)) return;
        
        const seekTime = (this.value / 100) * audioPlayer.duration;
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${this.value}%`;
        }
        
        // تحديث الوقت المعروض
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(seekTime);
        }
    });
    
    progressSlider.addEventListener('change', function() {
        if (!audioPlayer || isNaN(audioPlayer.duration)) return;
        
        const seekTime = (this.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });
}

function showToast(message, type = 'info') {
    // إنشاء عنصر Toast إذا لم يكن موجوداً
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateX(100px);
        transition: opacity 0.3s, transform 0.3s;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    toastContainer.appendChild(toast);
    
    // إظهار
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // إخفاء بعد 3 ثوان
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (savedTheme === 'dark' && themeToggle) {
        document.documentElement.setAttribute('data-theme', 'dark');
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-sun';
        }
        themeToggle.title = 'تفعيل الوضع النهاري';
    }
}

// ============================================
// فتح نافذة الآية المنبثقة
// ============================================
function openVerseModal(verse) {
    const modal = document.getElementById('verse-modal');
    const modalVerseTitle = document.getElementById('modal-verse-title');
    const modalVerseText = document.getElementById('modal-verse-text');
    const modalTafseerText = document.getElementById('modal-tafseer-text');
    
    if (!modal || !modalVerseTitle || !modalVerseText || !modalTafseerText) return;
    
    modalVerseTitle.textContent = `الآية ${verse.verse_number} - سورة ${currentSurah.arabic_name}`;
    modalVerseText.textContent = verse.text;
    modalTafseerText.textContent = verse.tafseer || 'يتم تحميل التفسير...';
    
    modal.style.display = 'flex';
    
    // إغلاق النافذة
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        modalCloseBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    // تشغيل الآية
    const modalPlayBtn = document.getElementById('modal-play-btn');
    if (modalPlayBtn) {
        modalPlayBtn.onclick = function() {
            if (audioPlayer) {
                audioPlayer.play().catch(e => {
                    console.error('❌ خطأ في تشغيل الصوت:', e);
                    showToast('تعذر تشغيل الصوت', 'error');
                });
                isPlaying = true;
                updatePlayButton();
            }
            modal.style.display = 'none';
        };
    }
    
    // إغلاق عند النقر خارج النافذة
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// ============================================
// بيانات افتراضية للسور
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
                    "tafseer": "البدء بذكر اسم الله تعالى، وهو الاستعانة به في كل أمر. الرحمن: ذو الرحمة الواسعة لجميع الخلق. الرحيم: ذو الرحمة الخاصة بالمؤمنين."
                }
            ]
        }
    ];
}

// ============================================
// أحداث مشغل الصوت
// ============================================
if (audioPlayer) {
    audioPlayer.addEventListener('play', function() {
        isPlaying = true;
        updatePlayButton();
        console.log('▶️ تشغيل الصوت');
    });
    
    audioPlayer.addEventListener('pause', function() {
        isPlaying = false;
        updatePlayButton();
        console.log('⏸️ إيقاف الصوت');
    });
    
    audioPlayer.addEventListener('ended', function() {
        isPlaying = false;
        updatePlayButton();
        if (isRepeating) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
            showToast('جاري تكرار التلاوة', 'info');
        } else {
            showToast('تم الانتهاء من التلاوة', 'success');
        }
    });
}

console.log('✅ Quran Player initialized successfully with Yasser Al-Dosari support!');
