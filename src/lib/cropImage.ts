export default async function getCroppedImg(
	imageSrc: string,
	pixelCrop: { x: number; y: number; width: number; height: number },
	fileType: "image" | "video"
): Promise<File | null> {
	const image = await createImage(imageSrc);
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		return null;
	}

	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height
	);

	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				resolve(null);
				return;
			}
			const file = new File([blob], `cropped-${Date.now()}.${fileType === "video" ? "mp4" : "jpeg"}`, {
				type: fileType === "video" ? "video/mp4" : "image/jpeg",
			});
			resolve(file);
		}, fileType === "video" ? "video/mp4" : "image/jpeg");
	});
}

const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.src = url;
	});
