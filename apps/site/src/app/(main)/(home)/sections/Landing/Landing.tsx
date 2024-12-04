"use client";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import haveApplicationsOpened from "@/lib/utils/haveApplicationsOpened";
import LandingUnopened from "./LandingUnopened";
import LandingUnlocked from "./LandingUnlocked";

const Landing = () => {
	const deadlinePassed = hasDeadlinePassed();
	const applicationsOpened = haveApplicationsOpened();

	if (deadlinePassed) return <LandingUnopened />;
	if (applicationsOpened) return <LandingUnlocked />;
	return <LandingUnlocked />;
};

export default Landing;
