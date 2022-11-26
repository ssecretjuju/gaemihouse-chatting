// http 서버 설정
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.static("public"));

app.listen(8000, () => {
  console.log(`listening on port 8000`);
});

// 웹소켓 서버 설정
const WebSocket = require("ws");
const { insertChattingLog } = require("./src/config/db-command");
const wss = new WebSocket.Server({ port: 8001 });

// // AI 추론 모델 설정
// const ort = require("onnxruntime-node");
// // const Int64 = require("node-int64");

// async function chattingFilter() {
//   try {
//     const session = await ort.InferenceSession.create(
//       "./model/abuse_filtering_model.onnx"
//     );

//     // 입력 값 및 크기(batch, sequence) 수정(입력 값이 채팅이 되도록)
//     const data_input_ids = BigInt64Array.from(["1", "0", "-1", "1"]);
//     const data_attention_mask = BigInt64Array.from(["1", "1", "-3", "-5"]);
//     const data_token_type_ids = BigInt64Array.from(["1", "-1", "0", "-2"]); // -2~1 사이의 값만 올 수 있음. Gather98

//     const tensor_input_ids = new ort.Tensor("int64", data_input_ids, [1, 4]);
//     const tensor_attention_mask = new ort.Tensor(
//       "int64",
//       data_attention_mask,
//       [1, 4]
//     );
//     const tensor_token_type_ids = new ort.Tensor(
//       "int64",
//       data_token_type_ids,
//       [1, 4]
//     );

//     const feeds = {
//       input_ids: tensor_input_ids,
//       attention_mask: tensor_attention_mask,
//       token_type_ids: tensor_token_type_ids,
//     };

//     const results = await session.run(feeds);

//     const data = results.output_0.data;
//     console.log(`filter result : ${data[0]}`);

//     return data[0];
//   } catch (e) {
//     console.error(`failed to inference ONNX model: ${e}.`);
//   }
// }

// broadcast : 클라이언트에게 송신
wss.broadcast = (message) => {
  wss.clients.forEach((client) => {
    client.send(message.toString());
  });
};

// 웹소켓 서버(wss) 연결 이벤트
wss.on("connection", (ws, req) => {
  wss.broadcast(`새로운 유저가 접속했습니다. 현재 유저 ${wss.clients.size} 명`);

  // 연결 시 송신
  console.log(`접속`);

  // 클라이언트(ws) 데이터 수신 이벤트
  ws.on("message", async (log) => {
    const logInfo = log.toString().split("%");
    const nickname = logInfo[0];
    const message = logInfo[1];

    insertChattingLog(nickname, message);

    await axios({
      method: "get",
      url: `http://54.180.149.211:8000/cursewordsfilter/${message}`,
    })
      .then((res) => {
        console.log("값: ", res.data.Filter);

        res.data.Filter == 1
          ? wss.broadcast(
              `${nickname} : 채팅 클린 AI에 의해 가려진 채팅입니다.`
            )
          : wss.broadcast(`${nickname} : ${message}`);
      })
      .catch(() => {
        wss.broadcast(`${nickname} : ${message}`);
      });
  });

  ws.on("close", () => {
    wss.broadcast(`유저 한명이 떠났습니다. 현재 유저 ${wss.clients.size} 명`);
    console.log(`접속해제`);
  });
});
