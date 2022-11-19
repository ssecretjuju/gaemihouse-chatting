const dotenv = require("dotenv/config");

// Database 및 Collection 생성 파일
const MongoClient = require("mongodb").MongoClient;
const url = process.env.CHATTING_DATABASE_ADDRESS;

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
