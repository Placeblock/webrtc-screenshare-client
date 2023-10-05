import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { WebsocketProvider } from './context/WebSocketContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <WebsocketProvider>
      <App />
    </WebsocketProvider>,
)
