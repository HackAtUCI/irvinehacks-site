import { Eye, EyeOff } from "lucide-react";

interface PasswordProps {
	visible: boolean;
	handler: React.MouseEventHandler<SVGElement>;
}

export default function PasswordEyeProps({ visible, handler }: PasswordProps) {
	if (visible) {
		return <EyeOff className="cursor-pointer" onClick={handler} />;
	} else {
		return <Eye className="cursor-pointer" onClick={handler} />;
	}
}
