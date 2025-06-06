#!/usr/bin/env node

const os = require('os')
const fs = require('fs')
const path = require('path')

function configCheck() {
  console.log('🔧 LAN-LMS Configuration Check')
  console.log('===============================')
  
  // Check environment file
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    console.log('✅ Environment file: .env.local found')
    
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=')
        envVars[key.trim()] = value.trim()
      }
    })
    
    // Check required variables
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PORT', 'HOST', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET']
    
    console.log('\n📝 Environment Variables:')
    for (const varName of requiredVars) {
      if (envVars[varName]) {
        if (varName.includes('PASSWORD') || varName.includes('SECRET')) {
          console.log(`   ✅ ${varName}: ${'*'.repeat(envVars[varName].length)}`)
        } else {
          console.log(`   ✅ ${varName}: ${envVars[varName]}`)
        }
      } else {
        console.log(`   ❌ ${varName}: Missing`)
      }
    }
  } else {
    console.log('❌ Environment file: .env.local not found')
  }
  
  // Check Next.js configuration
  const nextConfigPath = path.join(process.cwd(), 'next.config.js')
  if (fs.existsSync(nextConfigPath)) {
    console.log('\n✅ Next.js config: next.config.js found')
  } else {
    console.log('\n❌ Next.js config: next.config.js not found')
  }
  
  // Check TypeScript configuration
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json')
  if (fs.existsSync(tsConfigPath)) {
    console.log('✅ TypeScript config: tsconfig.json found')
  } else {
    console.log('❌ TypeScript config: tsconfig.json not found')
  }
  
  // Check build output
  const buildPath = path.join(process.cwd(), '.next')
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build output: .next directory found')
  } else {
    console.log('❌ Build output: .next directory not found (run npm run build)')
  }
  
  // Network information
  console.log('\n🌐 Network Configuration:')
  const interfaces = os.networkInterfaces()
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   📡 ${name}: ${iface.address}`)
      }
    })
  })
  
  // Server configuration
  const serverConfigPath = path.join(process.cwd(), 'server.config.json')
  if (fs.existsSync(serverConfigPath)) {
    console.log('\n✅ Server config: server.config.json found')
    try {
      const serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'))
      console.log(`   Port: ${serverConfig.port}`)
      console.log(`   Host: ${serverConfig.host}`)
    } catch (error) {
      console.log('   ❌ Invalid JSON format')
    }
  } else {
    console.log('\n⚠️  Server config: server.config.json not found (will use defaults)')
  }
  
  console.log('\n🎯 Recommended Access URLs:')
  const port = process.env.PORT || 3001
  console.log(`   Local: http://localhost:${port}`)
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   Network: http://${iface.address}:${port}`)
      }
    })
  })
  
  console.log('\n🔐 Default Credentials:')
  console.log('   Admin: admin / admin123')
  console.log('   Student: student1 / student123')
  
  console.log('\n✅ Configuration check completed!')
}

configCheck()
