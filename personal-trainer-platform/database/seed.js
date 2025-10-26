const { db } = require('./db');

// Popular banco com dados de teste
const seedDatabase = () => {
    console.log('🌱 Populando banco de dados com dados de teste...');

    // Inserir um personal trainer
    db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
        ['Personal Trainer', 'trainer@fitconnect.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/eoCOYTT7hCKv6/zV6', 'trainer'],
        function(err) {
            if (err) {
                console.error('Erro ao inserir trainer:', err);
                return;
            }
            
            const trainerId = this.lastID;
            console.log('✅ Personal Trainer criado com ID:', trainerId);

            // Inserir artigos de exemplo
            const sampleArticles = [
                {
                    title: '10 Dicas para Manter a Motivação nos Treinos',
                    content: 'Manter a motivação nos treinos pode ser desafiador, mas com essas estratégias você vai conseguir manter a consistência...',
                    category: 'motivacao',
                    author_id: trainerId
                },
                {
                    title: 'Importância da Alimentação no Treino',
                    content: 'A nutrição adequada é fundamental para potencializar seus resultados e melhorar seu desempenho nos treinos...',
                    category: 'nutricao',
                    author_id: trainerId
                },
                {
                    title: 'Como Prevenir Lesões Durante o Treino',
                    content: 'Conheça as técnicas para treinar com segurança e evitar lesões durante seus exercícios...',
                    category: 'treinamento',
                    author_id: trainerId
                }
            ];

            sampleArticles.forEach((article, index) => {
                db.run(`INSERT OR IGNORE INTO articles (title, content, author_id, category) VALUES (?, ?, ?, ?)`,
                    [article.title, article.content, article.author_id, article.category],
                    function(err) {
                        if (err) {
                            console.error('Erro ao inserir artigo:', err);
                        } else {
                            console.log(`✅ Artigo ${index + 1} criado com ID:`, this.lastID);
                        }
                    }
                );
            });
        }
    );
};

// Executar apenas se chamado diretamente
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
