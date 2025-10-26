const { db } = require('./db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    console.log('🌱 Populando banco de dados com dados de exemplo...');

    try {
        // Criar senhas reais criptografadas
        const hashedPassword = await bcrypt.hash('123456', 12);

        // Inserir usuários de exemplo
        const users = [
            { name: 'Personal Trainer', email: 'trainer@fitconnect.com', password: hashedPassword, role: 'trainer' },
            { name: 'João Silva', email: 'joao@email.com', password: hashedPassword, role: 'client' },
            { name: 'Maria Santos', email: 'maria@email.com', password: hashedPassword, role: 'client' }
        ];

        users.forEach(user => {
            db.run(
                'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [user.name, user.email, user.password, user.role],
                function(err) {
                    if (err) {
                        console.error('Erro ao inserir usuário:', err);
                    } else {
                        console.log(`✅ Usuário ${user.name} criado com ID: ${this.lastID}`);
                        
                        // Se for cliente, criar perfil também
                        if (user.role === 'client') {
                            db.run(
                                `INSERT OR IGNORE INTO client_profiles 
                                (user_id, age, gender, weight, height, fitness_level, goals) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [this.lastID, 30, 'male', 75.5, 175, 'intermediate', 'Ganhar massa muscular e definir']
                            );
                        }
                    }
                }
            );
        });

        // Inserir artigos de exemplo
        const articles = [
            {
                title: '10 Dicas para Manter a Motivação nos Treinos',
                content: `Manter a motivação nos treinos é um desafio comum para muitas pessoas. Aqui estão 10 dicas comprovadas...`,
                author_id: 1,
                category: 'motivacao'
            },
            {
                title: 'Alimentação para Melhor Performance',
                content: `A nutrição adequada é fundamental para potencializar seus resultados nos treinos...`,
                author_id: 1,
                category: 'nutricao'
            },
            {
                title: 'Como Prevenir Lesões no Treino',
                content: `Prevenir lesões é essencial para manter a consistência nos treinos. Siga estas recomendações...`,
                author_id: 1,
                category: 'treinamento'
            }
        ];

        articles.forEach(article => {
            db.run(
                'INSERT OR IGNORE INTO articles (title, content, author_id, category) VALUES (?, ?, ?, ?)',
                [article.title, article.content, article.author_id, article.category],
                function(err) {
                    if (err) {
                        console.error('Erro ao inserir artigo:', err);
                    } else {
                        console.log(`✅ Artigo "${article.title}" criado com ID: ${this.lastID}`);
                    }
                }
            );
        });

        console.log('✅ Dados de exemplo inseridos com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao popular banco de dados:', error);
    }
};

// Executar apenas se chamado diretamente
if (require.main === module) {
    seedData();
}

module.exports = { seedData };
