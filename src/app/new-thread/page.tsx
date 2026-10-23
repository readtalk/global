"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { clientApi } from "@/lib/clientApi";

export default function NewThread() {
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const [isSubmitting, setSubmittingState] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		body: "",
	});

	useEffect(() => {
		const titleQuery = searchParams.get("title");
		if (titleQuery) {
			setFormData((prev) => ({
				...prev,
				title: titleQuery,
			}));
		}
	}, [searchParams]);

	const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmittingState(true);
		try {
			const data = await clientApi.threads.create({
				title: formData.title,
				body: formData.body,
			});

			setSubmittingState(false);

			if (data?.id) {
				alert("Thread successfully created!");
				router.push(`/thread/${data.id}`);
			} else if (data?.message) {
				alert(data.message);
			}
		} catch (error: unknown) {
			console.error("Error creating thread:", error);
			setSubmittingState(false);
			alert(error instanceof Error ? error.message : "An error occurred while creating the thread.");
		}
	};

	return (
		<>
			<div className="flex flex-no-wrap">
				<Sidebar />
				<div className="flex flex-row w-full">
					<div className="flex flex-col lg:w-full items-center justify-center mx-auto md:h-screen lg:py-0">
						<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
							<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
								<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
									Post a new thread
								</h1>
								<form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
									<div>
										<label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
											Title
										</label>
										<input
											onChange={onChange}
											type="text"
											name="title"
											value={formData.title}
											id="title"
											className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
											placeholder="Thread title"
											required
										/>
									</div>

									<div>
										<label htmlFor="body" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
											Body
										</label>
										<textarea
											onChange={onChange}
											name="body"
											id="body"
											rows={7}
											value={formData.body}
											className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
											placeholder="Thread body"
											required
										></textarea>
									</div>

									<button
										type="submit"
										disabled={isSubmitting}
										aria-busy={isSubmitting}
										className="w-full text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-700"
									>
										{isSubmitting ? "Submitting..." : "Submit thread"}
									</button>
								</form>
							</div>
						</div>
						<Link href="/" className="text-blue-600 hover:underline mt-5">
							Back to the forums
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}
