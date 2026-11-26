"use client";

import React, { useMemo, useState } from "react";

type Props = {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  defaultSkinTone?: SkinTone;
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

export default function PanelEmoticon({ onSelect, onClose, defaultSkinTone = "🏻" }: Props) {
  const [skinTone, setSkinTone] = useState<SkinTone>(defaultSkinTone);
  const [tab, setTab] = useState<string>("orang");
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const categories = useMemo(() => {
    const map: Record<string, string[]> = {
      recent: recent,
      smiley: SMILEYS.filter((e) => !isBlocked(e)),
      orang: PEOPLE_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)),
      profesi: PROFESSION_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)),
      fantasi: FANTASY_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)),
      gerak: GESTURE_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)),
      aktivitas: [...ACTIVITY_PEOPLE_BASE.map((e) => applySkinTone(e, skinTone)), ...ACTIVITIES].filter((e) => !isBlocked(e)),
      hewan: ANIMALS.filter((e) => !isBlocked(e)),
      makanan: FOOD.filter((e) => !isBlocked(e)),
      travel: TRAVEL.filter((e) => !isBlocked(e)),
      objek: OBJECTS.filter((e) => !isBlocked(e)),
      simbol: SYMBOLS.filter((e) => !isBlocked(e)),
      pasangan: getCouples(skinTone),
    };
    return map;
  }, [skinTone, recent]);

  const currentList = useMemo(() => {
    const list = categories[tab] || [];
    if (!search.trim()) return list;
    return list.filter((e) => e.includes(search.trim()));
  }, [categories, tab, search]);

  const handleSelect = (emoji: string) => {
    setRecent((prev) => [emoji, ...prev.filter((x) => x !== emoji)].slice(0, 24));
    onSelect(emoji);
  };

  const tabs: [string, string][] = [
    ["recent", "🕑 Baru"],
    ["smiley", "😀 Senyum"],
    ["orang", "👩 Orang"],
    ["profesi", "👩‍⚕️ Profesi"],
    ["fantasi", "🧙 Fantasi"],
    ["gerak", "💁 Gerak"],
    ["aktivitas", "🏃 Aktivitas"],
    ["hewan", "🐶 Hewan"],
    ["makanan", "🍎 Makanan"],
    ["travel", "🚗 Travel"],
    ["objek", "💡 Objek"],
    ["simbol", "❤️ Simbol"],
    ["pasangan", "❤️ Pasangan"],
  ];

  return (
    <div style={{ position: "absolute", bottom: "100%", left: 0, width: 360, maxWidth: "92vw", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari emoticon..." style={{ flex: 1, border: "1px solid #eee", borderRadius: 999, padding: "7px 12px", outline: "none", fontSize: 13 }} />
        <button onClick={onClose} style={{ border: "none", background: "#f5f5f5", width: 28, height: 28, borderRadius: 999, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#888" }}>Warna kulit:</span>
        {SKIN_TONES.map((t) => (
          <button key={t} onClick={() => setSkinTone(t)} style={{ width: 26, height: 26, borderRadius: 999, cursor: "pointer", border: skinTone === t ? "2px solid #111" : "1px solid #ddd", background: "transparent", fontSize: 16 }}>👋{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", overflowX: "auto", whiteSpace: "nowrap" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ whiteSpace: "nowrap", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 999, fontSize: 12, background: tab === key ? "#111" : "#f2f2f2", color: tab === key ? "#fff" : "#333" }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2, padding: "0 8px 10px", maxHeight: 300, overflowY: "auto" }}>
        {currentList.map((emoji) => (
          <button key={emoji} onClick={() => handleSelect(emoji)} style={{ fontSize: 22, padding: "6px 0", border: "none", background: "transparent", cursor: "pointer", borderRadius: 8 }}>{emoji}</button>
        ))}
        {currentList.length === 0 && <div style={{ gridColumn: "span 8", textAlign: "center", padding: 20, fontSize: 12, color: "#999" }}>Tidak ada emoticon.</div>}
      </div>
      <div style={{ padding: "8px 12px", borderTop: "1px solid #f0f0f0", fontSize: 11, color: "#888", textAlign: "center" }}>
        READTalk
      </div>
    </div>
  );
}
