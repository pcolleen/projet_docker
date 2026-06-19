CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- mot de passe : "password123"
INSERT INTO users (email, password) VALUES
  ('test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO tasks (title, description, status) VALUES
  ('Créer la base de données', 'Mettre en place PostgreSQL', 'done'),
  ('Développer le backend', 'API Node.js + Express', 'in_progress'),
  ('Développer le frontend', 'Interface React', 'in_progress'),
  ('Écrire les tests', 'Tests unitaires et intégration', 'todo'),
  ('Déployer l''application', 'Docker compose en prod', 'todo');
