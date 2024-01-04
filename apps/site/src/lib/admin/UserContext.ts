import { createContext } from "react";

import { Identity } from "@/lib/utils/getUserIdentity";

const UserContext = createContext<Identity>({
	uid: null,
	role: null,
	status: null,
});

export default UserContext;
