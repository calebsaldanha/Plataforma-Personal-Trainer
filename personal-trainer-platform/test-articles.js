const express = require('express');
const router = express.Router();

// Rota de diagnóstico
router.get('/debug-routes', (req, res) => {
    console.log('🔍 Debug de rotas - Verificando se /articles está funcionando');
    
    // Lista todas as rotas registradas
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            if (middleware.handle.stack) {
                middleware.handle.stack.forEach(handler => {
                    if (handler.route) {
                        routes.push({
                            path: handler.route.path,
                            methods: Object.keys(handler.route.methods)
                        });
                    }
                });
            }
        }
    });
    
    res.json({
        message: 'Debug de rotas',
        routes: routes.filter(route => route.path.includes('article')),
        allRoutes: routes.map(route => `${Object.keys(route.methods)[0].toUpperCase()} ${route.path}`)
    });
});

// Rota simples de teste
router.get('/test-simple', (req, res) => {
    console.log('✅ Rota simples funcionando!');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Teste Simples</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 2rem; }
                .success { color: green; }
                .error { color: red; }
            </style>
        </head>
        <body>
            <h1>Teste de Rota Simples</h1>
            <p class="success">✅ Se você está vendo esta página, o servidor está funcionando!</p>
            <p><a href="/articles">➡️ Ir para Artigos</a></p>
            <p><a href="/debug-routes">🐛 Ver Rotas Debug</a></p>
        </body>
        </html>
    `);
});

module.exports = router;
