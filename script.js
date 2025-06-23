'use strict';

document.addEventListener('DOMContentLoaded', () => {

    class App {
        constructor() {
            this.state = {
                data: { videos: [], categories: [], channels: [] },
                currentView: 'category',
                searchQuery: '',
            };
            this.init();
        }

        // ===============================================
        // SECTION 1: INITIALIZATION
        // ===============================================
        
        init() {
            this.loadData();
            this.injectSharedHTML();
            this.setupGlobalEventListeners();

            const bodyId = document.body.id;
            if (bodyId === 'main-page') {
                this.initMainPage();
            } else if (bodyId === 'player-page') {
                this.initPlayerPage();
            } else if (bodyId === 'import-page') {
                this.initImportPage();
            }
        }

        initMainPage() {
            this.setupMainPageEventListeners();
            this.renderContent();
        }

        initPlayerPage() {
            const videoId = new URLSearchParams(window.location.search).get('v');
            if (!videoId) { window.location.href = 'index.html'; return; }
            const video = this.getVideoById(videoId);
            if (!video) {
                alert('הסרטון לא נמצא.'); window.location.href = 'index.html'; return;
            }
            this.setupPlayerPage(video);
        }

        initImportPage() {
            this.populateCategoryDropdown('#bulk-import-category');
            document.getElementById('bulk-import-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBulkImportForm(e.currentTarget);
            });
        }
        
        // ===============================================
        // SECTION 2: DATA MANAGEMENT
        // ===============================================
        
        loadData() {
            try {
                const dataJSON = localStorage.getItem('kosherTubeData_v2'); // Use new key for new structure
                if (dataJSON) { this.state.data = JSON.parse(dataJSON); } 
                else { this.state.data = { videos: [], categories: [], channels: [] }; }
                if (!this.state.data.channels) this.state.data.channels = [];
                if (!this.state.data.categories) this.state.data.categories = [];
                if (!this.state.data.videos) this.state.data.videos = [];
            } catch (e) {
                this.state.data = { videos: [], categories: [], channels: [] };
            }
        }

        saveData() {
            try {
                localStorage.setItem('kosherTubeData_v2', JSON.stringify(this.state.data));
            } catch (e) { console.error("Could not save data:", e); }
        }

        getVideoById(id) { return this.state.data.videos.find(v => v.id === id); }
        getChannelById(id) { return this.state.data.channels.find(c => c.id === id); }
        
        // ===============================================
        // SECTION 3: SHARED HTML & EVENT LISTENERS
        // ===============================================

        injectSharedHTML() {
             const sharedHTML = `
                <div id="overlay" class="hidden"></div>
                <aside id="side-nav">
                    <button class="nav-close-btn" id="nav-close-btn">×</button>
                    <nav>
                        <a href="index.html"><i class="fas fa-home"></i> דף הבית</a>
                        <a href="#" id="add-video-btn"><i class="fas fa-video"></i> הוסף סרטון</a>
                        <a href="import.html"><i class="fas fa-file-import"></i> ייבוא המוני</a>
                        <a href="#" id="add-channel-btn"><i class="fab fa-youtube"></i> הוסף ערוץ</a>
                        <a href="#" id="add-category-btn"><i class="fas fa-folder-plus"></i> הוסף קטגוריה</a>
                    </nav>
                </aside>
                <div id="modal-container" class="hidden">
                    <div id="modal-overlay"></div>
                    <div id="modal-content"><button id="modal-close-btn" class="nav-close-btn">×</button><div id="modal-body"></div></div>
                </div>
                <div id="loading-indicator" class="hidden"><div class="loading-box"><i class="fas fa-spinner"></i><span id="loading-text">טוען...</span></div></div>`;
            document.body.insertAdjacentHTML('afterbegin', sharedHTML);
        }

        setupGlobalEventListeners() {
            const sideNav = document.getElementById('side-nav');
            document.getElementById('menu-toggle')?.addEventListener('click', () => sideNav.classList.toggle('open'));
            document.getElementById('nav-close-btn')?.addEventListener('click', () => sideNav.classList.remove('open'));
            document.getElementById('overlay')?.addEventListener('click', () => sideNav.classList.remove('open'));
            
            document.getElementById('add-video-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.openModalWithForm('video'); });
            document.getElementById('add-channel-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.openModalWithForm('channel'); });
            document.getElementById('add-category-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.openModalWithForm('category'); });
        }
        
        setupMainPageEventListeners() {
            document.getElementById('search-bar')?.addEventListener('input', e => {
                this.state.searchQuery = e.target.value.trim().toLowerCase();
                this.renderContent();
            });
            document.getElementById('view-by-category')?.addEventListener('click', e => this.changeView(e.target));
            document.getElementById('view-by-channel')?.addEventListener('click', e => this.changeView(e.target));
        }

        // ... (The rest of the JS file will follow) 
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ייבוא המוני</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body id="import-page">
    <header>
        <h1><i class="fas fa-file-import"></i> ייבוא סרטונים מרובים</h1>
        <button class="menu-toggle" id="menu-toggle"><i class="fas fa-bars"></i></button>
    </header>
    <main>
        <form id="bulk-import-form" class="add-container">
            <h2>הדבק רשימת קישורים</h2>
            <p>המערכת תעבור על כל קישור ותשאל אותך להזין כותרת. סרטונים שכבר קיימים ידולגו אוטומטית.</p>
            <div class="form-group">
                <label for="video-links-textarea">רשימת קישורים:</label>
                <textarea id="video-links-textarea" rows="12" placeholder="https://www.youtube.com/watch?v=...\nhttps://youtu.be/..."></textarea>
            </div>
            <div class="form-group">
                <label for="bulk-import-category">שייך את כולם לקטגוריה:</label>
                <select id="bulk-import-category" required></select>
            </div>
            <button type="submit" class="submit-button"><i class="fas fa-cogs"></i> התחל</button>
        </form>
    </main>
    <script src="script.js"></script>
</body>
</html>