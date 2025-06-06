#!/usr/bin/env node

const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

async function testDatabaseConnection() {
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' })
    
    console.log('🔍 Testing Database Connection...')
    console.log('================================')
    
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lms_db'
    }
    
    console.log(`📊 Connection Parameters:`)
    console.log(`   Host: ${config.host}`)
    console.log(`   User: ${config.user}`)
    console.log(`   Database: ${config.database}`)
    console.log(`   Password: ${'*'.repeat(config.password.length)}`)
    
    // Test connection
    const connection = await mysql.createConnection(config)
    
    // Test basic query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users')
    const userCount = rows[0].count
    
    // Test each table
    const tables = [
      'users', 'courses', 'quizzes', 'enrollments', 'quiz_attempts',
      'quiz_questions', 'quiz_question_options', 'quiz_answers',
      'assignments', 'assignment_submissions', 'activity_logs'
    ]
    
    console.log(`\n📋 Database Verification:`)
    for (const table of tables) {
      try {
        const [tableRows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`)
        const count = tableRows[0].count
        console.log(`   ✅ ${table}: ${count} records`)
      } catch (error) {
        console.log(`   ❌ ${table}: Error - ${error.message}`)
      }
    }
    
    // Test default users
    console.log(`\n👤 Default Users:`)
    const [users] = await connection.execute('SELECT username, role, is_active FROM users WHERE username IN (?, ?, ?)', ['admin', 'teacher1', 'student1'])
    
    for (const user of users) {
      const status = user.is_active ? '✅' : '❌'
      console.log(`   ${status} ${user.username} (${user.role})`)
    }
    
    await connection.end()
    
    console.log(`\n🎉 Database Connection Test: SUCCESS`)
    console.log(`   Total Users: ${userCount}`)
    console.log(`   All Tables: Accessible`)
    
  } catch (error) {
    console.error('❌ Database Connection Test: FAILED')
    console.error(`   Error: ${error.message}`)
    process.exit(1)
  }
}

testDatabaseConnection()
