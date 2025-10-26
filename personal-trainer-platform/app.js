const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bodyParser = require('body-parser');
const { db, init } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './database'
  }),
  secret: process.env.SESSION_SECRET || 'personal-trainer-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware de autenticação
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  next();
});

// Database initialization
init();

// ✅ ROTAS - VERIFICAR SE routes/articles.js EXISTE
console.log('🔍 Carregando rotas...');

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/client', require('./routes/client'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));
app.use('/chat', require('./routes/chat'));
app.use('/client', require('./routes/workouts'));
app.use('/admin', require('./routes/workouts'));

// ✅ TENTAR CARREGAR ROTA DE ARTIGOS COM TRY/CATCH
try {
  const articlesRoute = require('./routes/articles');
  app.use('/', articlesRoute);
  console.log('✅ Rota de artigos carregada com sucesso!');
} catch (error) {
  console.log('❌ Erro ao carregar rota de artigos:', error.message);
  console.log('📝 Criando rota de artigos básica...');
  
  // Criar rota básica de artigos diretamente
  app.get('/articles', (req, res) => {
    console.log('📖 Página de artigos acessada via rota básica');
    
    const articles = [
      {
        id: 1,
        title: "10 Dicas para Manter a Motivação nos Treinos",
        content: "Descobre estratégias comprovadas para manter a consistência nos seus treinos...",
        author_name: "João Silva",
        category: "motivacao",
        created_at: new Date()
      },
      {
        id: 2,
        title: "Alimentação para Melhor Performance", 
        content: "Como a nutrição adequada pode potencializar seus resultados...",
        author_name: "Maria Santos",
        category: "nutricao",
        created_at: new Date()
      }
    ];
    
    res.render('pages/articles', {
      user: req.session ? req.session.user : null,
      isAuthenticated: !!(req.session && req.session.user),
      articles: articles,
      title: 'Artigos e Dicas - FitConnect',
      currentCategory: null
    });
  });
  
  console.log('✅ Rota básica de artigos criada!');
}

console.log('🚀 Todas as rotas carregadas!');

// Error handling
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).render('error', { 
    message: 'Algo deu errado! Tente novamente.',
    user: req.session ? req.session.user : null,
    isAuthenticated: !!(req.session && req.session.user)
  });
});

// 404 handling
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Página não encontrada',
    user: req.session ? req.session.user : null,
    isAuthenticated: !!(req.session && req.session.user)
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('🚀 Servidor rodando na porta ' + PORT);
    console.log('📖 Acesse: http://localhost:' + PORT);
    console.log('📚 Artigos: http://localhost:' + PORT + '/articles');
    console.log('👤 Login: http://localhost:' + PORT + '/auth/login');
  });
}

module.exports = app;
