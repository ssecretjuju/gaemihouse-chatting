// const dotenv = require("dotenv/config");

const { MONGO_DB_URI } = require("../../env");

// MongoDB Command
const MongoClient = require("mongodb").MongoClient;
const url = MONGO_DB_URI;

exports.insertChattingLog = (nickname, message) => {
  MongoClient.connect(url, (err, db) => {
    if (err) throw err;
    const dbo = db.db("chatting");
    const roomTitle = "방제목";
    const currentTime = new Date();
    const utc =
      currentTime.getTime() + currentTime.getTimezoneOffset() * 60 * 1000;
    const utcKr = new Date(utc + 9 * 60 * 60 * 1000);

    const chattingLog = {
      room: roomTitle,
      nickname: nickname,
      message: message,
      time: utcKr.toLocaleString().toString(),
    };

    dbo.collection("logs").insertOne(chattingLog, (err, res) => {
      if (err) throw err;
      // console.log("document inserted successfully");
      // db.close();
    });

    dbo
      .collection("logs")
      .find({})
      .sort({ time: 1 })
      .toArray((err, res) => {
        if (err) throw err;
        // console.log(res);
        // db.close();
      });
  });
};
