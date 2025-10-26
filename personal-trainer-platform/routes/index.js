const express = require('express');
const router = express.Router();

// Página inicial
router.get('/', (req, res) => {
    res.render('pages/index', {
        user: req.session ? req.session.user : null,
        isAuthenticated: !!(req.session && req.session.user),
        title: 'FitConnect - Sua Plataforma de Treino Personalizado'
    });
});

// Página sobre
router.get('/about', (req, res) => {
    res.render('pages/about', {
        user: req.session ? req.session.user : null,
        isAuthenticated: !!(req.session && req.session.user),
        title: 'Sobre - FitConnect'
    });
});
// Rota de login simples para teste
router.get('/login-simple', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login Simples</title>
        <style>
            body { font-family: Arial; padding: 20px; background: #f0f0f0; }
            .login-box { background: white; padding: 2rem; border-radius: 10px; max-width: 400px; margin: 50px auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .form-group { margin-bottom: 1rem; }
            label { display: block; margin-bottom: 0.5rem; }
            input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 5px; }
            button { width: 100%; padding: 0.75rem; background: #4361ee; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #3a56d4; }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h2>🔐 Login Simples</h2>
            <form method="POST" action="/auth/login">
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value="trainer@fitconnect.com" required>
                </div>
                <div class="form-group">
                    <label>Senha:</label>
                    <input type="password" name="password" value="123456" required>
                </div>
                <button type="submit">Entrar</button>
            </form>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                <strong>Credenciais pré-preenchidas:</strong><br>
                Email: trainer@fitconnect.com<br>
                Senha: 123456
            </p>
        </div>
        
        <script>
            console.log('🔐 Login Simples carregado');
            document.querySelector('form').addEventListener('submit', function(e) {
                console.log('🚀 Formulário enviado!');
                const email = this.email.value;
                const password = this.password.value;
                console.log('📧 Email:', email);
                console.log('🔑 Senha:', password);
            });
        </script>
    </body>
    </html>
    `);
});

module.exports = router;
