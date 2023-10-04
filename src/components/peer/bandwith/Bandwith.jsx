import { memo, useEffect, useRef, useState } from "react";
import "./Bandwith.css";

export default memo(function Bandwith({connection}) {
    const [data, setData] = useState(-1);
    const lastResult = useRef(null);

    useEffect(() => {
        const id = setInterval(updateBandwith, 1000);
        return () => {
            clearInterval(id);
        }
    }, []);

    function updateBandwith() {
        const sendersLength = connection.getSenders().length;
        if (connection == null || !sendersLength) return;
        connection.getSenders()[sendersLength-1].getStats().then(res => {
            res.forEach(rep => {
                if (rep.type === "outbound-rtp" && lastResult.current &&
                    lastResult.current.has(rep.id)) {
                    const now = rep.timestamp;
                    const bytes = rep.bytesSent;
                    const bitrate = 8 * (bytes - lastResult.current.get(rep.id).bytesSent) /
                        (now - lastResult.current.get(rep.id).timestamp);
                    setData(Math.round(bitrate));
                }
            })
            lastResult.current = res;
        })
    }

    return <div className="bandwith">
        {data} Kbps
    </div>
})