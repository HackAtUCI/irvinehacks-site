"use client";

// import clsx from "clsx";

// import NavLinkItem from "./NavbarHelpers";

// import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
// import Button from "@/lib/components/Button/Button";
// import buttonStyles from "@/lib/components/Button/Button.module.scss";
// import { Identity } from "@/lib/utils/getUserIdentity";
import BaseNavbar from "./BaseNavbar";

// interface NavbarProps {
// 	identity: Identity;
// }

export default function Navbar() {
	// const { uid, status } = identity;
	// const isLoggedIn = uid !== null;

	return (
		<BaseNavbar>
			{/* {status !== null && <NavLinkItem href="/portal">Portal</NavLinkItem>}
			{isLoggedIn ? (
				<a
					href="/logout"
					className={clsx(buttonStyles.buttonBox, buttonStyles.navButton)}
				>
					Log Out
				</a>
			) : (
				<Button text="Log In" href="/login" usePrefetch={false} isNavButton />
			)} */}
		</BaseNavbar>
	);
}
