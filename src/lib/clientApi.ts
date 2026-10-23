export class ClientApiError extends Error {
	status: number;
	data: unknown;

	constructor(message: string, status: number, data: unknown) {
		super(message);
		this.name = "ClientApiError";
		this.status = status;
		this.data = data;
	}
}

async function clientFetch(endpoint: string, options: RequestInit = {}) {
	try {
		const response = await fetch(endpoint, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new ClientApiError(
				data.message || data.error || "Request failed",
				response.status,
				data
			);
		}

		return data;
	} catch (error: unknown) {
		if (error instanceof ClientApiError) {
			throw error;
		}
		throw new ClientApiError(
			error instanceof Error ? error.message : "Network error",
			500,
			{ error: error instanceof Error ? error.message : "Unknown error" }
		);
	}
}

export const clientApi = {
	auth: {
		async login(email: string, password: string) {
			return clientFetch("/api/auth/login", {
				method: "POST",
				body: JSON.stringify({ login: email, password }),
			});
		},

		async register(username: string, email: string, password: string) {
			return clientFetch("/api/auth/register", {
				method: "POST",
				body: JSON.stringify({ username, email, password }),
			});
		},

		async forgotPassword(email: string) {
			return clientFetch("/api/auth/forgot-password", {
				method: "POST",
				body: JSON.stringify({ email }),
			});
		},

		async resetPassword({ email, password, oldPassword }: { email: string; password: string; oldPassword: string }) {
			return clientFetch("/api/auth/reset-password", {
				method: "POST",
				body: JSON.stringify({ email, password, oldPassword }),
			});
		},
	},

	threads: {
		async create({ title, slug, body, locked, pinned, tags, poll, extendedData }: Record<string, unknown>) {
			return clientFetch("/api/createThread", {
				method: "POST",
				body: JSON.stringify({ title, slug, body, locked, pinned, tags, poll, extendedData }),
			});
		},
	},

	posts: {
		async create({ body, threadId, parentId, extendedData }: Record<string, unknown>) {
			return clientFetch("/api/createPost", {
				method: "POST",
				body: JSON.stringify({ body, threadId, parentId, extendedData }),
			});
		},
	},

	search: {
		async query({ query, type, cursor }: { query: string; type: string; cursor?: string }) {
			return clientFetch("/api/search", {
				method: "POST",
				body: JSON.stringify({ query, type, cursor }),
			});
		},
	},
};
