import clsx from "clsx";
import React from "react";
import Link, { LinkProps } from "next/link";
import * as NavMenu from "@radix-ui/react-navigation-menu";

import styles from "./Navbar.module.scss";

const NavLinkItem = React.forwardRef<
	React.ElementRef<typeof NavMenu.Link>,
	React.ComponentPropsWithoutRef<typeof NavMenu.Link> & LinkProps
>(({ children, className, href, prefetch, ...props }, forwardedRef) => {
	return (
		<NavMenu.Item>
			<NavMenu.Link
				className={clsx(styles.navMenuLink, className)}
				{...props}
				ref={forwardedRef}
				asChild
			>
				<Link href={href as string} prefetch={prefetch}>
					{children}
				</Link>
			</NavMenu.Link>
		</NavMenu.Item>
	);
});

NavLinkItem.displayName = "NavLinkItem";
export default NavLinkItem;
