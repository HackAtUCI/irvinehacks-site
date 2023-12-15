"use client";
import { useForm } from "react-hook-form";
import {
	Form,
	FormItem,
	FormControl,
	FormDescription,
	FormLabel,
	FormField,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const EDU_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.edu)$/;
const LOGIN_PATH = "/api/user/login";

export default function Home() {
	const form = useForm({
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = (e: any) => {
		console.log("submit", e);
	};

	return (
		<div className="flex flex-col justify-center items-center">
			<section className="m-36 w-2/3 md:w-1/3">
				<h1 className="mb-10 text-4xl md:text-5xl font-bold text-center">
					Login
				</h1>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8 bg-gradient-radial to-blue-900 from-blue-950 p-5 rounded-md"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											className="text-black"
											placeholder="PeterTheAnteater@uci.edu"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										(Description) This is your public
										display name.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</Form>
			</section>
		</div>
	);
}
