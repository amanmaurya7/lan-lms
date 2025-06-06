const { spawn } = require("child_process")
const { writeFileSync, readFileSync, existsSync } = require("fs")
const { join } = require("path")
const os = require("os")

class ServerManager {
  constructor() {
    this.serverProcess = null
    this.configPath = join(process.cwd(), "server.config.json")
    this.loadConfig()
  }

  loadConfig() {
    if (existsSync(this.configPath)) {
      try {
        const config = JSON.parse(readFileSync(this.configPath, "utf8"))
        return config
      } catch (error) {
        console.error("Failed to load server config:", error)
      }
    }

    // Default configuration
    const defaultConfig = {
      port: 3000,
      host: "0.0.0.0",
      dbHost: "localhost",
      dbUser: "root",
      dbPassword: "",
      dbName: "lms_db",
    }

    this.saveConfig(defaultConfig)
    return defaultConfig
  }

  saveConfig(config) {
    try {
      writeFileSync(this.configPath, JSON.stringify(config, null, 2))
    } catch (error) {
      console.error("Failed to save server config:", error)
    }
  }

  updateConfig(newConfig) {
    const currentConfig = this.loadConfig()
    const updatedConfig = { ...currentConfig, ...newConfig }
    this.saveConfig(updatedConfig)
  }  startServer() {
    return new Promise((resolve, reject) => {
      if (this.serverProcess) {
        reject(new Error("Server is already running"))
        return
      }

      const config = this.loadConfig()

      // Set environment variables
      process.env.PORT = config.port.toString()
      process.env.HOST = config.host
      process.env.DB_HOST = config.dbHost
      process.env.DB_USER = config.dbUser
      process.env.DB_PASSWORD = config.dbPassword
      process.env.DB_NAME = config.dbName

      // Start Next.js server
      this.serverProcess = spawn("npm", ["run", "start"], {
        stdio: "inherit",
        env: { ...process.env },
        shell: true,
      })

      this.serverProcess.on("error", (error) => {
        console.error("Server start error:", error)
        this.serverProcess = null
        reject(error)
      })

      this.serverProcess.on("exit", (code) => {
        if (code !== 0) {
          console.log(`Server exited with code ${code}`)
        }
        this.serverProcess = null
      })

      // Resolve immediately after spawning since stdio is inherited
      resolve()
    })
  }

  stopServer() {
    return new Promise((resolve) => {
      if (!this.serverProcess) {
        resolve()
        return
      }

      this.serverProcess.on("exit", () => {
        this.serverProcess = null
        console.log("Server stopped")
        resolve()
      })

      // On Windows, use taskkill for better process termination
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", this.serverProcess.pid, "/f", "/t"], {
          stdio: "inherit",
        })
      } else {
        this.serverProcess.kill("SIGTERM")
      }

      // Force kill after 10 seconds
      setTimeout(() => {
        if (this.serverProcess) {
          if (process.platform === "win32") {
            spawn("taskkill", ["/pid", this.serverProcess.pid, "/f", "/t"], {
              stdio: "inherit",
            })
          } else {
            this.serverProcess.kill("SIGKILL")
          }
        }
      }, 10000)
    })
  }

  getStatus() {
    return {
      running: this.serverProcess !== null,
      config: this.loadConfig(),
    }
  }

  getNetworkInfo() {
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
}

const serverManager = new ServerManager()

module.exports = { serverManager }
