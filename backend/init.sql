CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

INSERT INTO items (name, description) VALUES
  ('Item 1', 'Description du premier item'),
  ('Item 2', 'Description du deuxième item');
