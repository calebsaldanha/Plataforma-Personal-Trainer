const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../database/db');
const router = express.Router();

// Página de login
router.get('/login', (req, res) => {
  if (req.session.user) {
    return redirectBasedOnRole(req.session.user.role, res);
  }
  res.render('pages/login', { error: null });
});

// Processar login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.render('pages/login', { 
            error: 'Erro interno do servidor' 
          });
        }

        if (!user) {
          return res.render('pages/login', { 
            error: 'Email ou senha incorretos' 
          });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.render('pages/login', { 
            error: 'Email ou senha incorretos' 
          });
        }

        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };

        redirectBasedOnRole(user.role, res);
      }
    );
  } catch (error) {
    res.render('pages/login', { 
      error: 'Erro interno do servidor' 
    });
  }
});

// Página de registro
router.get('/register', (req, res) => {
  if (req.session.user) {
    return redirectBasedOnRole(req.session.user.role, res);
  }
  res.render('pages/register', { error: null });
});

// Processar registro
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword, userType } = req.body;

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
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = userType === 'trainer' ? 'admin' : 'client';

    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.render('pages/register', { 
              error: 'Email já cadastrado' 
            });
          }
          return res.render('pages/register', { 
            error: 'Erro interno do servidor' 
          });
        }

        // Se for cliente, redireciona para formulário inicial
        if (role === 'client') {
          req.session.tempUserId = this.lastID;
          return res.redirect('/client/initial-form');
        }

        // Se for admin, faz login automaticamente
        req.session.user = {
          id: this.lastID,
          name: name,
          email: email,
          role: role
        };

        res.redirect('/admin/dashboard');
      }
    );
  } catch (error) {
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

function redirectBasedOnRole(role, res) {
  if (role === 'admin') {
    return res.redirect('/admin/dashboard');
  } else {
    return res.redirect('/client/dashboard');
  }
}

module.exports = router;
