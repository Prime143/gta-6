document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // RESPONSIVE MENU TOGGLE
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when links are clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // ==========================================
    // SECTION 1: HERO COUNTDOWN (Nov 19, 2026, 00:00 EST)
    // ==========================================
    // EST is UTC-5. November 19, 2026 00:00:00 EST is 2026-11-19T05:00:00Z (UTC)
    const targetDate = new Date("2026-11-19T05:00:00Z").getTime();
    
    const countdownTimer = document.getElementById('countdownTimer');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference <= 0) {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minsEl.textContent = "00";
            secsEl.textContent = "00";
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minsEl.textContent = String(minutes).padStart(2, '0');
        secsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ==========================================
    // SECTION 2: OFFICIAL STATEMENTS (Expandable)
    // ==========================================
    const timelineCards = document.querySelectorAll('.timeline-card');
    
    timelineCards.forEach(card => {
        const btn = card.querySelector('.expand-btn');
        const btnSpan = btn.querySelector('span');
        
        card.addEventListener('click', (e) => {
            // Check if user clicked a link inside the card so we don't interfere
            if (e.target.tagName === 'A') return;
            
            const isExpanded = card.classList.toggle('expanded');
            if (isExpanded) {
                btnSpan.textContent = "Read Less";
            } else {
                btnSpan.textContent = "Read More";
            }
        });
    });

    // ==========================================
    // SECTION 3: SALES & HYPE STATS (IntersectionObserver Count-Up)
    // ==========================================
    const stats = document.querySelectorAll('.stat-num');
    
    const countUp = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const suffix = element.getAttribute('data-suffix') || '';
        const divide = parseInt(element.getAttribute('data-divide'), 10) || 1;
        const decimals = parseInt(element.getAttribute('data-decimal'), 10) || 0;
        
        let start = 0;
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease out quad formula
            const easeProgress = progress * (2 - progress);
            const currentVal = Math.floor(easeProgress * target);
            
            if (divide > 1) {
                const formattedVal = (currentVal / divide).toFixed(decimals);
                element.textContent = parseFloat(formattedVal).toLocaleString() + suffix;
            } else {
                element.textContent = currentVal.toLocaleString() + suffix;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (divide > 1) {
                    const finalVal = (target / divide).toFixed(decimals);
                    element.textContent = parseFloat(finalVal).toLocaleString() + suffix;
                } else {
                    element.textContent = target.toLocaleString() + suffix;
                }
            }
        };
        
        requestAnimationFrame(animate);
    };
    
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });

    // ==========================================
    // SECTION 3.5: SIMULATED PRE-ORDER CLOCK
    // ==========================================
    const preOrderUnitsEl = document.getElementById('preOrderUnits');
    const preOrderRevenueEl = document.getElementById('preOrderRevenue');
    
    // Live estimate base: June 25, 2026 00:00:00 UTC (Pre-orders go live)
    const baseOpenTime = new Date("2026-06-25T00:00:00Z").getTime();
    const launchTime = new Date("2026-11-19T05:00:00Z").getTime();
    const pricePerUnit = 79.99;
    const msPerUnit = 1693.44; // 1 pre-order every ~1.69 seconds to reach 12.5M ($1B revenue) by launch
    
    function initPreOrderCounter() {
        function calculatePreOrders() {
            const now = new Date().getTime();
            
            if (now <= baseOpenTime) {
                return 5000000;
            } else if (now >= launchTime) {
                return 12500000; // Cap at 12.5M pre-orders (exactly $999.8M / ~$1B revenue)
            } else {
                const elapsedMs = now - baseOpenTime;
                const extraUnits = Math.floor(elapsedMs / msPerUnit);
                return 5000000 + extraUnits;
            }
        }
        
        function updateDisplay() {
            const currentUnits = calculatePreOrders();
            const currentRevenue = currentUnits * pricePerUnit;
            
            preOrderUnitsEl.textContent = currentUnits.toLocaleString();
            preOrderRevenueEl.textContent = '$' + Math.floor(currentRevenue).toLocaleString();
        }
        
        // Initial set
        updateDisplay();
        
        // Refresh display visually every 300ms to capture ticking
        setInterval(updateDisplay, 300);
    }
    
    if (preOrderUnitsEl && preOrderRevenueEl) {
        initPreOrderCounter();
    }

    // ==========================================
    // SECTION 4: COMMUNITY REACTIONS TICKER
    // ==========================================
    const communityReactions = [
        { platform: "Reddit", user: "u/GTAFanatic", text: "I took a day off work. My boss knows. He also took the day off." },
        { platform: "X", user: "@ViceCityVibes", text: "GTA 6 delayed twice. My kids grew up during the wait. Still buying day one." },
        { platform: "YouTube", user: "Top comment", text: "Trailer 2 hit 475M views in 24hrs. This isn't a game, it's a religion." },
        { platform: "Reddit", user: "u/Lucia_main", text: "First female GTA protagonist. We are so back." },
        { platform: "Reddit", user: "u/TakeTwo_bagholder", text: "Stock dropped 10% on the delay news. I bought the dip. Same as GTA V." },
        { platform: "X", user: "@GamingHistorian", text: "$1B in pre-orders in one hour. The games industry will never be the same." },
        { platform: "Reddit", user: "u/RockstarWatcher", text: "475M trailer views in 24hrs beat a Marvel movie. Let that sink in." },
        { platform: "X", user: "@NightlifeVice", text: "Jason and Lucia. Vice City. Bonnie & Clyde energy. I'm not okay." },
        { platform: "Reddit", user: "u/PCMasterRace_tears", text: "No PC launch. I will be playing on my cousin's PS5. Dignity = 0." },
        { platform: "YouTube", user: "Top comment", text: "GTA 5 was released when I was in school. I'm married now. Still waited." },
        { platform: "X", user: "@DelayCounter", text: "Delay 1: Fall 2025 → May 2026. Delay 2: May 2026 → Nov 2026. Rockstar cooking or Rockstar stalling? Both." },
        { platform: "Reddit", user: "u/ModernViceCity", text: "The no-disc thing is wild. You're buying a box with a download code inside. Gaming lore." },
        { platform: "X", user: "@AnalystWatch", text: "Piper Sandler: 46M copies day one. That's more than some countries' populations. Surreal." }
    ];
    
    const reactionTicker = document.getElementById('reactionTicker');
    const tickerCard = document.getElementById('tickerCard');
    let tickerIndex = 0;
    
    function rotateReactions() {
        if (!tickerCard) return;
        
        // Slide / Fade Out
        tickerCard.classList.add('fade-out');
        
        setTimeout(() => {
            tickerIndex = (tickerIndex + 1) % communityReactions.length;
            const data = communityReactions[tickerIndex];
            
            // Get platform lowercase and set class
            const platformClass = `platform-${data.platform.toLowerCase()}`;
            const metaContainer = tickerCard.querySelector('.ticker-meta');
            
            metaContainer.innerHTML = `
                <span class="ticker-platform ${platformClass}">${data.platform}</span>
                <span class="ticker-user">${data.user}</span>
            `;
            
            tickerCard.querySelector('.ticker-text').textContent = `"${data.text}"`;
            
            // Slide / Fade In
            tickerCard.classList.remove('fade-out');
            tickerCard.classList.add('fade-in');
            
            setTimeout(() => {
                tickerCard.classList.remove('fade-in');
            }, 50);
            
        }, 400); // match transition speed in css
    }
    
    // Cycle every 4 seconds
    setInterval(rotateReactions, 4000);

    // ==========================================
    // SECTION 6: LIVE YOUTUBE TRENDING (API-powered)
    // ==========================================
    const trendingGrid = document.getElementById('trendingGrid');
    const trendingLoader = document.getElementById('trendingLoader');
    const apiErrorBanner = document.getElementById('apiErrorBanner');
    const apiTimestamp = document.getElementById('apiTimestamp');
    
    // Fallback data
    const fallbackVideos = [
        {
            id: "QdBZY2fkU-0", // mock ID
            title: "GTA 6 Pre-Order Trailer & Gameplay Breakdown",
            channel: "Rockstar News",
            thumbnail: "img/trending1.png",
            published: new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            views: "1420000",
            isLive: false
        },
        {
            id: "E1bXGZ5t_M8", // mock ID
            title: "Is GTA 6 Worth $80? Pre-Order Controversy Explained",
            channel: "Gamer Zone",
            thumbnail: "img/trending2.png",
            published: new Date(new Date().getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            views: "820000",
            isLive: false
        },
        {
            id: "hJ8z6_1d_E0", // mock ID
            title: "GTA 6 MAP LEAKS - The Scale is Insane! (Vice City & Beyond)",
            channel: "Map Explorer",
            thumbnail: "img/trending3.png",
            published: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            views: "2100000",
            isLive: false
        }
    ];

    // Format Relative Time
    function getRelativeTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 60) {
            return `${diffMins} minutes ago`;
        } else if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }
    }

    // Format View Counts
    function formatViewCount(viewsString) {
        const views = parseInt(viewsString, 10);
        if (isNaN(views)) return "0 views";
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + "M views";
        } else if (views >= 1000) {
            return (views / 1000).toFixed(0) + "K views";
        }
        return views + " views";
    }

    // Render Cards in Grid
    function renderTrendingCards(items) {
        if (!trendingGrid) return;
        trendingGrid.innerHTML = '';
        
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'trending-card';
            
            const liveBadge = item.isLive ? `<span class="trending-live-badge">Live</span>` : '';
            const relativeTime = getRelativeTime(item.published);
            const viewText = formatViewCount(item.views);
            
            // Truncate title to 80 chars
            let truncatedTitle = item.title;
            if (truncatedTitle.length > 80) {
                truncatedTitle = truncatedTitle.substring(0, 77) + '...';
            }
            
            card.innerHTML = `
                <div class="thumb-container">
                    <img class="trending-thumb" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                    ${liveBadge}
                </div>
                <div class="trending-info">
                    <div>
                        <h3 class="trending-title" title="${item.title}">${truncatedTitle}</h3>
                        <p class="trending-channel">${item.channel}</p>
                    </div>
                    <div>
                        <div class="trending-meta">
                            <span>${viewText}</span>
                            <span>${relativeTime}</span>
                        </div>
                        <a href="https://www.youtube.com/watch?v=${item.id}" target="_blank" class="btn btn-card">Watch</a>
                    </div>
                </div>
            `;
            trendingGrid.appendChild(card);
        });
    }

    // Region and Video Modal Selector DOM elements
    const regionSelect = document.getElementById('regionSelect');
    const videoModal = document.getElementById('videoModal');
    const modalClose = document.getElementById('modalClose');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalIframe = document.getElementById('modalIframe');
    
    let currentRegion = 'US';

    // Geolocation to detect country code
    async function detectUserRegion() {
        try {
            const res = await fetch('https://ipapi.co/json/');
            if (res.ok) {
                const info = await res.json();
                if (info.country_code) {
                    return info.country_code.toUpperCase();
                }
            }
        } catch (e) {
            console.warn("IP Geolocation failed, reading browser locale:", e);
        }
        
        // Fallback locale parse (e.g. en-IN -> IN)
        try {
            const lang = navigator.language || navigator.userLanguage;
            if (lang && lang.length >= 2) {
                const country = lang.split('-')[1];
                if (country && country.length === 2) {
                    return country.toUpperCase();
                }
            }
        } catch (e) {}
        
        return 'US';
    }

    // Fetch from Endpoint passing detected region
    async function fetchTrendingVideos() {
        if (!trendingGrid) return;
        
        // Show loading state
        trendingGrid.classList.add('loading');
        
        try {
            const response = await fetch(`/api/youtube-gta6?region=${currentRegion}`);
            
            if (!response.ok) {
                throw new Error(`API returned error status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error || !Array.isArray(data) || data.length === 0) {
                throw new Error(data.error || "Invalid response format");
            }
            
            // Success
            renderTrendingCards(data);
            apiErrorBanner.classList.add('hidden');
            
            const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const regionName = regionSelect ? regionSelect.options[regionSelect.selectedIndex].text : currentRegion;
            apiTimestamp.textContent = `Last updated: ${timeNow} (${regionName})`;
            
        } catch (err) {
            console.warn("Dynamic YouTube fetch failed, loading fallback cards:", err);
            
            // Fallback render
            renderTrendingCards(fallbackVideos);
            apiErrorBanner.classList.remove('hidden');
            apiTimestamp.textContent = "Last updated: Fallback Mode";
        } finally {
            if (trendingLoader) {
                trendingLoader.classList.add('hidden');
            }
            trendingGrid.classList.remove('loading');
        }
    }

    // Regional Top Creators database
    const regionalCreators = {
        IN: [
            { name: "Techno Gamerz", subs: "39M", tag: "Hype", video: "GTA 6 Pre-Orders Opened! - My Thoughts", url: "https://youtube.com/results?search_query=Techno+Gamerz+GTA+6", avatar: "T", color: "#E91E63" },
            { name: "CarryMinati", subs: "44M", tag: "Reaction", video: "GTA 6 Pre-Order Reaction - THIS IS INSANE!", url: "https://youtube.com/results?search_query=CarryMinati+GTA+6", avatar: "C", color: "#FF5722" },
            { name: "Total Gaming", subs: "42M", tag: "Hype", video: "GTA 6 Pre-Orders Start - Vice City is Back!", url: "https://youtube.com/results?search_query=Total+Gaming+GTA+6", avatar: "T", color: "#4CAF50" },
            { name: "Triggered Insaan", subs: "23M", tag: "Reaction", video: "GTA 6 Pre-Order Reaction!", url: "https://youtube.com/results?search_query=Triggered+Insaan+GTA+6", avatar: "T", color: "#9C27B0" },
            { name: "Mythpat", subs: "15M", tag: "Reaction", video: "GTA 6 Pre-Order Price is Crazy!", url: "https://youtube.com/results?search_query=Mythpat+GTA+6", avatar: "M", color: "#00BCD4" },
            { name: "BeastBoyShub", subs: "7M", tag: "Analysis", video: "Is GTA 6 Worth 80 Dollars? - Detailed Breakdown", url: "https://youtube.com/results?search_query=BeastBoyShub+GTA+6", avatar: "B", color: "#3F51B5" },
            { name: "RawKnee Games", subs: "3.6M", tag: "Analysis", video: "Why GTA 6 No Disc is a Huge Mistake", url: "https://youtube.com/results?search_query=RawKnee+Games+GTA+6", avatar: "R", color: "#FFEB3B", textColor: "#000" }
        ],
        DEFAULT: [
            { name: "MrBossFTW", subs: "3.4M", tag: "Hype", video: "GTA 6 Pre-Orders BREAKDOWN — Everything You Need To Know", url: "https://youtube.com/results?search_query=MrBossFTW+GTA+6", avatar: "M", color: "#FF5722" },
            { name: "Typical Gamer", subs: "16M", tag: "Reaction", video: "GTA 6 Pre-Order Reaction — I Can't Believe The Price", url: "https://youtube.com/results?search_query=TypicalGamer+GTA+6", avatar: "T", color: "#4CAF50" },
            { name: "KSI", subs: "25M", tag: "Hype", video: "GTA 6 IS FINALLY HERE (Pre-Orders Open)", url: "https://youtube.com/results?search_query=KSI+GTA+6", avatar: "K", color: "#9C27B0" },
            { name: "Jacksepticeye", subs: "32M", tag: "Reaction", video: "GTA 6 Pre-Order — My Honest Thoughts", url: "https://youtube.com/results?search_query=Jacksepticeye+GTA+6", avatar: "J", color: "#00BCD4" },
            { name: "DarkViperAU", subs: "1.1M", tag: "Analysis", video: "Why GTA 6 Could Be The Last AAA Game Ever Made", url: "https://youtube.com/results?search_query=DarkViperAU+GTA+6", avatar: "D", color: "#E91E63" },
            { name: "Luke Stephens", subs: "800K", tag: "Breakdown", video: "GTA 6 No Disc Is A HUGE Problem — Here's Why", url: "https://youtube.com/results?search_query=Luke+Stephens+GTA+6", avatar: "L", color: "#3F51B5" },
            { name: "Legacykillah", subs: "500K", tag: "Analysis", video: "GTA 6 Sales Predictions Are INSANE — $3 Billion Year One?", url: "https://youtube.com/results?search_query=Legacykillah+GTA+6", avatar: "L", color: "#FFEB3B", textColor: "#000" }
        ]
    };

    // Render creators to DOM
    function renderCreatorCards(region) {
        const creatorsGrid = document.getElementById('creatorsGrid');
        if (!creatorsGrid) return;
        
        const list = regionalCreators[region] || regionalCreators['DEFAULT'];
        creatorsGrid.innerHTML = '';
        
        list.forEach(c => {
            const card = document.createElement('div');
            card.className = 'creator-card';
            
            const textColorStyle = c.textColor ? `color: ${c.textColor};` : '';
            const tagClass = `tag-${c.tag.toLowerCase()}`;
            
            card.innerHTML = `
                <div class="creator-header">
                    <div class="creator-avatar" style="background-color: ${c.color}; ${textColorStyle}">${c.avatar}</div>
                    <div class="creator-info">
                        <h3 class="creator-name">${c.name}</h3>
                        <span class="creator-subs">${c.subs} Subscribers</span>
                    </div>
                    <span class="badge ${tagClass}">${c.tag}</span>
                </div>
                <div class="creator-video">
                    <span class="video-label">LATEST COVERAGE</span>
                    <p class="video-title">"${c.video}"</p>
                </div>
                <a href="${c.url}" target="_blank" class="btn btn-card">Watch on YouTube</a>
            `;
            creatorsGrid.appendChild(card);
        });
    }

    // Initialize Region Select dropdown and initial load
    async function initTrendingSection() {
        currentRegion = await detectUserRegion();
        
        if (regionSelect) {
            const optionValues = Array.from(regionSelect.options).map(o => o.value);
            if (optionValues.includes(currentRegion)) {
                regionSelect.value = currentRegion;
            } else {
                currentRegion = 'US';
                regionSelect.value = 'US';
            }
            
            // Wire change listener
            regionSelect.addEventListener('change', (e) => {
                currentRegion = e.target.value;
                renderCreatorCards(currentRegion);
                fetchTrendingVideos();
            });
        }
        
        renderCreatorCards(currentRegion);
        fetchTrendingVideos();
    }

    // Modal Video Lightbox Player functions
    function openVideoPlayer(videoId) {
        if (!videoModal || !modalIframe) return;
        modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        videoModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Lock main page scrolling
    }

    function closeVideoPlayer() {
        if (!videoModal || !modalIframe) return;
        modalIframe.src = '';
        videoModal.classList.add('hidden');
        document.body.style.overflow = ''; // Unlock scrolling
    }

    if (modalClose) modalClose.addEventListener('click', closeVideoPlayer);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoPlayer);
    
    // ESC key closes player
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeVideoPlayer();
    });

    // Intercept clicks on Watch buttons in the trending grid
    if (trendingGrid) {
        trendingGrid.addEventListener('click', (e) => {
            const watchBtn = e.target.closest('.btn-card');
            if (watchBtn) {
                e.preventDefault();
                const url = watchBtn.getAttribute('href');
                if (url) {
                    const videoId = url.split('watch?v=')[1] || url.split('/').pop();
                    if (videoId) {
                        openVideoPlayer(videoId);
                    }
                }
            }
        });
    }

    // ==========================================
    // CREATIVE FEATURE 1: DAY/NIGHT THEME CYCLER
    // ==========================================
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    function initTheme() {
        const hour = new Date().getHours();
        let initialTheme = 'neon-night'; // default to neon night
        
        // 6 AM (6) to 6 PM (18) is Golden Hour
        if (hour >= 6 && hour < 18) {
            initialTheme = 'golden-hour';
        }
        
        // Apply theme to document element
        document.documentElement.setAttribute('data-theme', initialTheme);
        updateThemeIcon(initialTheme);
    }
    
    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'golden-hour') {
            themeIcon.textContent = '🌅';
            themeToggleBtn.title = 'Golden Hour active (Click to swap to Neon Night)';
        } else {
            themeIcon.textContent = '🌙';
            themeToggleBtn.title = 'Neon Night active (Click to swap to Golden Hour)';
        }
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const nextTheme = currentTheme === 'golden-hour' ? 'neon-night' : 'golden-hour';
            document.documentElement.setAttribute('data-theme', nextTheme);
            updateThemeIcon(nextTheme);
            
            // Interactive wanted level increase
            increaseWantedLevel(1);
        });
    }

    // ==========================================
    // CREATIVE FEATURE 2: VICE CITY RADIO HUD
    // ==========================================
    const retroAudio = document.getElementById('retroAudio');
    const radioPlayBtn = document.getElementById('radioPlayBtn');
    const audioVisualizer = document.getElementById('audioVisualizer');
    
    if (radioPlayBtn && retroAudio) {
        radioPlayBtn.addEventListener('click', () => {
            if (retroAudio.paused) {
                // Play audio and start visualizer bars
                retroAudio.play().then(() => {
                    radioPlayBtn.querySelector('.play-icon').classList.add('hidden');
                    radioPlayBtn.querySelector('.pause-icon').classList.remove('hidden');
                    if (audioVisualizer) audioVisualizer.classList.add('playing');
                }).catch(e => console.warn("Audio autoplay blocked by browser policy:", e));
            } else {
                // Pause audio and flatten bars
                retroAudio.pause();
                radioPlayBtn.querySelector('.play-icon').classList.remove('hidden');
                radioPlayBtn.querySelector('.pause-icon').classList.add('hidden');
                if (audioVisualizer) audioVisualizer.classList.remove('playing');
            }
            
            // Interaction increases wanted level
            increaseWantedLevel(1);
        });
    }

    // ==========================================
    // ==========================================
    // CREATIVE FEATURE 3: WANTED LEVEL HUD
    // ==========================================
    let wantedLevel = 0;
    const starsContainer = document.getElementById('starsContainer');
    const wantedStars = document.querySelectorAll('.wanted-star');
    const crtOverlay = document.querySelector('.crt-overlay');
    
    function increaseWantedLevel(amount) {
        if (wantedLevel >= 6) return; // Cap at 6 stars
        
        wantedLevel = Math.min(wantedLevel + amount, 6);
        updateWantedDisplay();
        
        // At 5 and 6 stars, trigger major visual alert events!
        if (wantedLevel === 5) {
            triggerPoliceFlash();
        } else if (wantedLevel === 6) {
            triggerPoliceFlash();
        }
    }
    
    function updateWantedDisplay() {
        wantedStars.forEach((star, index) => {
            if (index < wantedLevel) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    function triggerPoliceFlash() {
        if (!crtOverlay || !starsContainer) return;
        
        // Add visual flash effects
        crtOverlay.classList.add('flash-police');
        starsContainer.classList.add('flash-siren');
        
        // Remove flash after 4 seconds (siren cycle)
        setTimeout(() => {
            crtOverlay.classList.remove('flash-police');
            starsContainer.classList.remove('flash-siren');
        }, 4000);
    }
    
    // Wire wanted increase to existing page interactions
    // 1. Click on timeline card
    document.querySelectorAll('.timeline-card').forEach(card => {
        card.addEventListener('click', () => {
            increaseWantedLevel(1);
        });
    });
    
    // 2. Swapping regions in dropdown
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            increaseWantedLevel(1);
        });
    }

    // ==========================================
    // CREATIVE FEATURE 4: RELEASE PARTY DETECTOR
    // ==========================================
    function checkReleaseParty() {
        const now = new Date().getTime();
        if (now >= launchTime) {
            // Trigger permanent visual celebration overlays!
            if (daysEl) {
                document.querySelectorAll('.countdown-block').forEach(b => {
                    b.querySelector('.countdown-val').textContent = 'GO';
                    b.querySelector('.wanted-star').textContent = '★';
                });
            }
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) {
                heroTitle.textContent = '🔥 GRAND THEFT AUTO VI IS NOW RELEASED! 🔥';
                heroTitle.style.color = '#00ff66';
                heroTitle.style.textShadow = '0 0 25px #00ff66';
            }
        }
    }
    
    // Set up everything
    initTheme();
    initTrendingSection();
    checkReleaseParty();
    
    // Poll trending every 10 minutes
    setInterval(fetchTrendingVideos, 600000);
});
