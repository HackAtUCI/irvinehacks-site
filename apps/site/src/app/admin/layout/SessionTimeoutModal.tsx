"use client";

import { useEffect, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";

interface SessionTimeoutModalProps {
	visible: boolean;
	onExtend: () => void;
	onLogout: () => void;
}

const WARNING_SECONDS = 2 * 60; // 2 minutes

function SessionTimeoutModal({
	visible,
	onExtend,
	onLogout,
}: SessionTimeoutModalProps) {
	const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);

	// Reset and start countdown whenever modal becomes visible
	useEffect(() => {
		if (!visible) {
			setSecondsLeft(WARNING_SECONDS);
			return;
		}

		setSecondsLeft(WARNING_SECONDS);
		// Countdown logic
		const interval = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [visible]);

	const minutes = Math.floor(secondsLeft / 60);
	const seconds = secondsLeft % 60;
	const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
	const isUrgent = secondsLeft <= 30;

	return (
		<Modal
			visible={visible}
			onDismiss={onExtend}
			closeAriaLabel="Close"
			footer={
				<div className="flex justify-center">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="normal" onClick={onLogout}>
							Logout now
						</Button>
						<Button variant="primary" onClick={onExtend}>
							Keep working
						</Button>
					</SpaceBetween>
				</div>
			}
		>
			<SpaceBetween size="m">
				<Box variant="h1" textAlign="center">
					Session will expire soon!
				</Box>
				<Box variant="p" textAlign="center">
					You will be automatically logged out for security reasons in:
				</Box>
				<Box
					variant="p"
					textAlign="center"
					fontSize="display-l"
					fontWeight="bold"
					color={isUrgent ? "text-status-error" : "inherit"}
				>
					{formattedTime}
				</Box>
				<Box
					variant="p"
					textAlign="center"
					color="text-body-secondary"
					fontSize="body-s"
				>
					Would you like to keep working?
				</Box>
			</SpaceBetween>
		</Modal>
	);
}

export default SessionTimeoutModal;
