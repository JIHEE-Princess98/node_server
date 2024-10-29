const ExcelJS = require('exceljs');

async function createExcelFile() {
    // 새 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sample Data');
    
    // 헤더 행 추가
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Email', key: 'email', width: 30 }
    ];

    // 엑셀 파일 저장
    await workbook.xlsx.writeFile('sample_data.xlsx');
    console.log('Excel file created successfully!');
}


createExcelFile().catch(console.error);