// MongoDB Command
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/chatting";

exports.insertChattingLog = (nickname, message) => {
  MongoClient.connect(url, (err, db) => {
    if (err) throw err;
    const dbo = db.db("chatting");

    const chattingLog = {
      nickname: nickname,
      message: message,
      time: new Date().toLocaleString().toString(),
    };

    dbo.collection("logs").insertOne(chattingLog, (err, res) => {
      if (err) throw err;
      console.log("document inserted successfully");
      db.close();
    });

    dbo
      .collection("logs")
      .find({})
      .sort({ time: 1 })
      .toArray((err, res) => {
        if (err) throw err;
        console.log(res);
        db.close();
      });
  });
};
