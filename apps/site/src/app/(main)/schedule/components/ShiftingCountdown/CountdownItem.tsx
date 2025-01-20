import { AnimatePresence, motion, Variants } from "framer-motion";
import clsx from "clsx";

import styles from "./ShiftingCountdown.module.scss";

const timerAnimVariants = {
	initial: {
		y: "100%",
	},
	animate: {
		y: "0%",
		transition: {
			duration: 0.7,
		},
	},
} as Variants;

const CountdownItem = ({
	num,
	isColon,
}: {
	num: number | string;
	isColon: boolean;
}) => {
	return (
		<motion.div
			className={
				isColon
					? "font-display flex flex-col gap-1 md:gap-2 items-center justify-center pl-5 pr-5"
					: "font-display flex flex-col gap-1 md:gap-2 items-center justify-center border-slate-200 whitespace-normal"
			}
		>
			<div className="w-full p-1 text-center relative overflow-hidden">
				<AnimatePresence mode="popLayout">
					<motion.span
						variants={timerAnimVariants}
						className={clsx(
							"flex text-2xl sm:text-4xl md:text-6xl xl:text-9xl text-white text-center flex-col justify-center items-center",
							styles.text,
						)}
					>
						{`${isColon ? num : num.toString().padStart(2, "0")}`}
					</motion.span>
				</AnimatePresence>
			</div>
		</motion.div>
	);
};

export default CountdownItem;
