const fs = require('fs');
const path = require('path');

const resetDatabase = async () => {
    console.log('🔄 Reiniciando banco de dados e sessões...');
    
    try {
        const dbPath = path.join(__dirname, 'personal_trainer.db');
        const sessionDbPath = path.join(__dirname, 'sessions.db');

        // Deletar banco de dados principal
        if (fs.existsSync(dbPath)) {
            try {
                fs.unlinkSync(dbPath);
                console.log('🗑️  Banco de dados principal (personal_trainer.db) deletado.');
            } catch (e) {
                console.error('❌ Não foi possível deletar o banco de dados principal. Verifique se não há conexões abertas.');
                process.exit(1);
            }
        }
        
        // Deletar banco de dados de sessões
        if (fs.existsSync(sessionDbPath)) {
            try {
                fs.unlinkSync(sessionDbPath);
                console.log('🗑️  Banco de dados de sessões (sessions.db) deletado.');
            } catch (e) {
                console.error('❌ Não foi possível deletar o banco de sessões.');
            }
        }

        // Aguardar para garantir que os arquivos foram liberados
        await new Promise(resolve => setTimeout(resolve, 500));

        // Recriar e popular o banco de dados principal
        console.log('📦 Criando nova estrutura do banco de dados...');
        const { init } = require('./db');
        init();
        
        console.log('🌱 Populando com dados de exemplo...');
        const { seedData } = require('./seed');
        await seedData();
        
        console.log('\n🎉 Banco de dados e sessões resetados com sucesso!');
        console.log('\n📧 CREDENCIAIS PARA TESTE:');
        console.log('Personal Trainer: trainer@fitconnect.com / 123456');
        console.log('Cliente: joao@email.com / 123456');
        console.log('\n🚀 Execute: npm start para iniciar o servidor');
        
    } catch (error) {
        console.error('❌ Erro no processo de reset:', error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    resetDatabase().finally(() => {
        // Garante que o processo termine, pois o db pode manter a conexão aberta
        setTimeout(() => process.exit(0), 2000);
    });
}

module.exports = { resetDatabase };
