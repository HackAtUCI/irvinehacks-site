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
			<form method="post" action="/api/demo/square">
				<input type="number" required name="value" style={{ color: "black" }} />
				<button type="submit">Submit</button>
			</form>
		</div>
	);
}

export default Demo;
