"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import BarLoader from "../BarLoader";
import clsx from "clsx";

import styles from "./ShiftingCountdown.module.scss"

// NOTE: Change this date to whatever date you want to countdown to :)
const COUNTDOWN_FROM = "12/31/2023";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const ShiftingCountdown = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showTimer, setShowTimer] = useState(false);

  const [remaining, setRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    intervalRef.current = setInterval(handleCountdown, 1000);

    return () => clearInterval(intervalRef.current || undefined);
  }, []);
  

  const handleCountdown = () => {
    const end = new Date(COUNTDOWN_FROM);

    const now = new Date();

    const distance = +end - +now;

    const days = Math.floor(distance / DAY);
    const hours = Math.floor((distance % DAY) / HOUR);
    const minutes = Math.floor((distance % HOUR) / MINUTE);
    const seconds = Math.floor((distance % MINUTE) / SECOND);

    setRemaining({
      days,
      hours,
      minutes,
      seconds,
    });
    setShowTimer(true);
  };

  return (
    <div className="p-4">
        {
            !showTimer ? (
                    <div className="w-full flex justify-center">
                        <BarLoader/>
                    </div>
            ) : (
                <div className="w-full max-w-5xl mx-auto flex items-center">
                    <CountdownItem num={remaining.days} text="days " />
                    <CountdownItem num={remaining.hours} text="hours" />
                    <CountdownItem num={remaining.minutes} text="minutes" />
                    <CountdownItem num={remaining.seconds} text="seconds" />
                </div>
            )
        }
    </div>
    )
};

const CountdownItem = ({ num, text }: { num: number; text: string }) => {
  return (
    <motion.div className="font-mono w-1/4 h-24 md:h-36 flex flex-col gap-1 md:gap-2 items-center justify-center border-slate-200">
      <div className="w-full p-1 text-center relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={num}
            initial={{ y: "100%"}}
            animate={{ y: "0%"}}
            exit={{ y: "-100%" }}
            transition={{ ease: "backIn", duration: 0.75 }}
            className={clsx( "block text-2xl md:text-4xl lg:text-6xl xl:text-7xl text-white font-medium", styles.text)}
          >
            {num}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={clsx("text-xs md:text-sm lg:text-base font-light text-slate-500", styles.subtext)}>
        {text}
      </span>
    </motion.div>
  );
};

export default ShiftingCountdown;