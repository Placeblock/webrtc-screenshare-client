import { memo, useEffect, useRef } from "react"
import "./SelfVideo.css"

export default memo(function SelfVideo({title, stream}) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef != null) {
            videoRef.current.addEventListener("loadedmetadata", () => {
                videoRef.current.play();
            });
            videoRef.current.srcObject = stream
        }
    }, [stream, videoRef]);

    return <div id="self-video">
        <p>{title}</p>
        <video ref={videoRef}></video>
    </div>

});