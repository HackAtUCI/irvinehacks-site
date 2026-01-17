import Image from "next/image";

import irvineHacksLogo from "@/assets/logos/irvinehacks-logo-yellow.svg";

import styles from "./HackLogo.module.scss";

const HackLogo = () => {
	return (
		<div className={styles.hackLogo}>
			<Image src={irvineHacksLogo} alt="IrvineHacks Logo" />
		</div>
	);
};

export default HackLogo;
