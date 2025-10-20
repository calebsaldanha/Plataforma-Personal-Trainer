const express = require('express');
const { db } = require('../database/db');
const router = express.Router();

// API para buscar dados do usuário
router.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    
    db.get(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno' });
            }
            
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            
            res.json(user);
        }
    );
});

// API para estatísticas
router.get('/stats', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    db.serialize(() => {
        const stats = {};
        
        // Total de clientes
        db.get(
            'SELECT COUNT(*) as total FROM users WHERE role = \"client\"',
            (err, result) => {
                if (!err) stats.totalClients = result.total;
            }
        );
        
        // Total de treinos
        db.get(
            'SELECT COUNT(*) as total FROM workouts',
            (err, result) => {
                if (!err) stats.totalWorkouts = result.total;
            }
        );
        
        // Check-ins da semana
        db.get(
            \SELECT COUNT(*) as total 
             FROM workout_checkins 
             WHERE date(created_at) >= date('now', '-7 days')\,
            (err, result) => {
                if (!err) stats.weeklyCheckins = result.total;
                
                // Retorna todas as estatísticas
                res.json(stats);
            }
        );
    });
});

// API para dados de progresso do cliente
router.get('/client/progress/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    
    if (!req.session.user || (req.session.user.role !== 'admin' && req.session.user.id != clientId)) {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    db.all(
        \SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_workouts,
            SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_workouts
         FROM workout_checkins 
         WHERE client_id = ? 
         GROUP BY DATE(created_at)
         ORDER BY date DESC
         LIMIT 30\,
        [clientId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno' });
            }
            
            res.json(results);
        }
    );
});

module.exports = router;
