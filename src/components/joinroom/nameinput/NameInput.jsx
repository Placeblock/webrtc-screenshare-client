import "./NameInput.css"
import { useState } from "react";

export default function NameInput({value, onChange, onSubmit}) {
    function handleClick(e) {
        e.preventDefault();
        if (value === "") return;
        onSubmit();
    }

    return (
        <div className="name-input">
            <form className="form">
                <div className="name-input-container">
                    <label htmlFor="name">Nickname</label>
                    <input placeholder="Name" className="input textinput" value={value} onChange={(e) => onChange(e.target.value)} />
                </div>
                <button className="button secondary-btn" type="submit" onClick={handleClick}>Join</button>
            </form>
        </div>
    )
}