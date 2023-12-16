import api from "./api";

export interface Identity {
	uid: string | null;
	role: string | null;
	status: string | null;
}

export default async function getUserIdentity() {
	const identity = await api.get<Identity>("/user/me").catch((err) => {
		console.log(err);
		return { data: { uid: null, role: null, status: null } };
	});
	return identity.data;
}
