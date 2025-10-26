const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Função auxiliar para renderizar erro
const renderError = (res, message, user = null) => {
  return res.status(500).render('error', { 
    message: message,
    user: user,
    isAuthenticated: !!user
  });
};

// Listar artigos - ATUALIZADO
router.get('/articles', (req, res) => {
    const query = `
        SELECT a.*, u.name as author_name 
        FROM articles a 
        JOIN users u ON a.author_id = u.id 
        ORDER BY a.created_at DESC
    `;

    db.all(query, [], (err, articles) => {
        if (err) {
            console.error('Erro ao buscar artigos:', err);
            return res.status(500).render('error', { message: 'Erro ao carregar artigos' });
        }

        res.render('pages/articles', {
            user: req.session ? req.session.user : null,
            isAuthenticated: !!(req.session && req.session.user),
            articles: articles || [],
            title: 'Artigos e Dicas - FitConnect',
            currentCategory: null
        });
    });
});

// Ver artigo individual
router.get('/article/:id', (req, res) => {
    const articleId = req.params.id;

    // Validar ID
    if (!articleId || isNaN(articleId)) {
        return res.status(400).render('error', { 
            message: 'ID do artigo inválido',
            user: req.session ? req.session.user : null,
            isAuthenticated: !!(req.session && req.session.user)
        });
    }

    const query = `
        SELECT a.*, u.name as author_name 
        FROM articles a 
        JOIN users u ON a.author_id = u.id 
        WHERE a.id = ?
    `;

    db.get(query, [articleId], (err, article) => {
        if (err) {
            console.error('Erro ao buscar artigo:', err);
            return renderError(res, 'Erro ao carregar artigo', req.session ? req.session.user : null);
        }

        if (!article) {
            return res.status(404).render('error', { 
                message: 'Artigo não encontrado',
                user: req.session ? req.session.user : null,
                isAuthenticated: !!(req.session && req.session.user)
            });
        }

        res.render('pages/article-details', {
            user: req.session ? req.session.user : null,
            isAuthenticated: !!(req.session && req.session.user),
            article: article,
            title: `${article.title} - FitConnect`
        });
    });
});

// Criar artigo (admin)
router.get('/articles/create', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'trainer') {
        return res.redirect('/auth/login');
    }

    res.render('pages/create-article', {
        user: req.session.user,
        isAuthenticated: true,
        title: 'Criar Artigo - FitConnect'
    });
});

// Salvar artigo
router.post('/articles/create', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'trainer') {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    const { title, content, category } = req.body;
    const author_id = req.session.user.id;

    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Título e conteúdo são obrigatórios' });
    }

    const query = `
        INSERT INTO articles (title, content, author_id, category) 
        VALUES (?, ?, ?, ?)
    `;

    db.run(query, [title, content, author_id, category], function(err) {
        if (err) {
            console.error('Erro ao criar artigo:', err);
            return res.status(500).json({ success: false, message: 'Erro ao criar artigo' });
        }

        res.json({ 
            success: true, 
            message: 'Artigo criado com sucesso',
            articleId: this.lastID
        });
    });
});

// Artigos por categoria
router.get('/articles/category/:category', (req, res) => {
    const category = req.params.category;

    const query = `
        SELECT a.*, u.name as author_name 
        FROM articles a 
        JOIN users u ON a.author_id = u.id 
        WHERE a.category = ? 
        ORDER BY a.created_at DESC
    `;

    db.all(query, [category], (err, articles) => {
        if (err) {
            console.error('Erro ao buscar artigos por categoria:', err);
            return renderError(res, 'Erro ao carregar artigos', req.session ? req.session.user : null);
        }

        res.render('pages/articles', {
            user: req.session ? req.session.user : null,
            isAuthenticated: !!(req.session && req.session.user),
            articles: articles || [],
            title: `Artigos de ${category} - FitConnect`,
            currentCategory: category
        });
    });
});

module.exports = router;
