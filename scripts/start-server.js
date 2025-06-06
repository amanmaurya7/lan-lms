#!/usr/bin/env node

const os = require("os")
const { spawn } = require("child_process")

function getNetworkInfo() {
  const interfaces = os.networkInterfaces()
  const networkIPs = []
  let localIP = "localhost"

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        networkIPs.push(iface.address)
        if (!localIP || localIP === "localhost") {
          localIP = iface.address
        }
      }
    }
  }

  return { localIP, networkIPs }
}

async function startServer() {
  try {
    console.log("🚀 Starting LAN-LMS Server...")

    const networkInfo = getNetworkInfo()
    console.log(`📡 Network Information:`)
    console.log(`   Local IP: ${networkInfo.localIP}`)
    console.log(`   Available IPs: ${networkInfo.networkIPs.join(", ")}`)    // Default configuration
    const config = {
      port: process.env.PORT || 3001, // Use port 3001 instead of 3000
      host: "0.0.0.0",
    }

    console.log(`🌐 Access URLs:`)
    console.log(`   Local: http://localhost:${config.port}`)
    networkInfo.networkIPs.forEach((ip) => {
      console.log(`   Network: http://${ip}:${config.port}`)
    })

    console.log(`\n🎯 Starting Next.js server...\n`)
    
    // Set environment variables
    process.env.PORT = config.port.toString()
    process.env.HOST = config.host

    // Start the Next.js server directly
    const serverProcess = spawn("npm", ["run", "start"], {
      stdio: "inherit",
      env: { ...process.env },
      shell: true,
    })

    serverProcess.on("error", (error) => {
      console.error("❌ Server start error:", error)
      process.exit(1)
    })

    serverProcess.on("exit", (code) => {
      if (code !== 0) {
        console.log(`\n❌ Server exited with code ${code}`)
        process.exit(code)
      }
    })

    // Handle Ctrl+C gracefully
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping server...")
      serverProcess.kill("SIGINT")
    })

  } catch (error) {
    console.error("❌ Failed to start server:", error.message)
    process.exit(1)
  }
}

startServer()
