"use client";

import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react/dist/ssr";

type MediaViewerProps = {
	url: string | null;
	type: "image" | "video" | null;
	onClose: () => void;
};

export default function MediaViewer({ url, type, onClose }: MediaViewerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(true);
	const [progress, setProgress] = useState(0);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (type === "video" && videoRef.current) {
			videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
		}
		if (!url) {
			setIsPlaying(false);
			setProgress(0);
		}
	}, [url, type]);

	const togglePlay = () => {
		if (!videoRef.current) return;
		if (isPlaying) {
			videoRef.current.pause();
		} else {
			videoRef.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	const toggleMute = () => {
		if (!videoRef.current) return;
		videoRef.current.muted = !isMuted;
		setIsMuted(!isMuted);
	};

	const handleTimeUpdate = () => {
		if (!videoRef.current) return;
		const current = videoRef.current.currentTime;
		const duration = videoRef.current.duration;
		if (duration > 0) {
			setProgress((current / duration) * 100);
		}
	};

	if (!url || !type) return null;

	return (
		<div className="fixed inset-0 z-[200] bg-black flex flex-col justify-center items-center">
			<div className="absolute top-4 left-4 z-10 flex items-center gap-4">
				<button onClick={onClose} className="p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors">
					<X size={24} />
				</button>
			</div>

			<div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
				{type === "image" ? (
					<img src={url} alt="Media" className="max-w-full max-h-full object-contain" />
				) : (
					<div className="relative w-full max-w-[400px] aspect-[9/16] bg-black overflow-hidden flex items-center justify-center">
						<video
							ref={videoRef}
							src={url}
							className="w-full h-full object-cover"
							loop
							playsInline
							muted={isMuted}
							onTimeUpdate={handleTimeUpdate}
							controls={false}
							onClick={togglePlay}
							onContextMenu={(e) => e.preventDefault()}
						/>
						
						{!isPlaying && (
							<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
								<button onClick={togglePlay} className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white pointer-events-auto hover:bg-white/30 transition-colors">
									<Play size={40} weight="fill" />
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{type === "video" && (
				<div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2">
					<div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
						<div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
					</div>
					<div className="flex items-center justify-between text-white">
						<div className="flex items-center gap-4">
							<button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-full transition-colors">
								{isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
							</button>
							<button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-full transition-colors">
								{isMuted ? <SpeakerSlash size={24} /> : <SpeakerHigh size={24} />}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
