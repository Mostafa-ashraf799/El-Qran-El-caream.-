// script.js - ملف الجافاسكريبت للمصحف الشامل

// البيانات الأساسية
let surahsData = [];
let currentSurah = null;
let currentVerse = 1;
let currentReciter = "1";
let audioPlayer = null;
let isPlaying = false;
let isRepeating = false;
let currentPage = 1;
const totalPages = 604;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async function() {
    // إخفاء شاشة التحميل وإظهار المحتوى بعد 1.5 ثانية
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }, 1500);
    
    // تهيئة مشغل الصوت
    audioPlayer = document.getElementById('quran-audio');
    
    // تحميل بيانات السور من ملف JSON
    await loadSurahsData();
    
    // تهيئة عناصر الواجهة
    initializeUI();
    
    // تحميل سورة الفاتحة افتراضياً
    loadSurah(1);
    
    // إعداد الأحداث
    setupEventListeners();
});

// تحميل بيانات السور من ملف JSON
async function loadSurahsData() {
    try {
        const response = await fetch('data/surahs.json');
        if (!response.ok) {
            throw new Error('لا يمكن تحميل بيانات السور');
        }
        surahsData = await response.json();
        console.log('بيانات السور تم تحميلها بنجاح:', surahsData.length, 'سورة');
    } catch (error) {
        console.error('خطأ في تحميل بيانات السور:', error);
        // استخدام بيانات افتراضية في حالة الخطأ
        loadDefaultSurahsData();
    }
}

// بيانات افتراضية في حالة عدم وجود ملف JSON
function loadDefaultSurahsData() {
    surahsData = [
        {
            "id": 1,
            "name": "الفاتحة",
            "arabic_name": "الفاتحة",
            "english_name": "Al-Fatiha",
            "type": "مكية",
            "verses_count": 7,
            "audio_url": "audio/001.mp3",
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
                {
                    "id": 2,
                    "surah_id": 1,
                    "verse_number": 2,
                    "text": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                    "translation": "الحمد لله رب العالمين",
                    "tafseer": "الثناء على الله بصفاته التي كلها كمال، وبنعمه الظاهرة والباطنة، الدينية والدنيوية. رب: المربي لجميع الخلق بخلقه إياهم، وإنعامه عليهم."
                },
                {
                    "id": 3,
                    "surah_id": 1,
                    "verse_number": 3,
                    "text": "الرَّحْمَٰنِ الرَّحِيمِ",
                    "translation": "الرحمن الرحيم",
                    "tafseer": "تأكيد صفة الرحمة، فالرحمن: المنعم بجلائل النعم، والرحيم: المنعم بدقائقها."
                },
                {
                    "id": 4,
                    "surah_id": 1,
                    "verse_number": 4,
                    "text": "مَالِكِ يَوْمِ الدِّينِ",
                    "translation": "مالك يوم الدين",
                    "tafseer": "المالك ليوم الجزاء، وهو يوم القيامة، يمجده الخلق كلهم، ويخضعون لعظمته."
                },
                {
                    "id": 5,
                    "surah_id": 1,
                    "verse_number": 5,
                    "text": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                    "translation": "إياك نعبد وإياك نستعين",
                    "tafseer": "إخلاص العبادة لله وحده، والاستعانة به في جميع الأمور."
                },
                {
                    "id": 6,
                    "surah_id": 1,
                    "verse_number": 6,
                    "text": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                    "translation": "اهدنا الصراط المستقيم",
                    "tafseer": "نسأل الله الثبات على دين الإسلام، واتباع طريق الأنبياء والمرسلين."
                },
                {
                    "id": 7,
                    "surah_id": 1,
                    "verse_number": 7,
                    "text": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
                    "translation": "صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين",
                    "tafseer": "طريق الذين أنعم الله عليهم من النبيين والصديقين والشهداء والصالحين، وليس طريق اليهود الذين غضب الله عليهم، ولا طريق النصارى الذين ضلوا عن الحق."
                }
            ]
        },
        // يمكن إضافة المزيد من السور هنا...
    ];
}

