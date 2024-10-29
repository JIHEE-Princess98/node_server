const pool = require('../db/pool');
const sql = require('../sql/UserQuery');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const results = require('../config/result');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// ----- 회원가입----- //
exports.Register = async (req, res) => {
    const {
        sys_user_sign_id,
        sys_username,
        sys_email,
        sys_password_hash,
        sys_date_of_birth,
        sys_created_at,
        sys_updated_at
    } = req.body;

    //비밀번호 해시
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sys_password_hash, salt);

    pool.query(sql.registerPost, [
        sys_user_sign_id,
        sys_username,
        sys_email,
        hashedPassword,
        sys_date_of_birth,
        sys_created_at,
        sys_updated_at
    ], (err, data) => {
        if (err) {
            res.status(500).send('Register Error');
            console.error("회원가입 에러 :", err);
        } else {
            results.results = {
                title: '회원가입 성공',
                success: true,
                message: 'success',
                total: 1
            }
            res.status(201).json(results.results);
        }
    });
}


// ----- 로그인 ----- //
exports.Login = async (req, res) => {
    const { sys_user_sign_id, sys_password_hash } = req.body;

    pool.query(sql.userLogin, [sys_user_sign_id], async(err, data) => {
        if (err) {
            console.error("로그인 에러 :", err);
            res.status(500).send('Login Error');
        } else {

            // 회원이 없는 경우
            if (data.rows.length === 0) {
                res.status(404).json({ message: "회원을 찾을 수 없습니다." })
            }

            //1-1. 비밀번호 비교
            const dbUser = data.rows[0];
            const isMatch = await bcrypt.compare(sys_password_hash, dbUser.sys_password_hash);

            //1-2. 비밀번호 매치가 안될경우
            if (!isMatch) {
                res.status(401).json({ message: "아이디 또는 비밀번호가 맞지 않습니다." });
            } else {
                //JWT 엑세스토큰 생성
                const accessToekn = jwt.sign(
                    { user_id: dbUser.sys_user_sign_id, username: dbUser.sys_username },
                    ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' } //엑세스 토큰 만료시간 15분
                );

                //리프레시 토큰 생성
                const refreshToken = jwt.sign(
                    { user_id: dbUser.sys_user_sign_id, username: dbUser.sys_username },
                    REFRESH_TOKEN_SECRET,
                    { expiresIn: '7d' } //리프레시 토큰 만료시간 7일
                );

                //값 내보내기
                results.results = {
                    title: '로그인 성공',
                    success: true,
                    message: 'success',
                    data: [
                        {
                            sys_user_sign_id: dbUser.sys_user_sign_id,
                            sys_username: dbUser.sys_username,
                            sys_user_auth: dbUser.sys_user_auth,
                            accessToekn: accessToekn,
                            refreshToken: refreshToken
                        }
                    ],
                    total: 1
                }

                //API 전송
                res.status(200).json(results.results);
            }
        }
    });
}



// JWT 검증 미들웨어
exports.authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "접근권한이 없습니다." });
    } else {
        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: "유효하는 토큰이 아닙니다." });
            req.user = user;
            next();
        });
    };
}


//토큰갱신
exports.refreshJWT = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(401).json({ message: "접근권한이 없습니다." });
    } else {
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: "유효하는 토큰이 아닙니다." });

            const accessToekn = jwt.sign(
                { user_id: user.sys_user_sign_id, username: user.sys_username },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' } //엑세스 토큰 만료시간 15분
            );

            results.results = {
                title: '토큰 갱신',
                success: true,
                message: 'success',
                data: [
                    {
                        sys_user_sign_id: user.sys_user_sign_id,
                        sys_username: user.sys_username,
                        sys_user_auth: user.sys_user_auth,
                        accessToekn: accessToekn,
                    }
                ],
                total: 1
            }

            //토큰 반환
            res.status(200).json(results.results);
        });
    }
}

// 검증 리스트
exports.SampleAPI = async(req,res) => {
    const sampleQuery = "select sys_username from node.sys_users";
    pool.query(sampleQuery, (err,data) => {
        if(err){
            console.log(err);
        }else{
            results.results = {
                title: '검증 API',
                success: true,
                message: 'success',
                data: data.rows,
                total: 1
            };
            res.status(200).json(results.results);
        }
    })
}

//사용자 전체 리스트
exports.UserAllList = async(req, res) => {
    pool.query(sql.userAllList, (err,data) => {
        if(err){
            console.error("UserAllList Error", err);
            res.status(500).send('UserAllList Error');
        }else {
            results.results = {
                title: '사용자 전체 리스트 조회',
                success: true,
                message: 'success',
                data: data.rows,
                total: data.rows.length
            };
            res.status(200).json(results.results);
        }
    });
}


