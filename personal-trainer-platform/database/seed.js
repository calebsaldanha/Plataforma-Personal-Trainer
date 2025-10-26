const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configurar conexão com o banco diretamente
const dbPath = path.join(__dirname, 'personal_trainer.db');
const db = new sqlite3.Database(dbPath);

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
                    content: 'Manter a motivação nos treinos pode ser desafiador, mas com essas estratégias você vai conseguir manter a consistência. Primeiro, estabeleça metas realistas e comemore pequenas vitórias. Segundo, varie seus treinos para evitar a monotonia. Terceiro, encontre um parceiro de treino para aumentar o compromisso. Quarto, acompanhe seu progresso com métricas. Quinto, recompense-se pelos objetivos alcançados. Sexto, ouça música para aumentar a energia. Sétimo, visualize seus objetivos. Oitavo, descanse adequadamente. Nono, mantenha uma alimentação balanceada. Décimo, lembre-se do porquê você começou!',
                    category: 'motivacao',
                    author_id: trainerId
                },
                {
                    title: 'Importância da Alimentação no Treino',
                    content: 'A nutrição adequada é fundamental para potencializar seus resultados e melhorar seu desempenho nos treinos. O que você come antes do treino fornece energia, enquanto a alimentação pós-treino ajuda na recuperação muscular. Carboidratos complexos como batata-doce e aveia são excelentes fontes de energia pré-treino. Proteínas como frango, ovos e whey protein são essenciais para a reconstrução muscular após o exercício. Gorduras saudáveis como abacate e castanhas fornecem energia sustentada. Hidratação é crucial - beba água antes, durante e depois dos treinos. Suplementos como BCAA e creatina podem complementar uma dieta balanceada, mas não substituem alimentos reais.',
                    category: 'nutricao',
                    author_id: trainerId
                },
                {
                    title: 'Como Prevenir Lesões Durante o Treino',
                    content: 'Conheça as técnicas para treinar com segurança e evitar lesões durante seus exercícios. Primeiro, sempre faça um aquecimento adequado de 5-10 minutos antes de começar. Segundo, mantenha a forma correta durante todos os exercícios - qualidade é mais importante que quantidade. Terceiro, aumente a intensidade gradualmente, seguindo a regra dos 10%. Quarto, use calçados apropriados para o tipo de exercício. Quinto, descanse entre os treinos para permitir a recuperação muscular. Sexto, alongue-se após os treinos. Sétimo, ouça seu corpo - dor aguda é um sinal de alerta. Oitavo, mantenha-se hidratado. Nono, varie os grupos musculares trabalhados. Décimo, consulte um profissional antes de iniciar qualquer nova modalidade.',
                    category: 'treinamento',
                    author_id: trainerId
                },
                {
                    title: 'Benefícios do Exercício para a Saúde Mental',
                    content: 'Além dos benefícios físicos, o exercício regular tem impactos profundos na saúde mental. A atividade física libera endorfinas, conhecidas como "hormônios da felicidade", que melhoram o humor e reduzem o estresse. Exercícios aeróbicos como corrida e natação são particularmente eficazes para combater a ansiedade. O treino de força aumenta a autoconfiança e a autoestima. A consistência nos exercícios cria disciplina que se reflete em outras áreas da vida. Grupos de exercício proporcionam socialização e suporte. Mesmo 30 minutos de atividade moderada diária podem fazer uma diferença significativa no bem-estar mental.',
                    category: 'saude',
                    author_id: trainerId
                }
            ];

            let articlesInserted = 0;
            
            sampleArticles.forEach((article, index) => {
                db.run(`INSERT OR IGNORE INTO articles (title, content, author_id, category) VALUES (?, ?, ?, ?)`,
                    [article.title, article.content, article.author_id, article.category],
                    function(err) {
                        if (err) {
                            console.error('Erro ao inserir artigo:', err);
                        } else {
                            articlesInserted++;
                            console.log(`✅ Artigo "${article.title}" criado com ID:`, this.lastID);
                        }

                        // Fechar conexão quando todos os artigos forem inseridos
                        if (articlesInserted === sampleArticles.length) {
                            console.log('🎉 Dados de teste inseridos com sucesso!');
                            db.close();
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
