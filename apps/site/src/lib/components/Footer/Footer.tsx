import mail from "@/assets/logos/mail.svg";
import discord from "@/assets/logos/discord.svg";
import instagram from "@/assets/logos/instagram.svg";
import Image from "next/image";
import tiktok from "@/assets/logos/tiktok.svg";
import styles from "./Footer.module.scss";

const imageArray = [
	{
		"logo": mail,
		"alt": "Email that directs to hack@uci.edu",
		"link": "mailto:hack@uci.edu"
	},
	{
		"logo": discord,
		"alt": "Discord logo that links to Hack at UCI's Discord invite",
		"link": "https://discord.com/invite/pvkGxq2AWM"
	},
	{
		"logo": instagram,
		"alt": "Instagram logo that links to Hack at UCI's instagram",
		"link": "https://www.instagram.com/hackatuci/"
	},
	{
		"logo": tiktok,
		"alt": "Tiktok logo that links to Hack at UCI's tiktok",
		"link": "https://www.tiktok.com/@hackatuci"
	},

]

const Footer = () => {

	return (
	<footer className={`${styles.footer} flex flex-col items-center`}>
		<div className='flex flex-row footer-logos items-center gap-10 mt-12 max-[340px]:mt-5'>
			{imageArray.map((item, index) => {
				return(
					<a key={`footer-logo-${index}`} href={item.link} target="_blank" rel="noopener noreferrer">
						<Image
							src={item.logo}
							width="35"
							alt={item.alt}
						/>
					</a>
				)

			})}
		</div>
		<div className="flex flex-row gap-1 items-center mt-2 max-[600px]:flex-col max-[210px]:gap-0 max-[210px]:mt-0">
			<div className="flex flex-row gap-1 items-center max-[210px]:flex-col max-[210px]:gap-0">
				<p className="m-0">Made with</p>
				<svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M7.55321 0H2.96878V1.4339H1.4339V2.96878H0V9.14868H1.4339V10.5422H2.96878V12.0771H4.58444V13.7735H6.09912V15.167H7.55321V16.6817H9.14868V18.2974H10.6836V16.6817H12.1578V15.167H13.7331V13.7735H15.2478V12.0771H16.8231V10.5422H18.2974V9.14868H19.8322V2.96878H18.2974V1.4339H16.8231V0H12.1578V1.4339H10.6836V2.96878H9.14868V1.4339H7.55321V0Z" fill="#FF0000"/>
					<rect x="2.98877" y="4.52344" width="1.57527" height="4.64502" fill="white"/>
					<rect x="4.56445" y="2.98926" width="1.53488" height="1.53488" fill="white"/>
				</svg>

				<p className="m-0">in Irvine, CA <span className="max-[600px]:hidden">•</span></p>
			</div>

			<p className="m-0 flex gap-1 whitespace-nowrap max-[340px]:flex-col max-[340px]:items-center">Learn more about the <a href="https://hack.ics.uci.edu" target="_blank" rel="noopener noreferrer"><span style={{"color" : "#FBA80A"}}>Hack @ UCI Team</span></a></p>
		</div>

	</footer>
	)
	// ;#2878A6
};

export default Footer;
