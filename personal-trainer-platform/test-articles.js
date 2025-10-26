// Teste rápido para verificar se a rota está funcionando
const express = require('express');
const router = express.Router();

// Rota de teste
router.get('/test-articles', (req, res) => {
    console.log('✅ Rota de teste funcionando!');
    
    const sampleArticles = [
        {
            id: 1,
            title: "Artigo de Teste 1",
            content: "Este é um artigo de teste para verificar se a página está funcionando...",
            author_name: "Sistema",
            category: "treinamento",
            created_at: new Date()
        },
        {
            id: 2,
            title: "Artigo de Teste 2", 
            content: "Segundo artigo de teste para verificar a funcionalidade...",
            author_name: "Admin",
            category: "nutricao",
            created_at: new Date()
        }
    ];
    
    res.json({
        success: true,
        message: 'Rota funcionando!',
        articles: sampleArticles
    });
});

module.exports = router;
