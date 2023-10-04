import "./Room.css"
import { memo, useEffect, useState } from "react";
import Header from "../header/Header";
import Peer from "../peer/Peer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useWebSocket from "../../context/WebSocketHook";
import PeerFrame from "../peerframe/PeerFrame";
import SelfVideo from "../selfvideo/SelfVideo";

class StreamSettings {
    minimized = {
        width: 300
    }
    fullscreen = {
        width: 1920
    }
    frameRate = 30
    fullscreenDefault = true
    minimizedDefault = false
    autoShare = false
    getConstraints(key) {
        if (key === "fullscreen" && this.fullscreenDefault) {
            return {};
        } else if (key === "minimized" && this.minimizedDefault) {
            return {};
        }
        return {...this[key],frameRate:this.frameRate};
    }
}


export default memo(function Room() {
    const {id} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [userName, setUserName] = useState("Funky Monkey");
    const [uuid, setUUID] = useState(null);
    const [peers, setPeers] = useState([]);
    const [stream, setStream] = useState(null);
    const [smallStream, setSmallStream] = useState(null);
    const [streamSettings, setStreamSettings] = useState(new StreamSettings());

    useEffect(() => {
        if (location.state == undefined) {
            navigate("/join/" + id);
            return;
        } else {
            const uuid = location.state.uuid;
            setUUID(uuid);
            setUserName(location.state.name);
            const users = location.state.room.users;
            setPeers(users.filter(u => u.uuid != uuid));
        }
    }, []);


    useEffect(() => {
        console.log("UPDATE SETTINGS");
        if (stream != null) {
            const streamConstraints = streamSettings.getConstraints("fullscreen");
            stream.getTracks().forEach((track) => {
                if (track.kind === "video") {
                    track.applyConstraints(streamConstraints);
                }
            })
        }
        if (smallStream != null) {
            const smallConstraints = streamSettings.getConstraints("minimized");
            smallStream.getTracks().forEach((track) => {
                if (track.kind === "video") {
                    console.log("UPDATE TRACK");
                    track.applyConstraints(smallConstraints);
                }
            })
        }
    }, [streamSettings]);

    useWebSocket("add_users", (data) => {
        setPeers(peers => [...peers,...data.users])
    })

    useWebSocket("remove_user", (data) => {
        setPeers(peers => peers.filter((p) => p.uuid != data.user.uuid));
    })

    function selectDefaultStream() {
        const constraints = streamSettings.getConstraints("fullscreen");
        navigator.mediaDevices.getDisplayMedia({video: constraints}).then(newstream => {
            if (stream != null) {
                stream.getTracks().forEach(track => track.stop());
            }
            setStream(newstream);
        });
    }

    function selectSmallStream() {
        const constraints = streamSettings.getConstraints("minimized");
        navigator.mediaDevices.getDisplayMedia({video: constraints}).then(newstream => {
            if (smallStream != null) {
                smallStream.getTracks().forEach(track => track.stop());
            }
            setSmallStream(newstream);
        });
    }

    useEffect(() => {
        const cookie = getCookie("streamsettings");
        if (cookie === undefined) return;
        const settings = JSON.parse(cookie)
        setStreamSettings(Object.assign(streamSettings, settings))
    }, []);

    function updateSettings(s) {
        const newStreamSettings = new StreamSettings();
        Object.assign(newStreamSettings, s);
        setStreamSettings(newStreamSettings);
        setCookie("streamsettings", JSON.stringify(s));
    }

    return <div id="room">
        <Header onDefaultStream={selectDefaultStream}
                onSmallStream={selectSmallStream}
                onStreamSettings={updateSettings}
                streamSettings={streamSettings}/>
        <div id="peers-container">
            <PeerFrame>
                <SelfVideo title="Own Stream" stream={stream}/>
            </PeerFrame>
            <PeerFrame>
                <SelfVideo title="Own Small Stream" stream={smallStream}/>
            </PeerFrame>
            {
                peers.map((p, i) => {
                    return <PeerFrame key={p.uuid}>
                        <Peer 
                        peerName={p.name} 
                        peerUUID={p.uuid}
                        autoShare={streamSettings.autoShare}
                        currentStream={stream}
                        smallStream={smallStream} />
                    </PeerFrame>
                })
            }
        </div>
    </div>
})



function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return undefined;
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Strict";
}