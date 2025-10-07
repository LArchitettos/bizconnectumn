# 🚀 BizConnect - Portal Berita Kampus & Platform UMKM Mahasiswa

**BizConnect** adalah platform terintegrasi yang menghubungkan mahasiswa dengan berita kampus terkini dan memfasilitasi pengembangan bisnis UMKM mahasiswa. Platform ini dirancang khusus untuk mendukung ekosistem kampus yang dinamis dan inovatif dengan teknologi modern dan user experience yang optimal.

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Proses Bisnis](#-proses-bisnis)
- [Struktur Project](#-struktur-project)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi](#-konfigurasi)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

## 🎯 Tentang Proyek

**BizConnect** adalah solusi komprehensif untuk ekosistem kampus yang menggabungkan:

- **Portal Berita Kampus**: Sistem manajemen dan publikasi berita kampus dengan kategori yang terorganisir
- **Platform UMKM Mahasiswa**: Marketplace untuk bisnis mahasiswa dengan sistem e-commerce terintegrasi
- **Sistem Administrasi**: Panel admin untuk manajemen konten dan pengguna
- **Sistem Autentikasi**: Keamanan berbasis JWT dengan role-based access control

### 🎨 **Desain Philosophy**
- **User-Centric Design**: Interface yang intuitif dan mudah digunakan
- **Mobile-First Approach**: Optimized untuk semua perangkat
- **Performance-Oriented**: Loading cepat dan responsif
- **Security-First**: Implementasi keamanan yang ketat

## 🎯 Fitur Utama

### 🏠 **Homepage & Landing Page**
- **Hero Section** dengan call-to-action yang menarik dan animasi smooth
- **About Section** dengan carousel interaktif dan testimonial
- **Explore Section** untuk navigasi ke fitur utama dengan smooth scrolling
- **Contact Form** dengan pengiriman email otomatis dan validasi real-time
- **Newsletter Subscription** dengan konfirmasi email
- **Responsive Design** untuk semua perangkat (mobile, tablet, desktop)
- **Smooth Scrolling** dan animasi yang halus dengan CSS transitions
- **Loading States** untuk semua interaksi

### 📰 **Sistem Berita Kampus**
- **Tampilan Berita** dengan grid layout yang menarik dan responsive
- **Kategori Berita**: Prestasi, Event, Fasilitas, Beasiswa, Budaya, Akademik
- **Search & Filter** berdasarkan kategori, tanggal, dan kata kunci dengan highlight
- **Detail Berita** dengan konten lengkap, gambar, dan metadata
- **Pagination** untuk navigasi yang mudah dengan infinite scroll option
- **Toast Notifications** untuk feedback user dengan positioning yang optimal
- **Highlight Search** untuk hasil pencarian dengan animasi
- **Share Functionality** untuk media sosial
- **Reading Time** estimation untuk artikel

### 🏪 **Platform UMKM Mahasiswa**
- **Galeri UMKM** dengan grid layout responsif dan lazy loading
- **Kategori UMKM**: Fashion, Technology, Education, Food, Creative Services, Health
- **Search & Filter** berdasarkan kategori, nama, lokasi, dan produk dengan autocomplete
- **Detail UMKM** dengan informasi lengkap, galeri produk, dan kontak
- **Sistem Produk/Jasa** dengan gambar, deskripsi, harga, dan stok
- **Shopping Cart** dengan grouping per toko dan real-time updates
- **Checkout System** dengan integrasi WhatsApp dan konfirmasi order
- **Rating & Review** sistem dengan validasi
- **Contact UMKM** langsung dengan WhatsApp integration
- **Favorites System** untuk menyimpan UMKM favorit

### 🛒 **Sistem E-Commerce Terintegrasi**
- **Shopping Cart** dengan manajemen item yang advanced
- **Multi-Store Cart** (satu cart untuk beberapa toko dengan grouping)
- **Quantity Management** (tambah/kurang item dengan validasi stok)
- **Checkout Process** dengan form lengkap dan validasi
- **WhatsApp Integration** untuk konfirmasi order dengan template pesan
- **Transaction History** untuk user dengan filter dan export PDF
- **Real-time Cart Updates** dengan localStorage sync
- **Price Calculation** dengan tax dan shipping calculation
- **Order Tracking** dengan status updates

### 👤 **Sistem Autentikasi & User Management**
- **User Registration** dengan validasi lengkap dan email verification
- **User Login** dengan JWT authentication dan remember me
- **Profile Management** dengan edit data dan avatar upload
- **Password Change** dengan validasi keamanan dan history
- **Session Management** dengan token refresh dan auto-logout
- **Role-based Access** (User & Admin) dengan middleware protection
- **Auth Guards** untuk proteksi halaman dan API endpoints
- **Account Recovery** dengan email-based reset
- **Two-Factor Authentication** (2FA) support

### 🔧 **Panel Admin Komprehensif**
- **Dashboard** dengan statistik lengkap dan real-time updates
- **User Management** dengan CRUD operations dan bulk actions
- **News Management** dengan rich text editor dan media upload
- **UMKM Management** dengan approval system
- **Transaction Management** dengan filtering dan reporting
- **Search Functionality** di semua section dengan advanced queries
- **Toast Notifications** untuk feedback admin dengan positioning
- **Real-time Statistics** update dengan WebSocket support
- **Pending Approvals** management dengan notification system
- **Export Functionality** untuk data dalam format PDF/Excel
- **Audit Logs** untuk tracking perubahan data

### 📧 **Sistem Email Terintegrasi**
- **Contact Form** dengan pengiriman email otomatis dan template
- **Dual Email System**: Email ke admin + konfirmasi ke user
- **User-to-Admin Communication**: Email dikirim dari user ke administrator
- **Professional Email Templates** HTML dengan responsive design
- **Gmail Integration** dengan nodemailer dan SMTP authentication
- **Auto-Reply System**: Konfirmasi otomatis untuk user
- **Quick Action Buttons**: Tombol balas email dan WhatsApp di admin email
- **Error Handling** untuk pengiriman email dengan retry mechanism
- **Success/Error Notifications** untuk user dengan detailed feedback
- **Email Queue** untuk handling bulk emails
- **Template Management** untuk custom email templates
- **Reply-To Configuration**: Memudahkan admin membalas email user
- **Mobile-Friendly Templates**: Optimized untuk semua perangkat

### 📱 **Responsive Design & UX**
- **Mobile-First** approach dengan progressive enhancement
- **Tablet Optimization** untuk layar medium dengan touch gestures
- **Desktop Enhancement** untuk layar besar dengan keyboard shortcuts
- **Touch-Friendly** interface dengan proper spacing
- **Cross-Browser** compatibility dengan fallbacks
- **Accessibility** compliance dengan ARIA labels
- **Performance Optimization** dengan lazy loading dan caching

### 🔒 **Keamanan & Privasi**
- **JWT Authentication** dengan secure token management
- **Password Hashing** dengan bcrypt dan salt rounds
- **Input Validation** dengan sanitization dan escaping
- **CORS Protection** dengan whitelist configuration
- **XSS Prevention** dengan Content Security Policy
- **SQL Injection Protection** dengan parameterized queries
- **Rate Limiting** untuk API endpoints
- **Data Encryption** untuk sensitive information

## 🛠️ Teknologi yang Digunakan

### **Backend Technologies**
- **Node.js** (v18+) - Runtime environment untuk server dengan ES modules
- **Express.js** (v4.18+) - Web framework untuk API dan routing dengan middleware
- **JWT (jsonwebtoken)** (v9.0+) - Authentication dan session management
- **bcryptjs** (v2.4+) - Password hashing untuk keamanan dengan salt rounds
- **nodemailer** (v7.0+) - Email sending functionality dengan SMTP/IMAP
- **CORS** (v2.8+) - Cross-Origin Resource Sharing dengan configuration
- **body-parser** (v1.20+) - Request body parsing dengan size limits
- **dotenv** (v16.0+) - Environment variables management

### **Frontend Technologies**
- **HTML5** - Semantic markup structure dengan accessibility
- **CSS3** - Modern styling dengan Grid, Flexbox, dan Animations
- **JavaScript (ES6+)** - Interactive functionality dengan async/await
- **Font Awesome** (v6.0+) - Icon library dengan 2000+ icons
- **Google Fonts** - Typography (Inter font family) dengan fallbacks

### **Data Management & Storage**
- **JSON Files** - Data storage untuk development dengan validation
- **File System (fs)** - File operations dengan error handling
- **Local Storage** - Client-side data persistence dengan encryption
- **Session Storage** - Temporary data storage dengan cleanup
- **IndexedDB** - Advanced client-side storage untuk large data

### **Development Tools & Workflow**
- **npm** (v8+) - Package management dengan audit security
- **nodemon** (v3.0+) - Development server auto-restart dengan watch
- **Git** (v2.30+) - Version control dengan branching strategy
- **ESLint** - Code linting dengan custom rules
- **Prettier** - Code formatting dengan consistent style

### **Styling & UI Framework**
- **Custom CSS** - Tailored styling system dengan design tokens
- **CSS Grid** - Layout management dengan responsive breakpoints
- **CSS Flexbox** - Component alignment dengan gap properties
- **CSS Animations** - Smooth transitions dengan keyframes
- **CSS Variables** - Theme management dengan dark mode support
- **Media Queries** - Responsive design dengan mobile-first approach
- **CSS Modules** - Scoped styling dengan naming conventions

### **Security & Authentication**
- **JWT Authentication** - Secure token-based auth dengan refresh tokens
- **Password Hashing** - bcrypt encryption dengan configurable rounds
- **Input Validation** - Server-side validation dengan sanitization
- **CORS Protection** - Cross-origin security dengan whitelist
- **XSS Prevention** - Input sanitization dengan DOMPurify
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API rate limiting dengan Redis store

### **Performance & Optimization**
- **Lazy Loading** - Optimized image loading dengan intersection observer
- **Code Splitting** - JavaScript bundling dengan dynamic imports
- **Caching** - Local storage caching dengan TTL
- **Efficient DOM** - Optimized rendering dengan virtual DOM
- **Image Optimization** - WebP format dengan fallbacks
- **Bundle Optimization** - Tree shaking dengan dead code elimination

### **Testing & Quality Assurance**
- **Jest** - Unit testing framework dengan coverage reports
- **Supertest** - API testing dengan integration tests
- **Cypress** - End-to-end testing dengan visual regression
- **ESLint** - Code quality dengan custom rules
- **Prettier** - Code formatting dengan consistent style

## 🏗️ Arsitektur Sistem

### **Client-Side Architecture**
```
Frontend (Browser)
├── HTML5 (Semantic Structure)
├── CSS3 (Styling & Animations)
├── JavaScript ES6+ (Interactivity)
├── Local Storage (Data Persistence)
└── Service Workers (Caching)
```

### **Server-Side Architecture**
```
Backend (Node.js)
├── Express.js (Web Framework)
├── JWT (Authentication)
├── bcryptjs (Password Security)
├── nodemailer (Email Service)
└── File System (Data Storage)
```

### **Data Flow Architecture**
```
User Interface → API Endpoints → Business Logic → Data Storage
     ↓              ↓              ↓              ↓
Frontend JS → Express Routes → Controllers → JSON Files
```

### **Security Architecture**
```
Request → CORS → Authentication → Authorization → Business Logic
   ↓         ↓          ↓             ↓              ↓
Client → Middleware → JWT Verify → Role Check → Controller
```

## 💼 Proses Bisnis

### **1. User Registration & Authentication**
```
User Registration → Email Verification → Profile Setup → Login → Dashboard
```

### **2. News Management Process**
```
Admin Creates News → Content Review → Approval → Publication → User Access
```

### **3. UMKM Registration Process**
```
UMKM Registration → Admin Review → Approval → Product Upload → Marketplace
```

### **4. E-Commerce Transaction Process**
```
Product Selection → Cart Management → Checkout → WhatsApp Confirmation → Order Fulfillment
```

### **5. Content Management Process**
```
Content Creation → Review Process → Approval → Publication → User Notification
```

## 📁 Struktur Project

```
ProtoTypeVS/
├── 📁 data/                          # Data storage (JSON files)
│   ├── about.json                   # About page data
│   ├── news.json                    # News articles data
│   ├── transaction.json             # Transaction records
│   ├── umkm.json                    # UMKM businesses data
│   └── users.json                   # User accounts data
├── 📁 public/                        # Frontend files
│   ├── 📁 css/                      # Stylesheets
│   │   ├── admin.css                # Admin panel styles
│   │   ├── auth.css                 # Authentication styles
│   │   ├── news.css                 # News page styles
│   │   ├── profile.css              # Profile page styles
│   │   ├── style.css                # Main stylesheet
│   │   ├── toast.css                # Toast notification styles
│   │   └── umkm.css                 # UMKM page styles
│   ├── 📁 js/                       # JavaScript files
│   │   ├── admin.js                 # Admin panel functionality
│   │   ├── auth.js                  # Authentication logic
│   │   ├── news.js                  # News page functionality
│   │   ├── profile.js               # Profile management
│   │   ├── script.js                # Main homepage script
│   │   └── umkm.js                  # UMKM page functionality
│   ├── 📁 images/                   # Image assets
│   ├── admin.html                   # Admin panel page
│   ├── index.html                   # Homepage
│   ├── login.html                   # Login page
│   ├── news.html                    # News page
│   ├── profile.html                 # Profile page
│   ├── register.html                # Registration page
│   └── umkm.html                    # UMKM page
├── 📁 node_modules/                 # Dependencies
├── 📁 tests/                        # Test files
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                        # End-to-end tests
├── admin.js                        # Admin server logic
├── server.js                       # Main server file
├── package.json                    # Project dependencies
├── package-lock.json               # Dependency lock file
├── .env                           # Environment variables
├── .gitignore                       # Git ignore file
├── .eslintrc.js                    # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── jest.config.js                  # Jest configuration
├── cypress.config.js               # Cypress configuration
└── README.md                       # Project documentation
```

## 🚀 Instalasi & Setup

### **Prerequisites**
- **Node.js** (v18 atau lebih baru) - [Download](https://nodejs.org/)
- **npm** (v8 atau lebih baru) - Included with Node.js
- **Git** (v2.30 atau lebih baru) - [Download](https://git-scm.com/)
- **Gmail Account** - Untuk email functionality
- **Code Editor** - VS Code recommended

### **1. Clone Repository**
```bash
git clone https://github.com/your-username/bizconnect.git
cd bizconnect
```

### **2. Install Dependencies**
```bash
# Install production dependencies
npm install

# Install development dependencies
npm install --save-dev
```

### **3. Environment Configuration**
Buat file `.env` di root project:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_USER=ivander.nathanael@student.umn.ac.id
EMAIL_PASS=your_gmail_app_password

# Database Configuration (if using database)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bizconnect
DB_USER=your-db-user
DB_PASS=your-db-password
```

### **4. Gmail App Password Setup**
1. Buka [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (aktifkan jika belum)
3. Security → App passwords
4. Generate password untuk "Mail"
5. Copy password dan masukkan ke `.env` file

### **5. Jalankan Server**
```bash
# Development mode (dengan auto-restart)
npm run dev

# Production mode
npm start

# Testing mode
npm test

# Linting
npm run lint

# Formatting
npm run format
```

### **6. Akses Aplikasi**
- **Homepage**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Documentation**: http://localhost:3000/api
- **Test Coverage**: http://localhost:3000/coverage

## ⚙️ Konfigurasi

### **Environment Variables**
```env
# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@bizconnect.com

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### **Database Configuration**
```javascript
// Jika menggunakan database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bizconnect',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password'
};
```

### **Email Configuration**
```javascript
// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Admin email configuration
const ADMIN_EMAIL = 'ivander.nathanael@student.umn.ac.id';

// Contact email system
const mailOptions = {
  from: `"${name}" <${email}>`,        // From user's email
  to: ADMIN_EMAIL,                     // To administrator
  replyTo: email,                      // Reply-to user's email
  subject: `[BizConnect Contact] ${subject}`,
  html: `<!-- Professional HTML template -->`
};

// User confirmation email
const confirmationMailOptions = {
  from: `"BizConnect Admin" <${process.env.EMAIL_USER}>`,
  to: email,                           // To user's email
  subject: `[BizConnect] Konfirmasi Pesan Anda - ${subject}`,
  html: `<!-- User confirmation template -->`
};
```

## 🔌 API Documentation

### **Authentication Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|-----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/verify` | Verify JWT token | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

### **User Management Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|-----------|-------------|---------------|
| GET | `/api/users` | Get all users | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### **News Management Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|-----------|-------------|---------------|
| GET | `/api/news` | Get all news | No |
| GET | `/api/news/:id` | Get news by ID | No |
| POST | `/api/admin/news` | Create news | Admin |
| PUT | `/api/admin/news/:id` | Update news | Admin |
| DELETE | `/api/admin/news/:id` | Delete news | Admin |

### **UMKM Management Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|-----------|-------------|---------------|
| GET | `/api/umkm` | Get all UMKM | No |
| GET | `/api/umkm/:id` | Get UMKM by ID | No |
| POST | `/api/admin/umkm` | Create UMKM | Admin |
| PUT | `/api/admin/umkm/:id` | Update UMKM | Admin |
| DELETE | `/api/admin/umkm/:id` | Delete UMKM | Admin |
| POST | `/api/admin/umkm/:id/approve` | Approve UMKM | Admin |

### **E-Commerce Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|-----------|-------------|---------------|
| POST | `/api/transactions` | Create transaction | Yes |
| GET | `/api/transactions` | Get user transactions | Yes |
| GET | `/api/transactions/:id` | Get transaction by ID | Yes |
| PUT | `/api/transactions/:id` | Update transaction | Yes |

### **Contact Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|-----------|-------------|---------------|
| POST | `/api/contact` | Send contact email (dual system: admin notification + user confirmation) | No |

**Contact API Details:**
- **Request Body**: `{ name, email, subject, message }`
- **Admin Email**: Sent to `ivander.nathanael@student.umn.ac.id`
- **User Confirmation**: Auto-reply sent to user's email
- **Email Templates**: Professional HTML templates with responsive design
- **Quick Actions**: Reply and WhatsApp buttons in admin email
- **Validation**: Required fields validation with error handling

### **Profile Management Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|-----------|-------------|---------------|
| GET | `/api/profile/me` | Get user profile | Yes |
| PUT | `/api/profile/update` | Update profile | Yes |
| PUT | `/api/profile/password` | Change password | Yes |
| DELETE | `/api/profile/delete` | Delete account | Yes |

## 📧 Email System Features

### **Dual Email System**
The contact form implements a sophisticated dual email system that ensures both the administrator and the user receive appropriate notifications:

#### **1. Admin Notification Email**
- **From**: User's name and email address
- **To**: Administrator (ivander.nathanael@student.umn.ac.id)
- **Subject**: `[BizConnect Contact] {user_subject}`
- **Features**:
  - Professional HTML template with responsive design
  - User details with clickable email links
  - Message content with proper formatting
  - Status indicator (MENUNGGU RESPONS)
  - Quick action buttons (Reply Email & WhatsApp)
  - Timestamp with Indonesian timezone
  - Reply-to configuration for easy responses

#### **2. User Confirmation Email**
- **From**: BizConnect Admin
- **To**: User's email address
- **Subject**: `[BizConnect] Konfirmasi Pesan Anda - {subject}`
- **Features**:
  - Thank you message with personalization
  - Message summary with all details
  - Professional branding
  - Response time information (1-2 business days)
  - Auto-reply disclaimer

### **Email Template Features**
- **Responsive Design**: Optimized for all devices
- **Professional Branding**: Consistent with BizConnect identity
- **Visual Indicators**: Emojis and color coding for quick identification
- **Accessibility**: High contrast and clear structure
- **Mobile-Friendly**: Touch-optimized buttons and layout

### **Technical Implementation**
```javascript
// Email flow implementation
app.post('/api/contact', async (req, res) => {
  // 1. Validate input data
  // 2. Send notification to admin
  await transporter.sendMail(adminMailOptions);
  // 3. Send confirmation to user
  await transporter.sendMail(userConfirmationOptions);
  // 4. Return success response
});
```

### **Email Configuration Requirements**
```env
# Required environment variables
EMAIL_USER=ivander.nathanael@student.umn.ac.id
EMAIL_PASS=your_gmail_app_password
```

### **Gmail App Password Setup**
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password for "Mail"
3. Use the generated password in EMAIL_PASS
4. Test email configuration with transporter.verify()

## 🔧 Troubleshooting

### Error Email Configuration
Jika muncul error seperti:
```
Email configuration error: Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solusi:**
1. **Disable Email Features** (Recommended untuk development):
   - Biarkan `EMAIL_USER` dan `EMAIL_PASS` kosong di file `.env`
   - Server akan tetap berjalan dengan fitur email dinonaktifkan
   - Pesan akan ditampilkan di console: "📧 Email disabled - would send: [subject]"

2. **Enable Email Features** (Untuk production):
   - Buat file `.env` dengan konfigurasi email:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```
   - Gunakan Gmail App Password (bukan password biasa)
   - Aktifkan 2-Factor Authentication di Gmail
   - Generate App Password di: Google Account > Security > App passwords

### Database Connection Error
Jika database tidak terhubung:
1. Pastikan MySQL service berjalan
2. Periksa konfigurasi di `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=bizconnect
   ```
3. Pastikan database `bizconnect` sudah dibuat dan diimport

### Port Already in Use
Jika port 3000 sudah digunakan:
```bash
# Gunakan port lain
PORT=3001 node server.js
```

### Server Tidak Berjalan
1. Periksa apakah ada error di console
2. Pastikan semua dependencies terinstall: `npm install`
3. Periksa konfigurasi database dan email
4. Restart server: `Ctrl+C` lalu `node server.js`

## 🧪 Testing

### **Unit Testing**
```bash
# Run unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### **Integration Testing**
```bash
# Run integration tests
npm run test:integration

# Run API tests
npm run test:api
```

### **End-to-End Testing**
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

### **Test Coverage**
```bash
# Generate coverage report
npm run coverage

# View coverage report
npm run coverage:view
```

## 🚀 Deployment

### **Production Build**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Variables for Production**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-app-password
```

### **PM2 Process Management**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name bizconnect

# Monitor application
pm2 monit

# Restart application
pm2 restart bizconnect
```

## 📊 Performance Monitoring

### **Metrics to Monitor**
- **Response Time**: API response times
- **Memory Usage**: Server memory consumption
- **CPU Usage**: Server CPU utilization
- **Error Rate**: Application error rates
- **Throughput**: Requests per second

### **Monitoring Tools**
- **PM2 Monitoring**: Process monitoring
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure monitoring
- **Sentry**: Error tracking and monitoring

## 🔒 Security Best Practices

### **Authentication Security**
- JWT tokens dengan expiration
- Password hashing dengan bcrypt
- Rate limiting untuk login attempts
- Account lockout setelah failed attempts

### **Data Security**
- Input validation dan sanitization
- XSS prevention dengan Content Security Policy
- CSRF protection dengan tokens
- SQL injection prevention

### **API Security**
- CORS configuration
- Request size limits
- API rate limiting
- Authentication middleware

## 🤝 Kontribusi

### **Development Workflow**
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

### **Code Standards**
- Follow ESLint configuration
- Use Prettier for formatting
- Write unit tests for new features
- Update documentation

### **Commit Convention**
```
feat: add new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tim Pengembang

- **Backend Development**: Node.js, Express.js, JWT Authentication
- **Frontend Development**: HTML5, CSS3, JavaScript ES6+
- **UI/UX Design**: Responsive design, Modern interface
- **Database Management**: JSON file system, Future database integration
- **Email Integration**: Nodemailer dengan Gmail SMTP
- **Testing**: Jest, Supertest, Cypress
- **DevOps**: Docker, PM2, CI/CD

## 📞 Kontak & Support

- **Email**: ivander.nathanael@student.umn.ac.id
- **Project Repository**: [GitHub Repository URL]
- **Documentation**: [Project Documentation URL]
- **Issue Tracker**: [GitHub Issues URL]

## 🎯 Roadmap & Future Features

### **Phase 1 - Current**
- ✅ Basic CRUD operations
- ✅ Authentication system
- ✅ Email integration
- ✅ Responsive design

### **Phase 2 - Planned**
- 🔄 Database integration (PostgreSQL/MongoDB)
- 🔄 Real-time notifications
- 🔄 Advanced search with Elasticsearch
- 🔄 Payment gateway integration

### **Phase 3 - Future**
- 📋 Mobile app (React Native)
- 📋 AI-powered recommendations
- 📋 Advanced analytics dashboard
- 📋 Multi-language support

---

**BizConnect** - Koneksikan Inspirasi, Publikasikan Inovasi 🚀

*Dibuat dengan ❤️ untuk mendukung ekosistem kampus yang inovatif dan berkelanjutan.*