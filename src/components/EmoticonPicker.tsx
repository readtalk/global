"use client";

import React, { useMemo, useState } from "react";

type Props = {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  defaultSkinTone?: SkinTone;
  mode?: "popover" | "bottom-sheet";
};

type SkinTone = "🏻" | "🏼" | "🏽" | "🏾" | "🏿";

const SKIN_TONES: SkinTone[] = ["🏻", "🏼", "🏽", "🏾", "🏿"];

const BLOCKED_SUBSTRINGS = [
  "🏳️‍🌈",
  "🏳️‍⚧️",
  "⚧",
  "👩‍❤️‍👩",
  "👨‍❤️‍👨",
  "🧑‍❤️‍🧑",
  "👩‍❤️‍💋‍👩",
  "👨‍❤️‍💋‍👨",
  "🧑‍❤️‍💋‍🧑",
  "👩‍👩‍👦",
  "👩‍👩‍👧",
  "👨‍👨‍👦",
  "👨‍👨‍👧",
  "🫃",
  "🫄",
  "🤱",
  "👰‍♂️",
  "🤵‍♀️",
  "🧔‍♀️",
  "👨‍🍼",
  "🧑‍🍼",
];

function isBlocked(emoji: string): boolean {
  return BLOCKED_SUBSTRINGS.some((b) => emoji.includes(b));
}

const SMILEYS = "😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🫣🤭🫢🫡🤫🫠🤥😶🫥😐🫤😑🫨😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾".split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);
const ANIMALS = "💐🌹🥀🌺🌷🪷🌸💮🏵🪻🌻🌼🍂🍁🍄🌾🌿🌱🍃☘️🍀🪴🌵🌴🌳🌲🙈🙉🙊🐵🦁🐯🐱🐶🐺🐻🐨🐼🐹🐭🐰🦊🐮🐷🐽🐗🦄🐴🐲🦎🐉🦖🦕🐢🐊🐍🐸🐇🐁🐀🐈🐩🐕🦮🐖🐎🐄🐂🐃🦬🐏🐑🐐🦌🦙🦥🦘🦓🐘🦣🦏🦛🦒🐆🐅🐒🦍🦧🐪🐫🐿🦫🦝🦨🦡🦔🦦🦇🪽🪶🐦🐓🐔🐣🐤🐥🦅🦉🦜🕊🦤🦢🦆🪿🦩🦚🦃🐧🦭🦈🐬🐋🐳🐟🐠🐡🦐🦞🦀🦑🐙🪼🦪🪸🦂🕷🕸🐚🐌🐜🦗🪲🦟🪳🪰🐝🐞🦋🐛🪱🦠🐾".split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);
const FOOD = "🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🫛🥦🥬🥒🌶🫑🌽🥕🫒🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🫓🥪🥙🧆🌮🌯🫔🥗🥘🫕🥫🍝🍜🍲🍛🍣🍱🥟🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🫗🍼🫖☕🍵🧃🥤🧋🍶🍺🍻🥂🍷🥃🍸🍹🧉🍾🧊🥄🍴🍽🥣🥡🥢🧂".split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);
const ACTIVITIES = "⚽🏀🏈⚾🥎🎾🏐🏉🥏🎱🪀🏓🏸🏒🏑🥍🏏🪃🥅⛳🪁🛝🏹🎣🤿🥊🥋🎽🛹🛼🛷⛸️🥌🎿⛷️🏂🪂🤺🏆🥇🥈🥉🏅🎖🎗🎫🎟🎪🎭🩰🎨🎬🎤🎧🎼🎹🪇🥁🪘🎷🎺🪊🪗🎸🪕🪉🎻🪈🎲♟️🎯🎳🎮🎰🧩".split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);
const TRAVEL = "🚗🚕🚙🚌🚎🏎🚓🚑🚒🚐🛻🚚🚛🚜🛴🚲🛵🏍🛺🚨🚔🚍🚘🚖🚡🚠🚟🚃🚋🚞🚝🚄🚅🚈🚂🚆🚇🚊🚉✈️🛫🛬🛩💺🛰🚀🛸🚁🛶⛵🚤🛥🛳⛴️🚢🛟⚓⛽🚧🚦🚥🚏🗺🗿🗽🗼🏰🏯🏟🎡🎢🎠⛲⛱️🏖🏝🏜🌋⛰️🏔🗻🏕⛺🛖🏠🏡🏘🏚🏗🏭🏢🏬🏣🏤🏥🏦🏨🏪🏫🏩💒🏛⛪🕌🕍🛕🕋⛩️🛤🛣🗾🎑🏞🌅🌄🌠🎇🎆🌇🌆🏙🌃🌌🌉🌁".split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);
const OBJECTS = "⌚📱📲💻⌨️🖥🖨🖱🖲🕹🗜💽💾💿📀📼📷📸📹🎥📽🎞📞☎️📟📠📺📻🎙🎚🎛🧭⏱️⏲️⏰🕰⌛⏳📡🔋🔌💡🔦🕯🪔🧯🛢💸💵💴💶💷🪙💰💳🪪💎🪎⚖️🧰🪛🔧🔨⚒️🛠⛏️🪏🪚🔩⚙️🧱⛓️🔫💣🧨🪓🔪🗡⚔️🛡🚬⚰️🪦⚱️🏺🔮📿🧿🪬💈⚗️🔭🔬🕳🩻🩹🩺💊💉🩸🧬🧫🧪🌡🧹🪠🧺🧻🚽🚰🚿🛁🧼🪥🪒🧽🪣🧴🛎🔑🗝🚪🪑🛋🛏🧸🪆🖼🪞🪟🛍🛒🎁🎈🎏🎀🪄🪅🎊🎉🎎🪭🏮🎐🪩🧧✉️📩📨📧💌📥📤📦🏷🪧📪📫📬📭📮📯📜📃📄📑🧾📊📈📉🗒🗓📆📅🗑📇🗃🗳🗄📋📁📂🗂🗞📰📓📔📒📕📗📘📙📚📖🔖🧷🔗📎🖇📐📏🧮📌📍✂️🖊🖋✒️🖌🖍📝✏️🔍🔎🔏🔐🔒🔓".split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);
const SYMBOLS = "🩷❤️🧡💛💚🩵💙💜🖤🩶🤍🤎💔💕💞💓💗💖💘💝💟☮️✝️☪️🕉☸️🪯✡️🔯🕎☯️☦️🛐⛎♈♉♊♋♌♍♎♏♐♑♒♓🆔⚛️☢️☣️📴📳🈶🈚🈸🈺🈷✴️🆚💮🉐㊙️㊗️🈴🈵🈹🈲🅰🅱🆎🆑🅾🆘❌⭕🛑⛔📛🚫💯💢♨️🚷🚯🚳🚱🔞📵🚭❗❕❓❔‼️⁉️🔅🔆〽️⚠️🚸🔱⚜️🔰♻️✅🈯💹❇️✳️❎🌐💠🔶🔷🔸🔹".split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);

