import type { ComponentProps } from "react";
import styles from "./Button.module.css";
import clsx from "clsx";

interface ButtonProps {
	text: string;
	className?: string;
	href?: string;
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
}) => {
	if (href) {
		return (
			<a
				href={href}
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
