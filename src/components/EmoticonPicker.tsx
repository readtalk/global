"use client";

import React, { useState } from "react";

type Props = {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  defaultSkinTone?: SkinTone;
  mode?: "popover" | "bottom-sheet";
};

type SkinTone = "🏻" | "🏼" | "🏽" | "🏾" | "🏿";
const SKIN_TONES: SkinTone[] = ["🏻", "🏼", "🏽", "🏾", "🏿"];

const BLOCKED_SUBSTRINGS = ["🏳️‍🌈","🏳️‍⚧️","⚧","👩‍❤️‍👩","👨‍❤️‍👨","🧑‍❤️‍🧑","👩‍❤️‍💋‍👩","👨‍❤️‍💋‍👨","🧑‍❤️‍💋‍🧑","👩‍👩‍👦","👩‍👩‍👧","👨‍👨‍👦","👨‍👨‍👧","🫃","🫄","🤱","👰‍♂️","🤵‍♀️","🧔‍♀️","👨‍🍼","🧑‍🍼"];
function isBlocked(e: string) { return BLOCKED_SUBSTRINGS.some((b) => e.includes(b)); }

function split(s: string): string[] {  
  const seg = new (Intl as any).Segmenter("en", { granularity: "grapheme" });
  return [...seg.segment(s)].map((x: any) => x.segment).filter(Boolean);
}

