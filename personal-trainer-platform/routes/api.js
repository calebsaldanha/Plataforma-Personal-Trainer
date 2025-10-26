const express = require('express');
const router = express.Router();

// Rota de teste da API
router.get('/test', (req, res) => {
    res.json({ 
        message: 'API funcionando!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;
