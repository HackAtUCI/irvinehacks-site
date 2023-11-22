import type { ComponentProps } from "react";
import Link from "next/link";
import styles from "./Button.module.css";
import clsx from "clsx";

interface ButtonProps {
	text: string;
	href?: ComponentProps<typeof Link>["href"];
}

const Button: React.FC<ButtonProps> = ({ text, href }) => {
	if (href) {
		return (
			<Link
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={clsx(styles.button, "font-body")}
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
