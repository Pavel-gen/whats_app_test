import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");

  const handleLogin = async () => {
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      alert("Базовая проверка");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/set-green-api-data",
        {
          idInstance,
          apiTokenInstance,
        }
      );

      if (response.data.success) {
        onLogin(idInstance, apiTokenInstance);
      }
    } catch (error) {
      console.error(error.message);
      alert("Что-то пошло не так");
    }
  };

  return (
    <div className="login-container">
      <h1>Настройка чата</h1>

      <input
        type="text"
        placeholder="Введите idInstance..."
        value={idInstance}
        onChange={(e) => setIdInstance(e.target.value)}
      />

      <input
        type="password"
        placeholder="Введите apiTokenInstance..."
        value={apiTokenInstance}
        onChange={(e) => setApiTokenInstance(e.target.value)}
      />

      <button onClick={handleLogin}>Подключиться</button>
    </div>
  );
}

export default Login;
