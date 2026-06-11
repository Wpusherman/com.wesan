document.addEventListener('DOMContentLoaded', function() {
    const languageSelector = document.getElementById('languageSelector');

    const blogListContainers = {
        'ja': document.getElementById('blogListJa'),
        'en': document.getElementById('blogListEn'),
        'ru': document.getElementById('blogListRu')
    };
    const blogLoadingMessages = {
        'ja': document.getElementById('blogLoadingJa'),
        'en': document.getElementById('blogLoadingEn'),
        'ru': document.getElementById('blogLoadingRu')
    };
    const blogErrorMessages = {
        'ja': document.getElementById('blogErrorJa'),
        'en': document.getElementById('blogErrorEn'),
        'ru': document.getElementById('blogErrorRu')
    };
    const tagButtonsContainers = {
        'ja': document.getElementById('tagButtonsJa'),
        'en': document.getElementById('tagButtonsEn'),
        'ru': document.getElementById('tagButtonsRu')
    };
    const paginationContainers = {
        'ja': document.getElementById('paginationJa'),
        'en': document.getElementById('paginationEn'),
        'ru': document.getElementById('paginationRu')
    };
    const dateFilterInputs = {
        'ja': document.getElementById('dateFilterJa'),
        'en': document.getElementById('dateFilterEn'),
        'ru': document.getElementById('dateFilterRu')
    };

    const pageTitles = {
        'ja': 'ブログ - ウエさんの駄弁り場',
        'en': 'Blog - We-san\'s Chat Place',
        'ru': 'Блог - Место чатов Уэ-сана'
    };

    // タグ表示名
    const tagDisplayNames = {
        '日常': {'ja': '日常', 'en': 'Daily Life', 'ru': 'Повседневность'},
        'ゲーム': {'ja': 'ゲーム', 'en': 'Games', 'ru': 'Игры'},
        '麻雀': {'ja': '麻雀', 'en': 'Mahjong', 'ru': 'Маджонг'},
        '動画編集': {'ja': '動画編集', 'en': 'Video Editing', 'ru': 'Видеомонтаж'},
        '旅行': {'ja': '旅行', 'en': 'Travel', 'ru': 'Путешествия'},
        'ウェブ開発': {'ja': 'ウェブ開発', 'en': 'Web Development', 'ru': 'Веб-разработка'}, // 新しいタグを追加
        'all': {'ja': 'すべて', 'en': 'All', 'ru': 'Все'}
    };

    let allBlogPosts = [];
    let currentPage = 1;
    const postsPerPage = 5; 
    let currentSelectedTag = 'all';
    let currentSelectedMonth = '';

    function updateBlogPageTitle(lang) {
        document.title = pageTitles[lang] || pageTitles['ja'];
    }

    async function loadBlogPosts() {
        for (const lang in blogLoadingMessages) {
            if (blogLoadingMessages[lang]) blogLoadingMessages[lang].style.display = 'block';
            if (blogErrorMessages[lang]) blogErrorMessages[lang].style.display = 'none';
        }
        try {
            const response = await fetch('blog-posts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allBlogPosts = await response.json();
            for (const lang in blogLoadingMessages) {
                if (blogLoadingMessages[lang]) blogLoadingMessages[lang].style.display = 'none';
            }
            renderTagButtons(languageSelector.value);
            renderBlogList(languageSelector.value, currentSelectedTag, currentSelectedMonth, currentPage);
        } catch (error) {
            console.error('ブログ記事の読み込みエラー:', error);
            for (const lang in blogErrorMessages) {
                if (blogErrorMessages[lang]) blogErrorMessages[lang].style.display = 'block';
                if (blogLoadingMessages[lang]) blogLoadingMessages[lang].style.display = 'none';
            }
        }
    }

    function renderTagButtons(lang) {
        for (const langKey in tagButtonsContainers) {
            const container = tagButtonsContainers[langKey];
            if (container) {
                container.innerHTML = ''; 
                const tags = new Set();
                allBlogPosts.forEach(post => {
                    post.tags.forEach(tag => tags.add(tag));
                });

                const allButton = document.createElement('button');
                allButton.classList.add('tag-button');
                allButton.textContent = tagDisplayNames['all'][langKey];
                allButton.dataset.tag = 'all';
                allButton.classList.toggle('active', currentSelectedTag === 'all');
                allButton.addEventListener('click', () => {
                    currentSelectedTag = 'all';
                    currentPage = 1;
                    renderBlogList(languageSelector.value, currentSelectedTag, currentSelectedMonth, currentPage);
                    updateTagButtonStates(langKey, 'all');
                });
                container.appendChild(allButton);

                tags.forEach(tag => {
                    const button = document.createElement('button');
                    button.classList.add('tag-button');
                    button.textContent = tagDisplayNames[tag] ? tagDisplayNames[tag][langKey] : tag;
                    button.dataset.tag = tag;
                    button.classList.toggle('active', currentSelectedTag === tag);
                    button.addEventListener('click', () => {
                        currentSelectedTag = tag;
                        currentPage = 1;
                        renderBlogList(languageSelector.value, currentSelectedTag, currentSelectedMonth, currentPage);
                        updateTagButtonStates(langKey, tag);
                    });
                    container.appendChild(button);
                });
            }
        }
        updateTagButtonStates(lang, currentSelectedTag);
    }

    function updateTagButtonStates(langKey, activeTag) {
        const container = tagButtonsContainers[langKey];
        if (container) {
            container.querySelectorAll('.tag-button').forEach(button => {
                if (button.dataset.tag === activeTag) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    }

    function renderBlogList(lang, filterTag, filterMonth, page) {
        for (const langKey in blogListContainers) {
            const container = blogListContainers[langKey];
            if (container) {
                container.innerHTML = ''; 
            }
        }

        let filteredPosts = allBlogPosts.filter(post => {
            const matchesTag = filterTag === 'all' || post.tags.includes(filterTag);
            const postDate = new Date(post.date);
            const matchesMonth = filterMonth === '' || 
                                 (postDate.getFullYear() === parseInt(filterMonth.substring(0, 4)) &&
                                  (postDate.getMonth() + 1) === parseInt(filterMonth.substring(5, 7)));
            return matchesTag && matchesMonth;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        const startIndex = (page - 1) * postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

        for (const langKey in blogListContainers) {
            const container = blogListContainers[langKey];
            if (container && langKey === lang) { 
                if (paginatedPosts.length === 0) {
                    container.innerHTML = `<p class="lang-text" data-lang="ja">${langKey === 'ja' ? '該当する記事はありません。' : ''}</p>
                                         <p class="lang-text" data-lang="en" style="display: ${langKey === 'en' ? 'block' : 'none'};">${langKey === 'en' ? 'No articles found.' : ''}</p>
                                         <p class="lang-text" data-lang="ru" style="display: ${langKey === 'ru' ? 'block' : 'none'};">${langKey === 'ru' ? 'Статей не найдено.' : ''}</p>`;
                } else {
                    paginatedPosts.forEach(post => {
                        const blogItem = document.createElement('li');

                        const titleLink = document.createElement('a');

                        titleLink.href = post.url;

                        titleLink.textContent = post.title[langKey] || post.title['en'] || post.title['ja'];
                        blogItem.appendChild(titleLink);

                        const dateSpan = document.createElement('span');
                        dateSpan.classList.add('date');
                        dateSpan.textContent = new Date(post.date).toLocaleDateString(
                            langKey === 'en' ? 'en-US' : (langKey === 'ru' ? 'ru-RU' : 'ja-JP'),
                            { year: 'numeric', month: 'long', day: 'numeric' }
                        );
                        blogItem.appendChild(dateSpan);

                        const tagsDiv = document.createElement('div');
                        tagsDiv.classList.add('blog-item-tags');
                        if (post.tags && post.tags.length > 0) {
                            post.tags.forEach(tag => {
                                const tagSpan = document.createElement('span');
                                tagSpan.classList.add('blog-tag');
                                tagSpan.textContent = tagDisplayNames[tag] ? tagDisplayNames[tag][langKey] : tag;
                                tagsDiv.appendChild(tagSpan);
                            });
                        }
                        blogItem.appendChild(tagsDiv);

                        container.appendChild(blogItem);
                    });
                }
            }
        }
        renderPagination(lang, filteredPosts.length);
    }

    function renderPagination(lang, totalPosts) {
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        for (const langKey in paginationContainers) {
            const paginationContainer = paginationContainers[langKey];
            if (paginationContainer && langKey === lang) {
                paginationContainer.innerHTML = ''; 

                if (totalPages <= 1) {
                    return; 
                }

                const prevLink = document.createElement('a');
                prevLink.href = '#';
                prevLink.textContent = langKey === 'ja' ? '前へ' : (langKey === 'en' ? 'Prev' : 'Пред.');
                prevLink.classList.add('page-link');
                if (currentPage === 1) {
                    prevLink.classList.add('disabled');
                } else {
                    prevLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        currentPage--;
                        renderBlogList(lang, currentSelectedTag, currentSelectedMonth, currentPage);
                        const listContainer = blogListContainers[lang];
                        if (listContainer) {
                            window.scrollTo({ top: listContainer.offsetTop - 50, behavior: 'smooth' });
                        }
                    });
                }
                paginationContainer.appendChild(prevLink);

                // ページ番号
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, currentPage + 2);

                if (endPage - startPage + 1 < 5) {
                    if (startPage === 1) {
                        endPage = Math.min(totalPages, 5);
                    } else if (endPage === totalPages) {
                        startPage = Math.max(1, totalPages - 4);
                    }
                }

                for (let i = startPage; i <= endPage; i++) {
                    const pageLink = document.createElement('a');
                    pageLink.href = '#';
                    pageLink.textContent = i;
                    pageLink.classList.add('page-link');
                    if (i === currentPage) {
                        pageLink.classList.add('active');
                    }
                    pageLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        currentPage = i;
                        renderBlogList(lang, currentSelectedTag, currentSelectedMonth, currentPage);
                        const listContainer = blogListContainers[lang];
                        if (listContainer) {
                            window.scrollTo({ top: listContainer.offsetTop - 50, behavior: 'smooth' });
                        }
                    });
                    paginationContainer.appendChild(pageLink);
                }

                // Nextボタン
                const nextLink = document.createElement('a');
                nextLink.href = '#';
                nextLink.textContent = langKey === 'ja' ? '次へ' : (langKey === 'en' ? 'Next' : 'След.');
                nextLink.classList.add('page-link');
                if (currentPage === totalPages) {
                    nextLink.classList.add('disabled');
                } else {
                    nextLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        currentPage++;
                        renderBlogList(lang, currentSelectedTag, currentSelectedMonth, currentPage);
                        const listContainer = blogListContainers[lang];
                        if (listContainer) {
                            window.scrollTo({ top: listContainer.offsetTop - 50, behavior: 'smooth' });
                        }
                    });
                }
                paginationContainer.appendChild(nextLink);
            }
        }
    }

    languageSelector.addEventListener('change', function() {
        const selectedLang = this.value;
        updateBlogPageTitle(selectedLang);
        currentSelectedTag = 'all';
        currentSelectedMonth = '';
        for (const langKey in dateFilterInputs) {
            dateFilterInputs[langKey].value = '';
        }
        renderTagButtons(selectedLang); 
        renderBlogList(selectedLang, currentSelectedTag, currentSelectedMonth, currentPage);
    });

    for (const langKey in dateFilterInputs) {
        dateFilterInputs[langKey].addEventListener('change', function() {
            currentSelectedMonth = this.value;
            currentPage = 1;
            const currentLang = languageSelector.value;
            renderBlogList(currentLang, currentSelectedTag, currentSelectedMonth, currentPage);
        });
    }

    const initialLang = languageSelector.value;
    updateBlogPageTitle(initialLang);
    loadBlogPosts();
});