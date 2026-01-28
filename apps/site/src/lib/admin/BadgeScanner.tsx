import { useEffect, useRef } from "react";

import {
	Html5QrcodeScanner,
	QrcodeErrorCallback,
	QrcodeSuccessCallback,
} from "html5-qrcode";

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
	const scannerRef = useRef<Html5QrcodeScanner | null>(null);
	const isScanningRef = useRef(false);
	const hasProcessedScanRef = useRef(false);
	const isInitializingRef = useRef(false);
	const scannerRegionIdRef = useRef(
		`badge-scanner-${Math.random().toString(36).substr(2, 9)}`,
	);

	useEffect(() => {
		const {
			fps,
			// qrbox,
			aspectRatio,
			disableFlip,
			verbose,
			onSuccess,
			onError,
		} = props;
		const scannerRegionId = scannerRegionIdRef.current;
		let isMounted = true;

		// clears DOM element to prevent duplicate renders
		const element = document.getElementById(scannerRegionId);
		if (element) {
			element.innerHTML = '';
		}

		// stops scanning after success
		const wrappedOnSuccess: QrcodeSuccessCallback = (
			decodedText,
			result,
		) => {
			// prevent duplicate callbacks
			if (hasProcessedScanRef.current) {
				return;
			}
			
			hasProcessedScanRef.current = true;
			isScanningRef.current = false;
			
			// stop scanning
			if (scannerRef.current) {
				scannerRef.current
					.clear()
					.catch((error) => {
						console.error("Failed to stop scanner: ", error);
					});
			}
			
			onSuccess(decodedText, result);
		};

		// clear existing scanner if it exists, then create new one
		const initializeScanner = async () => {
			// prevent double initialization (React Strict Mode)
			if (isInitializingRef.current || scannerRef.current) {
				return;
			}
			isInitializingRef.current = true;

			// check DOM if clear
			const checkElement = document.getElementById(scannerRegionId);
			if (checkElement && checkElement.children.length > 0) {
				checkElement.innerHTML = '';
			}

			// only create scanner if component is still mounted
			if (!isMounted) {
				isInitializingRef.current = false;
				return;
			}

			const html5QrcodeScanner = new Html5QrcodeScanner(
				scannerRegionId,
				{
					fps: fps ?? 5,
					// qrbox: qrbox ?? 300,
					aspectRatio: aspectRatio ?? 1,
					disableFlip: disableFlip ?? true,
				},
				verbose ?? false,
			);

			scannerRef.current = html5QrcodeScanner;
			isScanningRef.current = true;
			hasProcessedScanRef.current = false;
			html5QrcodeScanner.render(wrappedOnSuccess, onError);
			isInitializingRef.current = false;
		};

		const timeoutId = setTimeout(() => {
			initializeScanner();
		}, 0);

		// Clean up when unmount
		return () => {
			clearTimeout(timeoutId);
			isMounted = false;
			isInitializingRef.current = false;
			if (scannerRef.current) {
				scannerRef.current
					.clear()
					.then(() => {
						isScanningRef.current = false;
						scannerRef.current = null;
						// clear DOM element content
						const element = document.getElementById(scannerRegionId);
						if (element) {
							element.innerHTML = '';
						}
					})
					.catch((error) => {
						console.error("Failed to clear html5QrcodeScanner. ", error);
						scannerRef.current = null;
						// clear DOM element content even on error
						const element = document.getElementById(scannerRegionId);
						if (element) {
							element.innerHTML = '';
						}
					});
			} else {
				// clear DOM even if no scanner ref (race condition)
				const element = document.getElementById(scannerRegionId);
				if (element) {
					element.innerHTML = '';
				}
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <div id={scannerRegionIdRef.current} />;
}

export default BadgeScanner;
