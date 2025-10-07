-- =====================================================
-- BizConnect — Fixed SQL (users, umkm, transactions, news)
-- =====================================================
CREATE DATABASE IF NOT EXISTS bizconnect;
USE bizconnect;

SET NAMES 'utf8mb4';
SET FOREIGN_KEY_CHECKS = 0;

-- Drop (safe) jika ada
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transaction_customers;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS umkm_products;
DROP TABLE IF EXISTS umkm_services;
DROP TABLE IF EXISTS umkm;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS news_articles;
DROP TABLE IF EXISTS news_stats;
DROP TABLE IF EXISTS news_categories;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(150),
    password VARCHAR(255),
    role ENUM('admin','user') DEFAULT 'user',
    fullName VARCHAR(150),
    createdAt DATETIME,
    updatedAt DATETIME NULL,
    lastLogin DATETIME,
    isActive BOOLEAN
);

INSERT INTO users (id, username, email, password, role, fullName, createdAt, updatedAt, lastLogin, isActive) VALUES
(1, 'admin', 'admin@bizconnect.com', '$2b$10$Ihe54Gd3vCKYpr.EBeh3T.NOmackm.fDxAvl3lztdqqvhm2p26Qk.', 'admin', 'Administrator', '2024-01-01 00:00:00', NULL, '2025-10-07 02:40:17', TRUE),
(2, 'user1', 'user1@example.com', '$2b$10$ymlRIbt94qfdGGqNdopw7OcrYEl8Uu99Xzae0n.yGuvlrrt/pQFWa', 'user', 'User1', '2024-01-15 00:00:00', '2025-09-30 08:47:07', '2025-10-07 01:53:34', TRUE),
(3, 'admin2', 'admin2@example.com', '$2a$10$qo/bMAQcckX44bHtDlaTZuzSkoTfVMdF/JpXYc61SXYyr7GDzbpxa', 'admin', 'Administrator2', '2025-09-30 10:49:23', '2025-09-30 10:50:19', '2025-10-06 09:53:34', TRUE),
(4, 'adam', 'adam@gmail.com', '$2a$10$.HAKfsFba9iDjrKTlZqhoOHKwU2uPpXaDBXXAt9/15yaKT.Pp4TkW', 'user', 'adam', '2025-10-01 02:14:43', NULL, '2025-10-01 02:23:49', TRUE),
(5, 'DevTest123', 'ivandernathanaelk@gmail.com', '$2a$10$iK3b.pulGs/iaSbbnzllju5Ynj/IRj9yM7F3dxHtn2vbUKf7X/z8.', 'user', 'DeveloperTest', '2025-10-07 02:42:42', NULL, '2025-10-07 02:42:50', TRUE);

-- =========================
-- UMKM (master) + products + services
-- =========================
CREATE TABLE umkm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    owner VARCHAR(100),
    faculty VARCHAR(100),
    semester INT,
    price_range VARCHAR(100),
    price INT,
    rating DECIMAL(2,1),
    reviews INT,
    contact VARCHAR(50),
    email VARCHAR(150),
    hours VARCHAR(100),
    customers INT,
    createdAt DATETIME,
    image TEXT,
    location VARCHAR(100),
    delivery BOOLEAN,
    pickup BOOLEAN,
    status ENUM('pending','approved','rejected'),
    approvedAt DATETIME
);

CREATE TABLE umkm_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    umkm_id INT,
    name VARCHAR(150),
    description TEXT,
    price INT,
    image TEXT,
    stock INT,
    FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);

CREATE TABLE umkm_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    umkm_id INT,
    name VARCHAR(150),
    description TEXT,
    price INT,
    image TEXT,
    duration VARCHAR(50),
    FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);

