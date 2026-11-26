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

function splitEmojis(s: string): string[] {
  return s.split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);
}

const RAW_BLOCKS = [
  "😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳🙂‍↕️😏😒🙂‍↔️😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😶‍🌫️😱😨😰😥😓🤗🤔🫣🤭🫢🫡🤫🫠🤥😶🫥😐🫤😑🫨😬🙄😯😦😧😮😲🥱🫩🫪😴🤤😪😮‍💨😵😵‍💫🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾🫶🏻🤲🏻👐🏻🙌🏻👏🏻🫱🏻‍🫲🏻👍🏻👎🏻👊🏻✊🏻🤛🏻🤜🏻🫷🏻🫸🏻🤞🏻✌🏻🫰🏻🤟🏻🤘🏻👌🏻🤌🏻🤏🏻🫳🏻🫴🏻👈🏻👉🏻👆🏻👇🏻☝🏻✋🏻🤚🏻🖐🏻🖖🏻👋🏻🤙🏻🫲🏻🫱🏻💪🏻🦾🖕🏻✍🏻🙏🏻🫵🏻🦶🏻🦵🏻🦿💄💋👄🫦🦷👅👂🏻🦻🏻👃🏻🫆👣👁️👀🫀🫁🧠🗣️👤👥🫂👶🏻👧🏻🧒🏻👦🏻👩🏻🧑🏻👨🏻👩🏻‍🦱🧑🏻‍🦱👨🏻‍🦱👩🏻‍🦰🧑🏻‍🦰👨🏻‍🦰👱🏻‍♀️👱🏻👱🏻‍♂️👩🏻‍🦳🧑🏻‍🦳👨🏻‍🦳👩🏻‍🦲🧑🏻‍🦲👨🏻‍🦲🧔🏻🧔🏻‍♂️👵🏻🧓🏻👴🏻👲🏻👳🏻‍♀️👳🏻👳🏻‍♂️🧕🏻👮🏻‍♀️👮🏻👮🏻‍♂️👷🏻‍♀️👷🏻👷🏻‍♂️💂🏻‍♀️💂🏻💂🏻‍♂️🕵🏻‍♀️🕵🏻🕵🏻‍♂️👩🏻‍⚕️🧑🏻‍⚕️👨🏻‍⚕️👩🏻‍🌾🧑🏻‍🌾👨🏻‍🌾👩🏻‍🍳🧑🏻‍🍳👨🏻‍🍳👩🏻‍🎓🧑🏻‍🎓👨🏻‍🎓👩🏻‍🎤🧑🏻‍🎤👨🏻‍🎤👩🏻‍🏫🧑🏻‍🏫👨🏻‍🏫👩🏻‍🏭🧑🏻‍🏭👨🏻‍🏭👩🏻‍💻🧑🏻‍💻👨🏻‍💻👩🏻‍💼🧑🏻‍💼👨🏻‍💼👩🏻‍🔧🧑🏻‍🔧👨🏻‍🔧👩🏻‍🔬🧑🏻‍🔬👨🏻‍🔬👩🏻‍🎨🧑🏻‍🎨👨🏻‍🎨👩🏻‍🚒🧑🏻‍🚒👨🏻‍🚒👩🏻‍✈️🧑🏻‍✈️👨🏻‍✈️👩🏻‍🚀🧑🏻‍🚀👨🏻‍🚀👩🏻‍⚖️🧑🏻‍⚖️👨🏻‍⚖️👰🏻‍♀️👰🏻🤵🏻🤵🏻‍♂️👸🏻🫅🏻🤴🏻🥷🏻🦸🏻‍♀️🦸🏻🦸🏻‍♂️🦹🏻‍♀️🦹🏻🦹🏻‍♂️🤶🏻🧑🏻‍🎄🎅🏻🧙🏻‍♀️🧙🏻🧙🏻‍♂️🧝🏻‍♀️🧝🏻🧝🏻‍♂️🧌🧛🏻‍♀️🧛🏻🧛🏻‍♂️🧟‍♀️🧟🧟‍♂️🧞‍♀️🧞🧞‍♂️🧜🏻‍♀️🧜🏻🧜🏻‍♂️🧚🏻‍♀️🧚🏻🧚🏻‍♂️👼🏻🤰🏻🙇🏻‍♀️🙇🏻🙇🏻‍♂️💁🏻‍♀️💁🏻💁🏻‍♂️🙅🏻‍♀️🙅🏻🙅🏻‍♂️🙆🏻‍♀️🙆🏻🙆🏻‍♂️🙋🏻‍♀️🙋🏻🙋🏻‍♂️🧏🏻‍♀️🧏🏻🧏🏻‍♂️🤦🏻‍♀️🤦🏻🤦🏻‍♂️🤷🏻‍♀️🤷🏻🤷🏻‍♂️🙎🏻‍♀️🙎🏻🙎🏻‍♂️🙍🏻‍♀️🙍🏻🙍🏻‍♂️💇🏻‍♀️💇🏻💇🏻‍♂️💆🏻‍♀️💆🏻💆🏻‍♂️🧖🏻‍♀️🧖🏻🧖🏻‍♂️💅🏻🤳🏻💃🏻🕺🏻🧑🏻‍🩰👯🏻‍♀️👯🏻👯🏻‍♂️🕴🏻👩🏻‍🦽🧑🏻‍🦽👨🏻‍🦽👩🏻‍🦼🧑🏻‍🦼👨🏻‍🦼🚶🏻‍♀️🚶🏻🚶🏻‍♂️👩🏻‍🦯🧑🏻‍🦯👨🏻‍🦯🧎🏻‍♀️🧎🏻🧎🏻‍♂️🏃🏻‍♀️🏃🏻🏃🏻‍♂️🧍🏻‍♀️🧍🏻🧍🏻‍♂️🪢🧶🧵🪡🧥🥼🦺👚👕👖🩲🩳👔👗👙🩱👘🥻🩴🥿👠👡👢👞👟🥾🧦🧤🧣🎩🧢👒🎓⛑️🪖👑💍👝👛👜💼🎒🧳👓🕶️🥽🌂",
  "💐🌹🥀🌺🌷🪷🌸💮🏵️🪻🌻🌼🍂🍁🍄🌾🌿🌱🍃☘️🍀🪴🌵🌴🪾🌳🌲🪵🪹🪺🪨🛘⛰️🏔️☃️⛄🌡️🔥🌋🏜️🏞️🌅🌄🏝️🏖️🌊🌬️❄️🌀🌪️⚡☔🌈💧☁️🌨️🌧️🌩️⛈️🌦️🌥️⛅🌤️☀️🌞🌝🌚🌜🌛🌙⭐🌟✨🕳️🪐🌍🌎🌏🌫️🌠🌌☄️🌑🌒🌓🌔🌕🌖🌗🌘🙈🙉🙊🐵🦁🐯🐱🐶🐺🐻🐻‍❄️🐨🐼🐹🐭🐰🦊🐮🐷🐽🐗🦄🐴🫎🐲🦎🐉🦖🦕🐢🐊🐍🐸🐇🐁🐀🐈🐈‍⬛🐩🐕🦮🐕‍🦺🐖🐎🫏🐄🐂🐃🦬🐏🐑🐐🦌🦙🦥🦘🦓🐘🦣🦏🦛🦒🐆🐅🐒🦍🦧🐪🐫🐿️🦫🦝🦨🦡🦔🦦🦇🪽🪶🐦🐦‍⬛🐓🐔🐣🐤🐥🦅🦉🦜🕊️🦤🦢🦆🪿🦩🦚🐦‍🔥🦃🐧🦭🦈🫍🐬🐋🐳🐟🐠🐡🦐🦞🦀🦑🐙🪼🦪🪸🫧🦂🕷️🕸️🐚🐌🐜🦗🪲🦟🪳🪰🐝🐞🦋🐛🪱🦠🐾",
  "🍏🍎🍐🍊🍋🍋‍🟩🍌🍉🍇🍓🍈🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🫛🥦🥬🥒🌶️🫑🌽🥕🫒🧄🧅🥔🫜🍠🫚🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🫓🥪🥙🧆🌮🌯🫔🥗🥘🫕🥫🫙🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🫘🍯🥛🫗🍼🫖☕🍵🧃🥤🧋🍶🍺🍻🥂🍷🥃🍸🍹🧉🍾🧊🥄🍴🍽️🥣🥡🥢🧂",
  "⚽🏀🏈⚾🥎🎾🏐🏉🥏🎱🪀🏓🏸🏒🏑🥍🏏🪃🥅⛳🪁🛝🏹🎣🤿🥊🥋🎽🛹🛼🛷⛸️🥌🎿⛷️🏂🪂🏋️‍♀️🏋🏼🏋🏻‍♂️🤼🏻‍♀️🤼🏻🤼🏻‍♂️🤸🏻‍♀️🤸🏻🤸🏻‍♂️⛹🏻‍♀️⛹🏻⛹🏻‍♂️🤺🏋🏼🤾🏻‍♀️🤾🏻🤾🏻‍♂️🏌🏻‍♀️🏌🏻🏌🏻‍♂️🏇🏻🧘🏻‍♀️🧘🏻🧘🏻‍♂️🏄🏻‍♀️🏄🏻🏄🏻‍♂️🏊🏻‍♀️🏊🏻🏊🏻‍♂️🤽🏻‍♀️🤽🏻🤽🏻‍♂️🚣🏻‍♀️🚣🏻🚣🏻‍♂️🧗🏻‍♀️🧗🏻🧗🏻‍♂️🚵🏻‍♀️🚵🏻🚵🏻‍♂️🚴🏻‍♀️🚴🏻🚴🏻‍♂️🏆🥇🥈🥉🏅🎖️🏵️🎗️🎫🎟️🎪🤹🏻‍♀️🤹🏻🤹🏻‍♂️🎭🩰🎨🫟🎬🎤🎧🎼🎹🪇🥁🪘🎷🎺🪊🪗🎸🪕🪉🎻🪈🎲♟️🎯🎳🎮🎰🧩",
  "🚗🚕🚙🚌🚎🏎️🚓🚑🚒🚐🛻🚚🚛🚜🦯🦽🦼🩼🛴🚲🛵🏍️🛺🛞🚨🚔🚍🚘🚖🚡🚠🚟🚃🚋🚞🚝🚄🚅🚈🚂🚆🚇🚊🚉✈️🛫🛬🛩️💺🛰️🚀🛸🚁🛶⛵🚤🛥️🛳️⛴️🚢🛟⚓🪝⛽🚧🚦🚥🚏🗺️🗿🗽🗼🏰🏯🏟️🎡🎢🎠⛲⛱️🏖️🏝️🏜️🌋⛰️🏔️🗻🏕️⛺🛖🏠🏡🏘️🏚️🏗️🏭🏢🏬🏣🏤🏥🏦🏨🏪🏫🏩💒🏛️⛪🕌🕍🛕🕋⛩️🛤️🛣️🗾🎑🏞️🌅🌄🌠🎇🎆🌇🌆🏙️🌃🌌🌉🌁",
  "⌚📱📲💻⌨️🖥️🖨️🖱️🖲️🕹️🗜️💽💾💿📀📼📷📸📹🎥📽️🎞️📞☎️📟📠📺📻🎙️🎚️🎛️🧭⏱️⏲️⏰🕰️⌛⏳📡🔋🪫🔌💡🔦🕯️🪔🧯🛢️💸💵💴💶💷🪙💰💳🪪💎🪎⚖️🪜🧰🪛🔧🔨⚒️🛠️⛏️🪏🪚🔩⚙️🪤🧱⛓️⛓️‍💥🧲🔫💣🧨🪓🔪🗡️⚔️🛡️🚬⚰️🪦⚱️🏺🔮📿🧿🪬💈⚗️🔭🔬🕳️🩻🩹🩺💊💉🩸🧬🦠🧫🧪🌡️🧹🪠🧺🧻🚽🚰🚿🛁🛀🏻🧼🪥🪒🪮🧽🪣🧴🛎️🔑🗝️🚪🪑🛋️🛏️🛌🏻🧸🪆🖼️🪞🪟🛍️🛒🎁🎈🎏🎀🪄🪅🎊🎉🎎🪭🏮🎐🪩🧧✉️📩📨📧💌📥📤📦🏷️🪧📪📫📬📭📮📯📜📃📄📑🧾📊📈📉🗒️🗓️📆📅🗑️📇🗃️🗳️🗄️📋📁📂🗂️🗞️📰📓📔📒📕📗📘📙📚📖🔖🧷🔗📎🖇️📐📏🧮📌📍✂️🖊️🖋️✒️🖌️🖍️📝✏️🔍🔎🔏🔐🔒🔓",
  "🩷❤️🧡💛💚🩵💙💜🖤🩶🤍🤎💔❤️‍🔥❤️‍🩹❣️💕💞💓💗💖💘💝💟☮️✝️☪️🕉️☸️🪯✡️🔯🕎☯️☦️🛐⛎♈♉♊♋♌♍♎♏♐♑♒♓🆔⚛️🉑☢️☣️📴📳🈶🈚🈸🈺🈷️✴️🆚💮🉐㊙️㊗️🈴🈵🈹🈲🅰️🅱️🆎🆑🅾️🆘❌⭕🛑⛔📛🚫💯💢♨️🚷🚯🚳🚱🔞📵🚭❗❕❓❔‼️⁉️🔅🔆〽️⚠️🚸🔱⚜️🔰♻️✅🈯💹❇️✳️❎🌐💠Ⓜ️🌀💤🏧🚾♿🅿️🛗🈳🈂️🛂🛃🛄🛅🛜🚹🚺🚼🧑‍🧑‍🧒🧑‍🧑‍🧒‍🧒🧑‍🧒🧑‍🧒‍🧒⚧️🚻🚮🎦📶🈁🔣ℹ️🔤🔡🔠🆖🆗🆙🆒🆕🆓0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟🔢#️⃣*️⃣⏏️▶️⏸️⏯️⏹️⏺️⏭️⏮️⏩⏪⏫⏬◀️🔼🔽➡️⬅️⬆️⬇️↗️↘️↙️↖️↕️↔️↪️↩️⤴️⤵️🔀🔁🔂🔄🔃🎵🎶➕➖➗✖️🟰♾️💲💱™️©️®️👁️‍🗨️🔚🔙🔛🔝🔜〰️➰➿✔️☑️🔘🔴🟠🟡🟢🔵🟣⚫⚪🟤🔺🔻🔸🔹🔶🔷🔳🔲▪️▫️◾◽◼️◻️🟥🟧🟨🟩🟦🟪⬛⬜🟫🔈🔇🔉🔊🔔🔕📣📢💬💭🗯️♠️♣️♥️♦️🃏🎴🀄🕐🕑🕒🕓🕔🕕🕖🕗🕘🕙🕚🕛🕜🕝🕞🕟🕠🕡🕢🕣🕤🕥🕦🕧",
  "🏳️🏴🏴‍☠️🏁🚩🏳️‍⚧️🏳‍🟧‍⬛‍🟧🇺🇳🇦🇫🇦🇽🇦🇱🇩🇿🇦🇸🇦🇩🇦🇴🇦🇮🇦🇶🇦🇬🇦🇷🇦🇲🇦🇼🇦🇺🇦🇹🇦🇿🇧🇸🇧🇭🇧🇩🇧🇧🇧🇾🇧🇪🇧🇿🇧🇯🇧🇲🇧🇹🇧🇴🇧🇦🇧🇼🇧🇷🇻🇬🇧🇳🇧🇬🇧🇫🇧🇮🇰🇭🇨🇲🇨🇦🇮🇨🇨🇻🇧🇶🇰🇾🇨🇫🇹🇩🇮🇴🇨🇱🇨🇳🇨🇽🇨🇨🇨🇴🇰🇲🇨🇬🇨🇩🇨🇰🇨🇷🇨🇮🇭🇷🇨🇺🇨🇼🇨🇾🇨🇿🇩🇰🇩🇯🇩🇲🇩🇴🇪🇨🇪🇬🇸🇻🇬🇶🇪🇷🇪🇪🇸🇿🇪🇹🇪🇺🇫🇰🇫🇴🇫🇯🇫🇮🇫🇷🇬🇫🇵🇫🇹🇫🇬🇦🇬🇲🇬🇪🇩🇪🇬🇭🇬🇮🇬🇷🇬🇱🇬🇩🇬🇵🇬🇺🇬🇹🇬🇬🇬🇳🇬🇼🇬🇾🇭🇹🇭🇳🇭🇰🇭🇺🇮🇸🇮🇳🇮🇩🇮🇷🇮🇶🇮🇪🇮🇲🇮🇹🇯🇲🇯🇵🎌🇯🇪🇯🇴🇰🇿🇰🇪🇰🇮🇽🇰🇰🇼🇰🇬🇱🇦🇱🇻🇱🇧🇱🇸🇱🇷🇱🇾🇱🇮🇱🇹🇱🇺🇲🇴🇲🇬🇲🇼🇲🇾🇲🇻🇲🇱🇲🇹🇲🇭🇲🇶🇲🇷🇲🇺🇾🇹🇲🇽🇫🇲🇲🇩🇲🇨🇲🇳🇲🇪🇲🇸🇲🇦🇲🇿🇲🇲🇳🇦🇳🇷🇳🇵🇳🇱🇳🇨🇳🇿🇳🇮🇳🇪🇳🇬🇳🇺🇳🇫🇰🇵🇲🇰🇲🇵🇳🇴🇴🇲🇵🇰🇵🇼🇵🇸🇵🇦🇵🇬🇵🇾🇵🇪🇵🇭🇵🇳🇵🇱🇵🇹🇵🇷🇶🇦🇷🇪🇷🇴🇷🇺🇷🇼🇼🇸🇸🇲🇸🇹🇨🇶🇸🇦🇸🇳🇷🇸🇸🇨🇸🇱🇸🇬🇸🇽🇸🇰🇸🇮🇬🇸🇸🇧🇸🇴🇿🇦🇰🇷🇸🇸🇪🇸🇱🇰🇧🇱🇸🇭🇰🇳🇱🇨🇵🇲🇻🇨🇸🇩🇸🇷🇸🇪🇨🇭🇸🇾🇹🇼🇹🇯🇹🇿🇹🇭🇹🇱🇹🇬🇹🇰🇹🇴🇹🇹🇹🇳🇹🇷🇹🇲🇹🇨🇹🇻🇻🇮🇺🇬🇺🇦🇦🇪🇬🇧🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁷󠁬󠁳󠁿🇺🇸🏴󠁵󠁳󠁴󠁸󠁿🇺🇾🇺🇿🇻🇺🇻🇦🇻🇪🇻🇳🇼🇫🇪🇭🇾🇪🇿🇲🇿🇼",
];

