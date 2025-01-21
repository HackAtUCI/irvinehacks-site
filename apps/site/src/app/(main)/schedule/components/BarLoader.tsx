import { motion, Variants } from "framer-motion";
import { Swords } from "lucide-react";

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
			<motion.div variants={variants} className="w-20 h-20">
				<Swords className="w-full h-full" />
			</motion.div>
			<motion.div variants={variants} className="w-20 h-20">
				<Swords className="w-full h-full" />
			</motion.div>
			<motion.div variants={variants} className="w-20 h-20">
				<Swords className="w-full h-full" />
			</motion.div>
			<motion.div variants={variants} className="w-20 h-20">
				<Swords className="w-full h-full" />
			</motion.div>
			<motion.div variants={variants} className="w-20 h-20">
				<Swords className="w-full h-full" />
			</motion.div>
		</motion.div>
	);
};

export default BarLoader;
