import { useContext, useState } from 'react'
import './App.css'
import Room from './components/room/Room';
import { State, WebsocketContext } from './context/WebSocketContext';
import WebSocketStatus from './components/websocket/WebSocketStatus';
import JoinRoom from './components/joinroom/JoinRoom';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: ":id",
    Component: Room
  },
  {
    path: "join/:id?",
    Component: JoinRoom
  },
  {
    path: "*",
    element: <><Navigate to={"join"} replace/></>
  }
])

function App() {
  //const signaler = useRef(new SignalingChannel());
  const {status} = useContext(WebsocketContext);
  const [room, setRoom] = useState("");

  return (
    <>
      {status == State.CONNECTED?
      <RouterProvider router={router} />:
      <WebSocketStatus />
      }
    </>
  )
}

export default App
