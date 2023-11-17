"use client";

import React from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";
import clsx from "clsx";

import styles from "./Accordion.module.scss";

export const Root = React.forwardRef<
	React.ElementRef<typeof RadixAccordion.Root>,
	React.ComponentPropsWithoutRef<typeof RadixAccordion.Root>
>(({ children, className, ...props }, forwardedRef) => (
	<RadixAccordion.Root
		className={clsx(styles.root, className)}
		{...props}
		ref={forwardedRef}
	>
		{children}
	</RadixAccordion.Root>
));
Root.displayName = RadixAccordion.Root.displayName;

export const Item = React.forwardRef<
	React.ElementRef<typeof RadixAccordion.Item>,
	React.ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(({ children, className, ...props }, forwardedRef) => (
	<RadixAccordion.Item
		className={clsx(styles.item, className)}
		{...props}
		ref={forwardedRef}
	>
		{children}
	</RadixAccordion.Item>
));
Item.displayName = RadixAccordion.Item.displayName;

export const Trigger = React.forwardRef<
	React.ElementRef<typeof RadixAccordion.Trigger>,
	React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>
>(({ children, className, ...props }, forwardedRef) => (
	<RadixAccordion.Header>
		<RadixAccordion.Trigger
			className={clsx(styles.trigger, className)}
			{...props}
			ref={forwardedRef}
		>
			{children}
			<div className={styles.icons}>
				<Plus size={24} className={styles.plusIcon} aria-hidden />
				<Minus size={24} className={styles.minusIcon} aria-hidden />
			</div>
		</RadixAccordion.Trigger>
	</RadixAccordion.Header>
));
Trigger.displayName = "AccordionTrigger";

export const Content = React.forwardRef<
	React.ElementRef<typeof RadixAccordion.Content>,
	React.ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(({ children, className, ...props }, forwardedRef) => (
	<RadixAccordion.Content
		className={clsx(styles.content, className)}
		{...props}
		ref={forwardedRef}
	>
		<div className={styles.contentPadding}>{children}</div>
	</RadixAccordion.Content>
));
Content.displayName = RadixAccordion.Content.displayName;
