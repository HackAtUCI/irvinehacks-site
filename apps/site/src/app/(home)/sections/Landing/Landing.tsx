import Button from "@/components/Button/Button";
import styles from "./Landing.module.css";

const Landing = () => {
	return (
		<section className={styles.landingSection}>
			<div className={styles.landingGroup}>
				<h1 className="font-display">IrvineHacks 2024</h1>
				<p className="font-display">January 26-28</p>
				<Button
					text="Stay updated"
					href="https://uci.us13.list-manage.com/subscribe?u=5976872928cd5681fbaca89f6&id=93333e11eb"
					isLink
				/>
			</div>
		</section>
	);
};

export default Landing;