const SMILEYS = "😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🫣🤭🫢🫡🤫🫠🤥😶🫥😐🫤😑🫨😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾";
const ANIMALS = "💐🌹🥀🌺🌷🪷🌸💮🏵🪻🌻🌼🍂🍁🍄🌾🌿🌱🍃☘️🍀🪴🌵🌴🌳🌲🙈🙉🙊🐵🦁🐯🐱🐶🐺🐻🐨🐼🐹🐭🐰🦊🐮🐷🐽🐗🦄🐴🐲🦎🐉🦖🦕🐢🐊🐍🐸🐇🐁🐀🐈🐩🐕🦮🐖🐎🐄🐂🐃🦬🐏🐑🐐🦌🦙🦥🦘🦓🐘🦣🦏🦛🦒🐆🐅🐒🦍🦧🐪🐫🐿🦫🦝🦨🦡🦔🦦🦇🪽🪶🐦🐓🐔🐣🐤🐥🦅🦉🦜🕊🦤🦢🦆🪿🦩🦚🦃🐧🦭🦈🐬🐋🐳🐟🐠🐡🦐🦞🦀🦑🐙🪼🦪🪸🦂🕷🕸🐚🐌🐜🦗🪲🦟🪳🪰🐝🐞🦋🐛🪱🦠🐾";
const FOOD = "🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🫛🥦🥬🥒🌶🫑🌽🥕🫒🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🫓🥪🥙🧆🌮🌯🫔🥗🥘🫕🥫🍝🍜🍲🍛🍣🍱🥟🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🫗🍼🫖☕🍵🧃🥤🧋🍶🍺🍻🥂🍷🥃🍸🍹🧉🍾🧊🥄🍴🍽🥣🥡🥢🧂";
const ACTIVITIES = "⚽🏀🏈⚾🥎🎾🏐🏉🥏🎱🪀🏓🏸🏒🏑🥍🏏🪃🥅⛳🪁🛝🏹🎣🤿🥊🥋🎽🛹🛼🛷⛸️🥌🎿⛷️🏂🪂🤺🏆🥇🥈🥉🏅🎖🎗🎫🎟🎪🎭🩰🎨🎬🎤🎧🎼🎹🪇🥁🪘🎷🎺🪊🪗🎸🪕🪉🎻🪈🎲♟️🎯🎳🎮🎰🧩";
const TRAVEL = "🚗🚕🚙🚌🚎🏎🚓🚑🚒🚐🛻🚚🚛🚜🛴🚲🛵🏍🛺🚨🚔🚍🚘🚖🚡🚠🚟🚃🚋🚞🚝🚄🚅🚈🚂🚆🚇🚊🚉✈️🛫🛬🛩💺🛰🚀🛸🚁🛶⛵🚤🛥🛳⛴️🚢🛟⚓⛽🚧🚦🚥🚏🗺🗿🗽🗼🏰🏯🏟🎡🎢🎠⛲⛱️🏖🏝🏜🌋⛰️🏔🗻🏕⛺🛖🏠🏡🏘🏚🏗🏭🏢🏬🏣🏤🏥🏦🏨🏪🏫🏩💒🏛⛪🕌🕍🛕🕋⛩️🛤🛣🗾🎑🏞🌅🌄🌠🎇🎆🌇🌆🏙🌃🌌🌉🌁";
const OBJECTS = "⌚📱📲💻⌨️🖥🖨🖱🖲🕹🗜💽💾💿📀📼📷📸📹🎥📽🎞📞☎️📟📠📺📻🎙🎚🎛🧭⏱️⏲️⏰🕰⌛⏳📡🔋🔌💡🔦🕯🪔🧯🛢💸💵💴💶💷🪙💰💳🪪💎🪎⚖️🧰🪛🔧🔨⚒️🛠⛏️🪏🪚🔩⚙️🧱⛓️🔫💣🧨🪓🔪🗡⚔️🛡🚬⚰️🪦⚱️🏺🔮📿🧿🪬💈⚗️🔭🔬🕳🩻🩹🩺💊💉🩸🧬🧫🧪🌡🧹🪠🧺🧻🚽🚰🚿🛁🧼🪥🪒🧽🪣🧴🛎🔑🗝🚪🪑🛋🛏🧸🪆🖼🪞🪟🛍🛒🎁🎈🎏🎀🪄🪅🎊🎉🎎🪭🏮🎐🪩🧧✉️📩📨📧💌📥📤📦🏷🪧📪📫📬📭📮📯📜📃📄📑🧾📊📈📉🗒🗓📆📅🗑📇🗃🗳🗄📋📁📂🗂🗞📰📓📔📒📕📗📘📙📚📖🔖🧷🔗📎🖇📐📏🧮📌📍✂️🖊🖋✒️🖌🖍📝✏️🔍🔎🔏🔐🔒🔓";
const SYMBOLS = "🩷❤️🧡💛💚🩵💙💜🖤🩶🤍🤎💔💕💞💓💗💖💘💝💟☮️✝️☪️🕉☸️🪯✡️🔯🕎☯️☦️🛐⛎♈♉♊♋♌♍♎♏♐♑♒♓🆔⚛️☢️☣️📴📳🈶🈚🈸🈺🈷✴️🆚💮🉐㊙️㊗️🈴🈵🈹🈲🅰🅱🆎🆑🅾🆘❌⭕🛑⛔📛🚫💯💢♨️🚷🚯🚳🚱🔞📵🚭❗❕❓❔‼️⁉️🔅🔆〽️⚠️🚸🔱⚜️🔰♻️✅🈯💹❇️✳️❎🌐💠🔶🔷🔸🔹";
const FLAGS = "🏳️🏴🏴‍☠️🏁🚩🇺🇳🇦🇫🇦🇽🇦🇱🇩🇿🇦🇸🇦🇩🇦🇴🇦🇮🇦🇶🇦🇬🇦🇷🇦🇲🇦🇼🇦🇺🇦🇹🇦🇿🇧🇸🇧🇭🇧🇩🇧🇧🇧🇾🇧🇪🇧🇿🇧🇯🇧🇲🇧🇹🇧🇴🇧🇦🇧🇼🇧🇷🇻🇬🇧🇳🇧🇬🇧🇫🇧🇮🇰🇭🇨🇲🇨🇦🇮🇨🇨🇻🇧🇶🇰🇾🇨🇫🇹🇩🇮🇴🇨🇱🇨🇳🇨🇽🇨🇨🇨🇴🇰🇲🇨🇬🇨🇩🇨🇰🇨🇷🇨🇮🇭🇷🇨🇺🇨🇼🇨🇾🇨🇿🇩🇰🇩🇯🇩🇲🇩🇴🇪🇨🇪🇬🇸🇻🇬🇶🇪🇷🇪🇪🇸🇿🇪🇹🇪🇺🇫🇰🇫🇴🇫🇯🇫🇮🇫🇷🇬🇫🇵🇫🇹🇫🇬🇦🇬🇲🇬🇪🇩🇪🇬🇭🇬🇮🇬🇷🇬🇱🇬🇩🇬🇵🇬🇺🇬🇹🇬🇬🇬🇳🇬🇼🇬🇾🇭🇹🇭🇳🇭🇰🇭🇺🇮🇸🇮🇳🇮🇩🇮🇷🇮🇶🇮🇪🇮🇲🇮🇹🇯🇲🇯🇵🎌🇯🇪🇯🇴🇰🇿🇰🇪🇰🇮🇽🇰🇰🇼🇰🇬🇱🇦🇱🇻🇱🇧🇱🇸🇱🇷🇱🇾🇱🇮🇱🇹🇱🇺🇲🇴🇲🇬🇲🇼🇲🇾🇲🇻🇲🇱🇲🇹🇲🇭🇲🇶🇲🇷🇲🇺🇾🇹🇲🇽🇫🇲🇲🇩🇲🇨🇲🇳🇲🇪🇲🇸🇲🇦🇲🇿🇲🇲🇳🇦🇳🇷🇳🇵🇳🇱🇳🇨🇳🇿🇳🇮🇳🇪🇳🇬🇳🇺🇳🇫🇰🇵🇲🇰🇲🇵🇳🇴🇴🇲🇵🇰🇵🇼🇵🇸🇵🇦🇵🇬🇵🇾🇵🇪🇵🇭🇵🇳🇵🇱🇵🇹🇵🇷🇶🇦🇷🇪🇷🇴🇷🇺🇷🇼🇼🇸🇸🇲🇸🇹🇨🇶🇸🇦🇸🇳🇷🇸🇸🇨🇸🇱🇸🇬🇸🇽🇸🇰🇸🇮🇬🇸🇸🇧🇸🇴🇿🇦🇰🇷🇸🇸🇪🇸🇱🇰🇧🇱🇸🇭🇰🇳🇱🇨🇵🇲🇻🇨🇸🇩🇸🇷🇸🇪🇨🇭🇸🇾🇹🇼🇹🇯🇹🇿🇹🇭🇹🇱🇹🇬🇹🇰🇹🇴🇹🇹🇹🇳🇹🇷🇹🇲🇹🇨🇹🇻🇻🇮🇺🇬🇺🇦🇦🇪🇬🇧🇺🇸🇺🇾🇺🇿🇻🇺🇻🇦🇻🇪🇻🇳🇼🇫🇪🇭🇾🇪🇿🇲🇿🇼";

