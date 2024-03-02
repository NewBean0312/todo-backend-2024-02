import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

// DB 설정
const pool = mysql.createPool({
  host: "localhost",
  user: "newbean",
  password: "juv0312",
  database: "todo_2024_02",
  waitForConnections: true, // 연결하는 동안 대기 여부
  connectionLimit: 10, // 연결 제한 개수
  queueLimit: 0, // 최대 0(제한없음)개의 연결 요청을 대기열에 추가
  dateStrings: true, // 날짜 출력
});

const app = express();

// CORS 미들웨어 추가
app.use(cors());

const port = 3000;

app.get("/:user_code/todos", async (req, res) => {
  const { user_code } = req.params;

  const [rows] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE user_code = ?
    ORDER BY id DESC
    `,
    [user_code]
  );

  res.json({
    resultCode: "S-1",
    msg: "성공",
    data: rows,
  });
});

app.get("/:user_code/todos/:no", async (req, res) => {
  const { user_code, no } = req.params;

  const [todoRow] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE user_code = ?
    AND no = ?
    `,
    [user_code, no]
  );

  if (todoRow == undefined) {
    res.status(404).json({
      resultCode: "F-1",
      msg: "not found",
    });
    return;
  }

  res.json({
    resultCode: "S-1",
    msg: "성공",
    data: todoRow,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
