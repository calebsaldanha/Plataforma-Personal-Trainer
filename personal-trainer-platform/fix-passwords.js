const { db } = require('./database/db');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
    console.log('🔧 Corrigindo senhas dos usuários...');
    
    try {
        // Criar um hash CORRETO para a senha "123456"
        const hashedPassword = await bcrypt.hash('123456', 12);
        
        console.log('🔑 Novo hash gerado:', hashedPassword.substring(0, 30) + '...');
        
        // Lista de usuários para atualizar
        const users = [
            'trainer@fitconnect.com',
            'joao@email.com', 
            'maria@email.com'
        ];
        
        let updatedCount = 0;
        
        // Atualizar cada usuário
        for (const email of users) {
            db.run(
                'UPDATE users SET password = ? WHERE email = ?',
                [hashedPassword, email],
                function(err) {
                    if (err) {
                        console.error(`❌ Erro ao atualizar ${email}:`, err);
                    } else {
                        updatedCount++;
                        console.log(`✅ Senha resetada para: ${email}`);
                        
                        // Se foi o último, fazer verificação
                        if (updatedCount === users.length) {
                            verifyFixedPasswords();
                        }
                    }
                }
            );
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

function verifyFixedPasswords() {
    console.log('\n🔍 Verificando se as senhas foram corrigidas...');
    
    const testUsers = [
        { email: 'trainer@fitconnect.com', password: '123456' },
        { email: 'joao@email.com', password: '123456' }
    ];
    
    testUsers.forEach(user => {
        db.get('SELECT * FROM users WHERE email = ?', [user.email], async (err, dbUser) => {
            if (err) {
                console.error('Erro:', err);
                return;
            }
            
            const isValid = await bcrypt.compare(user.password, dbUser.password);
            console.log(`🔑 ${user.email}: ${isValid ? '✅ FUNCIONA' : '❌ AINDA NÃO'}`);
            
            if (isValid) {
                console.log('   🎉 Login deve funcionar agora!');
            }
        });
    });
    
    console.log('\n📧 CREDENCIAIS PARA TESTE:');
    console.log('Personal Trainer: trainer@fitconnect.com / 123456');
    console.log('Cliente: joao@email.com / 123456');
    console.log('Cliente: maria@email.com / 123456');
}

fixPasswords();

// Manter o processo aberto por um tempo
setTimeout(() => {
    console.log('\n✨ Processo completo! Reinicie o servidor e teste o login.');
    process.exit(0);
}, 5000);
