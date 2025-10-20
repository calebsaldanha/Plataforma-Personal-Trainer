const express = require('express');
const router = express.Router();

// Página de login
router.get('/login', (req, res) => {
    res.render('pages/login', { error: null });
});

// Página de registro
router.get('/register', (req, res) => {
    res.render('pages/register', { error: null });
});

module.exports = router;
