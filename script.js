document.addEventListener('DOMContentLoaded', function() {
    const menuButtonDesktop = document.getElementById('menuButtonDesktop');
    const menuButtonMobile = document.getElementById('menuButtonMobile');
    const closeButtonDesktop = document.getElementById('closeButtonDesktop');
    const closeButtonMobileInHeader = document.getElementById('closeButtonMobileInHeader');
    const sideNavDesktop = document.getElementById('sideNavDesktop');
    const sideNavMobile = document.getElementById('sideNavMobile');
    const mainContent = document.querySelector('.main-content');
    const mainHeader = document.querySelector('.main-header');

    const languageSelector = document.getElementById('languageSelector');

    const shareButton = document.getElementById('shareButton');
    const shareOptions = document.getElementById('shareOptions');
    const copyLinkButton = document.getElementById('copyLinkButton');
    const shareOptionLinks = document.querySelectorAll('.share-options a[data-share-type]');
    const shareButtonTexts = document.querySelectorAll('.share-button-text');
    const copyLinkTexts = document.querySelectorAll('.copy-link-text');
    const messages = {
    'ja': {
        copySuccess: 'リンクがコピーされました！',
        copyFail: 'リンクのコピーに失敗しました。手動でコピーしてください。',
        copyFallback: 'リンクがコピーされました！（非推奨ブラウザ機能を使用）'
    },
    'en': {
        copySuccess: 'Link copied!',
        copyFail: 'Failed to copy link. Please copy it manually.',
        copyFallback: 'Link copied! (using deprecated browser feature)'
    },
    'ru': {
        copySuccess: 'Ссылка скопирована!',
        copyFail: 'Не удалось скопировать ссылку. Скопируйте ее вручную.',
        copyFallback: 'Ссылка скопирована! (с использованием устаревшей функции браузера)'
    }
};

    function setHeaderHeightVar() {
        const headerHeight = mainHeader.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
    setHeaderHeightVar();
    window.addEventListener('resize', setHeaderHeightVar);

    function openSideNav() {
        const currentLang = languageSelector.value;

        if (window.innerWidth > 768) {
            sideNavDesktop.classList.add('open');
            mainContent.classList.add('shifted');
            if (menuButtonDesktop) menuButtonDesktop.style.display = 'none';
            document.querySelectorAll('#sideNavDesktop .nav-list').forEach(ul => {
                ul.style.display = (ul.dataset.lang === currentLang) ? 'block' : 'none';
            });
        } else {
            sideNavMobile.classList.add('open');
            document.body.style.overflow = 'hidden';
            if (menuButtonMobile) menuButtonMobile.style.display = 'none';
            if (closeButtonMobileInHeader) closeButtonMobileInHeader.style.display = 'flex';
            document.querySelectorAll('#sideNavMobile .nav-list').forEach(ul => {
                ul.style.display = (ul.dataset.lang === currentLang) ? 'block' : 'none';
            });
        }
    }

    function closeSideNav() {
        if (window.innerWidth > 768) {
            sideNavDesktop.classList.remove('open');
            mainContent.classList.remove('shifted');
            if (menuButtonDesktop) menuButtonDesktop.style.display = 'flex';
            document.querySelectorAll('#sideNavDesktop .nav-list').forEach(ul => {
                ul.style.display = 'none';
            });
        } else {
            sideNavMobile.classList.remove('open');
            document.body.style.overflow = '';
            if (menuButtonMobile) menuButtonMobile.style.display = 'flex';
            if (closeButtonMobileInHeader) closeButtonMobileInHeader.style.display = 'none';
            document.querySelectorAll('#sideNavMobile .nav-list').forEach(ul => {
                ul.style.display = 'none';
            });
        }
    }

    if (menuButtonDesktop) {
        menuButtonDesktop.addEventListener('click', openSideNav);
    }
    if (menuButtonMobile) {
        menuButtonMobile.addEventListener('click', openSideNav);
    }
    if (closeButtonDesktop) {
        closeButtonDesktop.addEventListener('click', closeSideNav);
    }
    if (closeButtonMobileInHeader) {
        closeButtonMobileInHeader.addEventListener('click', closeSideNav);
    }

    window.addEventListener('resize', function() {
        if (sideNavDesktop.classList.contains('open') || sideNavMobile.classList.contains('open')) {
             closeSideNav();
        }

        const currentLang = languageSelector.value;

        if (window.innerWidth <= 768) {
            if (menuButtonDesktop) menuButtonDesktop.style.display = 'none';
            if (sideNavDesktop) sideNavDesktop.style.display = 'none';

            if (menuButtonMobile) {
                if (!sideNavMobile.classList.contains('open')) {
                    menuButtonMobile.style.display = 'flex';
                } else {
                    menuButtonMobile.style.display = 'none';
                    if (closeButtonMobileInHeader) closeButtonMobileInHeader.style.display = 'flex';
                }
            }
            if (sideNavMobile) sideNavMobile.style.display = 'block';

            document.querySelectorAll('#sideNavMobile .nav-list').forEach(ul => {
                if (sideNavMobile.classList.contains('open')) {
                     ul.style.display = (ul.dataset.lang === currentLang) ? 'block' : 'none';
                } else {
                     ul.style.display = 'none';
                }
            });

            if (!sideNavMobile.classList.contains('open') && closeButtonMobileInHeader) {
                closeButtonMobileInHeader.style.display = 'none';
            }

        } else {
            if (menuButtonMobile) menuButtonMobile.style.display = 'none';
            if (closeButtonMobileInHeader) closeButtonMobileInHeader.style.display = 'none';
            if (sideNavMobile) sideNavMobile.style.display = 'none';

            if (menuButtonDesktop) {
                if (!sideNavDesktop.classList.contains('open')) {
                    menuButtonDesktop.style.display = 'flex';
                } else {
                    menuButtonDesktop.style.display = 'none';
                }
            }
            if (sideNavDesktop) sideNavDesktop.style.display = 'block';

            document.querySelectorAll('#sideNavDesktop .nav-list').forEach(ul => {
                if (sideNavDesktop.classList.contains('open')) {
                     ul.style.display = (ul.dataset.lang === currentLang) ? 'block' : 'none';
                } else {
                     ul.style.display = 'none';
                }
            });
        }
        setHeaderHeightVar();
    });

    window.dispatchEvent(new Event('resize'));

    const pageTitles = {
        'ja': 'ウエさんの駄弁り場',
        'en': 'Wesan’s Chat Place',
        'ru': 'Wesan’s Chat Place'
    };

    function updateLanguage(lang) {
        document.documentElement.lang = lang;
        document.title = pageTitles[lang];

        document.querySelectorAll('.header-left-area .website-name').forEach(nameSpan => {
            if (nameSpan.dataset.lang === lang) {
                nameSpan.style.display = 'inline';
            } else {
                nameSpan.style.display = 'none';
            }
        });

        document.querySelectorAll('.main-content .lang-content').forEach(content => {
            if (content.dataset.lang === lang) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });

        document.querySelectorAll('.site-footer .lang-text').forEach(footerText => {
            if (footerText.dataset.lang === lang) {
                footerText.style.display = 'block';
            } else {
                footerText.style.display = 'none';
            }
        });

        document.querySelectorAll('.side-nav .nav-list').forEach(ul => {
            if (ul.dataset.lang === lang) {
                ul.style.display = 'block';
            } else {
                ul.style.display = 'none';
            }
        });

        shareButtonTexts.forEach(span => {
            if (span.dataset.lang === lang) {
                span.style.display = 'inline';
            } else {
                span.style.display = 'none';
            }
        });

        copyLinkTexts.forEach(span => {
            if (span.dataset.lang === lang) {
                span.style.display = 'inline';
            } else {
                span.style.display = 'none';
            }
        });

        updateShareLinks();
    }

    const savedLang = localStorage.getItem('selectedLanguage') || 'ja';
    languageSelector.value = savedLang;
    updateLanguage(savedLang);

    languageSelector.addEventListener('change', function() {
        const selectedLang = this.value;
        updateLanguage(selectedLang);
        localStorage.setItem('selectedLanguage', selectedLang);
    });

    function updateShareLinks() {
        const currentUrl = encodeURIComponent(window.location.href);
        const currentTitle = encodeURIComponent(document.title);

        shareOptionLinks.forEach(link => {
            const shareType = link.dataset.shareType;
            let shareUrl = '#';

            switch (shareType) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${currentTitle}%0A%40we_san69_pusher%0A&url=${currentUrl}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${currentTitle}&body=${currentTitle}%0A${currentUrl}`;
                    break;
            }
            link.href = shareUrl;
        });
    }

    if (shareButton) {
        shareButton.addEventListener('click', function() {
            if (shareOptions.style.display === 'block') {
                shareOptions.style.display = 'none';
            } else {
                updateShareLinks();
                shareOptions.style.display = 'block';
            }
        });
    }

    document.addEventListener('click', function(event) {
        if (shareOptions && !shareOptions.contains(event.target) && event.target !== shareButton && !shareButton.contains(event.target)) {
            shareOptions.style.display = 'none';
        }
    });

    if (copyLinkButton) {
    copyLinkButton.addEventListener('click', function() {
        const currentUrl = window.location.href;
        const currentLang = languageSelector.value; 

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentUrl).then(() => {
                alert(messages[currentLang].copySuccess);
                shareOptions.style.display = 'none';
            }).catch(err => {
                console.error('リンクのコピーに失敗しました:', err);
                alert(messages[currentLang].copyFail);
            });
        } else {
            const tempInput = document.createElement('textarea');
            tempInput.value = currentUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert(messages[currentLang].copyFallback);
            shareOptions.style.display = 'none';
        }
    });
}

    updateShareLinks();
});