const { db } = require('./database/db');
const bcrypt = require('bcryptjs');

console.log('🎯 TESTE FINAL - Sistema de Login');

async function finalTest() {
    console.log('\n1. 🔍 Verificando usuários no banco...');
    
    db.all('SELECT id, name, email, role, LENGTH(password) as pwd_length FROM users', [], async (err, users) => {
        if (err) {
            console.error('❌ Erro:', err);
            return;
        }
        
        console.log(`   Encontrados ${users.length} usuários:`);
        users.forEach(u => {
            console.log(`   - ${u.name} (${u.email}) - Senha: ${u.pwd_length} chars`);
        });
        
        console.log('\n2. 🔑 Testando login para cada usuário...');
        
        for (const user of users) {
            const testPassword = '123456';
            
            // Buscar hash completo
            db.get('SELECT password FROM users WHERE id = ?', [user.id], async (err, result) => {
                if (err) {
                    console.error(`   ❌ Erro ao buscar ${user.email}:`, err);
                    return;
                }
                
                const isValid = await bcrypt.compare(testPassword, result.password);
                console.log(`   ${user.email}: ${isValid ? '✅ LOGIN FUNCIONA' : '❌ LOGIN FALHA'}`);
                
                if (!isValid) {
                    console.log(`      Hash atual: ${result.password.substring(0, 30)}...`);
                    console.log(`      Problema: O hash não corresponde à senha "123456"`);
                }
            });
            
            // Pequena pausa
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n3. 📋 RESUMO:');
        console.log('   Se todos mostrarem "✅ LOGIN FUNCIONA", o problema está resolvido!');
        console.log('   Se algum mostrar "❌ LOGIN FALHA", execute novamente o fix-passwords.js');
    });
}

finalTest();

setTimeout(() => {
    console.log('\n🎉 Teste finalizado!');
    process.exit(0);
}, 3000);
