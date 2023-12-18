import clsx from "clsx";
import React from "react";
import Link from "next/link";
import * as NavMenu from "@radix-ui/react-navigation-menu";

import styles from "./Navbar.module.scss";

const NavLinkItem = React.forwardRef<
	React.ElementRef<typeof NavMenu.Link>,
	React.ComponentPropsWithoutRef<typeof NavMenu.Link>
>(({ children, className, href, ...props }, forwardedRef) => {
	return (
		<NavMenu.Item>
			<Link href={href as string} passHref legacyBehavior>
				<NavMenu.Link
					className={clsx(styles.navMenuLink, className)}
					{...props}
					ref={forwardedRef}
				>
					{children}
				</NavMenu.Link>
			</Link>
		</NavMenu.Item>
	);
});

NavLinkItem.displayName = "NavLinkItem";
export default NavLinkItem;