-- Insert UMKM rows (NB: approvedAt di-convert dari ISO -> MySQL DATETIME)
INSERT INTO umkm (id, name, description, category, owner, faculty, semester, price_range, price, rating, reviews, contact, email, hours, customers, createdAt, image, location, delivery, pickup, status, approvedAt) VALUES
(1, 'Crafty Corner - Handmade Accessories',
 'Produk aksesoris handmade berkualitas tinggi dengan desain unik dan modern. Cocok untuk mahasiswa yang ingin tampil stylish dengan budget terbatas.',
 'Fashion & Accessories', 'Sarah Maharani', 'Fakultas Desain', 6, 'Rp 25.000 - Rp 150.000', 25000, 4.8, 45, '087715658420', 'sarah.maharani@email.com', 'Senin - Jumat: 09:00 - 17:00', 120, '2024-01-15', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfqAa4BYbh9tq--t5vCUy9cCw0yu2ImHAyVg&s', 'Kampus Area', TRUE, TRUE, 'approved', '2025-09-30 10:27:49'),
(2, 'CodeCafe - Jasa Pembuatan Website',
 'Layanan pembuatan website untuk kebutuhan akademik, bisnis, dan personal. Tim developer berpengalaman dengan harga mahasiswa.',
 'Technology Services', 'Ahmad Rizki', 'Fakultas Teknik', 8, 'Rp 500.000 - Rp 2.000.000', 500000, 4.9, 23, '087715658420', 'ahmad.rizki@email.com', '24/7 Online Service', 45, '2024-02-01', 'https://resolusiweb.com/post/wp-content/uploads/2022/03/Jasa-Pembuatan-Website-di-Pondok-Aren-Tangerang-Selatan.jpg', 'Online Service', FALSE, FALSE, 'approved', '2025-09-30 10:27:52'),
(4, 'FoodieBox - Catering Sehat',
 'Layanan catering makanan sehat dan bergizi untuk mahasiswa. Menu bervariasi dengan harga terjangkau dan pengantaran tepat waktu.',
 'Food & Beverage', 'Budi Santoso', 'Fakultas Teknologi Pangan', 5, 'Rp 15.000 - Rp 35.000/porsi', 15000, 4.6, 89, '087715658420', 'budi.santoso@email.com', 'Senin - Jumat: 06:00 - 18:00', 156, '2024-01-10', 'https://beritanasional.com/storage/2025/04/prabowo-singgung-profesor-yang-remehkan-mbg-tidak-belajar-dan-tidak-baca-23042025-171107.jpg', 'Kampus Area', TRUE, TRUE, 'approved', '2025-09-30 10:43:36'),
(5, 'ArtSpace - Jasa Desain Grafis',
 'Layanan desain grafis untuk kebutuhan akademik dan bisnis. Logo, poster, banner, dan berbagai kebutuhan desain lainnya.',
 'Creative Services', 'Dina Putri', 'Fakultas Seni Rupa', 6, 'Rp 75.000 - Rp 500.000', 75000, 4.8, 34, '087715658420', 'dina.putri@email.com', 'Senin - Jumat: 09:00 - 18:00', 67, '2024-02-15', 'https://snapy.co.id/gambar/artikel/tips-memilih-jasa-desain-grafis-terpercaya-dan-profesional.jpg', 'Online Service', TRUE, FALSE, 'approved', '2025-09-30 10:43:37'),
(6, 'TechRepair - Service Laptop & HP',
 'Layanan service dan perbaikan laptop, HP, dan gadget lainnya. Teknisi berpengalaman dengan garansi resmi.',
 'Technology Services', 'Rizki Pratama', 'Fakultas Teknik', 7, 'Rp 50.000 - Rp 500.000', 50000, 4.5, 56, '087715658420', 'rizki.pratama@email.com', 'Senin - Sabtu: 08:00 - 17:00', 78, '2024-01-25', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUTExIVFhUVGBYYFxgXGBcYFxgWFxUWFxUYFRcbHSggGBolHRUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0dHx8uLS0tLSstLS0tLS0tLS0tListLS0tLS0tKy0tMC0tLS0tLS0tLS0tLystLS0tLS0tLf/AABEIAKoBKQMBIgACEQEDEQH/...,', 'Kampus Area', FALSE, TRUE, 'approved', '2025-09-30 10:43:37');

-- Insert products for Crafty Corner (umkm_id = 1)
INSERT INTO umkm_products (umkm_id, name, description, price, image, stock) VALUES
(1, 'Gelang Kulit', 'Gelang kulit asli dengan desain minimalis', 25000, 'https://via.placeholder.com/200x200/ec4899/ffffff?text=Gelang+Kulit', 15),
(1, 'Kalung Unik', 'Kalung dengan desain unik dan modern', 45000, 'https://via.placeholder.com/200x200/ec4899/ffffff?text=Kalung+Unik', 8),
(1, 'Earring Handmade', 'Anting handmade dengan detail yang indah', 35000, 'https://via.placeholder.com/200x200/ec4899/ffffff?text=Earring+Handmade', 12),
(1, 'Tas Kain', 'Tas kain dengan desain menarik', 75000, 'https://image.made-in-china.com/202f0j00QrqkUGRaojuf/Women-Lightweight-Soft-Comfortable-Luxury-Handbag-Chunky-Knit-Thick-Yarn-Crochet-Handmade-Woven-Bag.webp', 5);

-- Insert services for CodeCafe (umkm_id = 2)
INSERT INTO umkm_services (umkm_id, name, description, price, image, duration) VALUES
(2, 'Website Portfolio', 'Website portfolio profesional untuk showcase karya', 500000, 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Portfolio+Website', '3-5 hari'),
(2, 'E-commerce', 'Website toko online dengan fitur lengkap', 1500000, 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=E-commerce', '7-10 hari'),
(2, 'Landing Page', 'Landing page untuk promosi produk/jasa', 300000, 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Landing+Page', '2-3 hari'),
(2, 'Web App', 'Aplikasi web dengan fitur interaktif', 2000000, 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Web+App', '10-14 hari');

-- Insert products for FoodieBox (umkm_id = 4)
INSERT INTO umkm_products (umkm_id, name, description, price, image, stock) VALUES
(4, 'Nasi Gudeg', 'Nasi gudeg dengan kuah santan yang gurih', 15000, 'https://via.placeholder.com/200x200/f59e0b/ffffff?text=Nasi+Gudeg', 50),
(4, 'Ayam Bakar', 'Ayam bakar bumbu kecap yang lezat', 25000, 'https://via.placeholder.com/200x200/f59e0b/ffffff?text=Ayam+Bakar', 30),
(4, 'Sayur Lodeh', 'Sayur lodeh dengan santan segar', 12000, 'https://via.placeholder.com/200x200/f59e0b/ffffff?text=Sayur+Lodeh', 40),
(4, 'Gado-gado', 'Gado-gado dengan bumbu kacang khas', 18000, 'https://via.placeholder.com/200x200/f59e0b/ffffff?text=Gado-gado', 25);

-- Insert services for ArtSpace (umkm_id = 5)
INSERT INTO umkm_services (umkm_id, name, description, price, image, duration) VALUES
(5, 'Logo Design', 'Desain logo profesional untuk brand Anda', 150000, 'https://snapy.co.id/gambar/artikel/Jasa-Desain-Grafis-1.jpg', '3-5 hari'),
(5, 'Poster & Banner', 'Desain poster dan banner untuk promosi', 75000, 'https://api.bintangsempurna.co.id/images/product/1742905838-BhQ6ctgxX9.jpg', '2-3 hari'),
(5, 'Social Media Kit', 'Paket desain untuk media sosial', 200000, 'https://via.placeholder.com/200x200/8b5cf6/ffffff?text=Social+Media+Kit', '5-7 hari'),
(5, 'Brand Identity', 'Identitas brand lengkap dengan panduan', 500000, 'https://via.placeholder.com/200x200/8b5cf6/ffffff?text=Brand+Identity', '10-14 hari');

-- Insert services for TechRepair (umkm_id = 6)
INSERT INTO umkm_services (umkm_id, name, description, price, image, duration) VALUES
(6, 'Service Laptop', 'Service dan perbaikan laptop berbagai merk', 100000, 'https://via.placeholder.com/200x200/ef4444/ffffff?text=Laptop+Service', '1-3 hari'),
(6, 'Repair HP', 'Perbaikan HP dan smartphone', 50000, 'https://via.placeholder.com/200x200/ef4444/ffffff?text=Phone+Repair', '1-2 hari'),
(6, 'Install Software', 'Install software dan sistem operasi', 75000, 'https://via.placeholder.com/200x200/ef4444/ffffff?text=Software+Install', '2-4 jam');

-- =========================
-- TRANSACTIONS + ITEMS + CUSTOMERS
-- =========================
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    storeId INT,
    storeName VARCHAR(255),
    storeOwner VARCHAR(100),
    totalAmount INT,
    paymentMethod VARCHAR(50),
    status VARCHAR(32) DEFAULT 'pending',
    createdAt DATETIME,
    updatedAt DATETIME,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (storeId) REFERENCES umkm(id)
);

CREATE TABLE transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    productId INT,
    name VARCHAR(150),
    price INT,
    quantity INT,
    subtotal INT,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE transaction_customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    name VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(50),
    address VARCHAR(255),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Insert transactions (storeId refers to umkm.id which already exists)
INSERT INTO transactions (id, userId, storeId, storeName, storeOwner, totalAmount, paymentMethod, status, createdAt, updatedAt) VALUES
(1, 2, 4, 'FoodieBox - Catering Sehat', 'Budi Santoso', 15000, 'e-wallet', 'pending', '2025-09-30 21:30:08', '2025-09-30 21:30:08'),
(2, 2, 1, 'Crafty Corner - Handmade Accessories', 'Sarah Maharani', 25000, 'transfer', 'pending', '2025-09-30 21:56:35', '2025-09-30 21:56:35'),
(3, 2, 4, 'FoodieBox - Catering Sehat', 'Budi Santoso', 15000, 'cod', 'pending', '2025-10-01 00:33:49', '2025-10-01 00:33:49'),
(4, 2, 4, 'FoodieBox - Catering Sehat', 'Budi Santoso', 15000, 'transfer', 'pending', '2025-10-01 01:35:28', '2025-10-01 01:35:28'),
(5, 2, 4, 'FoodieBox - Catering Sehat', 'Budi Santoso', 15000, 'transfer', 'pending', '2025-10-01 01:36:42', '2025-10-01 01:36:42'),
(6, 2, 1, 'Crafty Corner - Handmade Accessories', 'Sarah Maharani', 25000, 'transfer', 'pending', '2025-10-01 01:43:10', '2025-10-01 01:43:10'),
(7, 2, 1, 'Crafty Corner - Handmade Accessories', 'Sarah Maharani', 25000, 'transfer', 'pending', '2025-10-01 01:46:59', '2025-10-01 01:46:59');

-- Insert items & customer info (from transaction.json)
INSERT INTO transaction_items (transaction_id, productId, name, price, quantity, subtotal) VALUES
(1, 1, 'Nasi Gudeg', 15000, 1, 15000),
(2, 1, 'Gelang Kulit', 25000, 1, 25000),
(3, 1, 'Nasi Gudeg', 15000, 1, 15000),
(4, 1, 'Nasi Gudeg', 15000, 1, 15000),
(5, 1, 'Nasi Gudeg', 15000, 1, 15000),
(6, 1, 'Gelang Kulit', 25000, 1, 25000),
(7, 1, 'Gelang Kulit', 25000, 1, 25000);

INSERT INTO transaction_customers (transaction_id, name, email, phone, address) VALUES
(1, 'Ivander', 'ivandernathanaelk@gmail.com', '087715658420', 'Hihiheha'),
(2, 'ivan', 'codewithivannn@gmail.com', '087715658420', 'hihiheha'),
(3, 'udin petot', 'ivander.nathanael@student.umn.ac.id', '08777', 'hihihea'),
(4, 'ivan', 'ivander.nathanael@student.umn.ac.id', '08777', 'xxxxxxxx'),
(5, 'ivan', 'ivander.nathanael@student.umn.ac.id', '08777', 'xxxxxxxx'),
(6, 'ivan', 'ivander.nathanael@student.umn.ac.id', 'xxxxxxxx', 'xxxxxxxx'),
(7, 'ivan', 'ivandernathanaelk@gmail.com', 'xxxxxxxx', 'zxxxxxxxxxx');

-- =========================
-- NEWS (categories + articles + stats)
-- =========================
CREATE TABLE news_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    summary TEXT,
    content TEXT,
    author VARCHAR(100),
    date DATETIME,
    category_id INT,
    image TEXT,
    views INT,
    likes INT,
    FOREIGN KEY (category_id) REFERENCES news_categories(id)
);

CREATE TABLE news_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    totalArticles INT,
    totalViews INT,
    totalLikes INT
);

INSERT INTO news_categories (id, name) VALUES
(1, 'Prestasi'),
(2, 'Event'),
(3, 'Fasilitas'),
(4, 'Beasiswa'),
(5, 'Budaya');

INSERT INTO news_articles (id, title, summary, content, author, date, category_id, image, views, likes) VALUES
(1, 'Mahasiswa Teknik Informatika Raih Juara 1 Kompetisi Nasional',
 'Tim mahasiswa dari Fakultas Teknik berhasil meraih juara pertama dalam kompetisi programming nasional yang diadakan di Jakarta.',
 'Tim mahasiswa Teknik Informatika Universitas berhasil meraih prestasi gemilang dalam kompetisi programming nasional yang diadakan di Jakarta pada tanggal 15 November 2024. Tim yang terdiri dari 3 mahasiswa semester 7 ini berhasil mengalahkan 50 tim dari berbagai universitas di Indonesia.',
 'Redaksi Kampus', '2024-11-20', 1, 'https://www.umn.ac.id/wp-content/uploads/2022/08/Screenshot-2022-07-22-033539.jpg', 1250, 89),
(2, 'Seminar Kewirausahaan: ''Membangun Startup di Era Digital''',
 'Universitas mengadakan seminar kewirausahaan dengan pembicara dari startup unicorn Indonesia.',
 'Dalam rangka meningkatkan semangat kewirausahaan mahasiswa, Universitas mengadakan seminar bertajuk ''Membangun Startup di Era Digital'' dengan menghadirkan pembicara dari startup unicorn Indonesia. Seminar ini dihadiri oleh lebih dari 500 mahasiswa dari berbagai fakultas.',
 'Tim Humas', '2024-11-18', 2, 'https://via.placeholder.com/400x250/10b981/ffffff?text=Entrepreneurship+Seminar', 890, 67),
(3, 'Fasilitas Laboratorium Komputer Terbaru Dibuka',
 'Laboratorium komputer dengan teknologi terbaru resmi dibuka untuk mendukung pembelajaran mahasiswa.',
 'Universitas membuka laboratorium komputer terbaru dengan teknologi terkini untuk mendukung proses pembelajaran mahasiswa. Laboratorium ini dilengkapi dengan 50 unit komputer dengan spesifikasi tinggi dan software terbaru untuk berbagai kebutuhan akademik.',
 'Fakultas Teknik', '2024-11-15', 3, 'https://via.placeholder.com/400x250/f59e0b/ffffff?text=Computer+Lab', 2100, 156),
(4, 'Beasiswa Prestasi Dibuka untuk Semester Genap 2024/2025',
 'Universitas membuka pendaftaran beasiswa prestasi untuk mahasiswa berprestasi akademik dan non-akademik.',
 'Universitas membuka kesempatan beasiswa prestasi untuk semester genap tahun akademik 2024/2025. Beasiswa ini terbuka untuk mahasiswa dengan IPK minimal 3.5 dan memiliki prestasi di bidang akademik maupun non-akademik. Pendaftaran dibuka hingga 30 Desember 2024.',
 'Bagian Kemahasiswaan', '2024-11-12', 4, 'https://via.placeholder.com/400x250/8b5cf6/ffffff?text=Scholarship', 3200, 234),
(5, 'Festival Budaya Mahasiswa 2024 Sukses Digelar',
 'Festival budaya mahasiswa tahunan berhasil digelar dengan meriah, menampilkan berbagai kesenian tradisional dan modern.',
 'Festival Budaya Mahasiswa 2024 berhasil digelar dengan sukses di lapangan utama kampus. Acara yang berlangsung selama 3 hari ini menampilkan berbagai pertunjukan seni tradisional dan modern dari mahasiswa berbagai fakultas. Festival ini dihadiri oleh ribuan pengunjung dari dalam dan luar kampus.',
 'BEM Universitas', '2024-11-10', 5, 'https://via.placeholder.com/400x250/ef4444/ffffff?text=Cultural+Festival', 1800, 145);

INSERT INTO news_stats (totalArticles, totalViews, totalLikes) VALUES (5, 9240, 691);

-- Re-enable FK checks
SET FOREIGN_KEY_CHECKS = 1;
