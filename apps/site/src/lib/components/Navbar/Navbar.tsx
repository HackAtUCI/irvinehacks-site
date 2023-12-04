"use client";

import * as NavMenu from "@radix-ui/react-navigation-menu";
import clsx from "clsx";

import styles from "./Navbar.module.scss";
import React from "react";

import Button from "@/lib/components/Button/Button";

import hackLogo from "@/assets/logos/white-anteater-logo.svg";
import hamburger from "@/assets/icons/navigation-icon.svg";
import Image from "next/image";

const NavLinkItem = React.forwardRef<
	React.ElementRef<typeof NavMenu.Link>,
	React.ComponentPropsWithoutRef<typeof NavMenu.Link>
>(({ children, className, ...props }, forwardedRef) => {
	return (
		<NavMenu.Item>
			<NavMenu.Link
				className={clsx(styles.navMenuLink, className)}
				{...props}
				ref={forwardedRef}
			>
				{children}
			</NavMenu.Link>
		</NavMenu.Item>
	);
});

function Navbar() {
	const [listShown, setListShown] = React.useState(false);
	const [transitionApplied, setTransitionApplied] = React.useState(false);
	const [backgroundChanged, setBackgroundChanged] = React.useState(false);

	const mobileNavInitStateHandler = () => {
		setListShown(false);
		setTransitionApplied(false);
		setBackgroundChanged(false);
	};
	window
		.matchMedia("(min-width: 768px)")
		.addEventListener("change", mobileNavInitStateHandler);

	return (
		<NavMenu.Root className="w-full z-10 flex flex-col fixed md:flex-row">
			<NavMenu.List
				className={
					(backgroundChanged ? "bg-black " : "") +
					`bg-opacity-50 flex p-3`
				}
			>
				<NavLinkItem href="/">
					<Image
						src={hackLogo}
						width="35"
						alt="Hack at UCI Anteater Logo"
					/>
				</NavLinkItem>
				<Image
					className="ml-auto md:hidden cursor-pointer"
					src={hamburger}
					width="35"
					alt="Mobile hamburger menu"
					onClick={() => {
						setListShown(!listShown);
						setTransitionApplied(true);
						setBackgroundChanged(true);
					}}
				/>
			</NavMenu.List>
			<div
				className={`${styles.navMenuListWrapper} md:mt-3 md:mr-3 md:ml-auto inline-block md:flex md:items-center`}
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
					onTransitionEnd={() => {
						if (!listShown) setBackgroundChanged(false);
					}}
				>
					<NavLinkItem href="/">Home</NavLinkItem>
					<NavLinkItem href="/sponsor">Sponsor</NavLinkItem>
					<NavLinkItem href="/schedule">Schedule</NavLinkItem>
					<NavLinkItem href="/resources">Resources</NavLinkItem>
					<NavLinkItem href="/stage">Stage</NavLinkItem>
					<Button text="Login" href="/login" alt={true}/>
				</NavMenu.List>
			</div>
		</NavMenu.Root>
	);
}

export default Navbar;
