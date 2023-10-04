import { memo } from "react"
import "./Modal.css"

export default memo(function Modal({title, children, onClose}) {

    function handleClose(e) {
        if(e.target !== e.currentTarget) return;
        onClose();
    }

    return <div className="modal-container" onClick={handleClose}>
        <div className="modal">
            <div className="modal-header">
                <h1 className="modal-title">{title}</h1>
            </div>
            <div className="modal-content">
                {children}
            </div>
        </div>
    </div>
})