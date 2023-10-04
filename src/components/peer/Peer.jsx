import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WebsocketContext } from "../../context/WebSocketContext";
import useWebSocket from "../../context/WebSocketHook";
import "./Peer.css";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { faCircleStop, faMaximize, faPause, faPlay, faRotate } from "@fortawesome/free-solid-svg-icons";
import Bandwith from "./bandwith/Bandwith";

const connectionConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

export default memo(function Peer({ peerUUID, peerName, currentStream, smallStream, autoShare }) {

    const { sendMessage } = useContext(WebsocketContext);

    const [connection, setConnection] = useState(new RTCPeerConnection(connectionConfig));
    const remoteVideoElement = useRef(null);
    const [fullSize, _setFullSize] = useState(false);
    const [polite, _setPolite] = useState(null);
    const politeRef = useRef(null);
    const setPolite = (polite) => {
        politeRef.current = polite;
        _setPolite(polite);
    }
    const [sending, setSending] = useState(false);
    const politeNumber = useRef(Math.random());
    const [politeSetPeer, setPoliteSetPeer] = useState(false);
    const makingOffer = useRef(false);
    const ignoreOffer = useRef(false);
    const [peerFullScreen, setPeerFullscreen] = useState(false);

    useEffect(() => {
        if (connection.getSenders().length != 0) {
            startSending();
        }
    }, [peerFullScreen]);

    useEffect(() => {
        sendPeerMessage("polite_request", {number: politeNumber.current})
        return () => {
            stopSending();
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

    function startSending() {
        stopSending();
        const calcSmallStrem = smallStream!=null?smallStream:currentStream;
        const startStream = peerFullScreen?currentStream:calcSmallStrem;
        if (startStream == null) return;
        for (const track of startStream.clone().getTracks()) {
            connection.addTrack(track, startStream);
        }
        setSending(true);
    }

    function stopSending() {
        connection.getTransceivers().forEach(trans => {
            trans.stop()
        })
        connection.getSenders().forEach((sender) => {
            connection.removeTrack(sender);
        })
        setSending(false);
    }

    function togglePaused() {
        connection.getSenders().forEach((sender) => {
            if (sender.track != null) {
                sender.track.enabled = !sender.track.enabled;
            }
        })
    }


    function handleTrackEvent({ track, streams }) {
        console.log("TRACK EVENT");
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
        console.log("NEGOTIATION NEEDED");
        try {
            makingOffer.current = true;
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
        console.log("ICE CANDIDATE");
        sendPeerMessage("ice_candidate", { candidate: JSON.stringify(candidate) })
    }


    useWebSocket("peer", data => {
        if (data.sender == peerUUID) {
            handlePeerMessage(data.message);
        }
    });

    async function handlePeerMessage(data) {
        console.log(data);
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
                sendPeerMessage("description", { description: JSON.stringify(connection.localDescription) });
            }
        } else if (data.action == "ice_candidate") {
            const candidate = JSON.parse(data.candidate);
            try {
                await connection.addIceCandidate(candidate);
            } catch (err) {
                if (!ignoreOffer.current) {
                    throw err;
                }
            }
        } else if (data.action == "polite_request") {
            const senderNumber = data.number;
            const impolite = politeNumber.current>senderNumber;
            setPolite(!impolite);
            sendPeerMessage("polite_response", {});
        } else if (data.action == "polite_response") {
            setPoliteSetPeer(true);
        } else if (data.action == "fullscreen") {
            const fullscreen = data.fullscreen;
            setPeerFullscreen(fullscreen);
        }
    }

    useEffect(() => {
        if (polite!=null&&politeSetPeer&&autoShare) {
            startSending();
        }
    }, [polite, politeSetPeer]);

    function sendPeerMessage(action, data) {
        sendMessage("peer", { receiver: peerUUID, message: { action: action, ...data } })
    }

    return <div className="peer">
        <div className="peer-controls">
            <p className="peer-name">{peerName}</p>
            <Bandwith connection={connection} />
            <div className="peer-btns">
                {peerFullScreen&&<FontAwesomeIcon className="peer-fullscreen" icon={faMaximize} />}
                <button className="primary-btn"
                    onClick={startSending} 
                    disabled={polite==null||!politeSetPeer||currentStream==null}>
                        {sending?<FontAwesomeIcon icon={faRotate} />:
                            <FontAwesomeIcon icon={faPlay}/>}
                </button>
                <button className="primary-btn"
                    disabled={!sending}
                    onClick={stopSending} >
                    <FontAwesomeIcon icon={faCircleStop} />
                </button>
                <button className="primary-btn"
                    disabled={!sending}
                    onClick={togglePaused} >
                    <FontAwesomeIcon icon={faPause} />
                </button>
            </div>
        </div>
        <video className={fullSize?"fullSize":""} 
            ref={remoteVideoElement}
            onClick={() => setFullSize(!fullSize)}>
        </video>
    </div>
});