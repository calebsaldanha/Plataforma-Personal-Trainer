// Validação de formulários de autenticação
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('form[action=\"/auth/register\"]');
    const loginForm = document.querySelector('form[action=\"/auth/login\"]');

    // Validação do formulário de registro
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');

            if (password.value !== confirmPassword.value) {
                e.preventDefault();
                showError('As senhas não coincidem');
                return;
            }

            if (password.value.length < 6) {
                e.preventDefault();
                showError('A senha deve ter pelo menos 6 caracteres');
                return;
            }
        });

        // Validação em tempo real
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (passwordInput && confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', function() {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    confirmPasswordInput.style.borderColor = '#ef4444';
                } else {
                    confirmPasswordInput.style.borderColor = '#10b981';
                }
            });
        }
    }

    // Validação do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const email = document.getElementById('email');
            const password = document.getElementById('password');

            if (!email.value || !password.value) {
                e.preventDefault();
                showError('Por favor, preencha todos os campos');
                return;
            }
        });
    }

    function showError(message) {
        // Remove alertas existentes
        const existingAlert = document.querySelector('.alert-error');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Cria novo alerta
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.textContent = message;

        const form = document.querySelector('.auth-form');
        if (form) {
            form.parentNode.insertBefore(alert, form);
        }
    }

    // Animação para formulários de auth
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.opacity = '0';
        authCard.style.transform = 'translateY(20px)';
        authCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            authCard.style.opacity = '1';
            authCard.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Função para mostrar notificações (compatibilidade)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = \
otification notification-\\;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease'
    });
    
    if (type === 'success') {
        notification.style.background = '#10b981';
    } else if (type === 'error') {
        notification.style.background = '#ef4444';
    } else {
        notification.style.background = '#4361ee';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
