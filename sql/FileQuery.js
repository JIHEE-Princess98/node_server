module.exports = {
    filePathInsert: `INSERT INTO node.sys_net_files (sys_file_name, sys_file_path, sys_file_mimetype, sys_file_size, sys_file_uploaded_at) ` +
    `VALUES($1, $2, $3, $4, $5) RETURNING sys_file_id;`,

    fileShowGET: `SELECT sys_file_path, sys_file_mimetype FROM node.sys_net_files WHERE sys_file_id = $1`,
    
    fileSelectAll: `SELECT * FROM node.sys_net_files`
}