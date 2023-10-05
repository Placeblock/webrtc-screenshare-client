import { memo, useState } from "react";
import "./StreamSettings.css";

export default memo(function StreamSettings({value, onSubmit}) {
    const [scaleFactorMinimized, setScaleFactorMinimized] = useState(value.minimized.scaleFactor);
    const [scaleFactorFullscreen, setScaleFactorFullscreen] = useState(value.fullscreen.scaleFactor);
    const [frameRateMinimized, setFrameRateMinimized] = useState(value.minimized.frameRate);
    const [frameRateFullscreen, setFrameRateFullscreen] = useState(value.fullscreen.frameRate);
    const [autoShare, setAutoShare] = useState(value.autoShare);

    function handleSubmit() {
        const newvalue = {
            minimized: {
                scaleFactor: scaleFactorMinimized,
                frameRate: frameRateMinimized
            },
            fullscreen: {
                scaleFactor: scaleFactorFullscreen,
                frameRate: frameRateFullscreen
            },
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
        <label>Minimized Quality: {Math.round(scaleFactorMinimized*100)} %</label>
        <input onChange={(e) => setScaleFactorMinimized(e.target.valueAsNumber)} value={scaleFactorMinimized} type="range" step={0.01} min={0.05} max={1}></input>
        <label>Fullscreen Quality: {Math.round(scaleFactorFullscreen*100)} %</label>
        <input onChange={(e) => setScaleFactorFullscreen(e.target.valueAsNumber)} value={scaleFactorFullscreen} type="range" step={0.01} min={0.05} max={1}></input>
        <label>Minimized Framerate: {frameRateMinimized} fps</label>
        <input onChange={(e) => setFrameRateMinimized(e.target.valueAsNumber)} value={frameRateMinimized} type="range" min={2} max={120}></input>
        <label>Fullscreen Framerate: {frameRateFullscreen} fps</label>
        <input onChange={(e) => setFrameRateFullscreen(e.target.valueAsNumber)} value={frameRateFullscreen} type="range" min={2} max={120}></input>
        <div className="stream-settings-controls"> 
            <button className="save-btn secondary-btn" onClick={handleSubmit}>Save</button>    
        </div>
    </div>

})