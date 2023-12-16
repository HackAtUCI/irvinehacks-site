import type { ComponentProps } from "react";
import styles from "./Button.module.css";
import clsx from "clsx";

interface ButtonProps {
	text: string;
	className?: string;
	href?: string;
	isLightVersion?: boolean;
	usePrefetch?: boolean;
}

const Button: React.FC<ButtonProps> = ({
	text,
	href,
	className,
	isLightVersion,
}) => {
	if (href) {
		return (
			<a
				href={href}
				target={isLightVersion ? "" : "_blank"}
				rel="noopener noreferrer"
				className={clsx(
					styles.button,
					isLightVersion && styles.lightButton,
					isLightVersion ? "font-display" : "font-body",
					className,
				)}
			>
				{text}
			</a>
		);
	}
	return (
		<button type="submit" className={styles.button + " font-body"}>
			{text}
		</button>
	);
};

export default Button;
