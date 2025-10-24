const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Listar treinos do cliente
router.get('/workouts', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'client') {
        return res.redirect('/auth/login');
    }

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

// Ver detalhes do treino
router.get('/workout/:id', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const workoutId = req.params.id;
    const userId = req.session.user.id;

    let query = '';
    let params = [];

    if (req.session.user.role === 'client') {
        query = `
            SELECT w.*, u.name as trainer_name 
            FROM workouts w 
            JOIN users u ON w.trainer_id = u.id 
            WHERE w.id = ? AND w.client_id = ?
        `;
        params = [workoutId, userId];
    } else {
        query = `
            SELECT w.*, u.name as client_name 
            FROM workouts w 
            JOIN users u ON w.client_id = u.id 
            WHERE w.id = ? AND w.trainer_id = ?
        `;
        params = [workoutId, userId];
    }

    db.get(query, params, (err, workout) => {
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
            WHERE workout_id = ? 
            ORDER BY created_at DESC
        `;

        db.all(checkinsQuery, [workoutId], (err, checkins) => {
            if (err) {
                console.error('Erro ao buscar check-ins:', err);
            }

            res.render('pages/workout-details', {
                user: req.session.user,
                workout: workout,
                checkins: checkins || [],
                exercises: workout.exercises ? JSON.parse(workout.exercises) : []
            });
        });
    });
});

// Criar treino (admin)
router.get('/workouts/create', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'trainer') {
        return res.redirect('/auth/login');
    }

    // Buscar clientes
    const clientsQuery = 'SELECT id, name FROM users WHERE role = "client"';
    
    db.all(clientsQuery, [], (err, clients) => {
        if (err) {
            console.error('Erro ao buscar clientes:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar clientes' });
        }

        res.render('pages/create-workout', {
            user: req.session.user,
            clients: clients || []
        });
    });
});

// Salvar treino
router.post('/workouts/create', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'trainer') {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    const { client_id, title, description, exercises } = req.body;
    const trainer_id = req.session.user.id;

    if (!client_id || !title) {
        return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }

    const query = `
        INSERT INTO workouts (client_id, trainer_id, title, description, exercises) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [client_id, trainer_id, title, description, exercises], function(err) {
        if (err) {
            console.error('Erro ao criar treino:', err);
            return res.status(500).json({ success: false, message: 'Erro ao criar treino' });
        }

        res.json({ 
            success: true, 
            message: 'Treino criado com sucesso',
            workoutId: this.lastID
        });
    });
});

// Fazer check-in no treino
router.post('/workout/:id/checkin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'client') {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    const workoutId = req.params.id;
    const clientId = req.session.user.id;
    const { completed, notes, rating } = req.body;

    const query = `
        INSERT INTO workout_checkins (workout_id, client_id, completed, notes, rating) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [workoutId, clientId, completed ? 1 : 0, notes, rating], function(err) {
        if (err) {
            console.error('Erro ao registrar check-in:', err);
            return res.status(500).json({ success: false, message: 'Erro ao registrar check-in' });
        }

        res.json({ success: true, message: 'Check-in registrado com sucesso' });
    });
});

module.exports = router;