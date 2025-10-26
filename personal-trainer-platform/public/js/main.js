// Menu Mobile
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Smooth Scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form de Contato
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simulação de envio
    const formData = new FormData(this);
    console.log('Dados do formulário:', Object.fromEntries(formData));
    
    // Feedback visual
    const button = this.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    
    button.textContent = 'Enviando...';
    button.disabled = true;
    button.classList.add('loading');
    
    setTimeout(() => {
        button.textContent = 'Mensagem Enviada!';
        button.style.background = '#28a745';
        button.classList.remove('loading');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.background = '';
            this.reset();
        }, 2000);
    }, 1000);
});

// Animação de scroll para elementos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar animação aos elementos
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.step, .feature-card, .article-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
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

// Validação de formulários
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                    
                    // Adicionar mensagem de erro
                    let errorMessage = field.parentNode.querySelector('.error-message');
                    if (!errorMessage) {
                        errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        errorMessage.style.color = '#ef4444';
                        errorMessage.style.fontSize = '0.8rem';
                        errorMessage.style.marginTop = '0.25rem';
                        field.parentNode.appendChild(errorMessage);
                    }
                    errorMessage.textContent = 'Este campo é obrigatório.';
                } else {
                    field.style.borderColor = '';
                    const errorMessage = field.parentNode.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.remove();
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            }
        });
    });
});

// Função para formatar datas
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Função para fazer requisições AJAX
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
        throw error;
    }
}

// Loading global para botões
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        if (e.target.matches('.btn[type="submit"]') || e.target.closest('.btn[type="submit"]')) {
            const button = e.target.matches('.btn') ? e.target : e.target.closest('.btn');
            const form = button.closest('form');
            
            if (form && form.checkValidity()) {
                button.classList.add('loading');
                button.disabled = true;
                
                // Remover loading após 30 segundos (timeout)
                setTimeout(() => {
                    button.classList.remove('loading');
                    button.disabled = false;
                }, 30000);
            }
        }
    });
});

// Função para copiar texto para clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copiado para a área de transferência!', 'success');
    }).catch(err => {
        console.error('Erro ao copiar texto: ', err);
        showNotification('Erro ao copiar texto.', 'error');
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('FitConnect - Plataforma carregada com sucesso!');
    
    // Adicionar classe de carregamento inicial
    document.body.classList.add('loaded');
    
    // Remover preloader se existir
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
            }, 300);
        }, 500);
    }
});

// Manipulação de erros global
window.addEventListener('error', function(e) {
    console.error('Erro global:', e.error);
    showNotification('Ocorreu um erro inesperado.', 'error');
});

// Offline/Online detection
window.addEventListener('online', function() {
    showNotification('Conexão restaurada.', 'success');
});

window.addEventListener('offline', function() {
    showNotification('Você está offline. Algumas funcionalidades podem não estar disponíveis.', 'warning');
});
