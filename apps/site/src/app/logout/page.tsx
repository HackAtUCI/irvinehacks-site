import Router from "next/router";

export default function Logout() {
	Router.push("/api/user/logout");
}