// تهيئة عناصر الواجهة
function initializeUI() {
    // تعبئة قائمة السور في dropdown
    const surahSelector = document.getElementById('surah-selector');
    surahsData.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.id;
        option.textContent = `${surah.id}. ${surah.arabic_name} (${surah.verses_count} آية)`;
        surahSelector.appendChild(option);
    });
    
    // إعداد النسخة الافتراضية في القوائم
    document.getElementById('reciter-selector').value = currentReciter;
    document.getElementById('tafseer-source').value = "1";
    
    // تحديث عرض الوقت
    updateTimeDisplay();
    
    // إعداد شريط التقدم
    setupProgressBar();
}

// تحميل سورة معينة
function loadSurah(surahId) {
    const surah = surahsData.find(s => s.id === surahId);
    if (!surah) {
        console.error('السورة غير موجودة:', surahId);
        return;
    }
    
    currentSurah = surah;
    currentVerse = 1;
    
    // تحديث معلومات السورة
    document.getElementById('current-surah-title').textContent = `المصحف الشريف - ${surah.arabic_name}`;
    document.getElementById('current-surah-name').textContent = `سورة ${surah.arabic_name}`;
    document.getElementById('surah-type').textContent = surah.type;
    document.getElementById('verse-count').textContent = surah.verses_count;
    document.getElementById('surah-duration').textContent = surah.duration || "00:00";
    document.getElementById('current-surah-name').textContent = `سورة ${surah.arabic_name}`;
    
    // تحديث عنوان الصفحة
    document.title = `سورة ${surah.arabic_name} - القرآن الكريم مع التفسير`;
    
    // تحديث اختيار السورة
    document.getElementById('surah-selector').value = surahId;
    
    // تحميل ملف الصوت
    loadAudioFile(surah.audio_url);
    
    // عرض الآيات
    displayVersesList();
    
    // تحميل التفسير
    loadTafseer();
    
    // تحديث الصفحة الأولى من المصحف (إذا كان لديك صور للمصحف)
    updateMushafPage(1);
}

// تحميل ملف الصوت
function loadAudioFile(audioUrl) {
    if (!audioPlayer) return;
    
    // إيقاف الصوت الحالي
    audioPlayer.pause();
    isPlaying = false;
    updatePlayButton();
    
    // تعيين المصدر الجديد
    audioPlayer.src = audioUrl;
    
    // إعادة تعيين شريط التقدم
    document.getElementById('progress-slider').value = 0;
    document.getElementById('progress-fill').style.width = '0%';
    
    // تحديث الوقت عند تحميل الملف
    audioPlayer.addEventListener('loadedmetadata', function() {
        updateTimeDisplay();
        document.getElementById('progress-slider').max = Math.floor(audioPlayer.duration);
    });
    
    // تحديث الوقت أثناء التشغيل
    audioPlayer.addEventListener('timeupdate', updateTimeDisplay);
    
    // عند انتهاء التشغيل
    audioPlayer.addEventListener('ended', function() {
        if (isRepeating) {
            // إذا كان وضع التكرار مفعلاً، أعد التشغيل
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else if (currentVerse < currentSurah.verses_count) {
            // الانتقال للآية التالية
            playNextVerse();
        } else {
            // إذا كانت الآية الأخيرة، أوقف التشغيل
            isPlaying = false;
            updatePlayButton();
        }
    });
}

// عرض قائمة الآيات
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
            // إزالة النشط من جميع الآيات
            document.querySelectorAll('.verse-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // إضافة النشط للآية المحددة
            verseItem.classList.add('active');
            
            // تحديث الآية الحالية
            currentVerse = verse.verse_number;
            
            // تحديث عرض الآية الحالية
            updateCurrentVerseDisplay();
            
            // تشغيل الآية من وقتها (إذا كان لديك بيانات توقيت)
            // يمكنك إضافة بيانات التوقيت في JSON
        });
        
        versesList.appendChild(verseItem);
    });
}

// تحديث عرض الآية الحالية
function updateCurrentVerseDisplay() {
    if (!currentSurah || !currentSurah.verses) return;
    
    const verse = currentSurah.verses.find(v => v.verse_number === currentVerse);
    if (!verse) return;
    
    document.getElementById('current-verse-num').textContent = verse.verse_number;
    document.getElementById('current-verse-text').textContent = verse.text;
    document.getElementById('current-verse-translation').textContent = verse.translation || '';
}

