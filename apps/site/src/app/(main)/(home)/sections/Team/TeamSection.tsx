"use client";
import { useState } from "react";
import Image from "next/image";
import { teamMembers } from "@/lib/data/team";

import linkedinIcon from "@/assets/team/linkedin.svg";
import pink from "@/assets/team/made-with-love.svg";
import orange from "@/assets/team/orange-tag.svg";
import petrSoda from "@/assets/team/soda-mascot.svg";
import roundLogo from "@/assets/team/round-logo.svg";
import pushpin from "@/assets/team/pushpin.svg";


import teamNav from "@/assets/team/team-nav.svg";
import torn0 from "@/assets/team/torn-0.svg";
import torn1 from "@/assets/team/torn-1.svg";
import torn2 from "@/assets/team/torn-2.svg";
import torn3 from "@/assets/team/torn-3.svg";



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
            <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center px-4 py-14 sm:px-8 lg:py-20">
                { /* staff only sign */ }
                <div className="mb-8 rounded-md bg-ink px-7 py-2.5 shadow-md">
                    <span className="font-geo text-[22px] text-white">
                        STAFF ONLY
                    </span>
                </div>
            </div>
        </section>
    )
}