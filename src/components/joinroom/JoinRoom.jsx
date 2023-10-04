import { useNavigate, useParams } from "react-router-dom"
import "./JoinRoom.css"
import { memo, useContext, useRef, useState } from "react"
import NameInput from "./nameinput/NameInput"
import RoomInput from "./roominput/RoomInput"
import Credits from "../credits/Credits"
import PasswordInput from "./passwordinput/PasswordInput"
import { WebsocketContext } from "../../context/WebSocketContext"
import useWebSocket from "../../context/WebSocketHook"

/* 
Namenseingabe

Wenn Raum-ID bereits gesetzt ist dann versuchen dem Raum beizutreten

Wenn Password verlangt wird dann Passworteingabe zeigen
Ansonsten mit UUID und Name des users zum Raum umleiten

Wenn Passwort eingegeben ist das Passwort zum Server schicken
Wenn korrekt mit UUID und Name des users zum Raum umleiten

Wenn Raum-ID noch nicht gesetzt ist vorher raumeingabe zeigen

*/

const State = {
    NAME: 0,
    ROOM: 1,
    PASSWORD: 2,
    LOADING: 3
}

const Action = {
    CREATE: 0,
    JOIN: 1
}

export default memo(function JoinRoom() {
    const {id} = useParams();
    const roomID = useRef(id);
    const {sendMessage} = useContext(WebsocketContext);
    const [state, setState] = useState(State.NAME);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const action = useRef(Action.JOIN);
    const navigate = useNavigate();

    function submitName() {
        if (id === undefined) {
            setState(State.ROOM);
        } else {
            showJoinRoom(id);
        }
    }

    function showJoinRoom(id) {
        roomID.current = id;
        action.current = Action.JOIN;
        setState(State.PASSWORD);
    }
    function showCreateRoom() {
        action.current = Action.CREATE;
        setState(State.PASSWORD);
    }

    function enterPassword() {
        if (action.current == Action.JOIN) {
            sendMessage("join_room", {id: roomID.current, password: password, name: name});
        } else {
            sendMessage("create_room", {password: password, name: name});
        }
        setState(State.LOADING);
    }

    useWebSocket("invalid_password", () => {
        setPassword("");
        setState(State.PASSWORD);
    });

    useWebSocket("room", (data) => {
        navigate("/"+data.room.id, {state: data})
    });

    return (
        <div id="join">
            {state==State.NAME&&
                <NameInput value={name} onChange={setName} onSubmit={submitName} />
            }
            {state==State.ROOM&&
                <RoomInput onJoin={showJoinRoom} onCreate={showCreateRoom} />
            }
            {state==State.PASSWORD&&
                <PasswordInput value={password} onChange={setPassword} onSubmit={enterPassword}/>
            }
            {state==State.LOADING&&
                <div className="join-content">
                    <h1 className="loading-title">Joining</h1>
                </div>
            }
            <Credits />
        </div>
    )
});