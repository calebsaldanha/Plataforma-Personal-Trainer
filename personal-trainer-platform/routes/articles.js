const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Listar artigos - CORRIGIDO
router.get('/articles', (req, res) => {
    console.log('📖 Acessando página de artigos...');
    
    const query = `
        SELECT a.*, u.name as author_name 
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        ORDER BY a.created_at DESC
    `;

    db.all(query, [], (err, articles) => {
        if (err) {
            console.error('❌ Erro ao buscar artigos:', err);
            return res.status(500).render('pages/error', { 
                message: 'Erro ao carregar artigos',
                user: req.session ? req.session.user : null,
                isAuthenticated: !!(req.session && req.session.user)
            });
        }

        console.log(`✅ ${articles ? articles.length : 0} artigos encontrados`);
        
        // Se não há artigos, criar alguns de exemplo
        let articlesData = articles;
        if (!articles || articles.length === 0) {
            console.log('📝 Criando artigos de exemplo...');
            articlesData = createSampleArticles();
        }

        res.render('pages/articles', {
            user: req.session ? req.session.user : null,
            isAuthenticated: !!(req.session && req.session.user),
            articles: articlesData,
            title: 'Artigos e Dicas - FitConnect',
            currentCategory: null
        });
    });
});

// Ver artigo individual - CORRIGIDO
router.get('/article/:id', (req, res) => {
    const articleId = req.params.id;

    const query = `
        SELECT a.*, u.name as author_name 
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        WHERE a.id = ?
    `;

    db.get(query, [articleId], (err, article) => {
        if (err) {
            console.error('Erro ao buscar artigo:', err);
            return res.status(500).render('pages/error', { 
                message: 'Erro ao carregar artigo',
                user: req.session ? req.session.user : null,
                isAuthenticated: !!(req.session && req.session.user)
            });
        }

        if (!article) {
            return res.status(404).render('pages/error', { 
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

// Artigos por categoria - CORRIGIDO
router.get('/articles/category/:category', (req, res) => {
    const category = req.params.category;

    const query = `
        SELECT a.*, u.name as author_name 
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        WHERE a.category = ? 
        ORDER BY a.created_at DESC
    `;

    db.all(query, [category], (err, articles) => {
        if (err) {
            console.error('Erro ao buscar artigos por categoria:', err);
            return res.status(500).render('pages/error', { 
                message: 'Erro ao carregar artigos',
                user: req.session ? req.session.user : null,
                isAuthenticated: !!(req.session && req.session.user)
            });
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

// Função para criar artigos de exemplo
function createSampleArticles() {
    return [
        {
            id: 1,
            title: "10 Dicas para Manter a Motivação nos Treinos",
            content: "Descubra estratégias comprovadas para manter a consistência nos seus treinos e alcançar seus objetivos de fitness...",
            author_name: "João Silva",
            category: "motivacao",
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: "Alimentação para Melhor Performance",
            content: "Como a nutrição adequada pode potencializar seus resultados nos treinos e melhorar sua recuperação muscular...",
            author_name: "Maria Santos",
            category: "nutricao",
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            title: "Como Prevenir Lesões Durante o Treino",
            content: "Aprenda técnicas e exercícios que podem ajudar a prevenir lesões comuns durante a prática de atividades físicas...",
            author_name: "Carlos Oliveira",
            category: "treinamento",
            created_at: new Date().toISOString()
        }
    ];
}

module.exports = router;
