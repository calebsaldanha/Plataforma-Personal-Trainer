const fs = require('fs');
const path = require('path');

const resetDatabase = async () => {
    console.log('🔄 Reiniciando banco de dados...');
    
    try {
        const dbPath = path.join(__dirname, 'personal_trainer.db');
        
        // Método 1: Tentar renomear o arquivo
        if (fs.existsSync(dbPath)) {
            const backupPath = dbPath + '.backup.' + Date.now();
            try {
                fs.renameSync(dbPath, backupPath);
                console.log('✅ Banco antigo movido para:', path.basename(backupPath));
            } catch (renameError) {
                console.log('⚠️  Não foi possível renomear, tentando deletar...');
                try {
                    fs.unlinkSync(dbPath);
                    console.log('🗑️ Banco antigo deletado');
                } catch (deleteError) {
                    console.log('❌ Não foi possível deletar o banco antigo');
                    console.log('💡 Feche todas as conexões e tente novamente');
                    process.exit(1);
                }
            }
        }

        // Aguardar para garantir que o sistema de arquivos está pronto
        await new Promise(resolve => setTimeout(resolve, 500));

        // Recriar banco usando uma nova instância
        console.log('📦 Criando novo banco de dados...');
        const { init } = require('./db');
        init();
        
        console.log('✅ Estrutura do banco criada');
        
        // Aguardar mais um pouco e popular dados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🌱 Populando com dados de exemplo...');
        const { seedData } = require('./seed');
        await seedData();
        
        console.log('🎉 Banco de dados resetado com sucesso!');
        console.log('\n📧 CREDENCIAIS PARA TESTE:');
        console.log('Personal Trainer: trainer@fitconnect.com / 123456');
        console.log('Cliente: joao@email.com / 123456');
        console.log('Cliente: maria@email.com / 123456');
        console.log('\n🚀 Execute: npm start para iniciar o servidor');
        
    } catch (error) {
        console.error('❌ Erro no reset:', error.message);
        console.log('\n💡 SOLUÇÃO ALTERNATIVA:');
        console.log('1. Execute: node database/seed.js');
        console.log('2. Ou delete manualmente o arquivo database/personal_trainer.db');
        process.exit(1);
    }
};

if (require.main === module) {
    resetDatabase();
}

module.exports = { resetDatabase };
