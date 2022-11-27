// const dotenv = require("dotenv/config");

const { MONGO_DB_URI } = require("../../env");

// Database 및 Collection 생성 파일
const MongoClient = require("mongodb").MongoClient;
const url = MONGO_DB_URI;

// MongoDB에 chatting Database 생성
MongoClient.connect(url, (err, db) => {
  if (err) throw err;
  const dbo = db.db("chatting");

  // chatting Database에 logs Collection 생성
  dbo.createCollection("logs", (err, res) => {
    if (err) throw err;
    db.close();
  });
});
