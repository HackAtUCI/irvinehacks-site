import api from "@/lib/utils/api";

async function getIdentity(): Promise<string> {
	const res = await api.get<string>("/user/me");
	return res.data;
}

async function Portal() {
	const identity = await getIdentity();
	return (
		<div className="min-h-screen flex flex-col justify-center bg-white text-black">
			<h1>Hello</h1>
			{Object.entries(identity).map(([key, value]) => (
				<p key={key}>
					{key} - {value}
				</p>
			))}
		</div>
	);
}

export default Portal;