// تحميل التفسير
function loadTafseer() {
    const tafseerContent = document.getElementById('tafseer-content');
    tafseerContent.innerHTML = '';
    
    if (!currentSurah || !currentSurah.verses) return;
    
    const source = document.getElementById('tafseer-source').value;
    const sourceName = getTafseerSourceName(source);
    
    currentSurah.verses.forEach(verse => {
        const tafseerItem = document.createElement('div');
        tafseerItem.className = 'tafseer-item';
        
        tafseerItem.innerHTML = `
            <h4>
                <i class="fas fa-verse"></i>
                الآية ${verse.verse_number}
                <span class="verse-ref">${currentSurah.arabic_name}:${verse.verse_number}</span>
            </h4>
            <p class="arabic-text" style="font-size: 1.3rem; margin-bottom: 10px;">${verse.text}</p>
            <p class="tafseer-text"><strong>${sourceName}:</strong> ${verse.tafseer || 'لا يوجد تفسير متاح لهذه الآية.'}</p>
        `;
        
        tafseerContent.appendChild(tafseerItem);
    });
}

// الحصول على اسم مصدر التفسير
function getTafseerSourceName(sourceId) {
    const sources = {
        "1": "التفسير الميسر",
        "2": "تفسير السعدي",
        "3": "تفسير ابن كثير",
        "4": "التفسير الوسيط"
    };
    
    return sources[sourceId] || "التفسير الميسر";
}

// تحديث صفحة المصحف
function updateMushafPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    
    currentPage = pageNum;
    
    // تحديث رقم الصفحة
    document.getElementById('current-page').textContent = pageNum;
    document.getElementById('page-slider').value = pageNum;
    document.getElementById('page-jump-input').value = pageNum;
    
    // تحديث صورة المصحف (تأكد من وجود الصور في مجلد images/mushaf/)
    const mushafImage = document.getElementById('mushaf-image');
    mushafImage.src = `images/mushaf/page-${String(pageNum).padStart(3, '0')}.jpg`;
    mushafImage.alt = `صفحة المصحف ${pageNum}`;
    
    // إضافة نقاط تفاعلية للآيات (هنا يمكنك تحسينها ببيانات دقيقة)
    addVerseHotspots();
}

// إضافة نقاط تفاعلية على صفحة المصحف
function addVerseHotspots() {
    const hotspotsContainer = document.getElementById('verse-hotspots');
    hotspotsContainer.innerHTML = '';
    
    // هذا مثال بسيط، يمكنك تحسينه باستخدام بيانات دقيقة عن مواقع الآيات
    if (currentSurah && currentSurah.verses) {
        // توزيع عشوائي للنقاط (للتوضيح فقط)
        currentSurah.verses.forEach(verse => {
            if (verse.verse_number <= 10) { // عرض أول 10 آيات فقط كمثال
                const hotspot = document.createElement('div');
                hotspot.className = 'hotspot';
                hotspot.dataset.verse = verse.verse_number;
                
                // مواقع عشوائية (يمكنك استبدالها ببيانات دقيقة)
                const top = 20 + (verse.verse_number * 8) + Math.random() * 5;
                const left = 30 + Math.random() * 40;
                
                hotspot.style.top = `${top}%`;
                hotspot.style.left = `${left}%`;
                
                hotspot.addEventListener('click', () => {
                    currentVerse = verse.verse_number;
                    updateCurrentVerseDisplay();
                    displayVersesList();
                    
                    // فتح النافذة المنبثقة
                    openVerseModal(verse);
                });
                
                hotspotsContainer.appendChild(hotspot);
            }
        });
    }
}

// فتح نافذة الآية المنبثقة
function openVerseModal(verse) {
    const modal = document.getElementById('verse-modal');
    const modalVerseTitle = document.getElementById('modal-verse-title');
    const modalVerseText = document.getElementById('modal-verse-text');
    const modalTafseerText = document.getElementById('modal-tafseer-text');
    
    modalVerseTitle.textContent = `الآية ${verse.verse_number} - سورة ${currentSurah.arabic_name}`;
    modalVerseText.textContent = verse.text;
    modalTafseerText.textContent = verse.tafseer || 'لا يوجد تفسير متاح لهذه الآية.';
    
    modal.style.display = 'flex';
}

