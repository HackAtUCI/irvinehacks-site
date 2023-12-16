"use client";

import React from "react";
import UserContext from "@/lib/utils/userContext";
import Navbar from "@/lib/components/Navbar/Navbar";
import { Layout } from "@/components/dom/Layout";
import Footer from "@/lib/components/Footer/Footer";

export default function App({ children }: { children: React.ReactNode }) {
    return (
        <UserContext.Provider value={{ uid: "test", role: "test", status: "test" }}>
            <Navbar />
            <Layout>{children}</Layout>
            <Footer />
        </UserContext.Provider>
    )
}