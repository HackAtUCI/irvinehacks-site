import styles from "./Title.module.scss";

export default function Title() {
	return (
		<>
			<h1
				className={`${styles.title} font-display text-[#fffce2] text-8xl text-center max-[500px]:text-7xl`}
			>
				Before you apply
			</h1>
		</>
	);
}
