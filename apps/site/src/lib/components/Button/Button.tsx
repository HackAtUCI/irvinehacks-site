import styles from "./Button.module.css";

interface ButtonProps {
	text: string;
	href?: string;
	alt?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, href, alt }) => {
	if (href) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={(alt ? styles.altButton : "") + ' ' + styles.button + " font-body"}
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
