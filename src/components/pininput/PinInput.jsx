import { useEffect, useRef, useState } from 'react';
import "./PinInput.css"

export default function PinInput({length, onSubmit=()=>{}}) {
    const values = useRef(Array(length))
    const elements = useRef(Array(length))

    useEffect(() => {
        if (elements.current.length > 0) {
          elements.current[0].focus();
        }
    }, []);
  
    function onUpdate(index, value) {
      values.current[index] = value;
      let result = ""
      for(let i = 0; i < values.current.length; i++) {
        if (values.current[i] == undefined) return;
        result = result + values.current[i]
      }
      onSubmit(Number(result));
    }
  
    function onBack(index) {
      if (index == 0) return;
      let previousElem = elements.current[index-1];
      previousElem.focus();
    }
    function onNext(index) {
      if (index == elements.current.length-1) return;
      elements.current[index+1].focus();
    }
  
    return (
      <form className='pin-input'>
        {[...Array(length)].map((_, i) => (
          <PinItem
            key={i}
            reference={r => elements.current[i]=r}
            onBack={() => onBack(i)}
            onNext={() => onNext(i)}
            onUpdate={(d) => onUpdate(i, d)}></PinItem>
        ))}
      </form>
    )
  }
  function PinItem({onBack, onUpdate, onNext, reference}) {
    const [value, setValue] = useState("");
  
    function keyHandler(event) {
      if (event.keyCode === 8) {
        event.preventDefault();
        if (value === "") {
          onBack();
        } else {
          setValue("");
        }
      } else if (!(/[0-9]/.test(event.key))) {
        event.preventDefault();
      }
    }
    function changeHander(event) {
      let newvalue = event.target.value % 10;
      setValue(newvalue)
      onUpdate(newvalue);
      if (newvalue !== "") {
        onNext();
      }
    }
  
    return (
      <input type='number'
        className='input pin-item'
        value={value}
        ref={r => reference(r)}
        onKeyDown={keyHandler}
        onChange={changeHander}></input>
    )
  }