let db = null;

// Initialize, Database
async function initDatabase() {
  const statusEl = document.getElementById('status');
  
  try {
    const initSqlJs = window.initSqlJs;
    const SQL = await initSqlJs({
      locateFile: file => https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}
    });

    statusEl.innerText = "กำลังดาวน์โหลดฐานข้อมูล...";

    // โหลดไฟล์ .db จาก repository (ปรับ path ให้ตรงกับไฟล์ของคุณ)
    const response = await fetch('quiz1.db');
    if (!response.ok) throw new Error("ไม่สามารถโหลดไฟล์ data.db ได้");
    
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));
    
    statusEl.innerText = "ฐานข้อมูลพร้อมใช้งานแล้ว!";
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

  const keyword = document.getElementById('searchInput').value;
  const tableEl = document.getElementById('resultTable');
  const headerEl = document.getElementById('tableHeader');
  const bodyEl = document.getElementById('tableBody');
  const statusEl = document.getElementById('status');

  // ล้างข้อมูลเดิมในตาราง
  headerEl.innerHTML = '';
  bodyEl.innerHTML = '';

  // เขียนคำสั่ง SQL (ปรับเปลี่ยนชื่อตาราง และ คอลัมน์ ตามโครงสร้าง DB ของคุณ)
  const query = `SELECT * FROM my_table WHERE name LIKE '%${keyword}%' LIMIT 50`;
  
  try {
    // db.exec จะส่งคืนโครงสร้าง: [{ columns: ['col1', 'col2'], values: [[val1, val2], ...] }]
    const results = db.exec(query);

    if (results.length === 0 || results[0].values.length === 0) {
      statusEl.innerText = "ไม่พบข้อมูลที่ค้นหา";
      tableEl.style.display = 'none';
      return;
    }

    const columns = results[0].columns;
    const rows = results[0].values;

    // 1. สร้างหัวตาราง (<th>) แบบไดนามิกตามชื่อ Column ใน DB
    columns.forEach(colName => {
      const th = document.createElement('th');
      th.textContent = colName;
      headerEl.appendChild(th);
    });

    // 2. ใส่ข้อมูลแถวลงตาราง (<tr> และ <td>)
    rows.forEach(rowData => {
      const tr = document.createElement('tr');
      rowData.forEach(cellValue => {
        const td = document.createElement('td');
        // ตรวจสอบค่า null ถ้าเป็น null ให้แสดงช่องว่าง
        td.textContent = cellValue !== null ? cellValue : '';
        tr.appendChild(td);
      });
      bodyEl.appendChild(tr);
    });

    // แสดงตารางเมื่อมีข้อมูล
    tableEl.style.display = 'table';
    statusEl.innerText = `พบข้อมูลทั้งหมด ${rows.length} รายการ`;

  } catch (error) {
    statusEl.innerText = `เกิดข้อผิดพลาดในการ Query: ${error.message}`;
    tableEl.style.display = 'none';
  }
}

// เริ่มต้นโหลด DB เมื่อเปิดหน้าเว็บ
initDatabase();
