import "./WebSocketStatus.css";
import { memo, useContext } from "react";
import { State, WebsocketContext } from "../../context/WebSocketContext";
import Credits from "../credits/Credits";

export default memo(function WebSocketStatus() {
    const {status, retries} = useContext(WebsocketContext);

    return (
        <div className="websocket-status">
            <WebSocketStatusDescription status={status} retries={retries}/>
            <Credits />
        </div>
    )
})

function WebSocketStatusDescription({status, retries}) {
    const connectionStatus = {
        [State.CONNECTING]: 'Connecting',
        [State.CONNECTED]: 'Connected',
        [State.RECONNECTING]: 'Reconnecting',
        [State.CLOSED]: 'Closed'
    }[status];
    return (
        <div className="websocket-status-description">
            <p className="websocket-status-message">{connectionStatus} {status==State.RECONNECTING&&<span>Try {retries}/10</span>}</p>

        </div>
    )
}