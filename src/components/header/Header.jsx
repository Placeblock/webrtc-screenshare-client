import Modal from "../modal/Modal";
import StreamSettings from "../streamsettings/StreamSettings";
import "./Header.css";
import { memo, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faSliders, faDisplay, faMinimize, faMaximize} from "@fortawesome/free-solid-svg-icons"

export default memo(function Header({onDefaultStream, onSmallStream, onStreamSettings, streamSettings}) {
    const [showSettings, setShowSettings] = useState(false);

    function updateSettings(s) {
        setShowSettings(!showSettings);
        onStreamSettings(s);
    }

    return <div id="header">
        <div id="header-items">
            <h1 id="header-title">PStreamer</h1>
            <button className="primary-btn" 
                title="Select source which is shown when the peer's viewer is in fullscreen"
                onClick={onDefaultStream}>
                    <FontAwesomeIcon icon={faDisplay}/>
                    <FontAwesomeIcon icon={faMaximize}/>
            </button>
            <button className="primary-btn" 
                title="Select source which is shown when the peer's viewer is minimized"
                onClick={onSmallStream}>
                    <FontAwesomeIcon icon={faDisplay}/>
                    <FontAwesomeIcon icon={faMinimize}/>
            </button>
        </div>
        <div id="header-right">
            <button className="primary-btn" 
                onClick={() => setShowSettings(!showSettings)}>
                <FontAwesomeIcon icon={faSliders}/>
            </button>
        </div>
        {showSettings&&<Modal title="Settings" onClose={() => setShowSettings(!showSettings)}>
            <StreamSettings value={streamSettings} onSubmit={updateSettings}/>
        </Modal>}
    </div>
});