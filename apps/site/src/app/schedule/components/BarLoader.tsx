import {motion, Variants} from "framer-motion"


const variants = {
    initial: {
      scaleY: 0.5,
      opacity: 0,
    },
    animate: {
      scaleY: 1,
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "mirror",
        duration: 1,
        // ease: "circIn",
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
        <motion.div variants={variants} className="h-20 w-4 bg-white" />
        <motion.div variants={variants} className="h-20 w-4 bg-white" />
        <motion.div variants={variants} className="h-20 w-4 bg-white" />
        <motion.div variants={variants} className="h-20 w-4 bg-white" />
        <motion.div variants={variants} className="h-20 w-4 bg-white" />
      </motion.div>
    );
  };
  
  export default BarLoader;