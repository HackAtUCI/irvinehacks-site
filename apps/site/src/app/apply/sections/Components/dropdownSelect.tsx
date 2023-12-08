"use client"

import { useState } from 'react';

interface SelectProps {
    labelStyle: string;
    inputStyle: string;
    name: string;
    labelText: string;
    values: Array<any>;
}

interface OtherProps {
    value: string
    name: string
}

const OtherPopup = (props: OtherProps) => {
    if(props.value == 'other') {
        return(
            <div className='mt-2 flex gap-2'>
                <label htmlFor={`${props.name}-other-input`} className='text-lg'>Other: <span className="text-[#FF2222]">*</span></label>
                <input type="text" name={`${props.name}-other-input`} className="border-b-2 p-1 h-6 border-black w-6/12" required/>
            </div>
        )
    }
}

export default function DropdownSelect(props: SelectProps) {
    const [value, setValue] = useState('');

    return(
        <>
            <label className={`${props.labelStyle}`} htmlFor={props.name}>{props.labelText} <span className="text-[#FF2222]">*</span></label>
            <select className={`${props.inputStyle}`} name={props.name} onChange={(e) => setValue(e.target.value)}>
                {props.values.map((item, i) => {
                    return(
                        <option key={`option-${i}`} value={item.value}>{item.text}</option>
                    )
                })}
            </select>
            <OtherPopup value={value} name={props.name}/>
        </>
    )
}