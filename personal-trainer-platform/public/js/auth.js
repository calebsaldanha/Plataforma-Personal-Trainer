// Validação de formulários de autenticação - VERSÃO CORRIGIDA E FUNCIONAL
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Script de auth carregado - VERSÃO CORRIGIDA');

    const loginForm = document.querySelector('form[action="/auth/login"]');
    const registerForm = document.querySelector('form[action="/auth/register"]');

    // Validação do formulário de login - CORRIGIDO
    if (loginForm) {
        console.log('✅ Formulário de login encontrado');
        
        loginForm.addEventListener('submit', function(e) {
            console.log('🚀 Formulário de login submetido - SEM BLOQUEIO');
            
            const email = document.getElementById('email');
            const password = document.getElementById('password');

            console.log('📧 Email:', email.value);
            console.log('🔑 Senha:', password.value ? '***' : 'vazia');

            // Apenas validação visual, NÃO prevenir envio
            if (!email.value || !password.value) {
                console.log('⚠️ Campos vazios detectados - apenas alerta visual');
                showError('Por favor, preencha todos os campos');
                e.preventDefault(); // Só prevenir se estiver realmente vazio
                return;
            }

            console.log('✅ Formulário válido, enviando normalmente...');
            
            // Apenas feedback visual, não bloquear envio
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Entrando...';
            submitBtn.disabled = true;

            // Timeout de segurança para reativar botão
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 5000);
        });
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

            // Loading visual
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Criando conta...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 5000);
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
});

// Função global para mostrar notificações
function showNotification(message, type = 'info') {
    console.log('💬 Notificação:', message);
    
    // Remove notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
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
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
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
