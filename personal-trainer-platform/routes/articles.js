const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

console.log('📄 Rota de artigos inicializada!');

// Listar artigos
router.get('/articles', (req, res) => {
    console.log('📖 Acessando página de artigos...');
    
    // Buscar artigos do banco
    const query = `
        SELECT a.*, u.name as author_name 
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        ORDER BY a.created_at DESC
    `;

    db.all(query, [], (err, articles) => {
        if (err) {
            console.error('❌ Erro ao buscar artigos do banco:', err);
            // Usar artigos de exemplo em caso de erro
            articles = [];
        }

        let articlesData = articles;
        
        // Se não há artigos no banco, usar exemplos
        if (!articles || articles.length === 0) {
            console.log('📝 Usando artigos de exemplo...');
            articlesData = [
                {
                    id: 1,
                    title: "10 Dicas para Manter a Motivação nos Treinos",
                    content: "Descobre estratégias comprovadas para manter a consistência nos seus treinos e alcançar seus objetivos de fitness de forma eficiente e sustentável. Aprenda técnicas que realmente funcionam para manter o foco e a disciplina.",
                    author_name: "João Silva",
                    category: "motivacao",
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "Alimentação para Melhor Performance",
                    content: "Como a nutrição adequada pode potencializar seus resultados nos treinos e melhorar sua recuperação muscular para alcançar seus objetivos mais rapidamente. Descubra os alimentos essenciais para cada fase do treino.",
                    author_name: "Maria Santos", 
                    category: "nutricao",
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    title: "Como Prevenir Lesões Durante o Treino",
                    content: "Aprenda técnicas e exercícios que podem ajudar a prevenir lesões comuns durante a prática de atividades físicas e mantenha-se saudável em sua jornada fitness. Conheça os erros mais comuns e como evitá-los.",
                    author_name: "Carlos Oliveira",
                    category: "treinamento",
                    created_at: new Date().toISOString()
                },
                {
                    id: 4,
                    title: "Importância do Descanso para o Crescimento Muscular",
                    content: "Entenda por que o descanso é tão importante quanto o treino para o desenvolvimento muscular e como otimizar sua recuperação para obter melhores resultados.",
                    author_name: "Ana Costa",
                    category: "saude", 
                    created_at: new Date().toISOString()
                }
            ];
        }

        console.log(`✅ Renderizando ${articlesData.length} artigos`);
        
        res.render('pages/articles', {
            user: req.session ? req.session.user : null,
            isAuthenticated: !!(req.session && req.session.user),
            articles: articlesData,
            title: 'Artigos e Dicas - FitConnect',
            currentCategory: null
        });
    });
});

// Ver artigo individual
router.get('/article/:id', (req, res) => {
    const articleId = req.params.id;
    console.log(`📄 Acessando artigo ID: ${articleId}`);
    
    // Buscar artigo específico do banco
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

// Artigos por categoria
router.get('/articles/category/:category', (req, res) => {
    const category = req.params.category;
    console.log(`📂 Filtrando artigos por categoria: ${category}`);
    
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
            articles = [];
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
