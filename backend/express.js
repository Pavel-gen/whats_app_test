const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

const WebSocket = require("ws");
const http = require("http");

const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
});

function broadcast(message) {
  console.log("Msg sent to client");
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

app.use(cors());
app.use(bodyParser.json());

let GREEN_API_URL = "https://1103.api.green-api.com";

let ID_INSTANCE = "";
let API_TOKEN = "";

setInterval(getNotifications, 2000);

//тут мы принимаем логи
app.post("/set-green-api-data", (req, res) => {
  const { idInstance, apiTokenInstance } = req.body;

  if (!idInstance || !apiTokenInstance) {
    return res.status(400).json({ error: "Invalid data" });
  }

  ID_INSTANCE = idInstance;
  API_TOKEN = apiTokenInstance;

  console.log("Green API data updated:", ID_INSTANCE, API_TOKEN);
  res.json({ success: true });
});

//типо тут отправка сообщений
app.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "Something is missing" });
  }

  try {
    const sendUrl = `${GREEN_API_URL}/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`;

    const data = {
      chatId: `${phone}@c.us`,
      message: message,
    };

    const responce = await axios.post(sendUrl, data);

    res.json(responce.data);
  } catch (error) {
    console.error("ERROR: ", error.message);
    res.status(500).json({ error: "Failed to send :c" });
  }
});

async function getNotifications() {
  try {
    const receiveUrl = `${GREEN_API_URL}/waInstance${ID_INSTANCE}/receiveNotification/${API_TOKEN}`;

    const response = await axios.get(receiveUrl);
    if (response.data) {
      const notification = response.data.body;

      if (notification) {
        if (notification.typeWebhook === "incomingMessageReceived") {
          const my_phone = notification.senderData.chatId;
          const text = notification.messageData.textMessageData.textMessage;
          const notificationId = response.data.receiptId;
          console.log("Полученно сообщение", {
            sender: my_phone,
            text: text,
          });

          broadcast(JSON.stringify({ sender: my_phone, text: text }));

          await deleteNotification(notificationId);
        }
      } else {
        console.log("No new notifications");
      }
    }
  } catch (e) {
    console.error("Error, somthing went wrong: ", e.message);
  }
}

async function deleteNotification(notificationId) {
  try {
    const delUrl = `${GREEN_API_URL}/waInstance${ID_INSTANCE}/deleteNotification/${API_TOKEN}/${notificationId}`;
    await axios.delete(delUrl);
  } catch (t) {
    console.error("DELEtE problen ", t.message);
  }
}

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
