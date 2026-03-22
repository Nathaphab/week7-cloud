const express = require('express');
const cors = require('cors');
const db = require('./src/config/database'); // เชื่อมต่อกับไฟล์ database.js ที่เตรียมไว้
const app = express();

// 1. ตั้งค่า Middleware
// อนุญาตให้ทุก Domain เข้าถึงได้ (สำคัญมากสำหรับตอน Deploy บน Cloud)
app.use(cors());
app.use(express.json());

// 2. Route พื้นฐาน
app.get('/', (req, res) => {
    res.send('🚀 TaskBoard API is Online and Connected to Cloud Database!');
});

// 3. [READ] ดึงรายการงานทั้งหมดจาก Database
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('❌ Database Error:', error.message);
        res.status(500).json({ success: false, error: 'Cannot fetch tasks' });
    }
});

// 4. [CREATE] เพิ่มงานใหม่ (เผื่อไว้กด Add Task จากหน้าเว็บ)
app.post('/api/tasks', async (req, res) => {
    const { title, description, status, priority } = req.body;
    try {
        const queryText = 'INSERT INTO tasks (title, description, status, priority) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [title, description, status || 'TODO', priority || 'MEDIUM'];
        const result = await db.query(queryText, values);
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Insert Error:', error.message);
        res.status(500).json({ success: false, error: 'Cannot create task' });
    }
});

// 5. Route สำหรับ Health Check (ตรวจสอบสถานะระบบ)
app.get('/api/health', async (req, res) => {
    try {
        // ทดสอบ Query เวลาจาก DB
        const dbCheck = await db.query('SELECT NOW()');
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            server_time: new Date(),
            db_time: dbCheck.rows[0].now
        });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
    }
});

// 6. ตั้งค่า Port และเริ่มการทำงาน
// Railway จะกำหนดค่า process.env.PORT ให้เองอัตโนมัติ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ===========================================
    🚀 TaskBoard API is running on port ${PORT}
    🔗 Local Test: http://localhost:${PORT}
    📡 Health Check: http://localhost:${PORT}/api/health
    ===========================================
    `);
});