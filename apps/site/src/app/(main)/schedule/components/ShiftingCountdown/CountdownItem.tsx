import { AnimatePresence, motion } from "framer-motion";

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
};

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
					? "font-display flex flex-col gap-1 md:gap-2 items-center justify-center px-2 sm:px-3 md:px-4"
					: "font-display flex flex-col gap-1 md:gap-2 items-center justify-center"
			}
		>
			<div className="w-full p-1 text-center relative overflow-hidden">
				<AnimatePresence mode="popLayout">
					<motion.span
						variants={timerAnimVariants}
						className="flex text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-cyan-300 text-center flex-col justify-center items-center font-bold tracking-wider"
					>
						{`${isColon ? num : num.toString().padStart(2, "0")}`}
					</motion.span>
				</AnimatePresence>
			</div>
		</motion.div>
	);
};

export default CountdownItem;
