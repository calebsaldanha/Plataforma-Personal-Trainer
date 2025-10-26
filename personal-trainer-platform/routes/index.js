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

module.exports = router;
