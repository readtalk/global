"use client";

import React, { useMemo, useState } from "react";

type Props = {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  mode?: "popover" | "bottom-sheet";
};

// Kunci ke putih, tidak bisa diganti user
const FIXED_TONE = "🏻";

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

function applyFixedTone(base: string): string {
  const cleaned = base.replace(/[🏻🏼🏽🏾🏿]/g, "");
  // Emoji yang gak punya varian tone + gender di Unicode, jangan ditempel
  // kalau dipaksain jadi tofu [STRIPPED 3 bytes] seperti kemarin
  if (cleaned.includes("‍♀") || cleaned.includes("‍♂")) {
    const isProfession = ["👮", "👷", "💂", "🕵", "👩‍⚕", "🧑‍⚕", "👨‍⚕", "👩‍🌾", "🧑‍🌾", "👨‍🌾", "👩‍🍳", "🧑‍🍳", "👨‍🍳", "👩‍🎓", "🧑‍🎓", "👨‍🎓", "👩‍🎤", "🧑‍🎤", "👨‍🎤", "👩‍🏫", "🧑‍🏫", "👨‍🏫", "👩‍🏭", "🧑‍🏭", "👨‍🏭", "👩‍💻", "🧑‍💻", "👨‍💻", "👩‍💼", "🧑‍💼", "👨‍💼", "👩‍🔧", "🧑‍🔧", "👨‍🔧", "👩‍🔬", "🧑‍🔬", "👨‍🔬", "👩‍🎨", "🧑‍🎨", "👨‍🎨", "👩‍🚒", "🧑‍🚒", "👨‍🚒", "👩‍✈", "🧑‍✈", "👨‍✈", "👩‍🚀", "🧑‍🚀", "👨‍🚀", "👩‍⚖", "🧑‍⚖", "👨‍⚖"].some((p) => cleaned.startsWith(p));
    if (!isProfession) return cleaned;
  }
  if (["🧞", "🧟", "🧛", "🧜", "🧚", "🧝", "🧙", "🦸", "🦹"].some((p) => cleaned.startsWith(p)) && cleaned.includes("‍")) {
    return cleaned;
  }
  const chars = Array.from(cleaned);
  if (chars.length === 0) return cleaned;
  const first = chars[0];
  const needsTone = ["👶","👧","🧒","👦","👩","🧑","👨","👱","🧔","👵","🧓","👴","👲","👳","🧕","👮","👷","💂","🕵","👰","🤵","👸","🫅","🤴","🥷","🦸","🦹","🤶","🎅","🧙","🧝","🧛","🧟","🧞","🧜","🧚","👼","🤰","🙇","💁","🙅","🙆","🙋","🧏","🤦","🤷","🙎","🙍","💇","💆","🧖","💅","🤳","💃","🕺","👯","🕴","🚶","🧎","🏃","🧍"].includes(first);
  if (!needsTone) return cleaned;
  return first + FIXED_TONE + chars.slice(1).join("");
}

export default function EmoticonPicker({ onSelect, onClose, mode = "popover" }: Props) {
  const [tab, setTab] = useState<string>("smiley");
  const [recent, setRecent] = useState<string[]>([]);

  const categories = useMemo(() => {
    const map: Record<string, string[]> = {
      recent: recent,
      smiley: SMILEYS.filter((e) => !isBlocked(e)),
      people: PEOPLE_BASE.map((e) => applyFixedTone(e)).filter((e) => !isBlocked(e)),
      profession: PROFESSION_BASE.map((e) => applyFixedTone(e)).filter((e) => !isBlocked(e)),
      fantasy: FANTASY_BASE.map((e) => applyFixedTone(e)).filter((e) => !isBlocked(e)),
      gestures: GESTURE_BASE.map((e) => applyFixedTone(e)).filter((e) => !isBlocked(e)),
      activity: [...ACTIVITY_PEOPLE_BASE.map((e) => applyFixedTone(e)), ...ACTIVITIES].filter((e) => !isBlocked(e)),
      animals: ANIMALS.filter((e) => !isBlocked(e)),
      food: FOOD.filter((e) => !isBlocked(e)),
      travel: TRAVEL.filter((e) => !isBlocked(e)),
      objects: OBJECTS.filter((e) => !isBlocked(e)),
      symbols: SYMBOLS.filter((e) => !isBlocked(e)),
      couples: [`👩${FIXED_TONE}‍❤️‍👨${FIXED_TONE}`, `👩${FIXED_TONE}‍❤️‍💋‍👨${FIXED_TONE}`],
    };
    return map;
  }, [recent]);

  const currentList = categories[tab] || [];

  const handleSelect = (emoji: string) => {
    setRecent((prev) => [emoji, ...prev.filter((x) => x !== emoji)].slice(0, 24));
    onSelect(emoji);
  };

  const tabs: [string, string][] = [
    ["recent", "🕑 Recent"],
    ["smiley", "😀 Smileys"],
    ["people", "👩 People"],
    ["profession", "👩‍⚕️ Profession"],
    ["fantasy", "🧙 Fantasy"],
    ["gestures", "💁 Gestures"],
    ["activity", "🏃 Activity"],
    ["animals", "🐶 Animals"],
    ["food", "🍎 Food"],
    ["travel", "🚗 Travel"],
    ["objects", "💡 Objects"],
    ["symbols", "❤️ Symbols"],
    ["couples", "❤️ Couples"],
  ];

  const content = (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px 0" }}>
        <button onClick={onClose} style={{ border: "none", background: "#f5f5f5", width: 28, height: 28, borderRadius: 999, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", overflowX: "auto", whiteSpace: "nowrap" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ whiteSpace: "nowrap", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 999, fontSize: 12, background: tab === key ? "#111" : "#f2f2f2", color: tab === key ? "#fff" : "#333" }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2, padding: "0 8px 10px", maxHeight: 300, overflowY: "auto" }}>
        {currentList.map((emoji) => (
          <button key={emoji} onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelect(emoji)} style={{ fontSize: 22, padding: "6px 0", border: "none", background: "transparent", cursor: "pointer", borderRadius: 8 }}>{emoji}</button>
        ))}
        {currentList.length === 0 && <div style={{ gridColumn: "span 8", textAlign: "center", padding: 20, fontSize: 12, color: "#999" }}>No emojis found.</div>}
      </div>
      <div style={{ padding: "8px 12px", borderTop: "1px solid #f0f0f0", fontSize: 11, color: "#888", textAlign: "center" }}>
        READTalk
      </div>
    </>
  );

  if (mode === "bottom-sheet") {
    return (
      <div style={{ width: "100%", background: "#fff", borderTop: "1px solid #e5e5e5", overflow: "hidden", flexShrink: 0 }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", bottom: "100%", left: 0, width: 360, maxWidth: "92vw", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 50 }}>
      {content}
    </div>
  );
}
