document.addEventListener('DOMContentLoaded', function() {
    const YOUTUBE_API_KEY = 'AIzaSyCd5ua3DrTKp0qZ-z5Q1urqlbjQGDZxXPY';
    const YOUTUBE_CHANNEL_ID = 'UCWgFCGfnCeetMDKZAFgd2pw';

    const youtubeVideoContainers = {
        'ja': document.getElementById('youtube-videos'),
        'en': document.getElementById('youtube-videos-en'),
        'ru': document.getElementById('youtube-videos-ru')
    };

    const pageTitles = {
        'ja': 'お知らせ - ウエさんの駄弁り場',
        'en': 'News - Wesan’s Chat Place',
        'ru': 'Новости - Wesan’s Chat Place'
    };

    function updatePageTitle(lang) {
        document.title = pageTitles[lang];
    }

    async function fetchLatestYouTubeVideos(lang) {
        if (!youtubeVideoContainers[lang]) return;

        const container = youtubeVideoContainers[lang];
        container.innerHTML = '<p>Loading latest YouTube videos...</p>'; 

        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                container.innerHTML = ''; 
                data.items.forEach(item => {
                    const videoId = item.id.videoId;
                    const videoTitle = item.snippet.title;
                    const thumbnailUrl = item.snippet.thumbnails.medium.url; 

                    const videoElement = document.createElement('div');
                    videoElement.classList.add('youtube-video-item');
                    videoElement.innerHTML = `
                        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">
                            <img src="${thumbnailUrl}" alt="${videoTitle}">
                            <p>${videoTitle}</p>
                        </a>
                    `;
                    container.appendChild(videoElement);
                });
            } else {
                container.innerHTML = '<p>No YouTube videos found.</p>';
            }
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
            container.innerHTML = '<p>Failed to load YouTube videos. Please try again later.</p>';
        }
    }

    const languageSelector = document.getElementById('languageSelector');

    function initializeNewsContent() {
        const currentLang = languageSelector.value;
        fetchLatestYouTubeVideos(currentLang);
        updatePageTitle(currentLang);
    }

    languageSelector.addEventListener('change', function() {
        const selectedLang = this.value;
        fetchLatestYouTubeVideos(selectedLang);
        updatePageTitle(selectedLang);
    });

    initializeNewsContent();
});