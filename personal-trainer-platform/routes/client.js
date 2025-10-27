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

// Meus treinos
router.get('/workouts', requireClientAuth, (req, res) => {
    const clientId = req.session.user.id;

    const query = `
        SELECT w.*, u.name as trainer_name 
        FROM workouts w 
        JOIN users u ON w.trainer_id = u.id 
        WHERE w.client_id = ? 
        ORDER BY w.created_at DESC
    `;

    db.all(query, [clientId], (err, workouts) => {
        if (err) {
            console.error('Erro ao buscar treinos:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar treinos' });
        }

        res.render('pages/client-workouts', {
            user: req.session.user,
            workouts: workouts || []
        });
    });
});

// Detalhes do treino (cliente)
router.get('/workout/:id', requireClientAuth, (req, res) => {
    const workoutId = req.params.id;
    const clientId = req.session.user.id;

    const query = `
        SELECT w.*, u.name as trainer_name 
        FROM workouts w 
        JOIN users u ON w.trainer_id = u.id 
        WHERE w.id = ? AND w.client_id = ?
    `;

    db.get(query, [workoutId, clientId], (err, workout) => {
        if (err) {
            console.error('Erro ao buscar treino:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar treino' });
        }

        if (!workout) {
            return res.status(404).render('error', { message: 'Treino não encontrado' });
        }

        // Buscar check-ins do treino
        const checkinsQuery = `
            SELECT * FROM workout_checkins 
            WHERE workout_id = ? AND client_id = ?
            ORDER BY created_at DESC
        `;

        db.all(checkinsQuery, [workoutId, clientId], (err, checkins) => {
            if (err) {
                console.error('Erro ao buscar check-ins:', err);
            }

            // Parse exercises JSON
            let exercises = [];
            try {
                exercises = workout.exercises ? JSON.parse(workout.exercises) : [];
            } catch (e) {
                console.error('Erro ao fazer parse dos exercícios:', e);
            }

            res.render('pages/workout-details', {
                user: req.session.user,
                workout: workout,
                checkins: checkins || [],
                exercises: exercises
            });
        });
    });
});

// Chat do cliente
router.get('/chat', requireClientAuth, (req, res) => {
    const clientId = req.session.user.id;

    // Buscar personal trainer para o chat
    const trainerQuery = `
        SELECT u.id, u.name, u.email 
        FROM users u 
        WHERE u.role = "trainer" 
        LIMIT 1
    `;

    db.get(trainerQuery, [], (err, trainer) => {
        if (err) {
            console.error('Erro ao buscar trainer para chat:', err);
            trainer = null;
        }

        const users = trainer ? [trainer] : [];

        res.render('pages/chat', {
            user: req.session.user,
            users: users,
            messages: [],
            selectedUser: trainer
        });
    });
});

// Progresso do cliente (placeholder)
router.get('/progress', requireClientAuth, (req, res) => {
    const clientId = req.session.user.id;

    // Buscar dados de progresso
    const progressQuery = `
        SELECT 
            COUNT(*) as total_workouts,
            SUM(CASE WHEN wc.completed = 1 THEN 1 ELSE 0 END) as completed_workouts,
            AVG(wc.rating) as avg_rating
        FROM workout_checkins wc
        JOIN workouts w ON wc.workout_id = w.id
        WHERE wc.client_id = ?
    `;

    db.get(progressQuery, [clientId], (err, progress) => {
        if (err) {
            console.error('Erro ao buscar progresso:', err);
            progress = {};
        }

        res.render('pages/client-progress', {
            user: req.session.user,
            progress: progress || {},
            title: 'Meu Progresso - FitConnect'
        });
    });
});

// Perfil do cliente
router.get('/profile', requireClientAuth, (req, res) => {
    const userId = req.session.user.id;

    const query = `
        SELECT u.name, u.email, u.created_at,
               cp.*
        FROM users u 
        LEFT JOIN client_profiles cp ON u.id = cp.user_id 
        WHERE u.id = ?
    `;

    db.get(query, [userId], (err, profile) => {
        if (err) {
            console.error('Erro ao buscar perfil:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar perfil' });
        }

        res.render('pages/client-profile', {
            user: req.session.user,
            profile: profile || {},
            title: 'Meu Perfil - FitConnect'
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
