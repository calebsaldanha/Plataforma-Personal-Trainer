const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
    res.render('pages/client-dashboard', {
        user: { name: 'Cliente Teste' },
        profile: null,
        workouts: [],
        checkins: [],
        unreadCount: 0
    });
});

module.exports = router;
