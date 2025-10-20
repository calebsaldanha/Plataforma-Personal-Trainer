const express = require('express');
const { db } = require('../database/db');
const router = express.Router();

// Middleware para verificar se é cliente
const requireClient = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'client') {
    return res.redirect('/auth/login');
  }
  next();
};

// Dashboard do cliente
router.get('/dashboard', requireClient, (req, res) => {
  const userId = req.session.user.id;

  // Buscar dados do cliente
  db.get(
    \SELECT cp.*, u.name, u.email 
     FROM client_profiles cp 
     JOIN users u ON cp.user_id = u.id 
     WHERE cp.user_id = ?\,
    [userId],
    (err, profile) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      // Buscar treinos do cliente
      db.all(
        \SELECT * FROM workouts 
         WHERE client_id = ? 
         ORDER BY created_at DESC\,
        [userId],
        (err, workouts) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Erro interno');
          }

          // Buscar check-ins recentes
          db.all(
            \SELECT wc.*, w.title 
             FROM workout_checkins wc 
             JOIN workouts w ON wc.workout_id = w.id 
             WHERE wc.client_id = ? 
             ORDER BY wc.created_at DESC 
             LIMIT 5\,
            [userId],
            (err, checkins) => {
              if (err) {
                console.error(err);
                return res.status(500).send('Erro interno');
              }

              // Buscar mensagens não lidas
              db.get(
                \SELECT COUNT(*) as unread_count 
                 FROM messages 
                 WHERE receiver_id = ? AND read = 0\,
                [userId],
                (err, result) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).send('Erro interno');
                  }

                  res.render('pages/client-dashboard', {
                    user: req.session.user,
                    profile: profile,
                    workouts: workouts,
                    checkins: checkins,
                    unreadCount: result.unread_count
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Formulário inicial do cliente
router.get('/initial-form', requireClient, (req, res) => {
  const tempUserId = req.session.tempUserId || req.session.user.id;
  
  // Verificar se já preencheu o formulário
  db.get(
    'SELECT * FROM client_profiles WHERE user_id = ?',
    [tempUserId],
    (err, profile) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      if (profile) {
        return res.redirect('/client/dashboard');
      }

      res.render('pages/initial-form', { 
        error: null,
        tempUserId: tempUserId
      });
    }
  );
});

// Processar formulário inicial
router.post('/initial-form', requireClient, (req, res) => {
  const {
    age, gender, weight, height, fitness_level,
    goals, medical_conditions, experience
  } = req.body;

  const userId = req.session.tempUserId || req.session.user.id;

  db.run(
    \INSERT INTO client_profiles 
     (user_id, age, gender, weight, height, fitness_level, goals, medical_conditions, experience) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\,
    [userId, age, gender, weight, height, fitness_level, goals, medical_conditions, experience],
    function(err) {
      if (err) {
        console.error(err);
        return res.render('pages/initial-form', {
          error: 'Erro ao salvar perfil',
          tempUserId: userId
        });
      }

      // Se era um usuário temporário, atualiza a sessão
      if (req.session.tempUserId) {
        db.get(
          'SELECT * FROM users WHERE id = ?',
          [userId],
          (err, user) => {
            if (err) {
              console.error(err);
              return res.redirect('/auth/login');
            }

            req.session.user = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            };
            delete req.session.tempUserId;

            res.redirect('/client/dashboard');
          }
        );
      } else {
        res.redirect('/client/dashboard');
      }
    }
  );
});

// Ver treino específico
router.get('/workout/:id', requireClient, (req, res) => {
  const workoutId = req.params.id;
  const userId = req.session.user.id;

  db.get(
    \SELECT w.*, u.name as trainer_name 
     FROM workouts w 
     JOIN users u ON w.trainer_id = u.id 
     WHERE w.id = ? AND w.client_id = ?\,
    [workoutId, userId],
    (err, workout) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      if (!workout) {
        return res.status(404).send('Treino não encontrado');
      }

      // Parse dos exercícios
      try {
        workout.exercises = JSON.parse(workout.exercises);
      } catch (e) {
        workout.exercises = [];
      }

      res.render('pages/workout-detail', {
        user: req.session.user,
        workout: workout
      });
    }
  );
});

// Fazer check-in
router.post('/workout/:id/checkin', requireClient, (req, res) => {
  const workoutId = req.params.id;
  const userId = req.session.user.id;
  const { completed, notes, rating } = req.body;

  db.run(
    \INSERT INTO workout_checkins 
     (workout_id, client_id, completed, notes, rating) 
     VALUES (?, ?, ?, ?, ?)\,
    [workoutId, userId, completed ? 1 : 0, notes, rating],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao salvar check-in' });
      }

      res.json({ success: true, checkinId: this.lastID });
    }
  );
});

// Chat do cliente
router.get('/chat', requireClient, (req, res) => {
  const userId = req.session.user.id;

  // Buscar mensagens
  db.all(
    \SELECT m.*, u.name as sender_name 
     FROM messages m 
     JOIN users u ON m.sender_id = u.id 
     WHERE (m.sender_id = ? OR m.receiver_id = ?) 
     AND (m.sender_id = ? OR m.receiver_id = ?) 
     ORDER BY m.created_at ASC\,
    [userId, userId, userId, userId],
    (err, messages) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      // Buscar personal trainer (admin)
      db.get(
        'SELECT id, name FROM users WHERE role = \"admin\" LIMIT 1',
        (err, trainer) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Erro interno');
          }

          res.render('pages/client-chat', {
            user: req.session.user,
            messages: messages,
            trainer: trainer
          });
        }
      );
    }
  );
});

// Enviar mensagem
router.post('/chat/send', requireClient, (req, res) => {
  const userId = req.session.user.id;
  const { message, receiver_id } = req.body;

  db.run(
    'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
    [userId, receiver_id, message],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao enviar mensagem' });
      }

      res.json({ success: true, messageId: this.lastID });
    }
  );
});

module.exports = router;
