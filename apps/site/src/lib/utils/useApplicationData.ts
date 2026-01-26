import axios from "axios";
import useSWR from "swr";

interface CharacterIndexes {
	character_head_index: number;
	character_body_index: number;
	character_feet_index: number;
	character_companion_index: number;
}

export interface ApplicationData {
	application_data: CharacterIndexes | null;
}

const fetcher = async (url: string) => {
	const res = await axios.get<ApplicationData>(url);
	return res.data;
};

function useApplicationData() {
	const { data } = useSWR<ApplicationData>("/api/user/application", fetcher);

	return data;
}

export default useApplicationData;
