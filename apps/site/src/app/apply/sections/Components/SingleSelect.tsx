interface SelectProps {
    name: string;
    labelText: string;
    IdentifierID: string;
    values: Array<any>;
}

export default function SingleSelect(props: SelectProps) {
    return(
        <>
            <p className="m-0 text-lg mb-4">{props.labelText} <span className="text-[#FF2222]">*</span></p>
            <div className="w-10/12 flex flex-col gap-2">
                {props.values.map((item, i) => {
                    if(item.value == "other") {
                        return(
                            <div className="flex gap-2">
                                <input id={`${props.IdentifierID}-${i}`} type="radio" key={`option-${i}`} name={props.name} value={item.value} required/>
                                <label className="text-lg" htmlFor={`${props.IdentifierID}-${i}`}>{item.text}</label>
                                <input type="text" className=" border-b-2 p-1 h-6 border-black w-6/12" />
                            </div> 
                        )
                    }
                    return(
                        <div className="flex gap-2">
                            <input id={`${props.IdentifierID}-${i}`} type="radio" key={`option-${i}`} name={props.name} value={item.value} required/>
                            <label className="text-lg" htmlFor={`${props.IdentifierID}-${i}`}>{item.text}</label>
                        </div>
                    )
                })}
            </div>
        </>
    )
}