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

        let userCount = 0;
        
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
                            const profileData = user.name === 'João Silva' 
                                ? [this.lastID, 30, 'male', 75.5, 175, 'intermediate', 'Ganhar massa muscular e definir']
                                : [this.lastID, 28, 'female', 62.0, 165, 'beginner', 'Perder peso e tonificar'];
                            
                            db.run(
                                `INSERT OR IGNORE INTO client_profiles 
                                (user_id, age, gender, weight, height, fitness_level, goals) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                profileData,
                                (err) => {
                                    if (err) console.error('Erro perfil:', err);
                                }
                            );
                        }
                        
                        userCount++;
                        if (userCount === users.length) {
                            seedArticles();
                        }
                    }
                }
            );
        });

        function seedArticles() {
            // Inserir artigos de exemplo
            const articles = [
                {
                    title: '10 Dicas para Manter a Motivação nos Treinos',
                    content: `Manter a motivação nos treinos é um desafio comum para muitas pessoas. Aqui estão 10 dicas comprovadas para ajudar você a manter o foco:\n\n1. Estabeleça metas realistas e específicas\n2. Crie uma rotina consistente\n3. Encontre um parceiro de treino\n4. Varie seus exercícios\n5. Comemore pequenas vitórias\n6. Use música para energizar\n7. Acompanhe seu progresso\n8. Recompense-se adequadamente\n9. Visualize seus objetivos\n10. Descanse e recupere-se adequadamente.`,
                    author_id: 1,
                    category: 'motivacao'
                },
                {
                    title: 'Alimentação para Melhor Performance',
                    content: `A nutrição adequada é fundamental para potencializar seus resultados nos treinos. Uma dieta balanceada pode fazer toda a diferença:\n\n• Proteínas: Essenciais para recuperação muscular\n• Carboidratos: Fornecem energia para os treinos\n• Gorduras saudáveis: Importantes para hormônios\n• Vitaminas e minerais: Cruciais para funções corporais\n• Hidratação: Fundamental para o desempenho\n\nInvista em alimentos naturais e evite processados.`,
                    author_id: 1,
                    category: 'nutricao'
                },
                {
                    title: 'Como Prevenir Lesões no Treino',
                    content: `Prevenir lesões é essencial para manter a consistência nos treinos. Siga estas recomendações:\n\n• Aquecimento adequado antes do treino\n• Técnica correta de execução\n• Progressão gradual de carga\n• Descanso entre sessões\n• Alongamento e mobilidade\n• Escute seu corpo\n• Use calçados apropriados\n• Mantenha-se hidratado\n\nLesões podem ser evitadas com cuidados básicos.`,
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

            console.log('🎉 Seed completo! Dados inseridos com sucesso.');
            console.log('\n📧 CREDENCIAIS PARA TESTE:');
            console.log('Personal Trainer: trainer@fitconnect.com / 123456');
            console.log('Cliente: joao@email.com / 123456');
            console.log('Cliente: maria@email.com / 123456');
        }
        
    } catch (error) {
        console.error('❌ Erro ao popular banco de dados:', error);
    }
};

if (require.main === module) {
    seedData();
}

module.exports = { seedData };
