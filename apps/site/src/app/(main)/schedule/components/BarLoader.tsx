import { motion, Variants } from "framer-motion";
import { SwordsIcon } from "lucide-react";

const variants = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 0.7,
		transition: {
			repeat: Infinity,
			repeatType: "mirror",
			duration: 0.5,
		},
	},
} as Variants;

const BarLoader = () => {
	return (
		<motion.div
			transition={{
				staggerChildren: 0.2,
			}}
			initial="initial"
			animate="animate"
			className="flex gap-2"
		>
			{Array(5)
				.fill(0)
				.map((_, i) => (
					<motion.div key={i} variants={variants} className="w-20 h-20">
						<SwordsIcon className="w-full h-full" />
					</motion.div>
				))}
		</motion.div>
	);
};

export default BarLoader;
