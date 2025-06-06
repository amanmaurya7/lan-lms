#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function setup() {
  console.log("🚀 LAN-LMS Setup Wizard")
  console.log("========================\n")

  try {
    // Check if Node.js and npm are installed
    console.log("✅ Checking Node.js installation...")
    execSync("node --version", { stdio: "pipe" })
    execSync("npm --version", { stdio: "pipe" })

    // Check if MySQL is installed
    console.log("✅ Checking MySQL installation...")
    try {
      execSync("mysql --version", { stdio: "pipe" })
    } catch (error) {
      console.log("❌ MySQL not found. Please install MySQL first.")
      process.exit(1)
    }

    // Get database configuration
    console.log("\n📊 Database Configuration")
    const dbHost = (await question("MySQL Host (localhost): ")) || "localhost"
    const dbUser = (await question("MySQL Username (root): ")) || "root"
    const dbPassword = await question("MySQL Password: ")
    const dbName = (await question("Database Name (lms_db): ")) || "lms_db"

    // Get server configuration
    console.log("\n🌐 Server Configuration")
    const serverPort = (await question("Server Port (3000): ")) || "3000"
    const serverHost = (await question("Server Host (0.0.0.0): ")) || "0.0.0.0"

    // Create .env.local file
    console.log("\n📝 Creating environment configuration...")
    const envContent = `
# Database Configuration
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}

# Server Configuration
PORT=${serverPort}
HOST=${serverHost}

# NextAuth Configuration
NEXTAUTH_URL=http://${serverHost === "0.0.0.0" ? "localhost" : serverHost}:${serverPort}
NEXTAUTH_SECRET=${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
`

    fs.writeFileSync(".env.local", envContent.trim())

    // Install dependencies
    console.log("\n📦 Installing dependencies...")
    execSync("npm install", { stdio: "inherit" })

    // Setup database
    console.log("\n🗄️ Setting up database...")
    const mysqlCommand = `mysql -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ""}`

    try {
      execSync(`${mysqlCommand} < scripts/01-create-database.sql`, { stdio: "inherit" })
      execSync(`${mysqlCommand} < scripts/02-seed-data.sql`, { stdio: "inherit" })
      console.log("✅ Database setup completed")
    } catch (error) {
      console.log("❌ Database setup failed. Please run the SQL scripts manually.")
    }

    // Build the application
    console.log("\n🔨 Building application...")
    execSync("npm run build", { stdio: "inherit" })

    console.log("\n🎉 Setup completed successfully!")
    console.log("\n📋 Next Steps:")
    console.log(`1. Start the server: npm start`)
    console.log(`2. Access the LMS at: http://localhost:${serverPort}`)
    console.log("3. Login with admin credentials: admin / admin123")
    console.log("\n🔐 Default Credentials:")
    console.log("Admin: admin / admin123")
    console.log("Student: student1 / student123")
  } catch (error) {
    console.error("❌ Setup failed:", error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

setup()
