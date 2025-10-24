const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Página do chat
router.get('/chat', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    // Buscar mensagens do usuário
    let query = '';
    let params = [];

    if (userRole === 'client') {
        query = `
            SELECT m.*, u.name as sender_name 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.receiver_id = ? OR m.sender_id = ?
            ORDER BY m.created_at ASC
        `;
        params = [userId, userId];
    } else {
        query = `
            SELECT m.*, u.name as sender_name 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.receiver_id = ? OR m.sender_id = ?
            ORDER BY m.created_at ASC
        `;
        params = [userId, userId];
    }

    db.all(query, params, (err, messages) => {
        if (err) {
            console.error('Erro ao buscar mensagens:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar mensagens' });
        }

        // Buscar usuários para o chat (clientes para trainers, trainers para clientes)
        let usersQuery = '';
        if (userRole === 'trainer') {
            usersQuery = 'SELECT id, name FROM users WHERE role = "client"';
        } else {
            usersQuery = 'SELECT id, name FROM users WHERE role = "trainer"';
        }

        db.all(usersQuery, [], (err, users) => {
            if (err) {
                console.error('Erro ao buscar usuários:', err);
                return res.status(500).render('error', { message: 'Erro ao carregar usuários' });
            }

            res.render('pages/chat', {
                user: req.session.user,
                messages: messages || [],
                users: users || [],
                selectedUser: null
            });
        });
    });
});

// Enviar mensagem
router.post('/chat/send', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    const { message, receiver_id } = req.body;
    const sender_id = req.session.user.id;

    if (!message || !receiver_id) {
        return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }

    const query = 'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)';
    
    db.run(query, [sender_id, receiver_id, message], function(err) {
        if (err) {
            console.error('Erro ao enviar mensagem:', err);
            return res.status(500).json({ success: false, message: 'Erro ao enviar mensagem' });
        }

        res.json({ success: true, message: 'Mensagem enviada com sucesso' });
    });
});

// Buscar mensagens
router.get('/chat/messages/:receiverId?', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    const userId = req.session.user.id;
    const receiverId = req.params.receiverId;

    let query = '';
    let params = [];

    if (receiverId) {
        query = `
            SELECT m.*, u.name as sender_name 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;
        params = [userId, receiverId, receiverId, userId];
    } else {
        query = `
            SELECT m.*, u.name as sender_name 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.receiver_id = ? OR m.sender_id = ?
            ORDER BY m.created_at ASC
        `;
        params = [userId, userId];
    }

    db.all(query, params, (err, messages) => {
        if (err) {
            console.error('Erro ao buscar mensagens:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar mensagens' });
        }

        // Marcar mensagens como lidas
        if (receiverId) {
            const updateQuery = 'UPDATE messages SET read = 1 WHERE receiver_id = ? AND sender_id = ? AND read = 0';
            db.run(updateQuery, [userId, receiverId]);
        }

        res.json({ success: true, messages });
    });
});

// Contar mensagens não lidas
router.get('/chat/unread-count', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    const userId = req.session.user.id;

    const query = 'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = 0';
    
    db.get(query, [userId], (err, result) => {
        if (err) {
            console.error('Erro ao contar mensagens não lidas:', err);
            return res.status(500).json({ success: false, message: 'Erro ao contar mensagens' });
        }

        res.json({ success: true, count: result.count });
    });
});

module.exports = router;