import useUserIdentity from "@/lib/utils/useUserIdentity";
import QRCode from "react-qr-code";

interface QRCodeComponentProps {
	uid?: string;
	className?: string;
	size?: number;
}

export default function QRCodeComponent({
	uid: uidProp,
	className = "",
	size = 200,
}: QRCodeComponentProps) {
	const identity = useUserIdentity();
	const uid = uidProp ?? identity?.uid;

	if (uid === undefined) {
		return (
			<div className={`text-center p-4 ${className}`}>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
				<span className="ml-2">Loading QR code...</span>
			</div>
		);
	}

	return (
		<div
			className={`bg-white p-6 rounded-lg shadow-lg text-center ${className}`}
		>
			<h3 className="text-xl font-bold mb-4 text-gray-800">Check-In QR Code</h3>

			<div className="mb-4 flex justify-center">
				<QRCode
					id="qr-code-svg"
					value={uid ?? ""}
					size={size}
					style={{ height: "auto", maxWidth: "100%", width: "100%" }}
					viewBox={`0 0 ${size} ${size}`}
				/>
			</div>
		</div>
	);
}
