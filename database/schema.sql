CREATE DATABASE IF NOT EXISTS bicycle_hub;
USE bicycle_hub;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS bicycles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bicycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bicycle_id INT NOT NULL,
    date DATE NOT NULL,
    duration INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bicycle_id) REFERENCES bicycles(id) ON DELETE CASCADE
);

-- Insert sample bicycles
INSERT INTO bicycles (name, type, price, image) VALUES 
('Mountain Explorer', 'Mountain', 25.00, '/uploads/mountain_bike.png'),
('City Commuter', 'Road', 15.00, '/uploads/city_bike.png'),
('Speedster Pro', 'Racing', 35.00, '/uploads/racing_bike.png'),
('Trail Blazer', 'Mountain', 28.00, '/uploads/hybrid_bike.png'),
('Urban Cruiser', 'Hybrid', 20.00, '/uploads/city_bike.png'),
('Speedster Elite', 'Racing', 45.00, '/uploads/racing_bike_2.png'),
('Off-Road Beast', 'Mountain', 32.00, '/uploads/mountain_bike_2.png');

-- Note: To create an admin user, register a normal user via the application interface, 
-- then run the following command in your MySQL database to upgrade their role:
-- UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
