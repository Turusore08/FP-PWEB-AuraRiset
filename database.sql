CREATE DATABASE aurariset_db;

\c aurariset_db;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'mahasiswa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat (
    id_chat SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    history_chat TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dokumen (
    id_dokumen SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    isi_dokumen TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed default users for RBAC testing (passwords: admin123, dosen123, mahasiswa123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@aurariset.ac.id', '$2y$12$EzsCXJunk8ZQ47Z1gWORxuNiNORAQ56xIBifKgavx/uLjxUBSULD.', 'admin'),
('dosen', 'dosen@aurariset.ac.id', '$2y$12$kK9dgYyMr5pz/DIrcDR46uTcpwPKDjRacRVooWWEzyMt8k6Z..DYa', 'dosen'),
('mahasiswa', 'mahasiswa@aurariset.ac.id', '$2y$12$BVaTyV9rAWz19NecM9u3JezhUGSMpQz2h/U.HQH7rL6GenfKm1clG', 'mahasiswa')
ON CONFLICT (username) DO NOTHING;
