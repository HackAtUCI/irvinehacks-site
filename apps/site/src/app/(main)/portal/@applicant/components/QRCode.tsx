import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

interface User {
	uid: string;
	email?: string;
	name?: string;
}

interface QRCodeComponentProps {
	className?: string;
	size?: number;
}

export default function QRCodeComponent({
	className = "",
	size = 200,
}: QRCodeComponentProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchUserData();
	}, []);

	const fetchUserData = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/user/me", {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch user data");
			}

			const userData = await response.json();
			if (!userData.uid) {
				throw new Error("User not authenticated");
			}

			setUser(userData);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	const generateQRValue = () => {
		if (!user) return "";
		return user.uid;
	};

	if (loading) {
		return (
			<div className={`flex items-center justify-center p-8 ${className}`}>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
				<span className="ml-2">Loading QR code...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className={`text-red-500 p-4 text-center ${className}`}>
				<p>Error: {error}</p>
				<button
					type="button"
					onClick={fetchUserData}
					className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Retry
				</button>
			</div>
		);
	}

	if (!user) {
		return (
			<div className={`text-center p-4 ${className}`}>
				No user data available
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
					value={generateQRValue()}
					size={size}
					style={{ height: "auto", maxWidth: "100%", width: "100%" }}
					viewBox={`0 0 ${size} ${size}`}
				/>
			</div>
		</div>
	);
}
