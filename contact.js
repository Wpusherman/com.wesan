document.addEventListener('DOMContentLoaded', function() {
    const contactForms = document.querySelectorAll('.contact-form');
    const languageSelector = document.getElementById('languageSelector');

    const messages = {
        'ja': {
            submitSuccess: 'お問い合わせありがとうございます！内容が送信されました。',
            submitFail: '送信に失敗しました。もう一度お試しください。',
            submitError: '送信中にエラーが発生しました。ネットワーク接続を確認してください。',
            sending: '送信中...'
        },
        'en': {
            submitSuccess: 'Thank you for your inquiry! Your message has been sent.',
            submitFail: 'Failed to send. Please try again.',
            submitError: 'An error occurred during submission. Please check your network connection.',
            sending: 'Sending...'
        },
        'ru': {
            submitSuccess: 'Спасибо за ваш запрос! Ваше сообщение было отправлено.',
            submitFail: 'Не удалось отправить. Пожалуйста, попробуйте еще раз.',
            submitError: 'Произошла ошибка при отправке. Пожалуйста, проверьте ваше сетевое соединение.',
            sending: 'Отправка...'
        }
    };

    function getCurrentLang() {
        return (languageSelector && languageSelector.value) ? languageSelector.value : 'ja';
    }

    contactForms.forEach(function(form) {
        const formStatus = form.querySelector('.form-status');
        const submitButton = form.querySelector('.submit-button');

        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const currentLang = getCurrentLang();
            const data = new FormData(form);

            if (formStatus) {
                formStatus.textContent = messages[currentLang].sending;
                formStatus.style.color = '#666';
            }
            if (submitButton) submitButton.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    if (formStatus) {
                        formStatus.textContent = messages[currentLang].submitSuccess;
                        formStatus.style.color = 'green';
                    }
                    form.reset();
                } else {
                    // Formspree はエラー時に { errors: [{ message }] } を返す
                    let errorMessage = messages[currentLang].submitFail;
                    try {
                        const responseData = await response.json();
                        if (responseData && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
                            errorMessage = responseData.errors.map(e => e.message).join(', ');
                        }
                    } catch (e) {
                        // JSON でない場合はデフォルトメッセージを使用
                    }
                    if (formStatus) {
                        formStatus.textContent = errorMessage;
                        formStatus.style.color = 'red';
                    }
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                if (formStatus) {
                    formStatus.textContent = messages[currentLang].submitError;
                    formStatus.style.color = 'red';
                }
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    });

    const pageTitles = {
        'ja': 'お問い合わせ - ウエさんの駄弁り場',
        'en': 'Contact Us - We-san\u2019s Chat Place',
        'ru': 'Контакты - We-san\u2019s Chat Place'
    };

    function updateContactPageTitle(lang) {
        document.title = pageTitles[lang] || pageTitles['ja'];
    }

    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            const selectedLang = this.value;
            // 言語切替時に全フォームのステータスをクリア
            document.querySelectorAll('.contact-form .form-status').forEach(function(status) {
                status.textContent = '';
            });
            updateContactPageTitle(selectedLang);
        });

        updateContactPageTitle(languageSelector.value);
    }
});
