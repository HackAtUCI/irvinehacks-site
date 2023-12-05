import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";

interface PasswordProps {
    visible: boolean,
    handler: any
}


export default function PasswordEye(props: PasswordProps) {
    if(props.visible) {
        return <EyeOff className="cursor-pointer" onClick={props.handler}/>
    } else {
        return <Eye className="cursor-pointer" onClick={props.handler}/>
    }
}