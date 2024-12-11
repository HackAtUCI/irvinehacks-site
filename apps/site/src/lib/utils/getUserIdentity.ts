import axios from "axios";

import { Logger } from "next-axiom";

import api from "./api";

const log = new Logger();

export interface Identity {
	uid: string | null;
	roles: ReadonlyArray<string>;
	status: string | null;
}

export default async function getUserIdentity(): Promise<Identity> {
	try {
		const identity = await api.get<Identity>("/user/me");
		return identity.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			log.error(`[getUserIdentity] ${err.message}`);
		} else {
			// Don't think this case is possible/relevant but for completeness
			log.error(`Unknown error ${err}`);
		}

		await log.flush();
		return { uid: null, roles: [], status: null };
	}
}
