import clsx from "clsx";
import React from "react";
import * as NavMenu from "@radix-ui/react-navigation-menu";

import styles from "./Navbar.module.scss";

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

NavLinkItem.displayName = "NavLinkItem";
export default NavLinkItem;
