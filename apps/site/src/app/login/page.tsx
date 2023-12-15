"use client";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Separator } from "@/components/ui/separator";

export const revalidate = 60;

const LOGIN_PATH = "/api/user/login";

const formSchema = z.object({
	email: z
		.string()
		.email({ message: "Sorry, that email address is invalid." }),
});

export default function Home() {
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = (e: z.infer<typeof formSchema>) => {
		console.log("submit", e);
		router.push(LOGIN_PATH);
	};

	return (
		<div className="flex flex-col justify-center items-center">
			<section className="m-36 w-2/3 xl:w-2/5">
				<h1 className="mb-10 text-4xl md:text-5xl font-bold text-center">
					Login
				</h1>
				<Separator className="mb-10" />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8 bg-gradient-radial to-blue-900 from-blue-950
                        py-10 px-10 rounded-md drop-shadow-lg"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-3xl">
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											className="text-black"
											placeholder="PeterTheAnteater@uci.edu"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										UCI students will log in with UCI SSO.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-1/5 h-14 hover:text-gray-500 active:text-black text-2xl
                             bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500
                             shadow-slate-500/50 shadow-lg hover:shadow-slate-500/80
                             hover:scale-105 transition ease-in"
						>
							Submit
						</Button>
					</form>
				</Form>
			</section>
		</div>
	);
}
