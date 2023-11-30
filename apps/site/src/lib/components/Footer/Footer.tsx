import hack from "@/assets/logos/hack.svg";
import mail from "@/assets/logos/mail.svg";
import facebook from "@/assets/logos/facebook.svg";
import instagram from "@/assets/logos/instagram.svg";
import Image from "next/image";

import styles from "./Footer.module.scss";

const imageArray = [
	{
		"logo": hack,
		"alt": "Hack Logo that links to Hack at UCI's website",
		"link": "https://hack.ics.uci.edu"
	},
	{
		"logo": mail,
		"alt": "Email that directs to hack@uci.edu",
		"link": "mailto:hack@uci.edu"
	},
	{
		"logo": facebook,
		"alt": "Facebook logo that links to Hack at UCI's facebook",
		"link": "https://www.facebook.com/groups/HackAtUCI/"
	},
	{
		"logo": instagram,
		"alt": "Instagram logo that links to Hack at UCI's instagram",
		"link": "https://www.instagram.com/hackatuci/"
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
		<div className=" flex flex-row gap-1 items-center mt-2 max-[600px]:flex-col max-[210px]:gap-0 max-[210px]:mt-0">
			<div className="flex flex-row gap-1 items-center max-[210px]:flex-col max-[210px]:gap-0">
				<h2>Made with</h2>
				<svg className=" fill-white" xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>
				<h2>in Irvine, CA <span className="max-[600px]:hidden">•</span></h2>
			</div>

			<h2 className="flex gap-1 whitespace-nowrap max-[340px]:flex-col max-[340px]:items-center">Learn more about the <a href="https://hack.ics.uci.edu" target="_blank" rel="noopener noreferrer"><span style={{"color" : "#FBA80A"}}>Hack @ UCI Team</span></a></h2>
		</div>

	</footer>
	);
};

export default Footer;
