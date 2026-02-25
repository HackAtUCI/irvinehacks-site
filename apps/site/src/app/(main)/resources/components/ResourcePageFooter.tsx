import Image from "next/image";
import ResourcePageFigure from "@/assets/images/resource-page-figure.svg";
import styles from "./ResourceSection.module.scss";

export default function ResourcePageFooter() {
	return (
		<footer className={styles.footer}>
			<Image
				src={ResourcePageFigure}
				className={styles.resourcePageFigure}
				alt="resource page figure"
			/>
		</footer>
	);
}
