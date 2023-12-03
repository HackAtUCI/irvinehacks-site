"use client";

import * as NavMenu from "@radix-ui/react-navigation-menu";
import clsx from "clsx";

import styles from "./Navbar.module.scss";
import React from "react";

import hackLogo from "@/assets/logos/white-anteater-logo.svg";
import Image from "next/image";

const NavLinkItem = React.forwardRef<
	React.ElementRef<typeof NavMenu.Link>,
	React.ComponentPropsWithoutRef<typeof NavMenu.Link>
>(({ children, className, ...props }, forwardedRef) => {
	return (
		<NavMenu.Item>
			<NavMenu.Link
				className={clsx(styles.navMenuItem, className)}
				{...props}
				ref={forwardedRef}
			>
				{children}
			</NavMenu.Link>
		</NavMenu.Item>
	);
});

function Navbar() {
	return (
		<NavMenu.Root className="flex fixed w-full z-10 p-3">
			<NavMenu.List>
				<NavLinkItem href="/">
					<Image
						src={hackLogo}
						width="35"
						alt="Hack at UCI Anteater Logo"
					/>
				</NavLinkItem>
			</NavMenu.List>
			<div className="ml-auto">
				<NavMenu.List
					className={`${styles.navMenuList} flex gap-10 mr-3`}
				>
					<NavLinkItem href="/">Home</NavLinkItem>
					<NavLinkItem href="/sponsor">Sponsor</NavLinkItem>
					<NavLinkItem href="/schedule">Schedule</NavLinkItem>
					<NavLinkItem href="/resources">Resources</NavLinkItem>
					<NavLinkItem href="/stage">Stage</NavLinkItem>
					<NavLinkItem href="/login">Login</NavLinkItem>
				</NavMenu.List>
			</div>
		</NavMenu.Root>
	);
}

export default Navbar;
