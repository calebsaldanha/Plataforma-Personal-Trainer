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

// ✅ ROTAS - APENAS UMA VEZ!
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/client', require('./routes/client'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));
app.use('/chat', require('./routes/chat'));
app.use('/client', require('./routes/workouts'));
app.use('/admin', require('./routes/workouts'));
app.use('/', require('./routes/articles')); // ✅ Rota de artigos adicionada

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
  });
}
// ... após as outras rotas
app.use('/', require('./test-routes')); // Adicione esta linha

module.exports = app;
