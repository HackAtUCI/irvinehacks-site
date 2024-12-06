import { createContext } from "react";

import { Identity } from "@/lib/utils/getUserIdentity";

const UserContext = createContext<Identity>({
	uid: null,
	roles: [],
	status: null,
});

export default UserContext;
