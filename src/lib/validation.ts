export function sanitizeString(input: unknown): string {
	if (typeof input !== "string") return "";
	return input.replace(/<[^>]*>/g, "").trim();
}

export function isValidEmail(email: unknown): boolean {
	if (!email || typeof email !== "string") return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email) && email.length <= 254;
}

export function isValidUsername(username: unknown): boolean {
	if (!username || typeof username !== "string") return false;
	const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
	return usernameRegex.test(username);
}

export function isValidPassword(password: unknown): boolean {
	if (!password || typeof password !== "string") return false;
	return password.length >= 8 && password.length <= 128;
}

export function isValidThreadTitle(title: unknown): boolean {
	if (!title || typeof title !== "string") return false;
	const rawLen = title.trim().length;
	const sanitizedLen = sanitizeString(title).length;
	return rawLen >= 3 && rawLen <= 200 && sanitizedLen >= 3;
}

export function isValidBody(body: unknown): boolean {
	if (!body || typeof body !== "string") return false;
	const rawLen = body.trim().length;
	const sanitizedLen = sanitizeString(body).length;
	return rawLen >= 1 && rawLen <= 10000 && sanitizedLen >= 1;
}

export function isValidPage(page: unknown): boolean {
	const pageNum = parseInt(page as string, 10);
	return !isNaN(pageNum) && pageNum > 0 && pageNum <= 10000;
}

export function isValidSearchQuery(query: unknown): boolean {
	if (!query || typeof query !== "string") return false;
	const sanitized = sanitizeString(query);
	return sanitized.length >= 1 && sanitized.length <= 100;
}

export function isValidSearchType(type: unknown): boolean {
	if (!type || typeof type !== "string") return false;
	const validTypes = ["threads", "posts", "all"];
	return validTypes.includes(type.toLowerCase());
}

export function validateRegistration(username: unknown, email: unknown, password: unknown) {
	const errors: string[] = [];
	if (!isValidUsername(username)) errors.push("Username must be 3-30 characters and contain only letters, numbers, and underscores");
	if (!isValidEmail(email)) errors.push("Invalid email address");
	if (!isValidPassword(password)) errors.push("Password must be at least 8 characters long");
	return { isValid: errors.length === 0, errors };
}

export function validateLogin(email: unknown, password: unknown) {
	const errors: string[] = [];
	if (!isValidEmail(email)) errors.push("Invalid email address");
	if (!password || (password as string).length === 0) errors.push("Password is required");
	return { isValid: errors.length === 0, errors };
}

export function validateThread(title: unknown, body: unknown) {
	const errors: string[] = [];
	if (!isValidThreadTitle(title)) errors.push("Title must be between 3 and 200 characters");
	if (!isValidBody(body)) errors.push("Body must be between 1 and 10000 characters");
	return {
		isValid: errors.length === 0,
		errors,
		sanitized: {
			title: sanitizeString(title),
			body: sanitizeString(body),
		},
	};
}

export function validatePost(body: unknown) {
	const errors: string[] = [];
	if (!isValidBody(body)) errors.push("Post must be between 1 and 10000 characters");
	return {
		isValid: errors.length === 0,
		errors,
		sanitized: {
			body: sanitizeString(body),
		},
	};
}
