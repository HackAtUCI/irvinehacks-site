"use client";

import clsx from "clsx";

import Button from "@/lib/components/Button/Button";
import NavLinkItem from "./NavbarHelpers";

// import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";

import buttonStyles from "@/lib/components/Button/Button.module.scss";
import { Identity } from "@/lib/utils/getUserIdentity";
import BaseNavbar from "./BaseNavbar";

interface NavbarProps {
	identity: Identity;
}

export default function Navbar({ identity }: NavbarProps) {
	const { uid, status } = identity;
	const isLoggedIn = uid === null;

	return (
		<BaseNavbar>
			{status !== null && <NavLinkItem href="/portal">Portal</NavLinkItem>}
			{isLoggedIn ? (
				<Button text="Log In" href="/login" usePrefetch={false} isNavButton />
			) : (
				<a
					href="/logout"
					className={clsx(buttonStyles.buttonBox, buttonStyles.navButton)}
				>
					Log Out
				</a>
			)}
		</BaseNavbar>
	);
}
