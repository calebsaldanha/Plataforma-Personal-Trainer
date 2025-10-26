const fs = require('fs');
const path = require('path');
const { db } = require('./db');
const { seedData } = require('./seed');

const resetDatabase = async () => {
    console.log('🔄 Reiniciando banco de dados...');
    
    try {
        // Fechar conexão atual
        db.close();
        
        // Deletar arquivo do banco
        const dbPath = path.join(__dirname, 'personal_trainer.db');
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
            console.log('🗑️ Banco de dados antigo removido');
        }
        
        // Recriar banco
        const { init } = require('./db');
        init();
        
        console.log('✅ Banco de dados recriado');
        
        // Aguardar um pouco e popular com dados
        setTimeout(async () => {
            await seedData();
            console.log('🎉 Banco de dados resetado com sucesso!');
            process.exit(0);
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro ao resetar banco:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    resetDatabase();
}

module.exports = { resetDatabase };
