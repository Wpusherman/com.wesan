document.addEventListener('DOMContentLoaded', function() {
    // YouTube Data API キーを廃止し、APIキー不要の RSS フィードを使用します。
    // RSS は XML かつ CORS 制限があるため、RSS→JSON 変換プロキシ経由で取得します。
    const YOUTUBE_CHANNEL_ID = 'UCWgFCGfnCeetMDKZAFgd2pw';
    const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const MAX_RESULTS = 5;

    // RSS→JSON / RSS取得プロキシを複数用意し、順にフォールバックする
    // （無料プロキシはレート制限があるため、1つ失敗しても次を試す）
    const RSS_FETCHERS = [
        // 1) rss2json（JSONを直接返す）
        {
            url: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(YOUTUBE_RSS_URL)}`,
            parse: parseRss2Json
        },
        // 2) allorigins（生のXMLを返す → 自前でパース）
        {
            url: `https://api.allorigins.win/raw?url=${encodeURIComponent(YOUTUBE_RSS_URL)}`,
            parse: parseRawXml
        }
    ];

    const youtubeVideoContainers = {
        'ja': document.getElementById('youtube-videos'),
        'en': document.getElementById('youtube-videos-en'),
        'ru': document.getElementById('youtube-videos-ru')
    };

    const pageTitles = {
        'ja': 'お知らせ - ウエさんの駄弁り場',
        'en': 'News - We-san\u2019s Chat Place',
        'ru': 'Новости - We-san\u2019s Chat Place'
    };

    const uiMessages = {
        'ja': {
            loading: '最新のYouTube動画を読み込み中...',
            empty: 'YouTube動画が見つかりませんでした。',
            error: 'YouTube動画の読み込みに失敗しました。しばらくしてからもう一度お試しください。'
        },
        'en': {
            loading: 'Loading latest YouTube videos...',
            empty: 'No YouTube videos found.',
            error: 'Failed to load YouTube videos. Please try again later.'
        },
        'ru': {
            loading: 'Загрузка последних видео с YouTube...',
            empty: 'Видео на YouTube не найдены.',
            error: 'Не удалось загрузить видео с YouTube. Пожалуйста, попробуйте позже.'
        }
    };

    // 動画情報の共通フォーマット: { id, title, thumbnail }

    // rss2json のレスポンス(JSON)をパース
    function parseRss2Json(data) {
        if (!data || data.status !== 'ok' || !Array.isArray(data.items)) {
            throw new Error('Invalid rss2json response');
        }
        return data.items.map(item => {
            const id = extractVideoIdFromStrings(item.guid, item.link);
            return id ? {
                id: id,
                title: item.title || '',
                thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
            } : null;
        }).filter(Boolean);
    }

    // 生のRSS(XML)文字列をパース
    function parseRawXml(xmlText) {
        const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (doc.querySelector('parsererror')) {
            throw new Error('XML parse error');
        }
        const entries = Array.from(doc.getElementsByTagName('entry'));
        return entries.map(entry => {
            const getText = (tag) => {
                const el = entry.getElementsByTagName(tag)[0];
                return el ? el.textContent : '';
            };
            // yt:videoId 要素（名前空間付き）
            let id = getText('yt:videoId') || getText('videoId');
            const linkEl = entry.getElementsByTagName('link')[0];
            const link = linkEl ? linkEl.getAttribute('href') : '';
            if (!id) {
                id = extractVideoIdFromStrings(getText('id'), link);
            }
            return id ? {
                id: id,
                title: getText('title'),
                thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
            } : null;
        }).filter(Boolean);
    }

    // 文字列群から YouTube 動画IDを抽出
    function extractVideoIdFromStrings() {
        for (let i = 0; i < arguments.length; i++) {
            const s = arguments[i];
            if (!s) continue;
            let m = s.match(/video:([\w-]+)/);
            if (m) return m[1];
            m = s.match(/[?&]v=([\w-]+)/);
            if (m) return m[1];
        }
        return null;
    }

    // 複数プロキシを順に試して動画リストを取得
    async function fetchVideos() {
        let lastError = null;
        for (const fetcher of RSS_FETCHERS) {
            try {
                const response = await fetch(fetcher.url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const payload = (fetcher.parse === parseRawXml)
                    ? await response.text()
                    : await response.json();
                const videos = fetcher.parse(payload);
                if (videos && videos.length > 0) {
                    return videos;
                }
                throw new Error('Empty video list');
            } catch (error) {
                lastError = error;
                // 次のプロキシを試す
            }
        }
        throw lastError || new Error('All fetchers failed');
    }

    function renderVideos(container, videos, msg) {
        container.innerHTML = '';
        videos.slice(0, MAX_RESULTS).forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.classList.add('youtube-video-item');

            const link = document.createElement('a');
            link.href = `https://www.youtube.com/watch?v=${video.id}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            const img = document.createElement('img');
            img.src = video.thumbnail;
            img.alt = video.title;
            img.loading = 'lazy';

            const titleP = document.createElement('p');
            titleP.textContent = video.title;

            link.appendChild(img);
            link.appendChild(titleP);
            videoElement.appendChild(link);
            container.appendChild(videoElement);
        });

        if (!container.hasChildNodes()) {
            container.innerHTML = `<p>${msg.empty}</p>`;
        }
    }

    async function fetchLatestYouTubeVideos(lang) {
        const container = youtubeVideoContainers[lang];
        if (!container) return;

        const msg = uiMessages[lang] || uiMessages['ja'];
        container.innerHTML = `<p>${msg.loading}</p>`;

        try {
            const videos = await fetchVideos();
            renderVideos(container, videos, msg);
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
            container.innerHTML = `<p>${msg.error}</p>`;
        }
    }

    const languageSelector = document.getElementById('languageSelector');

    function updatePageTitle(lang) {
        document.title = pageTitles[lang] || pageTitles['ja'];
    }

    function initializeNewsContent() {
        const currentLang = languageSelector ? languageSelector.value : 'ja';
        fetchLatestYouTubeVideos(currentLang);
        updatePageTitle(currentLang);
    }

    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            const selectedLang = this.value;
            fetchLatestYouTubeVideos(selectedLang);
            updatePageTitle(selectedLang);
        });
    }

    initializeNewsContent();
});
