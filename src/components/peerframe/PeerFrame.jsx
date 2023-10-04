import { memo } from "react"
import "./PeerFrame.css"

export default memo(function PeerFrame({children}) {
    return <div className="peer-frame">
        {children}
    </div>
});