	const handlePost = async () => {
		if (!content.trim()) return;
		const token = localStorage.getItem("session");
		if (!token) {
			alert("You must be logged in to post.");
			return;
		}

		setIsPosting(true);
		try {
			const res = await fetch("/api/updates", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify({ content }),
			});
			
			const data = (await res.json()) as { error?: string };
			if (res.ok) {
				setContent("");
				fetchData();
			} else {
				alert(`Gagal: ${data.error}`);
			}
		} catch (error: unknown) {
			console.error("Failed to post", error);
			alert(`Error Catch: ${error instanceof Error ? error.message : "Unknown"}`);
		} finally {
			setIsPosting(false);
		}
	};
