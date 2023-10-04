import { memo } from "react";
import "./PasswordInput.css";

export default memo(function PasswordInput({value, onChange, onSubmit}) {
    return (
        <div className="password-input">
            <form className="form">
                <div className="password-input-container">
                    <label htmlFor="password">Room Password (Optional)</label>
                    <input type="password" placeholder="Password" className="input textinput" value={value} onChange={(e) => onChange(e.target.value)} />
                </div>
                <button className="button secondary-btn" type="submit" onClick={onSubmit}>Join</button>
            </form>
        </div>
    )
})