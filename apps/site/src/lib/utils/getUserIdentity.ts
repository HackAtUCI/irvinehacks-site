import axios from "axios";

import api from "./api";

export interface Identity {
	uid: string | null;
	role: string | null;
	status: string | null;
}

export default async function getUserIdentity(): Promise<Identity> {
	try {
		const identity = await api.get<Identity>("/user/me");
		return identity.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			console.error(
				`[getUserIdentity] ${err.message}: ${err.response?.data}`,
			);
		} else {
			// Don't think this case is possible/relevant but for completeness
			console.error(err);
		}
		return { uid: null, role: null, status: null };
	}
}
