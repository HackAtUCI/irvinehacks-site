import mail from "@/assets/logos/mail-pink.svg";
import discord from "@/assets/logos/discord-pink.svg";
import instagram from "@/assets/logos/instagram-pink.svg";
import tiktok from "@/assets/logos/tiktok-pink.svg";
import linkedin from "@/assets/logos/linkedin-pink.svg"
import facebook from "@/assets/logos/facebook-pink.svg"
import hack from "@/assets/logos/hack.svg";

import Image from "next/image";
import styles from "./Footer.module.scss";

const socials = [
	{
		logo: mail,
		alt: "Email that directs to contact@irvinehacks.com",
		link: "mailto:contact@irvinehacks.com",
	},
	{
		logo: discord,
		alt: "Discord logo that links to Hack at UCI's Discord invite",
		link: "https://discord.com/invite/pvkGxq2AWM",
	},
	{
		logo: instagram,
		alt: "Instagram logo that links to Hack at UCI's instagram",
		link: "https://www.instagram.com/hackatuci/",
	},
	{
		logo: tiktok,
		alt: "Tiktok logo that links to Hack at UCI's tiktok",
		link: "https://www.tiktok.com/@hackatuci",
	},
	{
		logo: linkedin,
		alt: "Linkedin logo that links to Hack at UCI's Linkedin",
		link: "https://www.linkedin.com/company/hackuci",
	},
	{
		logo: facebook,
		alt: "Facebook logo that links to Hack at UCI's Facebook",
		link: "https://www.facebook.com/groups/HackAtUCI/",
	}
];

const Footer = () => {
	return (
		<footer className={styles.footer}>
			<div className={styles.topRow}>
				<div className={styles.socials}>
					{socials.map((item, index) => (
						<a
							key={`footer-social-${index}`}
							href={item.link}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={item.alt}
						>
							<Image src={item.logo} alt={item.alt} width={30} height={30} />
						</a>
					))}
				</div>
			</div>
			<div className={styles.bottomRow}>
				<a
					href="https://hack.ics.uci.edu/"
					target="_blank"
					rel="noopener noreferrer"
					className={styles.hackLogo}
					aria-label="Hack at UCI website"
				>
					<Image
						src={hack}
						alt="Hack logo that links to Hack at UCI's website"
						width={42}
						height={42}
					/>
				</a>

				<p className={styles.footerText}>
					Made with &lt;3 in Irvine, CA <span className={styles.bullet}>•</span>{" "}
					Learn more about the{" "}
					<a
						href="https://hack.ics.uci.edu"
						target="_blank"
						rel="noopener noreferrer"
						className={styles.link}
					>
						Hack @ UCI team
					</a>
				</p>
			</div>
		</footer>
	);
};

export default Footer;
