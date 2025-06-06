<<<<<<< HEAD
# lan-lms
=======
# LAN-LMS: Learning Management System

A lightweight, scalable Learning Management System designed for LAN environments with Safe Exam Browser (SEB) integration.

## 🚀 Features

### Admin Features
- ✅ User management (single & bulk CSV import)
- ✅ Course creation and management
- ✅ Quiz creation with question upload
- ✅ SEB configuration file management
- ✅ Student enrollment management
- ✅ Quiz results and reports download
- ✅ Server management and IP configuration

### Student Features
- ✅ Secure login with forced password change
- ✅ View enrolled courses
- ✅ Take quizzes (SEB integration)
- ✅ View quiz results and grades
- ✅ Assignment submission

### Technical Features
- ✅ MySQL database backend
- ✅ Role-based access control
- ✅ SEB browser detection and verification
- ✅ IP address tracking and management
- ✅ Lightweight and scalable architecture
- ✅ Built-in server start/stop functionality

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: LAN connection

### Software Requirements
- **Node.js**: v18.0.0 or higher
- **MySQL**: v8.0 or higher
- **npm**: v8.0.0 or higher

## 🛠️ Installation & Setup

### Step 1: Download and Extract
\`\`\`bash
# Download the LMS package
# Extract to your desired directory
cd lan-lms
\`\`\`

### Step 2: Automated Setup
\`\`\`bash
# Run the setup wizard
npm run setup
\`\`\`

The setup wizard will:
1. Check system requirements
2. Configure database connection
3. Set server configuration
4. Install dependencies
5. Create database and tables
6. Build the application

### Step 3: Manual Setup (Alternative)

If automated setup fails, follow these manual steps:

#### 3.1 Install Dependencies
\`\`\`bash
npm install
\`\`\`

#### 3.2 Configure Environment
Create `.env.local` file:
\`\`\`env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lms_db

# Server Configuration
PORT=3000
HOST=0.0.0.0

# NextAuth Configuration
NEXTAUTH_URL=http://192.168.1.100:3000
NEXTAUTH_SECRET=your-secret-key-here
\`\`\`

#### 3.3 Setup Database
\`\`\`bash
# Create database and tables
mysql -u root -p < scripts/01-create-database.sql

# Insert sample data
mysql -u root -p < scripts/02-seed-data.sql
\`\`\`

#### 3.4 Build Application
\`\`\`bash
npm run build
\`\`\`

## 🚀 Starting the Server

### Option 1: Using Server Manager
\`\`\`bash
npm run server:start
\`\`\`

### Option 2: Standard Next.js
\`\`\`bash
npm start
\`\`\`

### Option 3: Development Mode
\`\`\`bash
npm run dev
\`\`\`

## 🌐 Network Configuration

### LAN Access Setup

1. **Find Your Server IP**:
   \`\`\`bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   \`\`\`

2. **Update Environment**:
   \`\`\`env
   HOST=0.0.0.0
   NEXTAUTH_URL=http://YOUR_SERVER_IP:3000
   \`\`\`

3. **Firewall Configuration**:
   - Windows: Allow port 3000 through Windows Firewall
   - macOS: System Preferences > Security & Privacy > Firewall
   - Linux: `sudo ufw allow 3000`

### Access URLs
- **Local**: http://localhost:3000
- **LAN**: http://YOUR_SERVER_IP:3000

## 🔐 Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator (can manage everything)

### Sample Student Account
- **Username**: `student1`
- **Password**: `student123`
- **Role**: Student

## 📚 Usage Guide

### For Administrators

#### 1. User Management
- Navigate to **Admin Dashboard** > **User Management**
- **Add Single User**: Click "Add User" button
- **Bulk Import**: Use CSV format with columns:
  \`\`\`csv
  username,email,password,first_name,last_name,role,course_id
  student001,student001@school.local,defaultpass,John,Doe,student,1
  \`\`\`

#### 2. Course Management
- Go to **Admin Dashboard** > **Course Management**
- Click "Create Course"
- Fill in course details and assign teacher
- Enroll students in courses

#### 3. Quiz Creation
- Navigate to **Admin Dashboard** > **Quiz Management**
- Create quiz with questions
- Upload SEB configuration file if required
- Set time limits and attempt restrictions

#### 4. SEB Configuration
- Upload `.seb` configuration files
- Associate with specific quizzes
- Students must use SEB browser for these quizzes

### For Students

#### 1. First Login
- Use provided username and default password
- System will force password change on first login
- Choose a secure new password

#### 2. Taking Quizzes
- View available quizzes in dashboard
- Click "Take Quiz" to start
- For SEB-required quizzes, system will verify browser
- Submit quiz before time limit expires

#### 3. Viewing Results
- Check quiz results in "Grades" section
- View detailed feedback if provided

## 🔧 Server Management

### Starting/Stopping Server
\`\`\`bash
# Start server
npm run server:start

# Stop server
npm run server:stop

# Check server status
npm run server:status
\`\`\`

### Database Backup
\`\`\`bash
# Backup database
mysqldump -u root -p lms_db > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p lms_db < backup_20231201.sql
\`\`\`

### Log Files
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Access logs: `logs/access.log`

## 🛡️ Security Considerations

### Network Security
- Use on trusted LAN networks only
- Configure firewall rules appropriately
- Monitor access logs regularly

### User Security
- Enforce strong password policies
- Regular password changes
- Monitor user activity logs

### SEB Security
- Use proper SEB configuration files
- Verify SEB browser detection
- Monitor quiz attempt logs

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
\`\`\`bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1"
\`\`\`

#### 2. Port Already in Use
\`\`\`bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
\`\`\`

#### 3. SEB Not Detected
- Ensure SEB browser is properly installed
- Check SEB configuration file
- Verify browser user agent

#### 4. Permission Denied
\`\`\`bash
# Fix file permissions
chmod +x scripts/*.js
chown -R $USER:$USER .
\`\`\`

### Log Analysis
\`\`\`bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log

# Search for specific errors
grep "ERROR" logs/app.log
\`\`\`

## 📊 Performance Optimization

### Database Optimization
- Regular database maintenance
- Index optimization
- Query performance monitoring

### Server Optimization
- Adjust Node.js memory limits
- Configure connection pooling
- Monitor resource usage

### Network Optimization
- Use wired connections when possible
- Optimize network bandwidth
- Monitor network latency

## 🔄 Updates and Maintenance

### Regular Maintenance
1. **Weekly**: Check logs and system performance
2. **Monthly**: Database backup and cleanup
3. **Quarterly**: Security updates and patches

### Update Process
\`\`\`bash
# Backup current installation
cp -r lan-lms lan-lms-backup

# Download new version
# Extract and replace files

# Update database if needed
npm run db:migrate

# Restart server
npm run server:restart
\`\`\`

## 📞 Support

### Getting Help
1. Check this documentation
2. Review log files
3. Check GitHub issues
4. Contact system administrator

### Reporting Issues
When reporting issues, include:
- Error messages
- Log file excerpts
- System configuration
- Steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**LAN-LMS** - Lightweight Learning Management System for LAN Environments
>>>>>>> 2e2b23f (setup)