const PEOPLE_BASE = ["👶","👧","🧒","👦","👩","🧑","👨","👩‍🦱","🧑‍🦱","👨‍🦱","👩‍🦰","🧑‍🦰","👨‍🦰","👱‍♀️","👱","👱‍♂️","👩‍🦳","🧑‍🦳","👨‍🦳","👩‍🦲","🧑‍🦲","👨‍🦲","🧔","🧔‍♂️","👵","🧓","👴","👲","👳‍♀️","👳","👳‍♂️","🧕"];
const PROFESSION_BASE = ["👮‍♀️","👮","👮‍♂️","👷‍♀️","👷","👷‍♂️","💂‍♀️","💂","💂‍♂️","🕵‍♀️","🕵","🕵‍♂️","👩‍⚕️","🧑‍⚕️","👨‍⚕️","👩‍🌾","🧑‍🌾","👨‍🌾","👩‍🍳","🧑‍🍳","👨‍🍳","👩‍🎓","🧑‍🎓","👨‍🎓","👩‍🎤","🧑‍🎤","👨‍🎤","👩‍🏫","🧑‍🏫","👨‍🏫","👩‍🏭","🧑‍🏭","👨‍🏭","👩‍💻","🧑‍💻","👨‍💻","👩‍💼","🧑‍💼","👨‍💼","👩‍🔧","🧑‍🔧","👨‍🔧","👩‍🔬","🧑‍🔬","👨‍🔬","👩‍🎨","🧑‍🎨","👨‍🎨","👩‍🚒","🧑‍🚒","👨‍🚒","👩‍✈️","🧑‍✈️","👨‍✈️","👩‍🚀","🧑‍🚀","👨‍🚀","👩‍⚖️","🧑‍⚖️","👨‍⚖️"];
const FANTASY_BASE = ["👰‍♀️","👰","🤵","🤵‍♂️","👸","🫅","🤴","🥷","🦸‍♀️","🦸","🦸‍♂️","🦹‍♀️","🦹","🦹‍♂️","🤶","🧑‍🎄","🎅","🧙‍♀️","🧙","🧙‍♂️","🧝‍♀️","🧝","🧝‍♂️","🧌","🧛‍♀️","🧛","🧛‍♂️","🧟‍♀️","🧟","🧟‍♂️","🧞‍♀️","🧞","🧞‍♂️","🧜‍♀️","🧜","🧜‍♂️","🧚‍♀️","🧚","🧚‍♂️","👼","🤰"];
const GESTURE_BASE = ["🙇‍♀️","🙇","🙇‍♂️","💁‍♀️","💁","💁‍♂️","🙅‍♀️","🙅","🙅‍♂️","🙆‍♀️","🙆","🙆‍♂️","🙋‍♀️","🙋","🙋‍♂️","🧏‍♀️","🧏","🧏‍♂️","🤦‍♀️","🤦","🤦‍♂️","🤷‍♀️","🤷","🤷‍♂️","🙎‍♀️","🙎","🙎‍♂️","🙍‍♀️","🙍","🙍‍♂️","💇‍♀️","💇","💇‍♂️","💆‍♀️","💆","💆‍♂️","🧖‍♀️","🧖","🧖‍♂️","💅","🤳","💃","🕺","🧑‍🩰","👯‍♀️","👯","👯‍♂️","🕴"];
const ACTIVITY_PEOPLE_BASE = ["👩‍🦽","🧑‍🦽","👨‍🦽","👩‍🦼","🧑‍🦼","👨‍🦼","🚶‍♀️","🚶","🚶‍♂️","👩‍🦯","🧑‍🦯","👨‍🦯","🧎‍♀️","🧎","🧎‍♂️","🏃‍♀️","🏃","🏃‍♂️","🧍‍♀️","🧍","🧍‍♂️"];

