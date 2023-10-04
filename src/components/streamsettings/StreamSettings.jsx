import { memo, useState } from "react";
import "./StreamSettings.css";

export default memo(function StreamSettings({value, onSubmit}) {
    const [widthMinimized, setWidthMinimized] = useState(value.minimized.width);
    const [widthFullScreen, setWidthFullScreen] = useState(value.fullscreen.width);
    const [frameRate, setFrameRate] = useState(value.frameRate);
    const [fullscreenDefault, setFullscreenDefault] = useState(value.fullscreenDefault);
    const [minimizedDefault, setMinimizedDefault] = useState(value.minimizedDefault);
    const [autoShare, setAutoShare] = useState(value.autoShare);

    function handleSubmit() {
        const newvalue = {
            minimized: {
                width: widthMinimized
            },
            fullscreen: {
                width: widthFullScreen
            },
            frameRate: frameRate,
            fullscreenDefault: fullscreenDefault,
            minimizedDefault: minimizedDefault,
            autoShare: autoShare
        }
        onSubmit(newvalue);
    }

    return <div className="stream-settings">
        <p className="stream-settings-description"><b>How will others see your source?</b></p>
        <div>
            <label>Auto-Share stream to new users: </label>
            <input checked={autoShare} onChange={(e) => setAutoShare(e.target.checked)} type="checkbox"></input>
        </div>
        <div>
            <label>Use default stream size for fullscreen: </label>
            <input checked={fullscreenDefault} onChange={(e) => setFullscreenDefault(e.target.checked)} type="checkbox"></input>
        </div>
        <div>
            <label>Use default stream size for minimized: </label>
            <input checked={minimizedDefault} onChange={(e) => setMinimizedDefault(e.target.checked)} type="checkbox"></input>
        </div>
        <label>Max-Width (Minimized): {widthMinimized} px</label>
        <input disabled={minimizedDefault} onChange={(e) => setWidthMinimized(e.target.valueAsNumber)} value={widthMinimized} type="range" min={100} max={5000}></input>
        <label>Max-Width (Fullscreen): {widthFullScreen} px</label>
        <input disabled={fullscreenDefault} onChange={(e) => setWidthFullScreen(e.target.valueAsNumber)} value={widthFullScreen} type="range" min={300} max={5000}></input>
        <label>Framerate: {frameRate} fps (Reselect Stream to take effect)</label>
        <input onChange={(e) => setFrameRate(e.target.valueAsNumber)} value={frameRate} type="range" min={2} max={120}></input>
        <div className="stream-settings-controls"> 
            <button className="save-btn secondary-btn" onClick={handleSubmit}>Save</button>    
        </div>
    </div>

})