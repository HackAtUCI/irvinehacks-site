/* eslint-disable no-mixed-spaces-and-tabs */
"use client";

import EventProps from "../EventProps";
import DesktopSchedulePage from "./DesktopSchedulePage";

import "./SchedulePage.scss";

interface ScheduleProps {
	schedule: EventProps[][];
}

export default function SchedulePage({ schedule }: ScheduleProps) {
	return <DesktopSchedulePage schedule={schedule} />;
}
