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
app.use(express.json());

// CORS 미들웨어 추가
app.use(cors());

const port = 3000;

// 데이터 조회
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

// 데이터 단건조회
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

// 데이터 삭제
app.delete("/:user_code/todos/:no", async (req, res) => {
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

  await pool.query(
    `
    DELETE FROM todo
    WHERE user_code = ?
    AND no = ?
    `,
    [user_code, no]
  );

  res.json({
    resultCode: "S-1",
    msg: `${no}번 할 일을 삭제하였습니다.`,
  });
});

// 데이터 생성
app.post("/:user_code/todos", async (req, res) => {
  const { user_code } = req.params;

  const { content, perform_date, is_completed = 0 } = req.body;

  if (!content) {
    res.status(400).json({
      resultCode: "F-1",
      msg: "content required",
    });
  }

  if (!perform_date) {
    res.status(400).json({
      resultCode: "F-1",
      msg: "perform_date required",
    });
  }

  const [[lastTodoRow]] = await pool.query(
    `
    SELECT no
    FROM todo
    WHERE user_code = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [user_code]
  );

  // 넘버링 지정
  const no = lastTodoRow?.no + 1 || 1;

  const [insertTodoRs] = await pool.query(
    `
    INSERT INTO todo
    SET reg_date = NOW(),
    update_date = NOW(),
    user_code = ?,
    no = ?,
    content = ?,
    perform_date = ?,
    is_completed = ?
    `,
    [user_code, no, content, perform_date, is_completed]
  );

  const [justCreatedTodoRow] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE id = ?
    `,
    [insertTodoRs.insertId]
  );

  res.json({
    resultCode: "S-1",
    msg: `${justCreatedTodoRow.id}번 할 일을 생성하였습니다.`,
    data: justCreatedTodoRow,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
