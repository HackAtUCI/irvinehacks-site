import { CSSProperties, ComponentProps } from "react";
import Link from "next/link";
import clsx from "clsx";

import styles from "./Button.module.css";

interface ButtonProps {
	text: string;
	className?: string;
	href?: ComponentProps<typeof Link>["href"];
	isLightVersion?: boolean;
	isNavButton?:boolean
	usePrefetch?: boolean;
	disabled?: boolean;
	style?: CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
	text,
	href,
	className,
	style,
	isLightVersion,
	isNavButton,
	disabled,
	usePrefetch = true,
}) => {
	if (href) {
		return (
			<div className={styles.buttonBox}>
				<Link
					href={href}
					className={clsx(
						styles.button,
						isLightVersion && styles.lightButton,
						isNavButton && styles.navButton,
						isLightVersion ? "font-display" : "font-body",
						className,
					)}
					prefetch={usePrefetch}
				>
					{text}
				</Link>
			</div>
		);
	}
	return (
		<div className={styles.buttonBox}>
			<button
				type="submit"
				className={styles.button + " font-display"}
				disabled={disabled}
				style={style ? style : { width: "max-content" }}
			>
				{text}
			</button>
		</div>
	);
};

export default Button;