// INI YANG BENERIN TANDA TANYA - kalo ada ‍♀️/‍♂️ dan bukan profesi, jangan ditempel tone
function applySkinTone(base: string, tone: SkinTone): string {
  const cleaned = base.replace(/[🏻🏼🏽🏾🏿]/g, "");
  if (cleaned.includes("‍♀") || cleaned.includes("‍♂")) {
    const isProfession = PROFESSION_BASE.some((p) => cleaned.startsWith(p.replace(/[🏻🏼🏽🏾🏿]/g, "")));
    if (!isProfession) return cleaned;
  }
  if (["🧞","🧟","🧛","🧜","🧚","🧝","🧙","🦸","🦹"].some((p) => cleaned.startsWith(p)) && cleaned.includes("‍")) return cleaned;
  const chars = Array.from(cleaned);
  if (chars.length === 0) return cleaned;
  const first = chars[0];
  const needsTone = ["👶","👧","🧒","👦","👩","🧑","👨","👱","🧔","👵","🧓","👴","👲","👳","🧕","👮","👷","💂","🕵","👰","🤵","👸","🫅","🤴","🥷","🦸","🦹","🤶","🎅","🧙","🧝","🧛","🧟","🧞","🧜","🧚","👼","🤰","🙇","💁","🙅","🙆","🙋","🧏","🤦","🤷","🙎","🙍","💇","💆","🧖","💅","🤳","💃","🕺","👯","🕴","🚶","🧎","🏃","🧍"].includes(first);
  if (!needsTone) return cleaned;
  return first + tone + chars.slice(1).join("");
}

