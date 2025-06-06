#!/usr/bin/env node

const { serverManager } = require("../lib/server-manager")

async function startServer() {
  try {
    console.log("🚀 Starting LAN-LMS Server...")

    const networkInfo = serverManager.getNetworkInfo()
    console.log(`📡 Network Information:`)
    console.log(`   Local IP: ${networkInfo.localIP}`)
    console.log(`   Available IPs: ${networkInfo.networkIPs.join(", ")}`)

    await serverManager.startServer()

    const status = serverManager.getStatus()
    console.log(`✅ Server running on ${status.config.host}:${status.config.port}`)
    console.log(`🌐 Access URLs:`)
    console.log(`   Local: http://localhost:${status.config.port}`)
    networkInfo.networkIPs.forEach((ip) => {
      console.log(`   Network: http://${ip}:${status.config.port}`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error.message)
    process.exit(1)
  }
}

startServer()
