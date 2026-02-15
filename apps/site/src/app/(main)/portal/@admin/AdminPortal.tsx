import Link from "next/link";

function AdminPortal() {
	return (
		<div className="bg-white text-black text-center max-w-4xl rounded-2xl p-6 w-full">
			<p className="py-10 my-0">
				Welcome to the Admin portal. Please visit the{" "}
				<Link
					href="/admin/dashboard"
					className="font-bold text-lg text-pink hover:underline"
				>
					Admin Dashboard
				</Link>
				.
			</p>
		</div>
	);
}

export default AdminPortal;
