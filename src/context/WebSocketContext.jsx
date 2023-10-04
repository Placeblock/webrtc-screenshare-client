import { createContext, useEffect, useRef, useState } from "react";

export const State = {
    CONNECTING: -1,
    CONNECTED: 0,
    RECONNECTING: 1,
    CLOSED: 2
}

export const WebsocketContext = createContext(State.CONNECTING, null);

export const WebsocketProvider = ({children}) => {
    const [status, setStatus] = useState(State.CONNECTING)
    const [retries, _setRetries] = useState(0);
    const retriesRef = useRef(retries);
    const setRetries = retries => {
        retriesRef.current = retries;
        _setRetries(retries);
    }

    const messageHandler = useRef([]);
    const ws = useRef(null);
    const reloadTimer = useRef(null);
    const pingTimer = useRef(null);


    function registerHandler(action, callback) {
        const id = Math.random().toString(36);
        messageHandler.current.push([action, callback, id]);
        return id;
    }

    function unregisterHandler(id) {
        for (let i = 0; i < messageHandler.current.length; i++) {
            if (messageHandler.current[i][2] === id) {
                messageHandler.current.splice(i, 1);
                return;
            }
        }
    }

    function close() {
        ws.current.onclose = () => {};
        ws.current.close();
    }

    function reconnect() {
        close();
        setStatus(State.RECONNECTING);
        setRetries(retriesRef.current+1);
        connect();
    }

    function sendMessage(action, data) {
        const message = {"data":data, "action":action};
        ws.current.send(JSON.stringify(message));
    }

    function handleMessage(message) {
        for (let i of messageHandler.current) { 
            if (i[0] === message["action"]) {
                i[1](message["data"]);
            }
        }
    }

    function startPingTimer() {
        pingTimer.current = setInterval(() => {
            ws.current.send("ping");
        }, 120000);
    }

    function connect() {
        const socket = new WebSocket("wss://stream.codelix.de/wss");
        ws.current = socket;

        socket.onopen = e => {
            setRetries(0);
            setStatus(State.CONNECTED)
            startPingTimer();
        }
        
        socket.onmessage = e => {
            try {
                const message = JSON.parse(e.data);
                handleMessage(message);
            } catch (_) {}
        }
        
        socket.onclose = e => {
            if (e.code >= 3000) return;
            if (retriesRef.current <= 10) {
                const reloadID = setTimeout(reconnect, 5000);
                reloadTimer.current = reloadID;
            } else {
                setStatus(State.CLOSED);
            }
        }
    }

    useEffect(() => {
        connect();

        return () => {
            close();
            clearTimeout(pingTimer.current);
            clearTimeout(reloadTimer.current);
        }
    }, []);

    const ret = {status: status, 
                retries: retries,
                registerHandler: registerHandler,
                unregisterHandler: unregisterHandler,
                sendMessage: sendMessage};

    return (
        <WebsocketContext.Provider value={ret}>
            {children}
        </WebsocketContext.Provider>
    )
}