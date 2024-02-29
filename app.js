import express from "express";
import cors from "cors";

const app = express();

// CORS 미들웨어 추가
app.use(cors());

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/todos", (req, res) => {
  res.json([{ id: 1 }, { id: 2 }]);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
