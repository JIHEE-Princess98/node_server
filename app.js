const userController = require('./controller/userController');
const fileController = require('./controller/fileController');

// 내부 프로젝트 파일 적용
// const excelController = require('./controller/excelController');

const ExcelJS = require('exceljs');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//파일 저장위치 및 파일명 설정 
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/'); //저장할 폴더
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now()+'-'+Math.round(Math.random() * 169);
        cb(null, uniqueSuffix+'-'+file.originalname); //고유한 파일명 생성
    }
});

const upload = multer({storage: storage});

//업로드 폴더가 없으면 생성
if(!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

app.post('/api/register', userController.Register);
app.post('/api/login', userController.Login);
app.post('/api/refresh_token', userController.refreshJWT);

app.get('/api/sample', userController.authenticateToken ,userController.SampleAPI);
app.get('/api/userList', userController.UserAllList);

app.get('/api/file/list', fileController.fileSelectAll);
app.post('/api/upload', upload.single('file'), userController.authenticateToken, fileController.filesUpload);
app.get('/api/file/:sys_file_id', userController.authenticateToken, fileController.filesShowClient);

app.get('/api/excel', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sample Data');
    
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 10 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Email', key: 'email', width: 30 }
    ];

    worksheet.addRow({ id: 1, name: 'John Doe', age: 30, email: 'john.doe@example.com' });
    worksheet.addRow({ id: 2, name: 'Jane Smith', age: 25, email: 'jane.smith@example.com' });
    worksheet.addRow({ id: 3, name: 'Sam Brown', age: 35, email: 'sam.brown@example.com' });

    res.setHeader('Content-Disposition', 'attachment; filename=sample_data.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res);
    res.end();
});




app.listen(port, ()=> {
    console.log(`Node_Server API listening on Port : ${port}`);
});
