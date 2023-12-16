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
import { cn } from "@/lib/utils/utils";

import ButtonStyles from "@/lib/components/Button/Button.module.css";

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
		router.push(LOGIN_PATH);
	};

	return (
		<div className="flex flex-col justify-center items-center min-h-screen">
			<section className="m-36 w-2/3 xl:w-2/5">
				<h1 className="mb-10 text-4xl md:text-5xl font-bold text-center">
					Login
				</h1>
				<Separator className="mb-10" />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8 bg-white
                        py-10 px-10 rounded-md drop-shadow-lg"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xl md:text-3xl text-slate-800 underline underline-offset-4">
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											className="text-black text-xs sm:text-base -translate-x-1 bg-slate-200"
											placeholder="PeterAnteater@uci.edu"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-xs">
										UCI students will log in with UCI SSO.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className={cn(
								"h-14 text-2xl shadow-lg hover:scale-105 transition ease-in",
								ButtonStyles.button,
							)}
						>
							Submit
						</Button>
					</form>
				</Form>
			</section>
		</div>
	);
}
