const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'personal_trainer.db');
const db = new sqlite3.Database(dbPath);

const init = () => {
    // Tabela de usuários
    db.run(\CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'client',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )\);

    // Tabela de perfis de clientes
    db.run(\CREATE TABLE IF NOT EXISTS client_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        age INTEGER,
        gender TEXT,
        weight REAL,
        height REAL,
        fitness_level TEXT,
        goals TEXT,
        medical_conditions TEXT,
        experience TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )\);

    // Tabela de treinos
    db.run(\CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        trainer_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        exercises TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users (id),
        FOREIGN KEY (trainer_id) REFERENCES users (id)
    )\);

    // Tabela de check-ins de treino
    db.run(\CREATE TABLE IF NOT EXISTS workout_checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER,
        client_id INTEGER,
        completed BOOLEAN DEFAULT 0,
        notes TEXT,
        rating INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES workouts (id),
        FOREIGN KEY (client_id) REFERENCES users (id)
    )\);

    // Tabela de mensagens
    db.run(\CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
    )\);

    // Tabela de artigos
    db.run(\CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
    )\);

    console.log('✅ Banco de dados inicializado com sucesso!');
};

module.exports = { db, init };
