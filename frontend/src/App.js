import React, { use, useState, useEffect } from "react";
import Login from "./Login";
import Chat from "./Chat";
import "./App.css";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Состояние аутентификации

  const handleLogin = (idInst, apiToken) => {
    setIsAuthenticated(true); // Переходим к чату
  };

  return (
    <div className="app-container">
      {isAuthenticated ? <Chat /> : <Login onLogin={handleLogin} />}
    </div>
  );
}

export default App;
