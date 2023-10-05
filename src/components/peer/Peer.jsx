import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WebsocketContext } from "../../context/WebSocketContext";
import useWebSocket from "../../context/WebSocketHook";
import "./Peer.css";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { faDisplay, faMaximize, faPause, faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import Bandwith from "./bandwith/Bandwith";

const connectionConfig = {
    iceServers: [{
        urls: ["stun:stun.l.google.com:19302"]
    }],
}

export default memo(function Peer({ peerUUID, peerName, currentStream, streamSettings }) {

    const { sendMessage } = useContext(WebsocketContext);

    const [connection, setConnection] = useState(() => {
        console.log("NEW CONNECTION")
        return new RTCPeerConnection(connectionConfig);
    });
    const remoteVideoElement = useRef(null);
    const [fullSize, _setFullSize] = useState(false);
    const [polite, _setPolite] = useState(null);
    const politeRef = useRef(null);
    const setPolite = (polite) => {
        politeRef.current = polite;
        _setPolite(polite);
    }
    const [streamRunning, setStreamRunning] = useState(false);
    const politeNumber = useRef(Math.random());
    const [politePeer, setPolitePeer] = useState(null);
    const makingOffer = useRef(false);
    const ignoreOffer = useRef(false);
    const [peerFullScreen, setPeerFullscreen] = useState(false);

    useEffect(() => {
        sendPeerMessage("polite_request", {number: politeNumber.current})
        return () => {
            stopSending();
            if (connection != null) {
                connection.close();
            }
            setConnection(null);
        }
    }, []);

    useEffect(() => {
        connection.ontrack = handleTrackEvent;
        connection.onnegotiationneeded = handleNegotiationNeededEvent;
        connection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        connection.onicecandidate = handleICECandidateEvent;
    }, [connection]);

    useEffect(() => {
        remoteVideoElement.current.addEventListener("loadedmetadata", () => {
            remoteVideoElement.current.play();
        });
    }, [remoteVideoElement]);

    useEffect(() => {
        updateQuality();
    }, [streamSettings, peerFullScreen]);

    useEffect(() => {
        if (streamRunning) {
            startSending();
        }
    }, [currentStream]);

    function updateQuality() {
        const data = streamSettings.getData(peerFullScreen);
        connection.getSenders().forEach((sender) => {
            if (sender.track != null && sender.track.kind === "video") {
                const parameters = sender.getParameters();
                if (!parameters.encodings || parameters.encodings.length===0) {
                    parameters.encodings = [{}];
                }
                parameters.encodings[0].scaleResolutionDownBy = 1/data.scaleFactor;
                parameters.encodings[0].maxFramerate = data.frameRate;
                sender.setParameters(parameters)
                    .then(() => console.log("Bitrate changed successfully"))
                    .catch(e => console.error(e));
            }
        })
    }

    function startSending() {
        stopSending();
        if (currentStream == null) return;
        for (const track of currentStream.getTracks()) {
            connection.addTrack(track, currentStream);
        }
        updateQuality();
        setStreamRunning(true);
    }

    function stopSending() {
        connection.getTransceivers().forEach(trans => {
            trans.stop()
        })
        connection.getSenders().forEach((sender) => {
            connection.removeTrack(sender);
        })
        setStreamRunning(false);
    }


    function handleTrackEvent({ track, streams }) {
        track.onunmute = () => {
            remoteVideoElement.current.srcObject = streams[0];
        }
    }

    function setFullSize(fullSize) {
        sendPeerMessage("fullscreen", {fullscreen: fullSize});
        _setFullSize(fullSize);
    }


    // NEGOTIATION

    async function handleNegotiationNeededEvent() {
        try {
            makingOffer.current = true;
            console.log("CREATE OFFER");
            await connection.setLocalDescription();
            sendPeerMessage("description", { description: JSON.stringify(connection.localDescription) });
        } catch (err) {
            console.error(err);
        } finally {
            makingOffer.current = false;
        }
    }

    async function handleICEConnectionStateChangeEvent() {
        if (connection.iceConnectionState === "failed") {
            connection.restartIce();
        }
    }

    function handleICECandidateEvent({ candidate }) {
        console.log(candidate);
        sendPeerMessage("ice_candidate", { candidate: JSON.stringify(candidate) })
    }


    useWebSocket("peer", data => {
        if (data.sender == peerUUID) {
            handlePeerMessage(data.message);
        }
    });

    async function handlePeerMessage(data) {
        if (data.action == "description") {
            const description = JSON.parse(data.description);
            const offerCollision =
                description.type === "offer" &&
                (makingOffer.current || connection.signalingState !== "stable");
            const ignore = !politeRef.current && offerCollision;
            ignoreOffer.current = ignore;
            if (ignore) {
                return;
            }

            await connection.setRemoteDescription(description);
            if (description.type === "offer") {
                await connection.setLocalDescription();
                console.log("SET LOCAL DESCRIPTION");
                console.log(connection.localDescription);
                sendPeerMessage("description", { description: JSON.stringify(connection.localDescription) });
            }
        } else if (data.action == "ice_candidate") {
            const candidate = JSON.parse(data.candidate);
            await connection.addIceCandidate(candidate).catch(e => {
                console.log(e);
            });
        } else if (data.action == "polite_request") {
            const senderNumber = data.number;
            const selfPolite = politeNumber.current>senderNumber;
            setPolite(selfPolite);
            setPolitePeer(!selfPolite);
            sendPeerMessage("polite_response", {polite: selfPolite});
        } else if (data.action == "polite_response") {
            setPolite(!data.polite);
            setPolitePeer(data.polite);
        } else if (data.action == "fullscreen") {
            const fullscreen = data.fullscreen;
            setPeerFullscreen(fullscreen);
        }
    }

    useEffect(() => {
        if (polite!=null&&politePeer!=null
            &&streamSettings.autoShare
            &&!streamRunning) {
            startSending();
        }
    }, [polite, politePeer, streamSettings]);

    function sendPeerMessage(action, data) {
        sendMessage("peer", { receiver: peerUUID, message: { action: action, ...data } })
    }

    return <div className="peer">
        <div className="peer-controls">
            <p className="peer-name">{peerName}</p>
            <Bandwith connection={connection} />
            <div className="peer-btns">
                {peerFullScreen&&<FontAwesomeIcon className="peer-fullscreen" icon={faMaximize} />}
                {streamRunning?
                <button className="primary-btn"
                        onClick={stopSending} >
                    <FontAwesomeIcon icon={faStop} />
                </button>:
                <button className="primary-btn"
                        onClick={startSending} 
                        disabled={polite==null||politePeer==null||currentStream==null}>
                    <FontAwesomeIcon icon={faDisplay}/>
                </button>}
            </div>
        </div>
        <video className={fullSize?"fullSize":""} 
            ref={remoteVideoElement}
            onClick={() => setFullSize(!fullSize)}>
        </video>
    </div>
});