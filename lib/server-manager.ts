import { spawn, type ChildProcess } from "child_process"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"

interface ServerConfig {
  port: number
  host: string
  dbHost: string
  dbUser: string
  dbPassword: string
  dbName: string
}

class ServerManager {
  private serverProcess: ChildProcess | null = null
  private configPath = join(process.cwd(), "server.config.json")

  constructor() {
    this.loadConfig()
  }

  private loadConfig(): ServerConfig {
    if (existsSync(this.configPath)) {
      try {
        const config = JSON.parse(readFileSync(this.configPath, "utf8"))
        return config
      } catch (error) {
        console.error("Failed to load server config:", error)
      }
    }

    // Default configuration
    const defaultConfig: ServerConfig = {
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

  private saveConfig(config: ServerConfig): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(config, null, 2))
    } catch (error) {
      console.error("Failed to save server config:", error)
    }
  }

  public updateConfig(newConfig: Partial<ServerConfig>): void {
    const currentConfig = this.loadConfig()
    const updatedConfig = { ...currentConfig, ...newConfig }
    this.saveConfig(updatedConfig)
  }

  public startServer(): Promise<void> {
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

      this.serverProcess = spawn("npm", ["start"], {
        stdio: "inherit",
        env: { ...process.env },
      })

      this.serverProcess.on("error", (error) => {
        console.error("Server start error:", error)
        reject(error)
      })

      this.serverProcess.on("spawn", () => {
        console.log(`Server started on ${config.host}:${config.port}`)
        resolve()
      })

      this.serverProcess.on("exit", (code) => {
        console.log(`Server exited with code ${code}`)
        this.serverProcess = null
      })
    })
  }

  public stopServer(): Promise<void> {
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

      this.serverProcess.kill("SIGTERM")

      // Force kill after 10 seconds
      setTimeout(() => {
        if (this.serverProcess) {
          this.serverProcess.kill("SIGKILL")
        }
      }, 10000)
    })
  }

  public getStatus(): { running: boolean; config: ServerConfig } {
    return {
      running: this.serverProcess !== null,
      config: this.loadConfig(),
    }
  }

  public getNetworkInfo(): { localIP: string; networkIPs: string[] } {
    const os = require("os")
    const interfaces = os.networkInterfaces()
    const networkIPs: string[] = []
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

export const serverManager = new ServerManager()
