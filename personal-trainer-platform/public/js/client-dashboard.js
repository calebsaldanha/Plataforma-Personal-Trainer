// Funcionalidades do dashboard do cliente
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard do cliente carregado');

    // Sistema de check-in
    const checkinForms = document.querySelectorAll('.checkin-form');
    
    checkinForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const workoutId = this.dataset.workoutId;
            
            try {
                const response = await fetch(\/client/workout/\/checkin\, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Check-in realizado com sucesso!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showNotification('Erro ao realizar check-in', 'error');
                }
            } catch (error) {
                console.error('Erro:', error);
                showNotification('Erro ao realizar check-in', 'error');
            }
        });
    });

    // Sistema de chat
    const chatForm = document.getElementById('chatForm');
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (chatForm && messagesContainer) {
        // Enviar mensagem
        chatForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const messageInput = this.querySelector('input[name=\"message\"]');
            const message = messageInput.value.trim();
            
            if (!message) return;
            
            try {
                const response = await fetch('/client/chat/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        receiver_id: this.dataset.receiverId
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    messageInput.value = '';
                    addMessageToChat(message, true);
                    scrollToBottom();
                } else {
                    showNotification('Erro ao enviar mensagem', 'error');
                }
            } catch (error) {
                console.error('Erro:', error);
                showNotification('Erro ao enviar mensagem', 'error');
            }
        });
        
        // Auto-refresh das mensagens (simplificado)
        setInterval(() => {
            if (isChatVisible()) {
                // Em uma implementação real, aqui buscaria novas mensagens
                console.log('Verificando novas mensagens...');
            }
        }, 10000);
    }

    // Animações do dashboard
    animateDashboardElements();

    // Funções auxiliares
    function addMessageToChat(message, isOwn = false) {
        const messageElement = document.createElement('div');
        messageElement.className = \message \\;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageElement.innerHTML = \
            <div class=\"message-content\">
                <p>\</p>
                <span class=\"message-time\">\</span>
            </div>
        \;
        
        if (messagesContainer) {
            messagesContainer.appendChild(messageElement);
        }
    }

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function isChatVisible() {
        const chatPage = document.querySelector('.chat-container');
        return chatPage && chatPage.offsetParent !== null;
    }

    function animateDashboardElements() {
        const statsCards = document.querySelectorAll('.stat-card');
        const workoutCards = document.querySelectorAll('.workout-card');
        
        statsCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = \opacity 0.6s ease \s, transform 0.6s ease \s\;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
        
        workoutCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-20px)';
            card.style.transition = \opacity 0.6s ease \s, transform 0.6s ease \s\;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            }, 300 + (index * 100));
        });
    }

    // Adicionar estilos para o chat
    const chatStyles = \
        <style>
            .message {
                margin-bottom: 1rem;
                display: flex;
            }
            
            .own-message {
                justify-content: flex-end;
            }
            
            .other-message {
                justify-content: flex-start;
            }
            
            .message-content {
                max-width: 70%;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                position: relative;
            }
            
            .own-message .message-content {
                background: #4361ee;
                color: white;
            }
            
            .other-message .message-content {
                background: #e9ecef;
                color: #343a40;
            }
            
            .message-time {
                font-size: 0.75rem;
                opacity: 0.7;
                display: block;
                margin-top: 0.25rem;
            }
            
            .chat-container {
                height: 400px;
                overflow-y: auto;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 1rem;
                background: white;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        </style>
    \;
    
    document.head.insertAdjacentHTML('beforeend', chatStyles);
});

// Função para mostrar notificações
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
