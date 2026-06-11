document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus'); 
    const languageSelector = document.getElementById('languageSelector'); 

    const messages = { 
        'ja': { 
            submitSuccess: 'お問い合わせありがとうございます！内容が送信されました。', 
            submitFail: '送信に失敗しました。もう一度お試しください。', 
            submitError: '送信中にエラーが発生しました。ネットワーク接続を確認してください。', 
            phpError: 'サーバー側でエラーが発生しました。管理者にお問い合わせください。'
        },
        'en': { 
            submitSuccess: 'Thank you for your inquiry! Your message has been sent.', 
            submitFail: 'Failed to send. Please try again.', 
            submitError: 'An error occurred during submission. Please check your network connection.', 
            phpError: 'An error occurred on the server. Please contact the administrator.' 
        },
        'ru': { 
            submitSuccess: 'Спасибо за ваш запрос! Ваше сообщение было отправлено.', 
            submitFail: 'Не удалось отправить. Пожалуйста, попробуйте еще раз.', 
            submitError: 'Произошла ошибка при отправке. Пожалуйста, проверьте ваше сетевое соединение.', 
            phpError: 'Произошла ошибка на сервере. Пожалуйста, свяжитесь с администратором.'
        }
    };

    if (contactForm) { 
        contactForm.addEventListener('submit', async function(event) { 
            event.preventDefault(); 

            const currentLang = languageSelector.value; 
            const form = event.target; 
            const data = new FormData(form); 

            try {
                const response = await fetch(form.action, { 
                    method: form.method, 
                    body: data, 
                });

                const responseData = await response.json(); 

                if (response.ok && responseData.success) {
                    formStatus.textContent = messages[currentLang].submitSuccess; 
                    formStatus.style.color = 'green'; 
                    form.reset(); 
                } else {
                    if (responseData.message) {
                        formStatus.textContent = responseData.message; 
                    } else {
                        formStatus.textContent = messages[currentLang].submitFail; 
                    }
                    formStatus.style.color = 'red'; 
                }
            } catch (error) {
                console.error('Error submitting form:', error); 
                formStatus.textContent = messages[currentLang].submitError; 
                formStatus.style.color = 'red'; 
            }
        });
    }

    const pageTitles = { 
        'ja': 'お問い合わせ - ウエさんの駄弁り場', 
        'en': 'Contact Us - Wesan’s Chat Place', 
        'ru': 'Контакты - Wesan’s Chat Place' 
    };

    function updateContactPageTitle(lang) { 
        document.title = pageTitles[lang]; 
    }

    languageSelector.addEventListener('change', function() { 
        const selectedLang = this.value; 
        formStatus.textContent = ''; 
        updateContactPageTitle(selectedLang); 
    });

    updateContactPageTitle(languageSelector.value); 
});