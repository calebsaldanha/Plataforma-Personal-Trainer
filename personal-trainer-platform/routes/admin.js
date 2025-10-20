const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
    res.render('pages/admin-dashboard', {
        user: { name: 'Admin Teste' },
        stats: {
            totalClients: 0,
            totalWorkouts: 0,
            weeklyCheckins: 0
        },
        recentClients: []
    });
});

module.exports = router;
