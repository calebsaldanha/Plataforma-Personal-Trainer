const { db } = require('./database/db');
const bcrypt = require('bcryptjs');

console.log('🔐 Testando sistema de login...');

const testUsers = [
    { email: 'trainer@fitconnect.com', password: '123456' },
    { email: 'joao@email.com', password: '123456' },
    { email: 'maria@email.com', password: '123456' }
];

async function testLogin() {
    for (const user of testUsers) {
        console.log(`\n=== Testando: ${user.email} ===`);
        
        // 1. Buscar usuário
        db.get('SELECT * FROM users WHERE email = ?', [user.email], async (err, dbUser) => {
            if (err) {
                console.error('❌ Erro na consulta:', err);
                return;
            }
            
            if (!dbUser) {
                console.log('❌ Usuário não encontrado!');
                return;
            }
            
            console.log('✅ Usuário encontrado:');
            console.log(`- Nome: ${dbUser.name}`);
            console.log(`- Role: ${dbUser.role}`);
            console.log(`- Hash: ${dbUser.password.substring(0, 30)}...`);
            
            // 2. Testar senha
            try {
                const isValid = await bcrypt.compare(user.password, dbUser.password);
                console.log(`🔑 Senha "${user.password}" é válida: ${isValid}`);
                
                if (!isValid) {
                    console.log('❌ PROBLEMA: A senha não confere!');
                    console.log('O hash no banco não corresponde à senha "123456"');
                } else {
                    console.log('🎉 Login funcionaria!');
                }
            } catch (error) {
                console.log('❌ Erro ao comparar senhas:', error);
            }
        });
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

testLogin();

// Manter o processo aberto
setTimeout(() => {
    console.log('\n✅ Teste completo');
    process.exit(0);
}, 3000);
