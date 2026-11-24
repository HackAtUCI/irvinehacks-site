"use client";
import { useState } from "react";
import Image from "next/image";
import { teamMembers } from "@/lib/data/team";

import linkedinIcon from "@/assets/team/linkedin.svg";
import pink from "@/assets/team/made-with-love.svg";
import orange from "@/assets/team/orange-tag.svg";
import petrSoda from "@/assets/team/petr-soda.svg";
import roundLogo from "@/assets/team/round-logo.svg";
import pushpin from "@/assets/team/pushpin.svg";


import teamNav from "@/assets/team/team-nav.svg";
import torn0 from "@/assets/team/torn-0.svg";
import torn1 from "@/assets/team/torn-1.svg";
import torn2 from "@/assets/team/torn-2.svg";
import torn3 from "@/assets/team/torn-3.svg";

import corkboard from "@/assets/team/corkboard-texture.png";


import stubCorp from "@/assets/team/stub-corporate.svg";
import stubDes from "@/assets/team/stub-design.svg";
import stubLog from "@/assets/team/stub-logistics.svg";
import stubMark from "@/assets/team/stub-marketing.svg";
import stubTech from "@/assets/team/stub-tech.svg";

import tornCorp from "@/assets/team/torn-corp.svg";
import tornDes from "@/assets/team/torn-des.svg";
import tornLog from "@/assets/team/torn-log.svg";
import tornMark from "@/assets/team/torn-mark.svg";
import tornTech from "@/assets/team/torn-tech.svg";

type Committee = "Logistics" | "Corporate" | "Marketing" | "Design" | "Tech";

export default function Teamsection() {
    const [selectedCommittee, setSelectedCommittee] = useState<Committee>("Logistics");
    const members = teamMembers[selectedCommittee];
    const directors = members.filter((m) => m.position.includes("Director"));
    const organizers = members.filter((m) => m.position.includes("Organizer"));
    const interns = members.filter((m) => m.position.includes("Intern"));
    return (
        <section>
            { /* main content */ }
            <div className="mx-auto flex w-full max-w-[960px] flex-col items-center px-4 py-14 sm:px-8 lg:py-20">
                { /* staff only sign */ }
                <div className="mb-8 rounded-[9.212px] bg-ink px-7 py-2.5 shadow-md">
                    <span className="font-geo text-[22px] text-white">
                        STAFF ONLY
                    </span>
                </div>

                { /* corkboard */}
                { /*TODO: FIX TO ADD CORKBOARD TEXURE */}
                { /*TODO: FIX PLACEMENT OF THE STICKERS */}
                <div className="relative w-full border-[8px] border-[#3B2820] bg-[#B39B84] px-4 pb-16 pt-8 shadow-xl sm:px-10">
                    <Image
                        src={petrSoda}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-4 -top-16 z-20 w-[110px] sm:-right-8 sm:-top-24 sm:w-[155px]"
                    />
                    <Image 
                        src={orange}
                        alt="Hack @ UCI est. 2013"
                        className="pointer-events-none absolute left-4 top-8 hidden w-[95px] -rotate-[4deg] sm:block"
                        
                    />
                    <Image 
                        src={pink}
                        alt="Made with love"
                        className="pointer-events-none absolute left-6 top-28 hidden w-[64px] sm:block"
                    />
                    <Image 
                        src={roundLogo}
                        alt="IrvineHacks 2027"
                        className="pointer-events-none absolute right-4 top-14 hidden w-[110px] rotate-[6deg] sm:block"
                    />
                    {/* tear-away flyer */}
                    <div className="relative mx-auto mb-12 flex max-w-[380px] flex-col items-center">
                        {/* main header and pushpins */}
                        <div className="relative z-10 w-full">
                            <Image
                                src={teamNav}
                                alt="Meet the Team!"
                                className="h-auto w-full drop-shadow-md"
                            />
                            <Image
                                src={pushpin}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute -top-3 left-[4%] w-[28px]"
                            />
                            <Image
                                src={pushpin}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute top-3 right-[3%] w-[28px]"
                            />
                            {/*jagged edges L to R*/}
                            <Image
                                src={torn3}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute left-[-0.3%] top-[79%] w-[30%]"
                            />
                            <Image
                                src={torn1}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute left-[39%] top-[85%] w-[10.5%]"
                            />
                            <Image
                                src={torn0}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute left-[58.5%] top-[88.5%] w-[10.5%] rotate-[4deg]"
                            />
                            <Image
                                src={torn2}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute left-[78%] top-[91%] w-[10.5%] rotate-[4deg]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}