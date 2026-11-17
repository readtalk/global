"use client";

import { usePathname } from "next/navigation";
import Overlayout from "@/components/ai/Overlayout";
import AiChatPage from "@/app/chats/ai/page";
import ChatRoomPage from "@/app/chats/[id]/page";

export default function DesktopPanel() {
	const pathname = usePathname();

	if (pathname.startsWith("/chats/ai")) {
		return (
			<Overlayout>
				<AiChatPage />
			</Overlayout>
		);
	}

	if (pathname.startsWith("/chats/") && pathname !== "/chats" && pathname !== "/chats/") {
		return (
			<Overlayout>
				<ChatRoomPage />
			</Overlayout>
		);
	}

	return null;
}
