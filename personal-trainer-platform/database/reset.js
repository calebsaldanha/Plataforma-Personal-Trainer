const fs = require('fs');
const path = require('path');
const { db } = require('./db');
const { seedData } = require('./seed');

const resetDatabase = async () => {
    console.log('🔄 Reiniciando banco de dados...');
    
    try {
        const dbPath = path.join(__dirname, 'personal_trainer.db');
        
        // Fechar conexão atual se existir
        if (db) {
            db.close((err) => {
                if (err) {
                    console.log('⚠️  Aviso ao fechar conexão:', err.message);
                } else {
                    console.log('✅ Conexão com banco fechada');
                }
                
                // Aguardar um pouco antes de deletar
                setTimeout(() => {
                    deleteAndRecreate(dbPath);
                }, 1000);
            });
        } else {
            deleteAndRecreate(dbPath);
        }
        
    } catch (error) {
        console.error('❌ Erro ao resetar banco:', error);
        process.exit(1);
    }
};

function deleteAndRecreate(dbPath) {
    try {
        // Tentar deletar o arquivo do banco
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
            console.log('🗑️ Banco de dados antigo removido');
        } else {
            console.log('ℹ️  Arquivo do banco não encontrado, criando novo...');
        }
        
        // Recriar banco
        const { init } = require('./db');
        init();
        
        console.log('✅ Banco de dados recriado');
        
        // Aguardar e popular com dados
        setTimeout(async () => {
            try {
                await seedData();
                console.log('🎉 Banco de dados resetado com sucesso!');
                console.log('\n📧 CREDENCIAIS PARA TESTE:');
                console.log('Personal Trainer: trainer@fitconnect.com / 123456');
                console.log('Cliente: joao@email.com / 123456');
                console.log('Cliente: maria@email.com / 123456');
                console.log('\n🚀 Execute: npm start para iniciar o servidor');
                process.exit(0);
            } catch (seedError) {
                console.error('❌ Erro no seed:', seedError);
                process.exit(1);
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro ao recriar banco:', error);
        
        // Tentativa alternativa - renomear em vez de deletar
        console.log('🔄 Tentando método alternativo...');
        try {
            const backupPath = dbPath + '.backup';
            if (fs.existsSync(dbPath)) {
                fs.renameSync(dbPath, backupPath);
                console.log('📁 Banco antigo renomeado para backup');
                
                const { init } = require('./db');
                init();
                console.log('✅ Novo banco criado');
                
                setTimeout(async () => {
                    await seedData();
                    console.log('🎉 Banco resetado com sucesso (método alternativo)!');
                    process.exit(0);
                }, 2000);
            }
        } catch (altError) {
            console.error('❌ Método alternativo também falhou:', altError);
            console.log('\n💡 SOLUÇÃO MANUAL:');
            console.log('1. Pare o servidor (Ctrl+C)');
            console.log('2. Delete manualmente o arquivo: database/personal_trainer.db');
            console.log('3. Execute: npm run reset-db novamente');
            process.exit(1);
        }
    }
}

if (require.main === module) {
    resetDatabase();
}

module.exports = { resetDatabase };
