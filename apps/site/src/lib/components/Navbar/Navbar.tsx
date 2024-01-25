"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import clsx from "clsx";
import * as NavMenu from "@radix-ui/react-navigation-menu";

import NavLinkItem from "./NavbarHelpers";
import Button from "@/lib/components/Button/Button";
import HackLogo from "@/lib/components/HackLogo/HackLogo";

import hamburger from "@/assets/icons/navigation-icon.svg";
import { Identity } from "@/lib/utils/getUserIdentity";
import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";

import buttonStyles from "@/lib/components/Button/Button.module.css";
import styles from "./Navbar.module.scss";

interface NavbarProps {
	identity: Identity;
}

function Navbar({ identity }: NavbarProps) {
	const { uid, status } = identity;
	const isLoggedIn = uid === null;

	const [listShown, setListShown] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);
	const [hidden, setHidden] = useState(true);

	useEffect(() => {
		const scrollHandler = () =>
			window.scrollY !== 0 ? setHasScrolled(true) : setHasScrolled(false);

		window.addEventListener("scroll", scrollHandler);
	}, []);

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
					{/* <NavLinkItem href="/">Home</NavLinkItem>
					<NavLinkItem href="/">Sponsor</NavLinkItem>
					<NavLinkItem href="/">Resources</NavLinkItem>
					<NavLinkItem href="/">Stage</NavLinkItem> */}
					<NavLinkItem href="/schedule">Schedule</NavLinkItem>
					{!status && !deadlinePassed && (
						<NavLinkItem href="/apply">Apply</NavLinkItem>
					)}

					{status !== null && <NavLinkItem href="/portal">Portal</NavLinkItem>}
					{isLoggedIn ? (
						<Button
							text="Log In"
							href="/login"
							usePrefetch={false}
							isLightVersion
						/>
					) : (
						<a
							href="/logout"
							className={clsx(buttonStyles.button, buttonStyles.lightButton)}
						>
							Log Out
						</a>
					)}
				</NavMenu.List>
			</div>
		</NavMenu.Root>
	);
}

export default Navbar;
