require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'bizconnect_2025_secure_key_xyz789abc123def456ghi789';

// Ensure .env is loaded even if process cwd differs
if ((!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
    try {
        require('dotenv').config({ path: path.join(__dirname, '.env') });
    } catch (_) {}
}

// Email configuration
let emailEnabled = false;
const EMAIL_USER = (process.env.EMAIL_USER || '').trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || '').trim();

// Diagnostics for env presence (password masked)
console.log('Email env detected:', {
    EMAIL_USER_present: EMAIL_USER ? true : false,
    EMAIL_PASS_present: EMAIL_PASS ? true : false
});

// Only create transporter if credentials exist
const transporter = (EMAIL_USER && EMAIL_PASS)
    ? nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    })
    : null;

// Admin email configuration
const ADMIN_EMAIL = 'ivander.nathanael@student.umn.ac.id';

// Helper function to send email with fallback
async function sendEmail(mailOptions) {
    if (!emailEnabled || !transporter) {
        console.log('📧 Email disabled - would send:', mailOptions.subject);
        return { success: false, message: 'Email service not configured' };
    }
    
    try {
        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
}

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bizconnect',
    charset: 'utf8mb4'
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

// Test email configuration (with better error handling)
if (transporter) {
    transporter.verify((error) => {
        if (error) {
            console.warn('⚠️  Email configuration warning:', error.message);
            console.log('📧 Email features will be disabled. To enable email:');
            console.log('   1. Ensure .env exists at project root and contains EMAIL_USER, EMAIL_PASS');
            console.log('   2. For Gmail, enable 2FA and use an App Password (not regular password)');
            console.log('   3. If using Google Workspace, ensure SMTP/App Passwords are allowed');
            emailEnabled = false;
        } else {
            console.log('✅ Email server is ready to send messages');
            emailEnabled = true;
        }
    });
} else {
    console.warn('⚠️  Email credentials missing. Set EMAIL_USER and EMAIL_PASS in .env to enable email.');
    emailEnabled = false;
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'news.html'));
});

app.get('/umkm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'umkm.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// API Routes untuk data MySQL
app.get('/api/news', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT n.*, nc.name as category_name 
            FROM news_articles n 
            LEFT JOIN news_categories nc ON n.category_id = nc.id 
            ORDER BY n.date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to load news data' });
    }
});

