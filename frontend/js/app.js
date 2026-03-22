const API_URL = 'http://localhost:3000/api/tasks';

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        const taskContainer = document.getElementById('tasks-container');
        
        if (result.success && result.data.length > 0) {
            // ลบคำว่า "กำลังโหลด..." ออกแล้วแทนที่ด้วยข้อมูลจริง
            taskContainer.innerHTML = result.data.map(task => `
                <div class="task-card">
                    <h3>📌 ${task.title}</h3>
                    <p>${task.description || 'ไม่มีรายละเอียด'}</p>
                    <span class="status-badge ${task.status ? task.status.toLowerCase() : 'todo'}">
                        ${task.status || 'TODO'}
                    </span>
                </div>
            `).join('');
        } else {
            taskContainer.innerHTML = '<p>ไม่พบข้อมูลงาน</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('tasks-container').innerHTML = '<p style="color:red">เชื่อมต่อ API ไม่สำเร็จ (อย่าลืมรัน Backend นะครับ)</p>';
    }
}

// สั่งให้ฟังก์ชันทำงานทันทีที่โหลดหน้าเว็บ
fetchTasks();