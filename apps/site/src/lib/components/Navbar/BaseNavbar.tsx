"use client";

import * as NavMenu from "@radix-ui/react-navigation-menu";
import Image from "next/image";
import { useEffect, useState, PropsWithChildren } from "react";

import HackLogo from "@/lib/components/HackLogo/HackLogo";
import NavLinkItem from "./NavbarHelpers";

import hamburger from "@/assets/icons/navigation-icon.svg";
import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";

import styles from "./Navbar.module.scss";

export default function BaseNavbar({ children }: PropsWithChildren) {
	const [listShown, setListShown] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);
	const [hidden, setHidden] = useState(true);

	useEffect(() => {
		const scrollHandler = () =>
			window.scrollY !== 0 ? setHasScrolled(true) : setHasScrolled(false);

		window.addEventListener("scroll", scrollHandler);
	}, []);

	// const goToChooseChar = (e: React.MouseEvent) => {
	// 	e.preventDefault();

	// 	if (window.location.pathname !== "/") {
	// 		window.location.href = "/#apply";
	// 	} else {
	// 		const target = document.getElementById("apply");
	// 		if (target) {
	// 			target.scrollIntoView({ behavior: "smooth" });
	// 		}
	// 	}
	// };

	const deadlinePassed = hasDeadlinePassed();

	return (
		<NavMenu.Root
			className={`${hasScrolled ? "md:bg-opacity-50" : ""} ${
				hidden ? "max-md:h-[4rem] max-md:overflow-hidden" : ""
			} transition-colors duration-0 md:duration-700 ease-out w-full z-50 flex flex-col fixed bg-black bg-opacity-0 md:flex-row md:items-center`}
		>
			<NavMenu.List className="bg-black bg-opacity-50 md:bg-opacity-0 flex p-3">
				<NavLinkItem href="/">
					<HackLogo />
				</NavLinkItem>
				<button
					type="button"
					className="ml-auto h-auto md:hidden cursor-pointer"
					onClick={() => {
						setListShown((listShown) => !listShown);
						setHidden(false);
					}}
				>
					<Image src={hamburger} width="40" alt="Mobile hamburger menu" />
				</button>
			</NavMenu.List>
			<div
				className={`${styles.navMenuListWrapper} md:my-3 md:mr-3 md:ml-auto inline-block md:flex md:items-center`}
			>
				<NavMenu.List
					className={
						(hidden ? "opacity-0 " : "opacity-100 ") +
						(listShown ? "" : "-translate-y-full ") +
						"transition-transform duration-500 ease-in-out md:transition-none md:translate-y-0 md:opacity-100 " +
						"[&>*]:mb-5 [&>*]:md:mb-0 font-display gap-10 p-5 pt-3 bg-black bg-opacity-50 md:bg-opacity-0 md:p-0 md:flex md:items-center"
					}
					onTransitionEnd={() => setHidden(!listShown)}
				>
					<NavLinkItem href="/">Home</NavLinkItem>
					{!deadlinePassed && (
						<NavLinkItem
							href="/#apply"
							// onClick={goToChooseChar}
						>
							Apply
						</NavLinkItem>
					)}

					<NavLinkItem href="/resources">Resources</NavLinkItem>

					<NavLinkItem href="/schedule">Schedule</NavLinkItem>

					<NavLinkItem
						href="/incident"
						target="_blank"
						rel="noopener noreferrer"
					>
						Report Incident
					</NavLinkItem>

					<NavLinkItem
						href="/devpost"
						target="_blank"
						rel="noopener noreferrer"
					>
						Devpost
					</NavLinkItem>

					{children}
				</NavMenu.List>
			</div>
		</NavMenu.Root>
	);
}
