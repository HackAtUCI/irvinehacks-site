"use client";

import * as NavMenu from "@radix-ui/react-navigation-menu";

import styles from "./Navbar.module.scss";
import React from "react";
import { useState, useEffect } from "react";

import NavLinkItem from "./NavbarHelpers";
import Button from "@/lib/components/Button/Button";
import HackLogo from "@/lib/components/HackLogo/HackLogo";

import hamburger from "@/assets/icons/navigation-icon.svg";
import Image from "next/image";

function Navbar() {
	const [listShown, setListShown] = useState(false);
	const [transitionApplied, setTransitionApplied] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);

	useEffect(() => {
		const mobileNavInitStateHandler = () => {
			setListShown(false);
			setTransitionApplied(false);
		};

		// hides list on breakpoint
		window
			.matchMedia("(min-width: 768px)")
			.addEventListener("change", mobileNavInitStateHandler);
	}, []);

	useEffect(() => {
		const scrollHandler = () =>
			window.scrollY !== 0 ? setHasScrolled(true) : setHasScrolled(false);

		window.addEventListener("scroll", scrollHandler);
	}, []);

	return (
		<NavMenu.Root
			className={`${
				hasScrolled ? "md:bg-black md:bg-opacity-50" : ""
			} w-full z-10 flex flex-col fixed md:flex-row md:items-center`}
		>
			<NavMenu.List className={"bg-black bg-opacity-50 md:bg-opacity-0 flex p-3"}>
				<NavLinkItem href="/">
					<HackLogo />
				</NavLinkItem>
				<Image
					className="ml-auto md:hidden cursor-pointer"
					src={hamburger}
					width="35"
					alt="Mobile hamburger menu"
					onClick={() => {
						setListShown(!listShown);
						setTransitionApplied(true);
					}}
				/>
			</NavMenu.List>
			<div
				className={`${styles.navMenuListWrapper} md:my-3 md:mr-3 md:ml-auto inline-block md:flex md:items-center`}
			>
				<NavMenu.List
					className={
						(transitionApplied
							? `${styles.transformTransition} `
							: "") +
						(listShown
							? `${styles.showList} `
							: `${styles.hideList} `) +
						`${styles.navMenuList} font-display gap-10 p-5 pt-3 bg-black bg-opacity-50 md:bg-opacity-0 md:p-0 md:flex md:items-center`
					}
				>
					<NavLinkItem href="/">Home</NavLinkItem>
					<NavLinkItem href="/sponsor">Sponsor</NavLinkItem>
					<NavLinkItem href="/schedule">Schedule</NavLinkItem>
					<NavLinkItem href="/resources">Resources</NavLinkItem>
					<NavLinkItem href="/stage">Stage</NavLinkItem>
					<Button text="Login" href="/login" isLightVersion />
				</NavMenu.List>
			</div>
		</NavMenu.Root>
	);
}

export default Navbar;
