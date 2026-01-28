// Quran Audio Player with External Links
// script.js - النسخة المعدلة

// ============================================
// بيانات السور (مختصرة للذاكرة)
// ============================================
let surahsData = [];
let currentSurah = null;
let currentVerse = 1;
let currentReciter = "abdul-basit"; // القارئ الافتراضي
let audioPlayer = null;
let isPlaying = false;
let isRepeating = false;
let currentPage = 1;
const totalPages = 604;

// ============================================
// روابط التسجيلات الخارجية
// ============================================
const AUDIO_SOURCES = {
    // عبد الباسط عبد الصمد (مرتل)
    "abdul-basit": {
        baseUrl: "https://server8.mp3quran.net/abdulbasit/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // محمود خليل الحصري (مرتل)
    "husary": {
        baseUrl: "https://server8.mp3quran.net/husr/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // سعد الغامدي (مجود)
    "saad": {
        baseUrl: "https://server8.mp3quran.net/saad/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // مشاري العفاسي (مجود)
    "afasy": {
        baseUrl: "https://server8.mp3quran.net/afasy/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // المنشاوي (مرتل)
    "minshawi": {
        baseUrl: "https://server8.mp3quran.net/minsh/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    },
    
    // محمد صديق المنشاوي (مجود)
    "minshawi-mujawwad": {
        baseUrl: "https://server8.mp3quran.net/minsh_mjwd/",
        format: "mp3",
        fullUrl: function(surahId) {
            const surahNum = String(surahId).padStart(3, '0');
            return `${this.baseUrl}${surahNum}.mp3`;
        }
    }
};

// ============================================
// روابط صور المصحف (يمكن تغييرها)
// ============================================
const MUSHAF_IMAGES = {
    // المصحف العثماني
    "uthmani": {
        baseUrl: "https://www.tanzil.net/docs/images/",
        format: "png",
        fullUrl: function(pageNum) {
            const pageStr = String(pageNum).padStart(3, '0');
            return `${this.baseUrl}${pageStr}.png`;
        }
    },
    
    // مصحف المدينة المنورة
    "madina": {
        baseUrl: "https://cdn.islamic.network/quran/images/",
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
    console.log('جاري تحميل المصحف...');
    
    // إخفاء شاشة التحميل بعد 2 ثانية
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }, 2000);
    
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
        // جلب البيانات من ملف JSON المحلي (صغير الحجم)
        const response = await fetch('data/surahs.json');
        if (!response.ok) {
            throw new Error('لا يمكن تحميل بيانات السور');
        }
        surahsData = await response.json();
        console.log(`✅ تم تحميل بيانات ${surahsData.length} سورة`);
        
        // محاولة تحميل سورة من الرابط
        loadSurahFromURL();
        
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
    
    // تحديث صفحة المصحف
    updateMushafPage(1);
    
    // حفظ آخر سورة تمت زيارتها
    localStorage.setItem('lastSurah', surahId);
}

// ============================================
// تحميل الصوت من رابط خارجي
// ============================================
function loadExternalAudio(surahId) {
    if (!audioPlayer) return;
    
    // إيقاف التشغيل الحالي
    audioPlayer.pause();
    isPlaying = false;
    updatePlayButton();
    
    // الحصول على رابط الصوت حسب القارئ المختار
    const audioUrl = getAudioUrl(surahId, currentReciter);
    
    console.log(`🔊 جاري تحميل الصوت من: ${audioUrl}`);
    
    // تعيين مصدر الصوت
    audioPlayer.src = audioUrl;
    
    // إعادة تعيين شريط التقدم
    document.getElementById('progress-slider').value = 0;
    document.getElementById('progress-fill').style.width = '0%';
    
    // تحديث الوقت عند تحميل الملف
    audioPlayer.addEventListener('loadedmetadata', function() {
        updateTimeDisplay();
        if (!isNaN(audioPlayer.duration)) {
            document.getElementById('progress-slider').max = Math.floor(audioPlayer.duration);
        }
    });
    
    // تحديث الوقت أثناء التشغيل
    audioPlayer.addEventListener('timeupdate', updateTimeDisplay);
    
    // عند انتهاء التشغيل
    audioPlayer.addEventListener('ended', handleAudioEnded);
    
    // إظهار رسالة تحميل
    showToast(`جاري تحميل تلاوة سورة ${currentSurah.arabic_name}...`, 'info');
}

// ============================================
// الحصول على رابط الصوت
// ============================================
function getAudioUrl(surahId, reciterName) {
    const reciter = AUDIO_SOURCES[reciterName];
    if (!reciter) {
        console.warn(`❌ القارئ ${reciterName} غير متوفر، استخدام عبد الباسط`);
        return AUDIO_SOURCES["abdul-basit"].fullUrl(surahId);
    }
    
    return reciter.fullUrl(surahId);
}

// ============================================
// تحديث معلومات السورة
// ============================================
function updateSurahInfo(surah) {
    document.getElementById('current-surah-title').textContent = `المصحف الشريف - ${surah.arabic_name}`;
    document.getElementById('current-surah-name').textContent = `سورة ${surah.arabic_name}`;
    document.getElementById('surah-type').textContent = surah.type;
    document.getElementById('verse-count').textContent = surah.verses_count;
    document.getElementById('surah-duration').textContent = surah.duration || "00:00";
    
    // تحديث عنوان الصفحة
    document.title = `سورة ${surah.arabic_name} - القرآن الكريم مع التفسير`;
    
    // تحديث اختيار السورة
    document.getElementById('surah-selector').value = surah.id;
}

// ============================================
// عرض قائمة الآيات
// ============================================
function displayVersesList() {
    const versesList = document.getElementById('verses-list');
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
    
    document.getElementById('current-verse-num').textContent = verse.verse_number;
    document.getElementById('current-verse-text').textContent = verse.text;
    document.getElementById('current-verse-translation').textContent = verse.translation || '';
}

// ============================================
// تحميل التفسير
// ============================================
function loadTafseer() {
    const tafseerContent = document.getElementById('tafseer-content');
    tafseerContent.innerHTML = '';
    
    if (!currentSurah || !currentSurah.verses) return;
    
    const sourceId = document.getElementById('tafseer-source').value;
    const sourceName = getTafseerSourceName(sourceId);
    
    // عرض أول 10 آيات فقط في التفسير (للتجنب التحميل الثقيل)
    const versesToShow = currentSurah.verses.slice(0, 10);
    
    versesToShow.forEach(verse => {
        const tafseerItem = document.createElement('div');
        tafseerItem.className = 'tafseer-item';
        
        tafseerItem.innerHTML = `
            <h4>
                <i class="fas fa-verse"></i>
                الآية ${verse.verse_number}
                <span class="verse-ref">${currentSurah.arabic_name}:${verse.verse_number}</span>
            </h4>
            <p class="arabic-text" style="font-size: 1.3rem; margin-bottom: 10px;">${verse.text}</p>
            <p class="tafseer-text"><strong>${sourceName}:</strong> ${verse.tafseer || 'يتم تحميل التفسير...'}</p>
        `;
        
        tafseerContent.appendChild(tafseerItem);
    });
}

// ============================================
// تحديث صفحة المصحف
// ============================================
function updateMushafPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    
    currentPage = pageNum;
    
    // تحديث واجهة المستخدم
    document.getElementById('current-page').textContent = pageNum;
    document.getElementById('page-slider').value = pageNum;
    document.getElementById('page-jump-input').value = pageNum;
    
    // تحميل صورة المصحف من رابط خارجي
    const mushafImage = document.getElementById('mushaf-image');
    const imageUrl = getMushafImageUrl(pageNum);
    
    // إضافة مؤشر تحميل
    mushafImage.style.opacity = '0.5';
    mushafImage.src = imageUrl;
    mushafImage.alt = `صفحة المصحف ${pageNum}`;
    
    // عند تحميل الصورة
    mushafImage.onload = function() {
        mushafImage.style.opacity = '1';
    };
    
    // في حالة خطأ
    mushafImage.onerror = function() {
        mushafImage.src = 'https://via.placeholder.com/800x1200/0a5c36/ffffff?text=صفحة+المصحف+' + pageNum;
        mushafImage.alt = `صفحة المصحف ${pageNum} - صورة بديلة`;
    };
}

// ============================================
// الحصول على رابط صورة المصحف
// ============================================
function getMushafImageUrl(pageNum) {
    // استخدام مصدر خارجي
    const pageStr = String(pageNum).padStart(3, '0');
    
    // عدة مصادر احتياطية
    const sources = [
        `https://www.tanzil.net/docs/images/${pageStr}.png`,
        `https://cdn.islamic.network/quran/images/${pageStr}.png`,
        `https://quran.com/images/uthmani/${pageStr}.png`
    ];
    
    // العودة للمصدر الأول (يمكن إضافة منطق اختيار ذكي)
    return sources[0];
}

// ============================================
// إعداد واجهة المستخدم
// ============================================
function initializeUI() {
    // تعبئة قائمة السور
    const surahSelector = document.getElementById('surah-selector');
    surahsData.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.id;
        option.textContent = `${surah.id}. ${surah.arabic_name} (${surah.verses_count} آية)`;
        surahSelector.appendChild(option);
    });
    
    // تعبئة قائمة القراء
    const reciterSelector = document.getElementById('reciter-selector');
    reciterSelector.innerHTML = '';
    
    Object.keys(AUDIO_SOURCES).forEach(reciterKey => {
        const reciterName = getReciterArabicName(reciterKey);
        const option = document.createElement('option');
        option.value = reciterKey;
        option.textContent = reciterName;
        reciterSelector.appendChild(option);
    });
    
    // إعداد شريط التقدم
    setupProgressBar();
    
    // إضافة مؤشر جودة الاتصال
    addConnectionIndicator();
}

// ============================================
// إعداد مستمعي الأحداث
// ============================================
function setupEventListeners() {
    // تغيير السورة
    document.getElementById('surah-selector').addEventListener('change', function() {
        const surahId = parseInt(this.value);
        if (surahId) {
            loadSurah(surahId);
        }
    });
    
    // تغيير القارئ
    document.getElementById('reciter-selector').addEventListener('change', function() {
        currentReciter = this.value;
        if (currentSurah) {
            loadExternalAudio(currentSurah.id);
            showToast(`تم التغيير إلى ${getReciterArabicName(currentReciter)}`, 'success');
        }
    });
    
    // زر التشغيل/الإيقاف
    document.getElementById('play-btn').addEventListener('click', togglePlayback);
    
    // التحكم في الصوت
    document.getElementById('volume-slider').addEventListener('input', function() {
        if (audioPlayer) {
            audioPlayer.volume = this.value;
        }
    });
    
    // السورة السابقة
    document.getElementById('prev-surah-btn').addEventListener('click', function() {
        if (currentSurah && currentSurah.id > 1) {
            loadSurah(currentSurah.id - 1);
        }
    });
    
    // السورة التالية
    document.getElementById('next-surah-btn').addEventListener('click', function() {
        if (currentSurah && currentSurah.id < surahsData.length) {
            loadSurah(currentSurah.id + 1);
        }
    });
    
    // البحث في الآيات
    document.getElementById('verse-search').addEventListener('input', function() {
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
    
    // التحكم في صفحات المصحف
    document.getElementById('prev-page-btn').addEventListener('click', function() {
        updateMushafPage(currentPage - 1);
    });
    
    document.getElementById('next-page-btn').addEventListener('click', function() {
        updateMushafPage(currentPage + 1);
    });
    
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
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// ============================================
// دوال المساعدة
// ============================================
function getReciterArabicName(reciterKey) {
    const names = {
        "abdul-basit": "عبد الباسط عبد الصمد",
        "husary": "محمود خليل الحصري",
        "saad": "سعد الغامدي",
        "afasy": "مشاري العفاسي",
        "minshawi": "محمد صديق المنشاوي (مرتل)",
        "minshawi-mujawwad": "المنشاوي (مجود)"
    };
    
    return names[reciterKey] || reciterKey;
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
    if (!audioPlayer) return;
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        // محاولة التشغيل
        audioPlayer.play().catch(error => {
            console.error('❌ خطأ في تشغيل الصوت:', error);
            showToast('تعذر تشغيل الصوت. تأكد من اتصال الإنترنت.', 'error');
        });
    }
    
    isPlaying = !isPlaying;
    updatePlayButton();
}

function updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    const playIcon = playBtn.querySelector('i');
    
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
    
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');
    
    // الوقت الحالي
    const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
    const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
    currentTime.textContent = `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;
    
    // الوقت الكلي
    if (!isNaN(audioPlayer.duration)) {
        const totalMinutes = Math.floor(audioPlayer.duration / 60);
        const totalSeconds = Math.floor(audioPlayer.duration % 60);
        totalTime.textContent = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
        
        // تحديث شريط التقدم
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        document.getElementById('progress-slider').value = progress;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }
}

function setupProgressBar() {
    const progressSlider = document.getElementById('progress-slider');
    
    progressSlider.addEventListener('input', function() {
        if (!audioPlayer || isNaN(audioPlayer.duration)) return;
        
        const seekTime = (this.value / 100) * audioPlayer.duration;
        document.getElementById('progress-fill').style.width = `${this.value}%`;
        
        // تحديث الوقت المعروض
        const minutes = Math.floor(seekTime / 60);
        const seconds = Math.floor(seekTime % 60);
        document.getElementById('current-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });
    
    progressSlider.addEventListener('change', function() {
        if (!audioPlayer || isNaN(audioPlayer.duration)) return;
        
        const seekTime = (this.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });
}

function handleAudioEnded() {
    if (isRepeating) {
        // تكرار
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else {
        // إيقاف
        isPlaying = false;
        updatePlayButton();
        showToast('تم الانتهاء من التلاوة', 'success');
    }
}

function showToast(message, type = 'info') {
    // إنشاء عنصر Toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // إضافة إلى الصفحة
    document.body.appendChild(toast);
    
    // إظهار
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // إخفاء بعد 3 ثوان
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.querySelector('i').className = 'fas fa-sun';
        themeToggle.title = 'تفعيل الوضع النهاري';
    }
}

function addConnectionIndicator() {
    // إضافة مؤشر جودة الاتصال
    const indicator = document.createElement('div');
    indicator.id = 'connection-indicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        z-index: 1000;
        transition: background-color 0.3s;
    `;
    
    document.body.appendChild(indicator);
    
    // تحديث حسب جودة الاتصال
    function updateIndicator() {
        if (navigator.connection) {
            const downlink = navigator.connection.downlink;
            if (downlink > 5) {
                indicator.style.backgroundColor = '#2ecc71'; // أخضر - ممتاز
            } else if (downlink > 2) {
                indicator.style.backgroundColor = '#f39c12'; // برتقالي - جيد
            } else if (downlink > 0.5) {
                indicator.style.backgroundColor = '#e74c3c'; // أحمر - ضعيف
            } else {
                indicator.style.backgroundColor = '#7f8c8d'; // رمادي - غير معروف
            }
        }
    }
    
    // تحديث دوري
    updateIndicator();
    setInterval(updateIndicator, 10000);
}

// ============================================
// تحميل سورة من رابط URL
// ============================================
function loadSurahFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const surahParam = urlParams.get('surah');
    
    if (surahParam) {
        const surahId = parseInt(surahParam);
        if (!isNaN(surahId) && surahId >= 1 && surahId <= 114) {
            loadSurah(surahId);
            return true;
        }
    }
    
    return false;
}

// ============================================
// فتح نافذة الآية المنبثقة
// ============================================
function openVerseModal(verse) {
    const modal = document.getElementById('verse-modal');
    const modalVerseTitle = document.getElementById('modal-verse-title');
    const modalVerseText = document.getElementById('modal-verse-text');
    const modalTafseerText = document.getElementById('modal-tafseer-text');
    
    modalVerseTitle.textContent = `الآية ${verse.verse_number} - سورة ${currentSurah.arabic_name}`;
    modalVerseText.textContent = verse.text;
    modalTafseerText.textContent = verse.tafseer || 'يتم تحميل التفسير...';
    
    modal.style.display = 'flex';
    
    // إغلاق النافذة
    document.querySelector('.close-modal').onclick = function() {
        modal.style.display = 'none';
    };
    
    document.getElementById('modal-close-btn').onclick = function() {
        modal.style.display = 'none';
    };
    
    // تشغيل الآية
    document.getElementById('modal-play-btn').onclick = function() {
        if (audioPlayer) {
            // القفز لبداية الآية (إذا كانت بيانات التوقيت متوفرة)
            audioPlayer.play();
            isPlaying = true;
            updatePlayButton();
        }
        modal.style.display = 'none';
    };
}

// ============================================
// CSS إضافي للـ Toast والمؤشرات
// ============================================
const additionalCSS = `
.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2c3e50;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s, transform 0.3s;
}

.toast.show {
    opacity: 1;
    transform: translateY(0);
}

.toast-success {
    background: #27ae60;
}

.toast-error {
    background: #e74c3c;
}

.toast-info {
    background: #3498db;
}

#connection-indicator::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
}

#connection-indicator:hover::after {
    opacity: 1;
}

[data-theme="dark"] .toast {
    background: #34495e;
}
`;

// إضافة CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// ============================================
// بيانات افتراضية للسور (للطوارئ)
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
                },
                // ... باقي الآيات
            ]
        }
        // ... يمكن إضافة المزيد من السور
    ];
}

// ============================================
// تهيئة مشغل الصوت
// ============================================
audioPlayer.addEventListener('play', function() {
    isPlaying = true;
    updatePlayButton();
});

audioPlayer.addEventListener('pause', function() {
    isPlaying = false;
    updatePlayButton();
});

// تحديث حالة زر المايكروفون
document.getElementById('mute-btn').addEventListener('click', function() {
    if (!audioPlayer) return;
    audioPlayer.muted = !audioPlayer.muted;
    
    const icon = this.querySelector('i');
    if (audioPlayer.muted) {
        icon.className = 'fas fa-volume-mute';
        this.title = 'إعادة الصوت';
    } else {
        icon.className = 'fas fa-volume-up';
        this.title = 'كتم الصوت';
    }
});

// التكرار
document.getElementById('repeat-btn').addEventListener('click', function() {
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

// التراجع والتقديم
document.getElementById('rewind-btn').addEventListener('click', function() {
    if (!audioPlayer) return;
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
});

document.getElementById('forward-btn').addEventListener('click', function() {
    if (!audioPlayer) return;
    if (!isNaN(audioPlayer.duration)) {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    }
});

console.log('✅ Quran Player initialized successfully!');
