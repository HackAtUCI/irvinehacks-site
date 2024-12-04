import mail from "@/assets/logos/mail.svg";
import discord from "@/assets/logos/discord.svg";
import instagram from "@/assets/logos/instagram.svg";
import Image from "next/image";
import tiktok from "@/assets/logos/tiktok.svg";
import redHeart from "@/assets/icons/red-heart.svg";
import hack from "@/assets/logos/hack.svg";
import styles from "./Footer.module.scss";

const imageArray = [
	{
		logo: hack,
		alt: "Hack logo that links to Hack at UCI's website",
		link: "https://hack.ics.uci.edu/",
	},
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
];

const Footer = () => {
	return (
		<footer className={`${styles.footer} flex flex-col items-center`}>
			<div className="flex flex-row footer-logos items-center gap-10 mt-12 max-[340px]:mt-5">
				{imageArray.map((item, index) => {
					return (
						<a
							key={`footer-logo-${index}`}
							href={item.link}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Image src={item.logo} width="35" alt={item.alt} />
						</a>
					);
				})}
			</div>
			<div className="flex flex-row gap-1 items-center mt-2 max-[600px]:flex-col max-[210px]:gap-0 max-[210px]:mt-0">
				<div className="flex flex-row gap-1 items-center max-[210px]:flex-col max-[210px]:gap-0">
					<p className="m-0">Made with</p>
					<Image src={redHeart} alt="Red heart icon" layout="intrinsic" />

					<p className="m-0">
						by Hack at UCI <span className="max-[600px]:hidden">•</span>
					</p>
				</div>

				<p className="m-0 flex gap-1 whitespace-nowrap max-[340px]:flex-col max-[340px]:items-center">
					Learn more about the{" "}
					<a
						href="https://hack.ics.uci.edu"
						target="_blank"
						rel="noopener noreferrer"
					>
						<span style={{ color: "#FBA80A" }}>Hack @ UCI Team</span>
					</a>
				</p>
			</div>
		</footer>
	);
};

export default Footer;
