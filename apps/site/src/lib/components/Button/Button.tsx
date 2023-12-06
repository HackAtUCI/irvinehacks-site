import type { ComponentProps } from "react";
import Link from "next/link";
import styles from "./Button.module.css";
import clsx from "clsx";

interface ButtonProps {
	text: string;
	className?: string;
	href?: ComponentProps<typeof Link>["href"];
  	isLightVersion?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, href, className, isLightVersion }) => {
	if (href) {
		return (
			<Link
				href={href}
				target="_blank"
				rel="noopener noreferrer"
        className={clsx(styles.button, isLightVersion && styles.lightButton, isLightVersion ? "font-display" :"font-body", className)}
			>
				{text}
			</Link>
		);
	}
	return (
		<button type="submit" className={styles.button + " font-body"}>
			{text}
		</button>
	);
};

export default Button;
