// Validação de formulários de autenticação - VERSÃO CORRIGIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Script de auth carregado');

    const loginForm = document.querySelector('form[action="/auth/login"]');
    const registerForm = document.querySelector('form[action="/auth/register"]');

    // Validação do formulário de login
    if (loginForm) {
        console.log('✅ Formulário de login encontrado');
        
        loginForm.addEventListener('submit', function(e) {
            console.log('🚀 Formulário de login submetido');
            
            const email = document.getElementById('email');
            const password = document.getElementById('password');

            console.log('📧 Email:', email.value);
            console.log('🔑 Senha:', password.value ? '***' : 'vazia');

            if (!email.value || !password.value) {
                console.log('❌ Campos vazios detectados');
                e.preventDefault();
                showError('Por favor, preencha todos os campos');
                return;
            }

            console.log('✅ Formulário válido, enviando...');
            
            // Remover qualquer loading anterior
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Entrando...';
            submitBtn.disabled = true;
        });

        // Adicionar evento de input para debug
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                console.log('📧 Email digitado:', this.value);
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                console.log('🔑 Senha digitada:', this.value ? '***' : 'vazia');
            });
        }
    }

    // Validação do formulário de registro
    if (registerForm) {
        console.log('✅ Formulário de registro encontrado');
        
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
    }

    function showError(message) {
        console.log('❌ Erro:', message);
        
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

        // Scroll para o alerta
        alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Testar se o script está carregando
    console.log('🎯 Script de auth totalmente carregado');
});

// Função global para mostrar notificações
function showNotification(message, type = 'info') {
    console.log('💬 Notificação:', message);
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#10b981';
    } else if (type === 'error') {
        notification.style.background = '#ef4444';
    } else if (type === 'warning') {
        notification.style.background = '#f59e0b';
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
