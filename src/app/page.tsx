import { redirect } from "next/navigation";

export default function Home() {
	const id = crypto.randomUUID();
	redirect(`/${id}`);
}
