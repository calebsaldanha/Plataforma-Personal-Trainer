const { db } = require('./db');

const seedData = () => {
    console.log('🌱 Populando banco de dados com dados de exemplo...');

    // Inserir usuários de exemplo
    const users = [
        { name: 'Personal Trainer', email: 'trainer@fitconnect.com', password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/eoGM3XjLr12eC5qD2', role: 'trainer' },
        { name: 'João Silva', email: 'joao@email.com', password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/eoGM3XjLr12eC5qD2', role: 'client' },
        { name: 'Maria Santos', email: 'maria@email.com', password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/eoGM3XjLr12eC5qD2', role: 'client' }
    ];

    users.forEach(user => {
        db.run(
            'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [user.name, user.email, user.password, user.role]
        );
    });

    // Inserir artigos de exemplo
    const articles = [
        {
            title: '10 Dicas para Manter a Motivação nos Treinos',
            content: `Manter a motivação nos treinos é um desafio comum para muitas pessoas. Aqui estão 10 dicas comprovadas para ajudar você a manter a consistência:

1. **Estabeleça metas realistas** - Metas alcançáveis mantêm você motivado
2. **Crie uma rotina** - A consistência é a chave do sucesso
3. **Encontre um parceiro de treino** - A responsabilidade compartilhada ajuda
4. **Varie os exercícios** - Evite a monotonia
5. **Acompanhe seu progresso** - Ver resultados é motivador
6. **Recompense-se** - Celebre as pequenas vitórias
7. **Escute música energética** - Ajuda no ritmo e disposição
8. **Visualize seus objetivos** - Mantenha o foco no longo prazo
9. **Descanse adequadamente** - O descanso é parte do progresso
10. **Não seja tão duro consigo mesmo** - Permita-se recomeçar

Lembre-se: a jornada fitness é uma maratona, não uma corrida!`,
            author_id: 1,
            category: 'motivacao'
        },
        {
            title: 'Alimentação para Melhor Performance',
            content: `A nutrição adequada é fundamental para potencializar seus resultados nos treinos. Aqui está um guia completo:

**Pré-treino (1-2 horas antes):**
- Carboidratos complexos: aveia, batata doce, pão integral
- Proteínas magras: frango, peixe, whey protein
- Evite gorduras e fibras em excesso

**Pós-treino (até 2 horas após):**
- Proteínas para recuperação muscular
- Carboidratos para repor glicogênio
- Hidratação é crucial

**Alimentos essenciais:**
- 🥩 Proteínas: frango, peixe, ovos, whey
- 🍠 Carboidratos: batata doce, arroz integral, aveia
- 🥑 Gorduras boas: abacate, castanhas, azeite
- 🥦 Vegetais: brócolis, espinafre, couve

**Hidratação:**
- Beba água regularmente
- Considere bebidas isotônicas em treinos intensos
- Evite refrigerantes e sucos industrializados

Lembre-se: cada corpo é único, ajuste conforme suas necessidades!`,
            author_id: 1,
            category: 'nutricao'
        },
        {
            title: 'Como Prevenir Lesões no Treino',
            content: `Prevenir lesões é essencial para manter a consistência nos treinos. Siga estas recomendações:

**Aquecimento (5-10 minutos):**
- Mobilidade articular
- Ativação muscular
- Elevação gradual da frequência cardíaca

**Técnica Correta:**
- Aprenda a execução adequada de cada exercício
- Comece com cargas leves
- Peça orientação de um profissional

**Progressão Gradual:**
- Aumente carga e volume gradualmente
- Respeite os limites do seu corpo
- Não tente avançar muito rápido

**Recuperação:**
- Durma 7-9 horas por noite
- Alimente-se adequadamente
- Inclua dias de descanso na rotina

**Sinais de Alerta:**
- Dor aguda durante o exercício
- Inchaço ou vermelhidão
- Perda de amplitude de movimento

**Dicas Extras:**
- Use calçados adequados
- Mantenha a hidratação
- Alongue-se após os treinos

A prevenção é sempre melhor que a reabilitação!`,
            author_id: 1,
            category: 'treinamento'
        }
    ];

    articles.forEach(article => {
        db.run(
            'INSERT OR IGNORE INTO articles (title, content, author_id, category) VALUES (?, ?, ?, ?)',
            [article.title, article.content, article.author_id, article.category]
        );
    });

    console.log('✅ Dados de exemplo inseridos com sucesso!');
};

// Executar apenas se chamado diretamente
if (require.main === module) {
    seedData();
}

module.exports = { seedData };
