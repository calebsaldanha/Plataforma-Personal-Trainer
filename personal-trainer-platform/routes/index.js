const express = require('express');
const router = express.Router();

// Página inicial
router.get('/', (req, res) => {
    res.render('pages/index', {
        user: req.session ? req.session.user : null,
        isAuthenticated: !!(req.session && req.session.user)
    });
});

// Página de artigos
router.get('/articles', (req, res) => {
    res.render('pages/articles', {
        user: req.session ? req.session.user : null,
        isAuthenticated: !!(req.session && req.session.user)
    });
});

// Página sobre
router.get('/about', (req, res) => {
    res.render('pages/about', {
        user: req.session ? req.session.user : null,
        isAuthenticated: !!(req.session && req.session.user)
    });
});

module.exports = router;
