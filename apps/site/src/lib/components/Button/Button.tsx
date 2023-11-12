import styles from "./Button.module.css";

interface ButtonProps {
	text: string;
	href?: string;
	className?: string;
}

const Button: React.FC<ButtonProps> = ({ text, href, className }) => {
	if (href) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={styles.button + " font-body " + className}
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
