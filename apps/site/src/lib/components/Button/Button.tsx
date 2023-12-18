import { ComponentProps } from "react";
import Link from "next/link";
import clsx from "clsx";

import styles from "./Button.module.css";

interface ButtonProps {
	text: string;
	className?: string;
	href?: ComponentProps<typeof Link>["href"];
	isLightVersion?: boolean;
	usePrefetch?: boolean;
	disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
	text,
	href,
	className,
	isLightVersion,
	disabled,
	usePrefetch = true,
}) => {
	if (href) {
		return (
			<Link
				href={href}
				className={clsx(
					styles.button,
					isLightVersion && styles.lightButton,
					isLightVersion ? "font-display" : "font-body",
					className,
				)}
				prefetch={usePrefetch}
			>
				{text}
			</Link>
		);
	}
	return (
		<button
			type="submit"
			className={styles.button + " font-body"}
			disabled={disabled}
		>
			{text}
		</button>
	);
};

export default Button;
