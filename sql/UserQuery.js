module.exports = {
    registerPost : `INSERT INTO node.sys_users `+
    `(sys_user_sign_id, sys_username, sys_email, sys_password_hash, sys_date_of_birth, sys_created_at, sys_updated_at, sys_is_active, sys_user_auth)` +
    `VALUES($1, $2, $3, $4, $5, $6, $7, true, 4);`,
    
    userLogin : `SELECT * FROM node.sys_users WHERE sys_user_sign_id = $1`,

    userAllList: `select sys_user_seq_id , sys_user_sign_id ,sys_username ,` +
    `sys_email , sys_is_active , sys_user_auth from node.sys_users;`
}