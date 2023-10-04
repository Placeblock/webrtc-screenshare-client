import "./Credits.css";
import { memo } from "react";

export default memo(function Creator() {
    return <div className="credits-container">
        <p className="credits">Created with <span className="heart">♥</span> by Placeblock</p>
    </div>
})