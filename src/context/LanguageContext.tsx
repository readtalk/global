"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LanguageCode =
	| "my"
	| "id"
	| "lo"
	| "ms"
	| "tl"
	| "tet"
	| "th"
	| "vi"
	| "km"
	| "pt"
	| "en-us"
	| "en-gb"
	| "zh"
	| "hi"
	| "ja"
	| "ko";

export type LanguageOption = {
	code: LanguageCode;
	label: string;
	nativeName: string;
};

export const LANGUAGES: LanguageOption[] = [
	{ code: "my", label: "Burmese", nativeName: "မြန်မာဘာသာ" },
	{ code: "id", label: "Indonesian", nativeName: "Bahasa Indonesia" },
	{ code: "lo", label: "Lao", nativeName: "ພາສາລາວ" },
	{ code: "ms", label: "Malay", nativeName: "Bahasa Melayu" },
	{ code: "tl", label: "Tagalog / Filipino", nativeName: "Tagalog" },
	{ code: "tet", label: "Tetum", nativeName: "Lia-Tetun" },
	{ code: "th", label: "Thai", nativeName: "ภาษาไทย" },
	{ code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt" },
	{ code: "km", label: "Khmer", nativeName: "ខ្មែរ" },
	{ code: "pt", label: "Portuguese", nativeName: "Português" },
	{ code: "en-us", label: "English (US)", nativeName: "English (US)" },
	{ code: "en-gb", label: "English (UK)", nativeName: "English (UK)" },
	{ code: "zh", label: "Mandarin", nativeName: "中文" },
	{ code: "hi", label: "Hindi", nativeName: "हिन्दी" },
	{ code: "ja", label: "Japanese", nativeName: "日本語" },
	{ code: "ko", label: "Korean", nativeName: "한국어" },
];

type LanguageContextType = {
	language: LanguageCode;
	setLanguage: (lang: LanguageCode) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageState] = useState<LanguageCode>("en-us");

	useEffect(() => {
		const savedLang = localStorage.getItem("language") as LanguageCode;
		if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) {
			setLanguageState(savedLang);
		} else {
			const browserLang = navigator.language.toLowerCase();
			if (browserLang.startsWith("id")) setLanguageState("id");
			else if (browserLang.startsWith("ms")) setLanguageState("ms");
			else if (browserLang.startsWith("zh")) setLanguageState("zh");
			else if (browserLang.startsWith("ja")) setLanguageState("ja");
			else if (browserLang.startsWith("ko")) setLanguageState("ko");
			else if (browserLang.startsWith("hi")) setLanguageState("hi");
			else if (browserLang.startsWith("th")) setLanguageState("th");
			else if (browserLang.startsWith("vi")) setLanguageState("vi");
			else if (browserLang === "en-gb") setLanguageState("en-gb");
			else setLanguageState("en-us");
		}
	}, []);

	const setLanguage = (lang: LanguageCode) => {
		setLanguageState(lang);
		localStorage.setItem("language", lang);
	};

	return (
		<LanguageContext.Provider value={{ language, setLanguage }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
