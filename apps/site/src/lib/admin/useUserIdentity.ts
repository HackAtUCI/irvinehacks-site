import { useEffect, useState } from "react";

import axios from "axios";

import { Identity } from "@/lib/utils/getUserIdentity";

function useUserIdentity(): Identity | undefined {
	const [identity, setIdentity] = useState<Identity | undefined>();

	useEffect(() => {
		const getIdentity = async () => {
			const res = await axios.get(`/api/user/me`);
			const identity = res.data;
			setIdentity(identity);
		};

		getIdentity();
	}, []);

	return identity;
}

export default useUserIdentity;
