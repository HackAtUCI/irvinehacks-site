import styles from "./Button.module.css";

interface ButtonProps {
	text: string;
	href?: string;
	isLink: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, href, isLink }) => {
	if (isLink) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={styles.button + " font-body"}
			>
				{text}
			</a>
		);
	}
	return (
		<input
			type="submit"
			className={styles.button + " font-body"}
			value={text}
		/>
	);
};

export default Button;
