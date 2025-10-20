const express = require('express');
const { db } = require('../database/db');
const router = express.Router();

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
};

// Dashboard admin
router.get('/dashboard', requireAdmin, (req, res) => {
  // Estatísticas gerais
  db.serialize(() => {
    // Total de clientes
    db.get(
      'SELECT COUNT(*) as total FROM users WHERE role = \"client\"',
      (err, clientsResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Erro interno');
        }

        // Total de treinos
        db.get(
          'SELECT COUNT(*) as total FROM workouts',
          (err, workoutsResult) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Erro interno');
            }

            // Check-ins da semana
            db.get(
              \SELECT COUNT(*) as total 
               FROM workout_checkins 
               WHERE date(created_at) >= date('now', '-7 days')\,
              (err, checkinsResult) => {
                if (err) {
                  console.error(err);
                  return res.status(500).send('Erro interno');
                }

                // Clientes recentes
                db.all(
                  \SELECT u.*, cp.age, cp.goals 
                   FROM users u 
                   LEFT JOIN client_profiles cp ON u.id = cp.user_id 
                   WHERE u.role = 'client' 
                   ORDER BY u.created_at DESC 
                   LIMIT 5\,
                  (err, recentClients) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).send('Erro interno');
                    }

                    res.render('pages/admin-dashboard', {
                      user: req.session.user,
                      stats: {
                        totalClients: clientsResult.total,
                        totalWorkouts: workoutsResult.total,
                        weeklyCheckins: checkinsResult.total
                      },
                      recentClients: recentClients
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
});

// Lista de clientes
router.get('/clients', requireAdmin, (req, res) => {
  db.all(
    \SELECT u.*, cp.age, cp.weight, cp.height, cp.goals, cp.fitness_level 
     FROM users u 
     LEFT JOIN client_profiles cp ON u.id = cp.user_id 
     WHERE u.role = 'client' 
     ORDER BY u.created_at DESC\,
    (err, clients) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      res.render('admin/clients', {
        user: req.session.user,
        clients: clients
      });
    }
  );
});

// Detalhes do cliente
router.get('/clients/:id', requireAdmin, (req, res) => {
  const clientId = req.params.id;

  db.get(
    \SELECT u.*, cp.* 
     FROM users u 
     LEFT JOIN client_profiles cp ON u.id = cp.user_id 
     WHERE u.id = ? AND u.role = 'client'\,
    [clientId],
    (err, client) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      if (!client) {
        return res.status(404).send('Cliente não encontrado');
      }

      // Buscar treinos do cliente
      db.all(
        \SELECT * FROM workouts 
         WHERE client_id = ? 
         ORDER BY created_at DESC\,
        [clientId],
        (err, workouts) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Erro interno');
          }

          res.render('admin/client-detail', {
            user: req.session.user,
            client: client,
            workouts: workouts
          });
        }
      );
    }
  );
});

// Criar treino
router.get('/workouts/create', requireAdmin, (req, res) => {
  // Buscar lista de clientes
  db.all(
    'SELECT id, name FROM users WHERE role = \"client\" ORDER BY name',
    (err, clients) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      res.render('admin/create-workout', {
        user: req.session.user,
        clients: clients,
        error: null
      });
    }
  );
});

// Processar criação de treino
router.post('/workouts/create', requireAdmin, (req, res) => {
  const { client_id, title, description, exercises } = req.body;

  let exercisesArray;
  try {
    exercisesArray = JSON.parse(exercises);
  } catch (e) {
    exercisesArray = [];
  }

  db.run(
    \INSERT INTO workouts (client_id, trainer_id, title, description, exercises) 
     VALUES (?, ?, ?, ?, ?)\,
    [client_id, req.session.user.id, title, description, JSON.stringify(exercisesArray)],
    function(err) {
      if (err) {
        console.error(err);
        
        // Buscar clientes novamente para mostrar o form com erro
        db.all(
          'SELECT id, name FROM users WHERE role = \"client\" ORDER BY name',
          (err, clients) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Erro interno');
            }

            res.render('admin/create-workout', {
              user: req.session.user,
              clients: clients,
              error: 'Erro ao criar treino'
            });
          }
        );
        return;
      }

      res.redirect('/admin/clients/' + client_id);
    }
  );
});

// Chat admin
router.get('/chat', requireAdmin, (req, res) => {
  const adminId = req.session.user.id;

  // Buscar todas as conversas
  db.all(
    \SELECT DISTINCT 
       u.id as client_id,
       u.name as client_name,
       (SELECT COUNT(*) FROM messages m WHERE m.receiver_id = u.id AND m.read = 0) as unread_count,
       (SELECT message FROM messages m WHERE (m.sender_id = u.id OR m.receiver_id = u.id) ORDER BY m.created_at DESC LIMIT 1) as last_message
     FROM users u
     WHERE u.role = 'client'
     ORDER BY (SELECT MAX(created_at) FROM messages m WHERE m.sender_id = u.id OR m.receiver_id = u.id) DESC\,
    (err, conversations) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      res.render('admin/admin-chat', {
        user: req.session.user,
        conversations: conversations
      });
    }
  );
});

// Mensagens com cliente específico
router.get('/chat/:clientId', requireAdmin, (req, res) => {
  const clientId = req.params.clientId;
  const adminId = req.session.user.id;

  // Buscar informações do cliente
  db.get(
    'SELECT id, name FROM users WHERE id = ? AND role = \"client\"',
    [clientId],
    (err, client) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno');
      }

      if (!client) {
        return res.status(404).send('Cliente não encontrado');
      }

      // Buscar mensagens
      db.all(
        \SELECT m.*, u.name as sender_name 
         FROM messages m 
         JOIN users u ON m.sender_id = u.id 
         WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?) 
         ORDER BY m.created_at ASC\,
        [adminId, clientId, clientId, adminId],
        (err, messages) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Erro interno');
          }

          res.render('admin/chat-conversation', {
            user: req.session.user,
            client: client,
            messages: messages
          });
        }
      );
    }
  );
});

// Enviar mensagem como admin
router.post('/chat/send', requireAdmin, (req, res) => {
  const adminId = req.session.user.id;
  const { message, receiver_id } = req.body;

  db.run(
    'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
    [adminId, receiver_id, message],
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
