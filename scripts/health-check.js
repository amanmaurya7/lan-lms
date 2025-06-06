#!/usr/bin/env node

const http = require('http')
const os = require('os')

function getNetworkIPs() {
  const interfaces = os.networkInterfaces()
  const ips = []
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address)
      }
    })
  })
  
  return ips
}

async function testServerHealth() {
  console.log('🏥 LAN-LMS Health Check')
  console.log('========================')
  
  const port = process.env.PORT || 3001
  const ips = ['localhost', ...getNetworkIPs()]
  
  console.log(`🔍 Testing server health on port ${port}...`)
  
  for (const ip of ips) {
    const url = `http://${ip}:${port}`
    
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`${url}/api/health`, { timeout: 5000 }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log(`   ✅ ${url}: Server responding (${res.statusCode})`)
              resolve()
            } else if (res.statusCode === 404) {
              // 404 is expected if health endpoint doesn't exist
              console.log(`   ✅ ${url}: Server responding (${res.statusCode}) - Main app accessible`)
              resolve()
            } else {
              console.log(`   ⚠️  ${url}: Server responding but returned ${res.statusCode}`)
              resolve()
            }
          })
        })
        
        req.on('error', (error) => {
          reject(error)
        })
        
        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })
      })
    } catch (error) {
      console.log(`   ❌ ${url}: ${error.message}`)
    }
  }
  
  // Test main page
  console.log('\n🌐 Testing main application routes:')
  const routes = ['/', '/login', '/admin', '/student']
  
  for (const route of routes) {
    const url = `http://localhost:${port}${route}`
    
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: 5000 }, (res) => {
          if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 401) {
            console.log(`   ✅ ${route}: Accessible (${res.statusCode})`)
          } else {
            console.log(`   ⚠️  ${route}: Returned ${res.statusCode}`)
          }
          resolve()
        })
        
        req.on('error', reject)
        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Timeout'))
        })
      })
    } catch (error) {
      console.log(`   ❌ ${route}: ${error.message}`)
    }
  }
  
  console.log('\n🎯 Health check completed!')
  console.log('\n📋 Quick Access:')
  console.log(`   🌐 Main App: http://localhost:${port}`)
  console.log(`   🔐 Login: http://localhost:${port}/login`)
  console.log(`   👨‍💼 Admin: http://localhost:${port}/admin`)
  console.log(`   🎓 Student: http://localhost:${port}/student`)
}

testServerHealth()
