import Image from "next/image";

// import hackAnteater from "@/assets/logos/hackuci-anteater.svg";
// import hackGear from "@/assets/logos/hackuci-gear.svg";
import irvineHacksLogo from "@/assets/logos/irvinehacks-logo-yellow.svg";

import styles from "./HackLogo.module.scss";

const HackLogo = () => {
	return (
		<div className={styles.hackLogo}>
			<Image src={irvineHacksLogo} alt="IrvineHacks Logo Anteater" />
			{/* <Image
				className={styles.spinning}
				src={hackGear}
				alt="Hack at UCI Logo Gear"
			/> */}
		</div>
	);
};

export default HackLogo;
