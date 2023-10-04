import { useContext, useEffect } from "react";
import { WebsocketContext } from "./WebSocketContext";


export default function useWebSocket(action, callback, dependencies=[]) {
    const {registerHandler, unregisterHandler} = useContext(WebsocketContext);
    useEffect(() => {
        const rID = registerHandler(action, callback);
        return () => {
            unregisterHandler(rID);
        }
    }, dependencies);
}