app.get('/api/umkm', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT u.*, 
                   GROUP_CONCAT(DISTINCT p.name ORDER BY p.id SEPARATOR '|') as product_names,
                   GROUP_CONCAT(DISTINCT s.name ORDER BY s.id SEPARATOR '|') as service_names
            FROM umkm u
            LEFT JOIN umkm_products p ON u.id = p.umkm_id
            LEFT JOIN umkm_services s ON u.id = s.umkm_id
            WHERE u.status = 'approved'
            GROUP BY u.id
            ORDER BY u.createdAt DESC
        `);
        
        // Get detailed products and services for each UMKM
        const umkmWithDetails = await Promise.all(rows.map(async (umkm) => {
            // Get products
            const [products] = await pool.execute(`
                SELECT * FROM umkm_products WHERE umkm_id = ? ORDER BY id
            `, [umkm.id]);
            
            // Get services
            const [services] = await pool.execute(`
                SELECT * FROM umkm_services WHERE umkm_id = ? ORDER BY id
            `, [umkm.id]);
            
            return {
                ...umkm,
                products: products,
                services: services
            };
        }));
        
        res.json(umkmWithDetails);
    } catch (error) {
        console.error('Error fetching UMKM:', error);
        res.status(500).json({ error: 'Failed to load UMKM data' });
    }
});

app.get('/api/about', (req, res) => {
    res.json({
        title: "BizConnect",
        description: "Portal berita kampus dan media promosi UMKM mahasiswa",
        version: "1.0.0"
    });
});

// Authentication API Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user in database
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND isActive = 1',
            [username, username]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username atau password salah!' 
            });
        }
        
        const user = rows[0];
        
        // Check password using bcrypt
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username atau password salah!' 
            });
        }
        
        // Update last login
        await pool.execute(
            'UPDATE users SET lastLogin = NOW() WHERE id = ?',
            [user.id]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login berhasil!',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat login!' 
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, username, email, password, confirmPassword } = req.body;
        
        // Validation
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password dan konfirmasi password tidak sama!' 
            });
        }
        
        // Check if username or email already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username atau email sudah digunakan!' 
            });
        }
        
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, role, fullName, createdAt, isActive) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
            [username, email, hashedPassword, 'user', fullName, 1]
        );
        
        res.json({
            success: true,
            message: 'Registrasi berhasil! Silakan login.'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat registrasi!' 
        });
    }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Admin API Routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to load users data' });
    }
});

app.get('/api/admin/news', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT n.*, nc.name as category_name 
            FROM news_articles n 
            LEFT JOIN news_categories nc ON n.category_id = nc.id 
            ORDER BY n.date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to load news data' });
    }
});

app.get('/api/admin/umkm', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT u.*, 
                   GROUP_CONCAT(DISTINCT p.name ORDER BY p.id SEPARATOR '|') as product_names,
                   GROUP_CONCAT(DISTINCT s.name ORDER BY s.id SEPARATOR '|') as service_names
            FROM umkm u
            LEFT JOIN umkm_products p ON u.id = p.umkm_id
            LEFT JOIN umkm_services s ON u.id = s.umkm_id
            GROUP BY u.id
            ORDER BY u.createdAt DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching UMKM:', error);
        res.status(500).json({ error: 'Failed to load UMKM data' });
    }
});

// Get UMKM detail (admin)
app.get('/api/admin/umkm/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const umkmId = parseInt(req.params.id);
        
        // Get UMKM basic info
        const [umkmRows] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [umkmId]);
        if (umkmRows.length === 0) {
            return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan' });
        }
        
        const umkm = umkmRows[0];
        
        // Get products
        const [products] = await pool.execute('SELECT * FROM umkm_products WHERE umkm_id = ?', [umkmId]);
        
        // Get services
        const [services] = await pool.execute('SELECT * FROM umkm_services WHERE umkm_id = ?', [umkmId]);
        
        umkm.products = products;
        umkm.services = services;
        
        return res.json({ success: true, umkm: umkm });
    } catch (error) {
        console.error('Error fetching UMKM detail:', error);
        return res.status(500).json({ error: 'Failed to load UMKM detail' });
    }
});

// Create user (admin)
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { username, email, fullName, password, confirmPassword, role = 'user', isActive = true } = req.body;
        if (!username || !email || !fullName) {
            return res.status(400).json({ success: false, message: 'Data user tidak lengkap' });
        }
        // Require password + confirmPassword for create
        if (!password || !confirmPassword || password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Password wajib dan harus sama dengan konfirmasi' });
        }
        
        // Check if user exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, role, fullName, createdAt, isActive) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
            [username, email, hashedPassword, role, fullName, isActive ? 1 : 0]
        );
        
        const newUser = {
            id: result.insertId,
            username,
            email,
            role,
            fullName,
            isActive: isActive ? 1 : 0
        };
        
        return res.json({ success: true, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user (admin)
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, email, fullName, role, isActive } = req.body;
        
        // Check if user exists
        const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }
        
        // Check uniqueness
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
        );
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan' });
        }
        
        // Update user
        await pool.execute(
            'UPDATE users SET username = ?, email = ?, fullName = ?, role = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
            [username, email, fullName, role, isActive ? 1 : 0, userId]
        );
        
        const [updatedUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        return res.json({ success: true, user: updatedUser[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'User berhasil dihapus!' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Create news (admin)
app.post('/api/admin/news', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, summary = '', content, author = 'Admin', date = new Date().toISOString().slice(0,10), category = 'Umum', image = '', views = 0, likes = 0 } = req.body;
        if (!title || !content) return res.status(400).json({ success: false, message: 'Judul dan konten wajib diisi' });
        
        // Get or create category
        let [categoryRows] = await pool.execute('SELECT id FROM news_categories WHERE name = ?', [category]);
        let categoryId;
        if (categoryRows.length === 0) {
            const [categoryResult] = await pool.execute('INSERT INTO news_categories (name) VALUES (?)', [category]);
            categoryId = categoryResult.insertId;
        } else {
            categoryId = categoryRows[0].id;
        }
        
        const [result] = await pool.execute(
            'INSERT INTO news_articles (title, summary, content, author, date, category_id, image, views, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, summary, content, author, date, categoryId, image, views, likes]
        );
        
        const newArticle = { 
            id: result.insertId, 
            title, 
            summary, 
            content, 
            author, 
            date, 
            category_id: categoryId,
            image, 
            views, 
            likes 
        };
        
        return res.json({ success: true, article: newArticle });
    } catch (error) {
        console.error('Error creating news:', error);
        return res.status(500).json({ error: 'Failed to create news' });
    }
});

// Update news (admin)
app.put('/api/admin/news/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const newsId = parseInt(req.params.id);
        const { title, summary, content, author, date, category, image, views, likes } = req.body;
        
        // Check if article exists
        const [articleRows] = await pool.execute('SELECT * FROM news_articles WHERE id = ?', [newsId]);
        if (articleRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
        }
        
        // Get or create category if provided
        let categoryId = articleRows[0].category_id;
        if (category) {
            let [categoryRows] = await pool.execute('SELECT id FROM news_categories WHERE name = ?', [category]);
            if (categoryRows.length === 0) {
                const [categoryResult] = await pool.execute('INSERT INTO news_categories (name) VALUES (?)', [category]);
                categoryId = categoryResult.insertId;
            } else {
                categoryId = categoryRows[0].id;
            }
        }
        
        // Prepare safe values to avoid undefined bind params
        const current = articleRows[0];
        const safeTitle = title ?? current.title ?? '';
        const safeSummary = summary ?? current.summary ?? '';
        const safeContent = content ?? current.content ?? '';
        const safeAuthor = author ?? current.author ?? '';
        // If date not provided, keep existing; ensure DATETIME string if provided
        const safeDate = (date ?? current.date) ?? new Date().toISOString().slice(0, 19).replace('T', ' ');
        const safeImage = image ?? current.image ?? '';
        const safeViews = (views !== undefined && views !== null) ? Number(views) : (current.views ?? 0);
        const safeLikes = (likes !== undefined && likes !== null) ? Number(likes) : (current.likes ?? 0);

        // Update article
        await pool.execute(
            'UPDATE news_articles SET title = ?, summary = ?, content = ?, author = ?, date = ?, category_id = ?, image = ?, views = ?, likes = ? WHERE id = ?',
            [safeTitle, safeSummary, safeContent, safeAuthor, safeDate, categoryId, safeImage, safeViews, safeLikes, newsId]
        );
        
        const [updatedArticle] = await pool.execute('SELECT * FROM news_articles WHERE id = ?', [newsId]);
        return res.json({ success: true, article: updatedArticle[0] });
    } catch (error) {
        console.error('Error updating news:', error);
        return res.status(500).json({ error: 'Failed to update news' });
    }
});

app.delete('/api/admin/news/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const newsId = parseInt(req.params.id);
        
        const [result] = await pool.execute('DELETE FROM news_articles WHERE id = ?', [newsId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Berita berhasil dihapus!' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news' });
    }
});

// Create UMKM (admin)
app.post('/api/admin/umkm', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, category, owner, faculty, semester, price_range, price, contact, email, hours, location, delivery, pickup, status } = req.body;
        if (!name || !owner || !category) return res.status(400).json({ success: false, message: 'Nama, pemilik, dan kategori wajib diisi' });

        // Normalize/Default values to avoid undefined binds
        const safeName = name;
        const safeDescription = description ?? '';
        const safeCategory = category;
        const safeOwner = owner;
        const safeFaculty = faculty ?? null;
        const safeSemester = (semester !== undefined && semester !== null && semester !== '') ? Number(semester) : null;
        const safePriceRange = price_range ?? null;
        const safePrice = (price !== undefined && price !== null && price !== '') ? Number(price) : 0;
        const safeContact = contact ?? '';
        const safeEmail = email ?? null;
        const safeHours = hours ?? null;
        const safeLocation = location ?? '';
        const safeDelivery = (delivery !== undefined && delivery !== null) ? (delivery ? 1 : 0) : 0;
        const safePickup = (pickup !== undefined && pickup !== null) ? (pickup ? 1 : 0) : 0;
        const safeStatus = status ?? 'pending';

        const [result] = await pool.execute(
            'INSERT INTO umkm (name, description, category, owner, faculty, semester, price_range, price, contact, email, hours, location, delivery, pickup, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [safeName, safeDescription, safeCategory, safeOwner, safeFaculty, safeSemester, safePriceRange, safePrice, safeContact, safeEmail, safeHours, safeLocation, safeDelivery, safePickup, safeStatus]
        );
        
        const newBusiness = { 
            id: result.insertId, 
            name: safeName, 
            description: safeDescription, 
            category: safeCategory, 
            owner: safeOwner, 
            faculty: safeFaculty,
            semester: safeSemester,
            price_range: safePriceRange,
            price: safePrice,
            contact: safeContact,
            email: safeEmail,
            hours: safeHours,
            location: safeLocation,
            delivery: safeDelivery,
            pickup: safePickup,
            status: safeStatus,
            createdAt: new Date().toISOString()
        };
        
        return res.json({ success: true, umkm: newBusiness });
    } catch (error) {
        console.error('Error creating UMKM:', error);
        return res.status(500).json({ error: 'Failed to create UMKM' });
    }
});

// Update UMKM (admin)
app.put('/api/admin/umkm/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const umkmId = parseInt(req.params.id);
        const { name, description, category, owner, faculty, semester, price_range, price, contact, email, hours, location, delivery, pickup, status } = req.body;
        
        // Check if UMKM exists
        const [umkmRows] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [umkmId]);
        if (umkmRows.length === 0) {
            return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan' });
        }
        
        // Merge payload with existing values to avoid undefined bind params
        const current = umkmRows[0];
        const safeName = name ?? current.name ?? '';
        const safeDescription = description ?? current.description ?? '';
        const safeCategory = category ?? current.category ?? '';
        const safeOwner = owner ?? current.owner ?? '';
        const safeFaculty = faculty ?? current.faculty ?? null;
        const safeSemester = (semester !== undefined && semester !== null && semester !== '') ? Number(semester) : (current.semester ?? null);
        const safePriceRange = price_range ?? current.price_range ?? null;
        const safePrice = (price !== undefined && price !== null && price !== '') ? Number(price) : (current.price ?? 0);
        const safeContact = contact ?? current.contact ?? '';
        const safeEmail = email ?? current.email ?? null;
        const safeHours = hours ?? current.hours ?? null;
        const safeLocation = location ?? current.location ?? '';
        const safeDelivery = (delivery !== undefined && delivery !== null) ? (delivery ? 1 : 0) : (current.delivery ? 1 : 0);
        const safePickup = (pickup !== undefined && pickup !== null) ? (pickup ? 1 : 0) : (current.pickup ? 1 : 0);
        const safeStatus = status ?? current.status ?? 'pending';

        // Update UMKM
        await pool.execute(
            'UPDATE umkm SET name = ?, description = ?, category = ?, owner = ?, faculty = ?, semester = ?, price_range = ?, price = ?, contact = ?, email = ?, hours = ?, location = ?, delivery = ?, pickup = ?, status = ? WHERE id = ?',
            [safeName, safeDescription, safeCategory, safeOwner, safeFaculty, safeSemester, safePriceRange, safePrice, safeContact, safeEmail, safeHours, safeLocation, safeDelivery, safePickup, safeStatus, umkmId]
        );
        
        const [updatedUmkm] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [umkmId]);
        return res.json({ success: true, umkm: updatedUmkm[0] });
    } catch (error) {
        console.error('Error updating UMKM:', error);
        return res.status(500).json({ error: 'Failed to update UMKM' });
    }
});

// Add product to UMKM (admin)
app.post('/api/admin/umkm/:id/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const umkmId = parseInt(req.params.id);
        const { name, description = '', price, image = '', stock, duration, type = 'product' } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ success: false, message: 'Nama dan harga produk wajib diisi' });
        }
        
        // Check if UMKM exists
        const [umkmRows] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [umkmId]);
        if (umkmRows.length === 0) {
            return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan' });
        }
        
        let result;
        if (type === 'service') {
            const safeName = name;
            const safeDescription = description ?? '';
            const safePrice = Number(price);
            const safeImage = image ?? '';
            const safeDuration = duration ?? null;
            [result] = await pool.execute(
                'INSERT INTO umkm_services (umkm_id, name, description, price, image, duration) VALUES (?, ?, ?, ?, ?, ?)',
                [umkmId, safeName, safeDescription, safePrice, safeImage, safeDuration]
            );
        } else {
            const safeName = name;
            const safeDescription = description ?? '';
            const safePrice = Number(price);
            const safeImage = image ?? '';
            const safeStock = (stock !== undefined && stock !== null && stock !== '') ? Number(stock) : null;
            [result] = await pool.execute(
                'INSERT INTO umkm_products (umkm_id, name, description, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
                [umkmId, safeName, safeDescription, safePrice, safeImage, safeStock]
            );
        }
        
        const newProduct = { 
            id: result.insertId, 
            name, 
            description, 
            price: Number(price), 
            image, 
            stock: (stock !== undefined && stock !== null && stock !== '') ? Number(stock) : undefined, 
            duration: (duration ?? undefined)
        };
        
        return res.json({ success: true, product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ error: 'Failed to add product' });
    }
});

// Update product of UMKM (admin)
app.put('/api/admin/umkm/:id/products/:pid', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const umkmId = parseInt(req.params.id);
        const productId = parseInt(req.params.pid);
        let { name, description, price, image, stock, duration, type } = req.body;
        
        // Check if UMKM exists
        const [umkmRows] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [umkmId]);
        if (umkmRows.length === 0) {
            return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan' });
        }
        // Infer type if missing
        if (!type) {
            const [svc] = await pool.execute('SELECT id FROM umkm_services WHERE id = ? AND umkm_id = ?', [productId, umkmId]);
            type = (svc.length > 0) ? 'service' : 'product';
        }

        // Normalize fields to avoid undefined binds
        const safeName = name ?? '';
        const safeDescription = description ?? '';
        const safePrice = (price !== undefined && price !== null && price !== '') ? Number(price) : 0;
        const safeImage = image ?? '';
        const safeDuration = duration ?? null;
        const safeStock = (stock !== undefined && stock !== null && stock !== '') ? Number(stock) : null;

        let result;
        if (type === 'service') {
            [result] = await pool.execute(
                'UPDATE umkm_services SET name = ?, description = ?, price = ?, image = ?, duration = ? WHERE id = ? AND umkm_id = ?',
                [safeName, safeDescription, safePrice, safeImage, safeDuration, productId, umkmId]
            );
        } else {
            [result] = await pool.execute(
                'UPDATE umkm_products SET name = ?, description = ?, price = ?, image = ?, stock = ? WHERE id = ? AND umkm_id = ?',
                [safeName, safeDescription, safePrice, safeImage, safeStock, productId, umkmId]
            );
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produk/Jasa tidak ditemukan' });
        }
        
        const updatedProduct = { id: productId, name: safeName, description: safeDescription, price: Number(safePrice), image: safeImage, stock: (safeStock ?? undefined), duration: safeDuration };
        return res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product of UMKM (admin)
app.delete('/api/admin/umkm/:id/products/:pid', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const umkmId = parseInt(req.params.id);
        const productId = parseInt(req.params.pid);
        const { type = 'product' } = req.body;
        
        // Check if UMKM exists
        const [umkmRows] = await pool.execute('SELECT * FROM umkm WHERE id = ?', [umkmId]);
        if (umkmRows.length === 0) {
            return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan' });
        }
        
        let result;
        if (type === 'service') {
            [result] = await pool.execute('DELETE FROM umkm_services WHERE id = ? AND umkm_id = ?', [productId, umkmId]);
        } else {
            [result] = await pool.execute('DELETE FROM umkm_products WHERE id = ? AND umkm_id = ?', [productId, umkmId]);
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produk/Jasa tidak ditemukan' });
        }
        
        return res.json({ success: true, message: 'Produk/Jasa berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.delete('/api/admin/umkm/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const umkmId = parseInt(req.params.id);
        
        // Delete related products and services first
        await pool.execute('DELETE FROM umkm_products WHERE umkm_id = ?', [umkmId]);
        await pool.execute('DELETE FROM umkm_services WHERE umkm_id = ?', [umkmId]);
        
        // Delete UMKM
        const [result] = await pool.execute('DELETE FROM umkm WHERE id = ?', [umkmId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'UMKM berhasil dihapus!' });
    } catch (error) {
        console.error('Error deleting UMKM:', error);
        res.status(500).json({ error: 'Failed to delete UMKM' });
    }
});

app.post('/api/admin/umkm/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const umkmId = parseInt(req.params.id);
        
        const [result] = await pool.execute(
            'UPDATE umkm SET status = ?, approvedAt = NOW() WHERE id = ?',
            ['approved', umkmId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'UMKM berhasil disetujui!' });
    } catch (error) {
        console.error('Error approving UMKM:', error);
        res.status(500).json({ error: 'Failed to approve UMKM' });
    }
});

// Profile API Routes
app.put('/api/profile/update', authenticateToken, async (req, res) => {
    try {
        const { fullName, username, email } = req.body;
        const userId = req.user.id;
        
        // Check if user exists
        const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });
        }
        
        // Check if username or email is already taken by another user
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username atau email sudah digunakan!' 
            });
        }
        
        // Update user data
        await pool.execute(
            'UPDATE users SET fullName = ?, username = ?, email = ?, updatedAt = NOW() WHERE id = ?',
            [fullName, username, email, userId]
        );
        
        const [updatedUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        const user = updatedUser[0];
        
        res.json({
            success: true,
            message: 'Profil berhasil diperbarui!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat memperbarui profil!' 
        });
    }
});

// Get current user's full profile
app.get('/api/profile/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });
        }
        
        const user = userRows[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil profil!' });
    }
});

// Delete current user's account
app.delete('/api/profile/delete', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });
        }
        
        return res.json({ success: true, message: 'Akun berhasil dihapus.' });
    } catch (error) {
        console.error('Delete account error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus akun!' });
    }
});

// Fallback for environments not allowing DELETE method
app.post('/api/profile/delete', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });
        }
        
        return res.json({ success: true, message: 'Akun berhasil dihapus.' });
    } catch (error) {
        console.error('Delete account (POST) error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus akun!' });
    }
});

app.put('/api/profile/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        // Get user data
        const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });
        }
        
        const user = userRows[0];
        
        // Check current password (bcrypt)
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password saat ini salah!' 
            });
        }
        
        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute(
            'UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?',
            [hashedPassword, userId]
        );
        
        res.json({
            success: true,
            message: 'Password berhasil diubah!'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengubah password!' 
        });
    }
});

// Contact Email API
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Semua field harus diisi!'
            });
        }
        
        // Email content
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: ADMIN_EMAIL,
            replyTo: email,
            subject: `[BizConnect Contact] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                        📧 Pesan Baru dari User BizConnect
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">👤 Detail Pengirim:</h3>
                        <p><strong>Nama:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
                        <p><strong>Subjek:</strong> ${subject}</p>
                        <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">MENUNGGU RESPONS</span></p>
                    </div>
                    
                    <div style="background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
                        <h3 style="color: #333; margin-top: 0;">Pesan:</h3>
                        <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                        <p style="margin: 0; color: #1976d2; font-size: 14px;">
                            <strong>Waktu:</strong> ${new Date().toLocaleString('id-ID', {
                                timeZone: 'Asia/Jakarta',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
                        <p>Pesan ini dikirim melalui form kontak BizConnect</p>
                        <div style="margin-top: 15px;">
                            <a href="mailto:${email}?subject=Re: ${subject}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; display: inline-block;">📧 Balas Email</a>
                            <a href="https://wa.me/6281234567890?text=Halo%20${encodeURIComponent(name)},%20terima%20kasih%20atas%20pesan%20Anda%20mengenai%20${encodeURIComponent(subject)}" style="background: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; display: inline-block;">💬 WhatsApp</a>
                        </div>
                    </div>
                </div>
            `
        };
        
        // Send email to admin
        const adminEmailResult = await sendEmail(mailOptions);
        
        // Send confirmation email to user
        const confirmationMailOptions = {
            from: `"BizConnect Admin" <${EMAIL_USER || 'ivander.nathanael@student.umn.ac.id'}>`,
            to: email,
            subject: `[BizConnect] Konfirmasi Pesan Anda - ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                        Terima Kasih Atas Pesan Anda!
                    </h2>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <h3 style="color: #10b981; margin-top: 0;">Pesan Anda Telah Diterima</h3>
                        <p>Halo <strong>${name}</strong>,</p>
                        <p>Terima kasih telah menghubungi BizConnect. Pesan Anda dengan subjek <strong>"${subject}"</strong> telah berhasil dikirim dan akan segera kami proses.</p>
                    </div>
                    
                    <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h3 style="color: #333; margin-top: 0;">Detail Pesan Anda:</h3>
                        <p><strong>Nama:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Subjek:</strong> ${subject}</p>
                        <p><strong>Pesan:</strong></p>
                        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 10px;">
                            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
                        <p style="margin: 0; color: #1d4ed8; font-size: 14px;">
                            <strong>Waktu Pengiriman:</strong> ${new Date().toLocaleString('id-ID', {
                                timeZone: 'Asia/Jakarta',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
                        <p>Pesan ini adalah konfirmasi otomatis dari sistem BizConnect</p>
                        <p>Kami akan merespons pesan Anda dalam 1-2 hari kerja</p>
                    </div>
                </div>
            `
        };
        
        // Send confirmation email to user
        const confirmationEmailResult = await sendEmail(confirmationMailOptions);
        
        res.json({
            success: true,
            message: 'Pesan berhasil dikirim! Kami akan segera merespons.'
        });
        
    } catch (error) {
        console.error('Email sending error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            response: error.response
        });
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Transaction API Routes
app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId, storeName, storeOwner, items, totalAmount, customerInfo, paymentMethod } = req.body;
        
        // Validate required fields
        if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data transaksi tidak lengkap!' 
            });
        }
        
        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
            // Create transaction
            const [transactionResult] = await connection.execute(
                'INSERT INTO transactions (userId, storeId, storeName, storeOwner, totalAmount, paymentMethod, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [userId, storeId, storeName || 'Unknown Store', storeOwner || 'Unknown Owner', totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0), paymentMethod || 'transfer', 'pending']
            );
            
            const transactionId = transactionResult.insertId;
            
            // Add transaction items
            for (const item of items) {
                await connection.execute(
                    'INSERT INTO transaction_items (transaction_id, productId, name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                    [transactionId, item.productId, item.name, item.price, item.quantity, item.price * item.quantity]
                );
            }
            
            // Add customer info
            if (customerInfo) {
                await connection.execute(
                    'INSERT INTO transaction_customers (transaction_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
                    [transactionId, customerInfo.name || '', customerInfo.email || '', customerInfo.phone || '', customerInfo.address || '']
                );
            }
            
            await connection.commit();
            
        const newTransaction = {
                id: transactionId,
            userId: userId,
            storeId: storeId,
            storeName: storeName || 'Unknown Store',
            storeOwner: storeOwner || 'Unknown Owner',
            items: items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            customerInfo: customerInfo || {},
            paymentMethod: paymentMethod || 'transfer',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: 'Transaksi berhasil dicatat!',
            transaction: newTransaction
        });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mencatat transaksi!' 
        });
    }
});

// Get user transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [transactions] = await pool.execute(`
            SELECT t.*, 
                   GROUP_CONCAT(ti.name ORDER BY ti.id SEPARATOR '|') as item_names,
                   GROUP_CONCAT(ti.price ORDER BY ti.id SEPARATOR '|') as item_prices,
                   GROUP_CONCAT(ti.quantity ORDER BY ti.id SEPARATOR '|') as item_quantities,
                   tc.name as customer_name,
                   tc.email as customer_email,
                   tc.phone as customer_phone,
                   tc.address as customer_address
            FROM transactions t
            LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
            LEFT JOIN transaction_customers tc ON t.id = tc.transaction_id
            WHERE t.userId = ?
            GROUP BY t.id
            ORDER BY t.createdAt DESC
        `, [userId]);
        
        // Format transactions to match expected structure
        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            userId: t.userId,
            storeId: t.storeId,
            storeName: t.storeName,
            storeOwner: t.storeOwner,
            totalAmount: t.totalAmount,
            paymentMethod: t.paymentMethod,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            items: t.item_names ? t.item_names.split('|').map((name, index) => ({
                name: name,
                price: parseFloat(t.item_prices.split('|')[index]),
                quantity: parseInt(t.item_quantities.split('|')[index])
            })) : [],
            customerInfo: {
                name: t.customer_name || '',
                email: t.customer_email || '',
                phone: t.customer_phone || '',
                address: t.customer_address || ''
            }
        }));
        
        res.json({
            success: true,
            transactions: formattedTransactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data transaksi!' 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`BizConnect server running on http://localhost:${PORT}`);
    console.log('ADMIN ACCOUNT:\n Username: admin\n Password: admin123');
    console.log('USER ACCOUNT:\n Username: DevTest123\n Password: DevTest123');
});