// تحديث عرض الوقت
function updateTimeDisplay() {
    if (!audioPlayer) return;
    
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');
    
    // تنسيق الوقت الحالي
    const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
    const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
    currentTime.textContent = `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;
    
    // تنسيق الوقت الكلي
    if (!isNaN(audioPlayer.duration)) {
        const totalMinutes = Math.floor(audioPlayer.duration / 60);
        const totalSeconds = Math.floor(audioPlayer.duration % 60);
        totalTime.textContent = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    }
    
    // تحديث شريط التقدم
    if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        document.getElementById('progress-slider').value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }
}

// إعداد شريط التقدم
function setupProgressBar() {
    const progressSlider = document.getElementById('progress-slider');
    
    progressSlider.addEventListener('input', function() {
        if (!audioPlayer) return;
        
        const seekTime = (this.value / 100) * audioPlayer.duration;
        document.getElementById('progress-fill').style.width = `${this.value}%`;
        
        // تحديث الوقت الحالي
        const currentMinutes = Math.floor(seekTime / 60);
        const currentSeconds = Math.floor(seekTime % 60);
        document.getElementById('current-time').textContent = 
            `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;
    });
    
    progressSlider.addEventListener('change', function() {
        if (!audioPlayer) return;
        
        const seekTime = (this.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });
}

// تحديث زر التشغيل/الإيقاف
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

// تشغيل الآية التالية
function playNextVerse() {
    if (!currentSurah) return;
    
    if (currentVerse < currentSurah.verses_count) {
        currentVerse++;
        updateCurrentVerseDisplay();
        displayVersesList();
        
        // هنا يمكنك إضافة منطق للتقدم إلى وقت الآية التالية
        // إذا كان لديك بيانات توقيت الآيات في JSON
    }
}

