import api from "@/lib/utils/api";

async function getMessage(): Promise<string> {
	const res = await api.get<string>("/demo/me");
	return res.data;
}

async function Demo() {
	const message = await getMessage();
	return (
		<div>
			<p>Demo: {message}</p>
			<form action="/api/demo/user" className="mb-10">
				<input
					type="text"
					required
					id="search_name"
					name="search_name"
					style={{ color: "black" }}
				/>
				<br />
				<button type="submit">Search Name</button>
			</form>
			<form method="post" action="/api/demo/add-user">
				<input
					type="text"
					required
					name="name"
					style={{ color: "black" }}
				/>
				<br />
				<br />
				<input
					type="text"
					required
					name="ucinetid"
					style={{ color: "black" }}
				/>
				<br />
				<br />
				<button type="submit">Submit</button>
			</form>
		</div>
	);
}

export default Demo;
