import { StrictMode } from 'react'
import React from "react";
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Chat from './pages/chat.jsx'
import './index.css'

// polyfill for SockJS
globalThis.global = globalThis;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={< Chat/>} />
        </Routes>
      </BrowserRouter>
  </React.StrictMode>,
)