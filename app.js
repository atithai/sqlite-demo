let db = null;

// Initialize Database
async function initDatabase() {
  const statusEl = document.getElementById('status');
  
  try {
    const initSqlJs = window.initSqlJs;
    const SQL = await initSqlJs({
      // เพิ่ม quotes รอบ URL string
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    statusEl.innerText = "กำลังดาวน์โหลดฐานข้อมูล...";

    const response = await fetch('quiz1.db');
    if (!response.ok) throw new Error("ไม่สามารถโหลดไฟล์ quiz1.db ได้");
    
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));
    
    statusEl.innerText = "ฐานข้อมูลพร้อมใช้งานแล้ว!";
    
    // แสดงข้อมูลทั้งหมดทันทีเมื่อเปิดหน้าเว็บ
    searchData();
  } catch (error) {
    statusEl.innerText = `เกิดข้อผิดพลาด: ${error.message}`;
    console.error(error);
  }
}

// ฟังก์ชันค้นหาและสร้างตาราง
function searchData() {
  if (!db) {
    alert("ฐานข้อมูลยังไม่พร้อมใช้งาน");
    return;
  }

  const keyword = document.getElementById('searchInput').value.trim();
  const tableEl = document.getElementById('resultTable');
  const headerEl = document.getElementById('tableHeader');
  const bodyEl = document.getElementById('tableBody');
  const statusEl = document.getElementById('status');

  headerEl.innerHTML = '';
  bodyEl.innerHTML = '';

  // หากไม่มีการพิมพ์คำค้นหา จะดึงข้อมูลทั้งหมด (LIMIT 50) 
  // แก้ไข ${name} เป็น ${keyword}
  let query = `SELECT * FROM quiz1 LIMIT 50`;
  if (keyword) {
    query = `SELECT * FROM quiz1 WHERE name LIKE '%${keyword}%' LIMIT 50`;
  }
  
  try {
    const results = db.exec(query);

    if (results.length === 0 || results[0].values.length === 0) {
      statusEl.innerText = "ไม่พบข้อมูลที่ค้นหา";
      tableEl.style.display = 'none';
      return;
    }

    const columns = results[0].columns;
    const rows = results[0].values;

    // 1. สร้างหัวตาราง (<th>)
    columns.forEach(colName => {
      const th = document.createElement('th');
      th.textContent = colName;
      headerEl.appendChild(th);
    });

    // 2. ใส่ข้อมูลลงตาราง (<tr> และ <td>)
    rows.forEach(rowData => {
      const tr = document.createElement('tr');
      rowData.forEach(cellValue => {
        const td = document.createElement('td');
        td.textContent = cellValue !== null ? cellValue : '';
        tr.appendChild(td);
      });
      bodyEl.appendChild(tr);
    });

    tableEl.style.display = 'table';
    statusEl.innerText = `พบข้อมูลทั้งหมด ${rows.length} รายการ`;

  } catch (error) {
    statusEl.innerText = `เกิดข้อผิดพลาดในการ Query: ${error.message}`;
    tableEl.style.display = 'none';
  }
}

// เริ่มต้นโหลด DB เมื่อเปิดหน้าเว็บ
initDatabase();
