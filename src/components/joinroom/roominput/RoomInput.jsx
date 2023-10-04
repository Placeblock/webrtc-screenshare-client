import PinInput from "../../pininput/PinInput";
import "./RoomInput.css"

export default function RoomInput({onJoin, onCreate}) {

    function joinRoom(value) {
        onJoin(Number(value));
    }

    return (
        <div className="room-input">
            <div>
                <label>Join with ID</label>
                <PinInput length={4} onSubmit={joinRoom} />
            </div>
            <hr></hr>
            <button className="button secondary-btn create-room-button" onClick={onCreate}>Create Room</button>
        </div>
    )
}