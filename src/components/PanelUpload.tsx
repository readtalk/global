"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { X } from "@phosphor-icons/react/dist/ssr";
import getCroppedMedia from "@/lib/cropMedia";

type PanelUploadProps = {
	file: File | null;
	onClose: () => void;
	onSave: (file: File) => void;
};

export default function PanelUpload({ file, onClose, onSave }: PanelUploadProps) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [isVideo, setIsVideo] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		if (file) {
			const url = URL.createObjectURL(file);
			setImageSrc(url);
			setIsVideo(file.type.startsWith("video/"));
			return () => URL.revokeObjectURL(url);
		}
	}, [file]);

	const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	const handleSave = async () => {
		if (!imageSrc || !croppedAreaPixels || !file) return;
		setIsProcessing(true);
		try {
			const croppedFile = await getCroppedMedia(imageSrc, croppedAreaPixels, isVideo ? "video" : "image");
			if (croppedFile) {
				onSave(croppedFile);
			}
		} catch (e) {
			console.error(e);
			alert("Failed to crop media.");
		} finally {
			setIsProcessing(false);
		}
	};

	if (!file || !imageSrc) return null;

	return (
		<div className="fixed inset-0 z-[100] bg-black flex flex-col">
			<div className="flex items-center justify-between p-4 bg-black text-white">
				<button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
					<X size={24} />
				</button>
				<h2 className="text-lg font-bold">Crop {isVideo ? "Video" : "Photo"}</h2>
				<button 
					onClick={handleSave} 
					disabled={isProcessing}
					className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
				>
					{isProcessing ? "Processing..." : "Save"}
				</button>
			</div>

			<div className="relative flex-1 w-full bg-zinc-950">
				<Cropper
					image={isVideo ? undefined : imageSrc}
					video={isVideo ? imageSrc : undefined}
					crop={crop}
					zoom={zoom}
					aspect={isVideo ? 9 / 16 : 1 / 1}
					onCropChange={setCrop}
					onCropComplete={onCropComplete}
					onZoomChange={setZoom}
					cropShape="rect"
				/>
			</div>

			<div className="p-6 bg-black text-white flex flex-col gap-4">
				<div className="flex items-center gap-4">
					<span className="text-sm font-medium w-12">Zoom</span>
					<input
						type="range"
						value={zoom}
						min={1}
						max={3}
						step={0.1}
						aria-labelledby="Zoom"
						onChange={(e) => setZoom(Number(e.target.value))}
						className="flex-1 accent-blue-500"
					/>
				</div>
			</div>
		</div>
	);
}
