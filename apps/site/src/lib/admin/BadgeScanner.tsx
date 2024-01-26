import { useEffect } from "react";

import {
	Html5QrcodeScanner,
	QrcodeErrorCallback,
	QrcodeSuccessCallback,
} from "html5-qrcode";

const scannerRegionId = "badge-scanner-full-region";

interface BadgeScannerProps {
	fps?: number;
	qrbox?: number;
	aspectRatio?: number;
	disableFlip?: boolean;
	verbose?: boolean;
	onSuccess: QrcodeSuccessCallback;
	onError: QrcodeErrorCallback;
}

function BadgeScanner(props: BadgeScannerProps) {
	useEffect(() => {
		const {
			fps,
			qrbox,
			aspectRatio,
			disableFlip,
			verbose,
			onSuccess,
			onError,
		} = props;

		const html5QrcodeScanner = new Html5QrcodeScanner(
			scannerRegionId,
			{
				fps: fps ?? 5,
				qrbox: qrbox ?? 300,
				aspectRatio: aspectRatio ?? 1,
				disableFlip: disableFlip ?? true,
			},
			verbose ?? false,
		);
		html5QrcodeScanner.render(onSuccess, onError);

		// Clean up when unmount
		return () => {
			html5QrcodeScanner.clear().catch((error) => {
				console.error("Failed to clear html5QrcodeScanner. ", error);
			});
		};
	}, [props]);

	return <div id={scannerRegionId} />;
}

export default BadgeScanner;
