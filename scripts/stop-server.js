#!/usr/bin/env node

const { serverManager } = require("../lib/server-manager")

async function stopServer() {
  try {
    console.log("🛑 Stopping LAN-LMS Server...")
    await serverManager.stopServer()
    console.log("✅ Server stopped successfully")
  } catch (error) {
    console.error("❌ Failed to stop server:", error.message)
    process.exit(1)
  }
}

stopServer()
