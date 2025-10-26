const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { db } = require('../database/db');

// Página de login
router.get('/login', (req, res) => {
    if (req.session.user) {
        return redirectToDashboard(req.session.user.role, res);
    }
    res.render('pages/login', { error: null });
});

// Página de registro
router.get('/register', (req, res) => {
    if (req.session.user) {
        return redirectToDashboard(req.session.user.role, res);
    }
    res.render('pages/register', { error: null });
});

// Processar login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('pages/login', { 
            error: 'Por favor, preencha todos os campos' 
        });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    
    db.get(query, [email], async (err, user) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.render('pages/login', { 
                error: 'Erro interno do servidor' 
            });
        }

        if (!user) {
            return res.render('pages/login', { 
                error: 'E-mail ou senha incorretos' 
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.render('pages/login', { 
                error: 'E-mail ou senha incorretos' 
            });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Verificar se é cliente e não tem perfil completo
        if (user.role === 'client') {
            const profileQuery = 'SELECT * FROM client_profiles WHERE user_id = ?';
            db.get(profileQuery, [user.id], (err, profile) => {
                if (err || !profile) {
                    return res.redirect('/client/initial-form');
                }
                return redirectToDashboard(user.role, res);
            });
        } else {
            return redirectToDashboard(user.role, res);
        }
    });
});

// Processar registro
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword, userType } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.render('pages/register', { 
            error: 'Por favor, preencha todos os campos' 
        });
    }

    if (password !== confirmPassword) {
        return res.render('pages/register', { 
            error: 'As senhas não coincidem' 
        });
    }

    if (password.length < 6) {
        return res.render('pages/register', { 
            error: 'A senha deve ter pelo menos 6 caracteres' 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const role = userType || 'client';

        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        
        db.run(query, [name, email, hashedPassword, role], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                    return res.render('pages/register', { 
                        error: 'Este e-mail já está cadastrado' 
                    });
                }
                console.error('Erro ao criar usuário:', err);
                return res.render('pages/register', { 
                    error: 'Erro interno do servidor' 
                });
            }

            // Logar usuário automaticamente após registro
            req.session.user = {
                id: this.lastID,
                name: name,
                email: email,
                role: role
            };

            if (role === 'client') {
                res.redirect('/client/initial-form');
            } else {
                res.redirect('/admin/dashboard');
            }
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.render('pages/register', { 
            error: 'Erro interno do servidor' 
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
        }
        res.redirect('/');
    });
});

// Função auxiliar para redirecionar para o dashboard correto
function redirectToDashboard(role, res) {
    if (role === 'client') {
        res.redirect('/client/dashboard');
    } else {
        res.redirect('/admin/dashboard');
    }
}

module.exports = router;
