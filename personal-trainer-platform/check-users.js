const { db } = require('./database/db');

console.log('🔍 Verificando usuários no banco de dados...');

db.all('SELECT * FROM users', [], (err, users) => {
    if (err) {
        console.error('❌ Erro ao buscar usuários:', err);
        return;
    }
    
    console.log(`📊 Total de usuários encontrados: ${users.length}`);
    
    users.forEach(user => {
        console.log('---');
        console.log(`ID: ${user.id}`);
        console.log(`Nome: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Senha (hash): ${user.password ? '✅ Existe' : '❌ Não existe'}`);
    });
    
    if (users.length === 0) {
        console.log('❌ NENHUM usuário encontrado! O seed não funcionou.');
    }
});

// Verificar artigos também
db.all('SELECT * FROM articles', [], (err, articles) => {
    if (err) {
        console.error('❌ Erro ao buscar artigos:', err);
        return;
    }
    
    console.log(`\n📝 Total de artigos encontrados: ${articles.length}`);
});