const PEOPLE_BASE = ["👶","👧","🧒","👦","👩","🧑","👨","👩‍🦱","🧑‍🦱","👨‍🦱","👩‍🦰","🧑‍🦰","👨‍🦰","👱‍♀️","👱","👱‍♂️","👩‍🦳","🧑‍🦳","👨‍🦳","👩‍🦲","🧑‍🦲","👨‍🦲","🧔","🧔‍♂️","👵","🧓","👴","👲","👳‍♀️","👳","👳‍♂️","🧕"];
const PROFESSION_BASE = ["👮‍♀️","👮","👮‍♂️","👷‍♀️","👷","👷‍♂️","💂‍♀️","💂","💂‍♂️","🕵‍♀️","🕵","🕵‍♂️","👩‍⚕️","🧑‍⚕️","👨‍⚕️","👩‍🌾","🧑‍🌾","👨‍🌾","👩‍🍳","🧑‍🍳","👨‍🍳","👩‍🎓","🧑‍🎓","👨‍🎓","👩‍🎤","🧑‍🎤","👨‍🎤","👩‍🏫","🧑‍🏫","👨‍🏫","👩‍🏭","🧑‍🏭","👨‍🏭","👩‍💻","🧑‍💻","👨‍💻","👩‍💼","🧑‍💼","👨‍💼","👩‍🔧","🧑‍🔧","👨‍🔧","👩‍🔬","🧑‍🔬","👨‍🔬","👩‍🎨","🧑‍🎨","👨‍🎨","👩‍🚒","🧑‍🚒","👨‍🚒","👩‍✈️","🧑‍✈️","👨‍✈️","👩‍🚀","🧑‍🚀","👨‍🚀","👩‍⚖️","🧑‍⚖️","👨‍⚖️"];
const FANTASY_BASE = ["👰‍♀️","👰","🤵","🤵‍♂️","👸","🫅","🤴","🥷","🦸‍♀️","🦸","🦸‍♂️","🦹‍♀️","🦹","🦹‍♂️","🤶","🧑‍🎄","🎅","🧙‍♀️","🧙","🧙‍♂️","🧝‍♀️","🧝","🧝‍♂️","🧌","🧛‍♀️","🧛","🧛‍♂️","🧟‍♀️","🧟","🧟‍♂️","🧞‍♀️","🧞","🧞‍♂️","🧜‍♀️","🧜","🧜‍♂️","🧚‍♀️","🧚","🧚‍♂️","👼","🤰"];
const GESTURE_BASE = ["🙇‍♀️","🙇","🙇‍♂️","💁‍♀️","💁","💁‍♂️","🙅‍♀️","🙅","🙅‍♂️","🙆‍♀️","🙆","🙆‍♂️","🙋‍♀️","🙋","🙋‍♂️","🧏‍♀️","🧏","🧏‍♂️","🤦‍♀️","🤦","🤦‍♂️","🤷‍♀️","🤷","🤷‍♂️","🙎‍♀️","🙎","🙎‍♂️","🙍‍♀️","🙍","🙍‍♂️","💇‍♀️","💇","💇‍♂️","💆‍♀️","💆","💆‍♂️","🧖‍♀️","🧖","🧖‍♂️","💅","🤳","💃","🕺","🧑‍🩰","👯‍♀️","👯","👯‍♂️","🕴"];
const ACTIVITY_PEOPLE_BASE = ["👩‍🦽","🧑‍🦽","👨‍🦽","👩‍🦼","🧑‍🦼","👨‍🦼","🚶‍♀️","🚶","🚶‍♂️","👩‍🦯","🧑‍🦯","👨‍🦯","🧎‍♀️","🧎","🧎‍♂️","🏃‍♀️","🏃","🏃‍♂️","🧍‍♀️","🧍","🧍‍♂️"];

