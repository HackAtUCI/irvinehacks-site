import Image from "next/image";

import hackAnteater from "@/assets/logos/hackuci-anteater.svg";
import hackGear from "@/assets/logos/hackuci-gear.svg";

import styles from "./HackLogo.module.scss";

const HackLogo = () => {
	return (
		<div className={styles.hackLogo}>
			<Image
				src={hackGear}
				alt="IrvineHacks gear logo"
				fill
				className={styles.gearImage}
			/>
			<Image
				src={hackAnteater}
				alt="IrvineHacks anteater logo"
				fill
				className={styles.anteaterImage}
			/>
		</div>
	);
};

export default HackLogo;
