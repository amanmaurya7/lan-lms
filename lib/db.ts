import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lms_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

export const db = mysql.createPool(dbConfig)

// Helper function to check SEB browser
export function isSEBBrowser(userAgent: string, headers: any): boolean {
  const sebUserAgent = userAgent?.toLowerCase().includes("safeexambrowser")
  const sebHeader = headers["x-safeexambrowser-requesthash"]
  return sebUserAgent && !!sebHeader
}

// Helper function to verify SEB config hash
export function verifySEBHash(configHash: string, requestHash: string): boolean {
  // In real implementation, implement proper SEB hash verification
  return configHash === requestHash
}
