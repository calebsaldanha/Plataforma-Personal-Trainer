const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Middleware para verificar autenticação e role
const requireAdminAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    if (req.session.user.role !== 'trainer') {
        return res.redirect('/client/dashboard');
    }
    next();
};

// Dashboard do admin
router.get('/dashboard', requireAdminAuth, (req, res) => {
    const trainerId = req.session.user.id;

    // Buscar estatísticas
    const statsQueries = {
        totalClients: 'SELECT COUNT(*) as count FROM users WHERE role = "client"',
        totalWorkouts: 'SELECT COUNT(*) as count FROM workouts WHERE trainer_id = ?',
        weeklyCheckins: `
            SELECT COUNT(*) as count FROM workout_checkins 
            WHERE created_at >= date("now", "-7 days")
        `
    };

    // Executar todas as queries de estatísticas
    const stats = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(statsQueries).length;

    Object.keys(statsQueries).forEach(key => {
        const query = statsQueries[key];
        const params = key === 'totalWorkouts' ? [trainerId] : [];
        
        db.get(query, params, (err, result) => {
            if (err) {
                console.error(`Erro ao buscar estatística ${key}:`, err);
                stats[key] = 0;
            } else {
                stats[key] = result.count;
            }

            completedQueries++;
            if (completedQueries === totalQueries) {
                // Buscar clientes recentes
                const clientsQuery = `
                    SELECT u.id, u.name, u.email, u.created_at, 
                           cp.age, cp.goals 
                    FROM users u 
                    LEFT JOIN client_profiles cp ON u.id = cp.user_id 
                    WHERE u.role = "client" 
                    ORDER BY u.created_at DESC 
                    LIMIT 5
                `;

                db.all(clientsQuery, [], (err, recentClients) => {
                    if (err) {
                        console.error('Erro ao buscar clientes recentes:', err);
                        recentClients = [];
                    }

                    res.render('pages/admin-dashboard', {
                        user: req.session.user,
                        stats: stats,
                        recentClients: recentClients || []
                    });
                });
            }
        });
    });
});

// Listar todos os clientes
router.get('/clients', requireAdminAuth, (req, res) => {
    const query = `
        SELECT u.id, u.name, u.email, u.created_at,
               cp.age, cp.gender, cp.weight, cp.height, cp.goals,
               cp.fitness_level, cp.experience, cp.medical_conditions
        FROM users u 
        LEFT JOIN client_profiles cp ON u.id = cp.user_id 
        WHERE u.role = "client" 
        ORDER BY u.created_at DESC
    `;

    db.all(query, [], (err, clients) => {
        if (err) {
            console.error('Erro ao buscar clientes:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar clientes' });
        }

        res.render('pages/admin/clients', {
            user: req.session.user,
            clients: clients || []
        });
    });
});

// Detalhes do cliente
router.get('/clients/:id', requireAdminAuth, (req, res) => {
    const clientId = req.params.id;

    const query = `
        SELECT u.id, u.name, u.email, u.created_at,
               cp.*
        FROM users u 
        LEFT JOIN client_profiles cp ON u.id = cp.user_id 
        WHERE u.id = ? AND u.role = "client"
    `;

    db.get(query, [clientId], (err, client) => {
        if (err) {
            console.error('Erro ao buscar cliente:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar cliente' });
        }

        if (!client) {
            return res.status(404).render('error', { message: 'Cliente não encontrado' });
        }

        // Buscar treinos do cliente
        const workoutsQuery = `
            SELECT w.*, 
                   (SELECT COUNT(*) FROM workout_checkins wc WHERE wc.workout_id = w.id) as total_checkins,
                   (SELECT COUNT(*) FROM workout_checkins wc WHERE wc.workout_id = w.id AND wc.completed = 1) as completed_checkins
            FROM workouts w 
            WHERE w.client_id = ?
            ORDER BY w.created_at DESC
        `;

        db.all(workoutsQuery, [clientId], (err, workouts) => {
            if (err) {
                console.error('Erro ao buscar treinos:', err);
                workouts = [];
            }

            res.render('pages/admin/client-details', {
                user: req.session.user,
                client: client,
                workouts: workouts
            });
        });
    });
});

module.exports = router;