function applySkinTone(base: string, tone: SkinTone): string {
  const cleaned = base.replace(/[🏻🏼🏽🏾🏿]/g, "");
  const chars = Array.from(cleaned);
  if (chars.length === 0) return cleaned;
  const first = chars[0];
  const needsTone = ["👶","👧","🧒","👦","👩","🧑","👨","👱","🧔","👵","🧓","👴","👲","👳","🧕","👮","👷","💂","🕵","👰","🤵","👸","🫅","🤴","🥷","🦸","🦹","🤶","🎅","🧙","🧝","🧛","🧟","🧞","🧜","🧚","👼","🤰","🙇","💁","🙅","🙆","🙋","🧏","🤦","🤷","🙎","🙍","💇","💆","🧖","💅","🤳","💃","🕺","👯","🕴","🚶","🧎","🏃","🧍"].includes(first);
  if (!needsTone) return cleaned;
  return first + tone + chars.slice(1).join("");
}

function getCouples(tone: SkinTone) {
  return [`👩${tone}‍❤️‍👨${tone}`, `👩${tone}‍❤️‍💋‍👨${tone}`];
}

export default function EmoticonPicker({ onSelect, onClose, defaultSkinTone = "🏻", mode = "popover" }: Props) {
  const [skinTone, setSkinTone] = useState<SkinTone>(defaultSkinTone);
  const [tab, setTab] = useState<string>("orang");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const categories = useMemo(() => {
    const map: Record<string, { title: string; list: string[] }> = {
      recent: { title: "Recents", list: recent },
      smiley: { title: "Smileys & People", list: SMILEYS.filter((e) => !isBlocked(e)) },
      orang: { title: "Smileys & People", list: PEOPLE_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)) },
      profesi: { title: "Profesi", list: PROFESSION_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)) },
      fantasi: { title: "Fantasi", list: FANTASY_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)) },
      gerak: { title: "Gerak", list: GESTURE_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)) },
      aktivitas: { title: "Aktivitas", list: [...ACTIVITY_PEOPLE_BASE.map((e) => applySkinTone(e, skinTone)), ...ACTIVITIES].filter((e) => !isBlocked(e)) },
      hewan: { title: "Hewan & Alam", list: ANIMALS.filter((e) => !isBlocked(e)) },
      makanan: { title: "Makanan", list: FOOD.filter((e) => !isBlocked(e)) },
      travel: { title: "Travel", list: TRAVEL.filter((e) => !isBlocked(e)) },
      objek: { title: "Objek", list: OBJECTS.filter((e) => !isBlocked(e)) },
      simbol: { title: "Simbol", list: SYMBOLS.filter((e) => !isBlocked(e)) },
      pasangan: { title: "Pasangan", list: getCouples(skinTone) },
    };
    return map;
  }, [skinTone, recent]);
  const current = categories[tab] || categories.orang;
  const filtered = search.trim() ? current.list.filter((e) => e.includes(search.trim())) : current.list;
  const handleSelect = (emoji: string) => {
    setRecent((prev) => [emoji, ...prev.filter((x) => x !== emoji)].slice(0, 24));
    onSelect(emoji);
  };
  const tabs: [string, string][] = [
    ["recent", "🕑"],
    ["smiley", "😀"],
    ["orang", "👩"],
    ["hewan", "🐶"],
    ["makanan", "🍎"],
    ["aktivitas", "⚽"],
    ["travel", "🚗"],
    ["objek", "💡"],
    ["simbol", "❤️"],
    ["pasangan", "💑"],
  ];
  const isBottom = mode === "bottom-sheet";
  const wrapperStyle: React.CSSProperties = isBottom
    ? { position: "fixed", bottom: 0, left: 0, right: 0, width: "100%", maxWidth: "100%", borderRadius: "16px 16px 0 0", zIndex: 50 }
    : { position: "absolute", bottom: "100%", left: 0, width: 380, maxWidth: "92vw", borderRadius: 16, zIndex: 50 };
  return (
    <div style={{ ...wrapperStyle, background: "#fff", border: "1px solid #e5e5e5", boxShadow: "0 12px 32px rgba(0,0,0,0.15)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
        <button onClick={() => setShowSearch(!showSearch)} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}>🔍</button>
        <div style={{ display: "flex", flex: 1, border: "1px solid #eee", borderRadius: 999, overflow: "hidden" }}>
          <button style={{ flex: 1, border: "none", background: "#f2f2f2", padding: "7px 0", cursor: "pointer", fontSize: 18 }}>😀</button>
          <button style={{ flex: 1, border: "none", background: "#fff", padding: "7px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#888" }}>GIF</button>
          <button style={{ flex: 1, border: "none", background: "#fff", padding: "7px 0", cursor: "pointer", fontSize: 16 }}>✏️</button>
          <button style={{ flex: 1, border: "none", background: "#fff", padding: "7px 0", cursor: "pointer", fontSize: 16 }}>💬</button>
        </div>
        <button onClick={onClose} style={{ border: "none", background: "#f5f5f5", width: 28, height: 28, borderRadius: 999, cursor: "pointer" }}>✕</button>
      </div>
      {showSearch && (
        <div style={{ padding: "8px 12px" }}>
          <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emoji" style={{ width: "100%", border: "1px solid #25D366", borderRadius: 999, padding: "8px 14px", outline: "none", fontSize: 13 }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 4, padding: "6px 12px", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#888" }}>Warna kulit:</span>
        {SKIN_TONES.map((t) => (
          <button key={t} onClick={() => setSkinTone(t)} style={{ border: skinTone === t ? "2px solid #111" : "1px solid #ddd", background: "transparent", borderRadius: 999, cursor: "pointer", fontSize: 14 }}>👋{t}</button>
        ))}
      </div>
      <div style={{ padding: "4px 12px 2px", fontSize: 13, color: "#555", fontWeight: 600 }}>{current.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 2, padding: "4px 8px 10px", maxHeight: isBottom ? 340 : 300, overflowY: "auto" }}>
        {filtered.map((emoji) => (
          <button key={emoji} onClick={() => handleSelect(emoji)} style={{ fontSize: 24, padding: "6px 0", border: "none", background: "transparent", cursor: "pointer", borderRadius: 8 }}>{emoji}</button>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: "span 9", textAlign: "center", padding: 20, fontSize: 12, color: "#999" }}>Tidak ada emoticon.</div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 8px", borderTop: "1px solid #f0f0f0", background: "#fff" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 22, opacity: tab === key ? 1 : 0.45, borderBottom: tab === key ? "2px solid #25D366" : "2px solid transparent", paddingBottom: 2 }}>{label}</button>
        ))}
      </div>
    </div>
  );
}
