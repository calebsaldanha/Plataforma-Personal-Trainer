const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Middleware para verificar autenticação e role
const requireClientAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    if (req.session.user.role !== 'client') {
        return res.redirect('/admin/dashboard');
    }
    next();
};

// Dashboard do cliente
router.get('/dashboard', requireClientAuth, (req, res) => {
    const userId = req.session.user.id;

    // Buscar perfil do cliente
    const profileQuery = 'SELECT * FROM client_profiles WHERE user_id = ?';
    
    db.get(profileQuery, [userId], (err, profile) => {
        if (err) {
            console.error('Erro ao buscar perfil:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar dashboard' });
        }

        // Buscar treinos do cliente
        const workoutsQuery = `
            SELECT w.*, u.name as trainer_name 
            FROM workouts w 
            JOIN users u ON w.trainer_id = u.id 
            WHERE w.client_id = ? 
            ORDER BY w.created_at DESC
            LIMIT 5
        `;

        db.all(workoutsQuery, [userId], (err, workouts) => {
            if (err) {
                console.error('Erro ao buscar treinos:', err);
                return res.status(500).render('error', { message: 'Erro ao carregar dashboard' });
            }

            // Buscar check-ins recentes
            const checkinsQuery = `
                SELECT wc.*, w.title 
                FROM workout_checkins wc 
                JOIN workouts w ON wc.workout_id = w.id 
                WHERE wc.client_id = ? 
                ORDER BY wc.created_at DESC 
                LIMIT 10
            `;

            db.all(checkinsQuery, [userId], (err, checkins) => {
                if (err) {
                    console.error('Erro ao buscar check-ins:', err);
                    return res.status(500).render('error', { message: 'Erro ao carregar dashboard' });
                }

                // Contar mensagens não lidas
                const unreadQuery = 'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = 0';
                
                db.get(unreadQuery, [userId], (err, result) => {
                    if (err) {
                        console.error('Erro ao contar mensagens:', err);
                    }

                    res.render('pages/client-dashboard', {
                        user: req.session.user,
                        profile: profile,
                        workouts: workouts || [],
                        checkins: checkins || [],
                        unreadCount: result ? result.count : 0
                    });
                });
            });
        });
    });
});

// Formulário inicial do cliente
router.get('/initial-form', requireClientAuth, (req, res) => {
    // Verificar se já tem perfil
    const checkQuery = 'SELECT * FROM client_profiles WHERE user_id = ?';
    
    db.get(checkQuery, [req.session.user.id], (err, profile) => {
        if (err || profile) {
            return res.redirect('/client/dashboard');
        }
        
        res.render('pages/initial-form', {
            user: req.session.user,
            error: null
        });
    });
});

// Processar formulário inicial
router.post('/initial-form', requireClientAuth, (req, res) => {
    const {
        age, gender, weight, height, 
        fitness_level, goals, experience, medical_conditions
    } = req.body;

    if (!age || !gender || !weight || !height || !fitness_level || !goals) {
        return res.render('pages/initial-form', {
            user: req.session.user,
            error: 'Por favor, preencha todos os campos obrigatórios'
        });
    }

    const query = `
        INSERT INTO client_profiles 
        (user_id, age, gender, weight, height, fitness_level, goals, experience, medical_conditions) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
        req.session.user.id, age, gender, weight, height, 
        fitness_level, goals, experience, medical_conditions
    ], function(err) {
        if (err) {
            console.error('Erro ao salvar perfil:', err);
            return res.render('pages/initial-form', {
                user: req.session.user,
                error: 'Erro ao salvar perfil. Tente novamente.'
            });
        }

        res.redirect('/client/dashboard');
    });
});

module.exports = router;
