import { createContext } from "react";

const UserContext = createContext<Identity>({
	uid: null,
	role: null,
	status: null,
});

export interface Identity {
	uid: string | null;
	role: string | null;
	status: string | null;
}

export default UserContext;