// تشغيل الآية السابقة
function playPrevVerse() {
    if (!currentSurah) return;
    
    if (currentVerse > 1) {
        currentVerse--;
        updateCurrentVerseDisplay();
        displayVersesList();
        
        // هنا يمكنك إضافة منطق للرجوع إلى وقت الآية السابقة
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // تغيير السورة
    document.getElementById('surah-selector').addEventListener('change', function() {
        const surahId = parseInt(this.value);
        if (surahId) {
            loadSurah(surahId);
        }
    });
    
    // زر التشغيل/الإيقاف
    document.getElementById('play-btn').addEventListener('click', function() {
        if (!audioPlayer) return;
        
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play().catch(e => {
                console.error('خطأ في تشغيل الصوت:', e);
                alert('تعذر تشغيل الصوت. تأكد من وجود ملف الصوت.');
            });
        }
        
        isPlaying = !isPlaying;
        updatePlayButton();
    });
    
    // تغيير حالة التشغيل عند تغيير الصوت
    audioPlayer.addEventListener('play', function() {
        isPlaying = true;
        updatePlayButton();
    });
    
    audioPlayer.addEventListener('pause', function() {
        isPlaying = false;
        updatePlayButton();
    });
    
    // التراجع 10 ثوان
    document.getElementById('rewind-btn').addEventListener('click', function() {
        if (!audioPlayer) return;
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    });
    
    // التقدم 10 ثوان
    document.getElementById('forward-btn').addEventListener('click', function() {
        if (!audioPlayer) return;
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    });
    
    // كتم الصوت
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
    
    // التحكم في الصوت
    document.getElementById('volume-slider').addEventListener('input', function() {
        if (!audioPlayer) return;
        audioPlayer.volume = this.value;
    });
    
    // تكرار الآية الحالية
    document.getElementById('repeat-btn').addEventListener('click', function() {
        isRepeating = !isRepeating;
        
        const icon = this.querySelector('i');
        if (isRepeating) {
            icon.style.color = 'var(--primary-color)';
            this.title = 'إيقاف التكرار';
        } else {
            icon.style.color = '';
            this.title = 'تكرار الآية الحالية';
        }
    });
    
    // السورة السابقة
    document.getElementById('prev-surah-btn').addEventListener('click', function() {
        if (!currentSurah || currentSurah.id <= 1) return;
        loadSurah(currentSurah.id - 1);
    });
    
    // السورة التالية
    document.getElementById('next-surah-btn').addEventListener('click', function() {
        if (!currentSurah || currentSurah.id >= surahsData.length) return;
        loadSurah(currentSurah.id + 1);
    });
    
    // البحث في الآيات
    document.getElementById('verse-search').addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        const verseItems = document.querySelectorAll('.verse-item');
        
        verseItems.forEach(item => {
            const verseText = item.querySelector('.verse-text').textContent.toLowerCase();
            if (verseText.includes(searchTerm) || searchTerm === '') {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // التنقل بين الأقسام
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة النشط من جميع الروابط
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.remove('active');
            });
            
            // إضافة النشط للرابط الحالي
            this.classList.add('active');
            
            // إخفاء جميع الأقسام
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // إظهار القسم المحدد
            const sectionId = this.dataset.section + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // تبديل الوضع الليلي/النهاري
    document.getElementById('theme-toggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const icon = this.querySelector('i');
        
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.className = 'fas fa-moon';
            this.title = 'تفعيل الوضع الليلي';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.className = 'fas fa-sun';
            this.title = 'تفعيل الوضع النهاري';
        }
    });
    
    // تحميل الوضع المحفوظ
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').querySelector('i').className = 'fas fa-sun';
        document.getElementById('theme-toggle').title = 'تفعيل الوضع النهاري';
    }
    
    // تغيير القارئ
    document.getElementById('reciter-selector').addEventListener('change', function() {
        currentReciter = this.value;
        // هنا يمكنك تغيير ملف الصوت حسب القارئ
        // مثلاً: audio/001_reciter_${currentReciter}.mp3
        if (currentSurah) {
            const newAudioUrl = `audio/${String(currentSurah.id).padStart(3, '0')}_${currentReciter}.mp3`;
            loadAudioFile(newAudioUrl);
        }
    });
    
    // تغيير مصدر التفسير
    document.getElementById('tafseer-source').addEventListener('change', function() {
        loadTafseer();
    });
    
    // التحكم في صفحات المصحف
    document.getElementById('prev-page-btn').addEventListener('click', function() {
        updateMushafPage(currentPage - 1);
    });
    
    document.getElementById('next-page-btn').addEventListener('click', function() {
        updateMushafPage(currentPage + 1);
    });
    
    document.getElementById('page-slider').addEventListener('input', function() {
        updateMushafPage(parseInt(this.value));
    });
    
    document.getElementById('page-jump-input').addEventListener('change', function() {
        const pageNum = parseInt(this.value);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            updateMushafPage(pageNum);
        }
    });
    
    document.getElementById('jump-btn').addEventListener('click', function() {
        const input = document.getElementById('page-jump-input');
        const pageNum = parseInt(input.value);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            updateMushafPage(pageNum);
        }
    });
    
    // النافذة المنبثقة
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('verse-modal').style.display = 'none';
    });
    
    document.getElementById('modal-close-btn').addEventListener('click', function() {
        document.getElementById('verse-modal').style.display = 'none';
    });
    
    document.getElementById('modal-play-btn').addEventListener('click', function() {
        // تشغيل الآية الحالية
        if (audioPlayer) {
            audioPlayer.play();
            isPlaying = true;
            updatePlayButton();
        }
        
        // إغلاق النافذة
        document.getElementById('verse-modal').style.display = 'none';
    });
    
    // إغلاق النافذة بالضغط خارجها
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('verse-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // منع إغلاق النافذة بالضغط داخلها
    document.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// تحميل سورة من رابط URL (إذا تم تمريرها من index.html)
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

// تهيئة التطبيق عند تحميل الصفحة (استدعاء إضافي)
window.addEventListener('load', function() {
    // محاولة تحميل سورة من URL
    if (!loadSurahFromURL()) {
        // إذا لم تكن هناك سورة في URL، تحقق من localStorage
        const lastSurah = localStorage.getItem('lastSurah');
        if (lastSurah) {
            loadSurah(parseInt(lastSurah));
        }
    }
    
    // حفظ آخر سورة تمت زيارتها
    window.addEventListener('beforeunload', function() {
        if (currentSurah) {
            localStorage.setItem('lastSurah', currentSurah.id);
        }
    });
});