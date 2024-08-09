import React, { Children } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/Signup";
import ChatBox from "./components/Chats/ChatBox";
import Protected from "./Protected";
import ChatSidebar from "./components/Chats/ChatSidebar";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chats" element={<Protected Component={ChatSidebar} />}></Route>
          <Route
            path="/chatbox/:roomId"
            element={<Protected Component={ChatBox} />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