export default function EmoticonPicker({ onSelect, onClose, defaultSkinTone = "🏻", mode = "popover" }: Props) {
  const [skinTone, setSkinTone] = useState<SkinTone>(defaultSkinTone);
  const [tab, setTab] = useState<string>("smiley");
  const [recent, setRecent] = useState<string[]>([]);

  const categories: Record<string, string[]> = {
    recent: recent,
    smiley: split(SMILEYS).filter((e) => !isBlocked(e)),
    people: PEOPLE_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)),
    profession: PROFESSION_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)),
    fantasy: FANTASY_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)),
    gestures: GESTURE_BASE.map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)),
    activity: [...ACTIVITY_PEOPLE_BASE.map((e) => applySkinTone(e, skinTone)), ...split(ACTIVITIES)].filter((e) => !isBlocked(e)),
    animals: split(ANIMALS).filter((e) => !isBlocked(e)),
    food: split(FOOD).filter((e) => !isBlocked(e)),
    travel: split(TRAVEL).filter((e) => !isBlocked(e)),
    objects: split(OBJECTS).filter((e) => !isBlocked(e)),
    symbols: split(SYMBOLS).filter((e) => !isBlocked(e)),
    flags: split(FLAGS).filter((e) => !isBlocked(e)),
    couples: [`👩${skinTone}‍❤️‍👨${skinTone}`, `👩${skinTone}‍❤️‍💋‍👨${skinTone}`],
  };

  const currentList = categories[tab] || [];
  const handleSelect = (emoji: string) => { setRecent((prev) => [emoji, ...prev.filter((x) => x !== emoji)].slice(0, 24)); onSelect(emoji); };
  const tabs: [string, string][] = [["recent","🕑 Recent"],["smiley","😀 Smileys"],["people","👩 People"],["profession","👩‍⚕️ Profession"],["fantasy","🧙 Fantasy"],["gestures","💁 Gestures"],["activity","🏃 Activity"],["animals","🐶 Animals"],["food","🍎 Food"],["travel","🚗 Travel"],["objects","💡 Objects"],["symbols","❤️ Symbols"],["flags","🏳️ Flags"],["couples","❤️ Couples"]];

  const content = (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px 0" }}>
        <button onClick={onClose} style={{ border: "none", background: "#f5f5f5", width: 28, height: 28, borderRadius: 999, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#888" }}>Skin tone:</span>
        {SKIN_TONES.map((t) => (<button key={t} onClick={() => setSkinTone(t)} style={{ width: 26, height: 26, borderRadius: 999, cursor: "pointer", border: skinTone === t ? "2px solid #111" : "1px solid #ddd", background: "transparent", fontSize: 16 }}>👋{t}</button>))}
      </div>
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", overflowX: "auto", whiteSpace: "nowrap" }}>
        {tabs.map(([key, label]) => (<button key={key} onClick={() => setTab(key)} style={{ whiteSpace: "nowrap", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 999, fontSize: 12, background: tab === key ? "#111" : "#f2f2f2", color: tab === key ? "#fff" : "#333" }}>{label}</button>))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2, padding: "0 8px 10px", maxHeight: 300, overflowY: "auto" }}>
        {currentList.map((emoji) => (<button key={emoji} onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelect(emoji)} style={{ fontSize: 22, padding: "6px 0", border: "none", background: "transparent", cursor: "pointer", borderRadius: 8 }}>{emoji}</button>))}
        {currentList.length === 0 && <div style={{ gridColumn: "span 8", textAlign: "center", padding: 20, fontSize: 12, color: "#999" }}>No emojis found.</div>}
      </div>
      <div style={{ padding: "8px 12px", borderTop: "1px solid #f0f0f0", fontSize: 11, color: "#888", textAlign: "center" }}>READTalk Messenger</div>
    </>
  );

  if (mode === "bottom-sheet") return <div style={{ width: "100%", background: "#fff", borderTop: "1px solid #e5e5e5", overflow: "hidden", flexShrink: 0 }}>{content}</div>;
  return <div style={{ position: "absolute", bottom: "100%", left: 0, width: 360, maxWidth: "92vw", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 50 }}>{content}</div>;
}
