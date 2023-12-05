interface SelectProps {
    labelStyle: string;
    inputStyle: string;
    name: string;
    labelText: string;
    values: Array<any>;
}

export default function DropdownSelect(props: SelectProps) {
    return(
        <>
            <label className={`${props.labelStyle}`} htmlFor={props.name}>{props.labelText} <span className="text-[#FF2222]">*</span></label>
            <select className={`${props.inputStyle}`} name={props.name}>
                {props.values.map((item, i) => {
                    return(
                        <option key={`option-${i}`} value={item.value}>{item.text}</option>
                    )
                })}
            </select>
        </>
    )
}