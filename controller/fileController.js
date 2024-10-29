const pool = require('../db/pool');
const sql = require('../sql/FileQuery');
const path = require('path');
const results = require('../config/result');

const fs = require('fs');

exports.fileSelectAll = async(req, res) => {
    pool.query(sql.fileSelectAll, (err,data) => {
        if(err) {
            console.error("FileSelectAll Error", err);
            res.status(500).send('FileSelectAll Error');
        }else{
            results.results = {
                title: '파일업로드 리스트 조회',
                success: true,
                message: 'success',
                data: data.rows,
                total: data.rows.length
            };
            res.status(200).json(results.results);
        }
    })
}

//파일 업로드후 DB 저장
exports.filesUpload = async(req,res) => {
    if(!req.file){
        return res.status(400).send('No file Upload');
    }

    const {originalname, mimetype, size, path: filePath} = req.file;
    const filename = originalname;
    const relativeFilePath = path.join('uploads', req.file.filename);
    const fileSize = size;
    const uploadAt = new Date();

    try{
        const values = [filename, relativeFilePath, mimetype, fileSize, uploadAt];

        const result = await pool.query(sql.filePathInsert, values);
        const fileId = result.rows[0].sys_file_id;

        results.results = {
            title: `파일명: ${fileId} 전송 성공`,
            success: true,
            message: 'success',
            total: 1
        }

         //API 전송
         res.status(200).json(results.results);

    }catch(err){
        console.error(err);
        res.status(500).send('Error saving file info to the database.');
    }
}


//파일 제공
exports.filesShowClient = async(req, res) => {
    const sys_file_id = req.params.sys_file_id;

    try{
        const result = await pool.query(sql.fileShowGET, [sys_file_id]);

        if(result.rows.length === 0){
            return res.status(404).send('파일을 찾을 수 없습니다.');
        }

        const {sys_file_path : filePath, sys_file_mimetype: mimetype} = result.rows[0];

        //업로드된 파일 경로
            //상위 파일에 있으니, 중간에 '..' 을 넣어준다.
        const fullPath = path.join(__dirname, '..' ,filePath);
        console.log('Checking file at:', fullPath);
        
        fs.access(fullPath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File not found:', err);
                return res.status(404).send('파일이 없습니다.');
            }
        
            res.setHeader('Content-Type', mimetype);
            res.sendFile(fullPath);
        });
    }catch(err){
        console.error(err);
        res.status(500).send('Error retrieving file from the database.');
    }
}