function applySkinTone(base: string, tone: SkinTone): string {
  const cleaned = base.replace(/[🏻🏼🏽🏾🏿]/g, "");
  const chars = Array.from(cleaned);
  if (chars.length === 0) return cleaned;
  const first = chars[0];
  const needsTone = ["👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👱", "🧔", "👵", "🧓", "👴", "👲", "👳", "🧕", "👮", "👷", "💂", "🕵", "👰", "🤵", "👸", "🫅", "🤴", "🥷", "🦸", "🦹", "🤶", "🎅", "🧙", "🧝", "🧛", "🧟", "🧞", "🧜", "🧚", "👼", "🤰", "🙇", "💁", "🙅", "🙆", "🙋", "🧏", "🤦", "🤷", "🙎", "🙍", "💇", "💆", "🧖", "💅", "🤳", "💃", "🕺", "👯", "🕴", "🚶", "🧎", "🏃", "🧍", "🫶", "🤲", "👐", "🙌", "👏", "👍", "👎", "👊", "✊", "🤛", "🤜", "🫷", "🫸", "🤞", "✌", "🫰", "🤟", "🤘", "👌", "🤌", "🤏", "🫳", "🫴", "👈", "👉", "👆", "👇", "☝", "✋", "🤚", "🖐", "🖖", "👋", "🤙", "💪", "🖕", "✍", "🙏", "🫵", "🦶", "🦵", "👂", "🦻", "👃", "👣", "🏋", "🤼", "🤸", "⛹", "🤾", "🏌", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚵", "🚴", "🤹"].includes(first);
  if (!needsTone) return cleaned;
  return first + tone + chars.slice(1).join("");
}

export default function EmoticonPicker({ onSelect, onClose, defaultSkinTone = "🏻", mode = "popover" }: Props) {
  const [skinTone, setSkinTone] = useState<SkinTone>(defaultSkinTone);
  const [tab, setTab] = useState<string>("people");
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const categories = useMemo(() => {
    const blocks = RAW_BLOCKS.map((b) => splitEmojis(b).map((e) => applySkinTone(e, skinTone)).filter((e) => !isBlocked(e)));
    const map: Record<string, string[]> = {
      recent: recent,
      people: blocks[0],
      animals: blocks[1],
      food: blocks[2],
      activity: blocks[3],
      travel: blocks[4],
      objects: blocks[5],
      symbols: blocks[6],
      flags: blocks[7],
    };
    return map;
  }, [skinTone, recent]);

  const currentList = useMemo(() => {
    if (search.trim()) {
      const all = Object.values(categories).flat();
      return [...new Set(all)].filter((e) => e.includes(search.trim()));
    }
    return categories[tab] || [];
  }, [categories, tab, search]);

  const handleSelect = (emoji: string) => {
    setRecent((prev) => [emoji, ...prev.filter((x) => x !== emoji)].slice(0, 24));
    onSelect(emoji);
  };

  const tabs: [string, string][] = [
    ["recent", "🕑 Recent"],
    ["people", "😀 People"],
    ["animals", "🐶 Animals"],
    ["food", "🍎 Food"],
    ["activity", "🏃 Activity"],
    ["travel", "🚗 Travel"],
    ["objects", "💡 Objects"],
    ["symbols", "❤️ Symbols"],
    ["flags", "🏳️ Flags"],
  ];

  const content = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emojis..." style={{ flex: 1, border: "1px solid #eee", borderRadius: 999, padding: "7px 12px", outline: "none", fontSize: 13 }} />
        <button onClick={onClose} style={{ border: "none", background: "#f5f5f5", width: 28, height: 28, borderRadius: 999, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#888" }}>Skin tone:</span>
        {SKIN_TONES.map((t) => (
          <button key={t} onClick={() => setSkinTone(t)} style={{ width: 26, height: 26, borderRadius: 999, cursor: "pointer", border: skinTone === t ? "2px solid #111" : "1px solid #ddd", background: "transparent", fontSize: 16 }}>👋{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", overflowX: "auto", whiteSpace: "nowrap" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setSearch(""); }} style={{ whiteSpace: "nowrap", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 999, fontSize: 12, background: tab === key ? "#111" : "#f2f2f2", color: tab === key ? "#fff" : "#333" }}>{label}</button>
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
