import React, { useEffect, useState } from "react";
import axios from "axios";

function Chat() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [chatHist, setChatHist] = useState([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");

    socket.addEventListener("open", () => {
      console.log("WebSocket connected");
    });

    socket.addEventListener("message", (event) => {
      console.log("worked");
      if (socket.readyState === WebSocket.OPEN) {
        const msg = JSON.parse(event.data);
        console.log("Received message from server:", msg);

        setChatHist((prev) => [...prev, msg]);
      }
    });

    return () => socket.close();
  }, []);

  const sendMsg = async () => {
    if (!phone || !message) {
      alert("Заполни поля!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/send-message", {
        phone,
        message,
      });

      setChatHist([...chatHist, { sender: "Me", text: message }]);
      setMessage("");
    } catch (e) {
      console.error("Ошибка при отправке сообщения", e);
      alert("Не удалось отправить сообщение");
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">WhatsApp Messenger</h1>
      <div className="chat-history">
        {chatHist.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}: </strong>
            {msg.text}
          </div>
        ))}
      </div>

      <footer className="chat-footer">
        <input
          type="text"
          placeholder="Номер телефона"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ marginBottom: "10px", padding: "5px", width: "100%" }}
        />
        <textarea
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMsg}>Send</button>
      </footer>
    </div>
  );
}

export default Chat;
