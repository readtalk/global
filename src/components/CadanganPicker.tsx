"use client";

import React, { useState } from "react";

type Props = {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  mode?: "popover" | "bottom-sheet";
};

// From Local_Txt.docx - 7 lines, flags removed, 2x 🏼 fixed to 🏻, LGBTQ removed
const SMILEYS_PEOPLE = "😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳🙂‍↕️😏😒🙂‍↔️😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😶‍🌫️😱😨😰😥😓🤗🤔🫣🤭🫢🫡🤫🫠🤥😶🫥😐🫤😑🫨😬🙄😯😦😧😮😲🥱🫩🫪😴🤤😪😮‍💨😵😵‍💫🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾🫶🏻🤲🏻👐🏻🙌🏻👏🏻🫱🏻‍🫲🏻👍🏻👎🏻👊🏻✊🏻🤛🏻🤜🏻🫷🏻🫸🏻🤞🏻✌🏻🫰🏻🤟🏻🤘🏻👌🏻🤌🏻🤏🏻🫳🏻🫴🏻👈🏻👉🏻👆🏻👇🏻☝🏻✋🏻🤚🏻🖐🏻🖖🏻👋🏻🤙🏻🫲🏻🫱🏻💪🏻🦾🖕🏻✍🏻🙏🏻🫵🏻🦶🏻🦵🏻🦿💄💋👄🫦🦷👅👂🏻🦻🏻👃🏻🫆👣👁️👀🫀🫁🧠🗣️👤👥🫂👶🏻👧🏻🧒🏻👦🏻👩🏻🧑🏻👨🏻👩🏻‍🦱🧑🏻‍🦱👨🏻‍🦱👩🏻‍🦰🧑🏻‍🦰👨🏻‍🦰👱🏻‍♀️👱🏻👱🏻‍♂️👩🏻‍🦳🧑🏻‍🦳👨🏻‍🦳👩🏻‍🦲🧑🏻‍🦲👨🏻‍🦲🧔🏻🧔🏻‍♂️👵🏻🧓🏻👴🏻👲🏻👳🏻‍♀️👳🏻👳🏻‍♂️🧕🏻👮🏻‍♀️👮🏻👮🏻‍♂️👷🏻‍♀️👷🏻👷🏻‍♂️💂🏻‍♀️💂🏻💂🏻‍♂️🕵🏻‍♀️🕵🏻🕵🏻‍♂️👩🏻‍⚕️🧑🏻‍⚕️👨🏻‍⚕️👩🏻‍🌾🧑🏻‍🌾👨🏻‍🌾👩🏻‍🍳🧑🏻‍🍳👨🏻‍🍳👩🏻‍🎓🧑🏻‍🎓👨🏻‍🎓👩🏻‍🎤🧑🏻‍🎤👨🏻‍🎤👩🏻‍🏫🧑🏻‍🏫👨🏻‍🏫👩🏻‍🏭🧑🏻‍🏭👨🏻‍🏭👩🏻‍💻🧑🏻‍💻👨🏻‍💻👩🏻‍💼🧑🏻‍💼👨🏻‍💼👩🏻‍🔧🧑🏻‍🔧👨🏻‍🔧👩🏻‍🔬🧑🏻‍🔬👨🏻‍🔬👩🏻‍🎨🧑🏻‍🎨👨🏻‍🎨👩🏻‍🚒🧑🏻‍🚒👨🏻‍🚒👩🏻‍✈️🧑🏻‍✈️👨🏻‍✈️👩🏻‍🚀🧑🏻‍🚀👨🏻‍🚀👩🏻‍⚖️🧑🏻‍⚖️👨🏻‍⚖️👰🏻‍♀️👰🏻🤵🏻🤵🏻‍♂️👸🏻🫅🏻🤴🏻🥷🏻🦸🏻‍♀️🦸🏻🦸🏻‍♂️🦹🏻‍♀️🦹🏻🦹🏻‍♂️🤶🏻🧑🏻‍🎄🎅🏻🧙🏻‍♀️🧙🏻🧙🏻‍♂️🧝🏻‍♀️🧝🏻🧝🏻‍♂️🧌🧛🏻‍♀️🧛🏻🧛🏻‍♂️🧟‍♀️🧟🧟‍♂️🧞‍♀️🧞🧞‍♂️🧜🏻‍♀️🧜🏻🧜🏻‍♂️🧚🏻‍♀️🧚🏻🧚🏻‍♂️👼🏻🤰🏻🙇🏻‍♀️🙇🏻🙇🏻‍♂️💁🏻‍♀️💁🏻💁🏻‍♂️🙅🏻‍♀️🙅🏻🙅🏻‍♂️🙆🏻‍♀️🙆🏻🙆🏻‍♂️🙋🏻‍♀️🙋🏻🙋🏻‍♂️🧏🏻‍♀️🧏🏻🧏🏻‍♂️🤦🏻‍♀️🤦🏻🤦🏻‍♂️🤷🏻‍♀️🤷🏻🤷🏻‍♂️🙎🏻‍♀️🙎🏻🙎🏻‍♂️🙍🏻‍♀️🙍🏻🙍🏻‍♂️💇🏻‍♀️💇🏻💇🏻‍♂️💆🏻‍♀️💆🏻💆🏻‍♂️🧖🏻‍♀️🧖🏻🧖🏻‍♂️💅🏻🤳🏻💃🏻🕺🏻🧑🏻‍🩰👯🏻‍♀️👯🏻👯🏻‍♂️🕴🏻👩🏻‍🦽🧑🏻‍🦽👨🏻‍🦽👩🏻‍🦼🧑🏻‍🦼👨🏻‍🦼🚶🏻‍♀️🚶🏻🚶🏻‍♂️👩🏻‍🦯🧑🏻‍🦯👨🏻‍🦯🧎🏻‍♀️🧎🏻🧎🏻‍♂️🏃🏻‍♀️🏃🏻🏃🏻‍♂️🧍🏻‍♀️🧍🏻🧍🏻‍♂️🪢🧶🧵🪡🧥🥼🦺👚👕👖🩲🩳👔👗👙🩱👘🥻🩴🥿👠👡👢👞👟🥾🧦🧤🧣🎩🧢👒🎓⛑️🪖👑💍👝👛👜💼🎒🧳👓🕶️🥽🌂";
const ANIMALS = "💐🌹🥀🌺🌷🪷🌸💮🏵️🪻🌻🌼🍂🍁🍄🌾🌿🌱🍃☘️🍀🪴🌵🌴🪾🌳🌲🪵🪹🪺🪨🛘⛰️🏔️☃️⛄🌡️🔥🌋🏜️🏞️🌅🌄🏝️🏖️🌊🌬️❄️🌀🌪️⚡☔💧☁️🌨️🌧️🌩️⛈️🌦️🌥️⛅🌤️☀️🌞🌝🌚🌜🌛🌙⭐🌟✨🕳️🪐🌍🌎🌏🌫️🌠🌌☄️🌑🌒🌓🌔🌕🌖🌗🌘🙈🙉🙊🐵🦁🐯🐱🐶🐺🐻🐻‍❄️🐨🐼🐹🐭🐰🦊🐮🐷🐽🐗🦄🐴🫎🐲🦎🐉🦖🦕🐢🐊🐍🐸🐇🐁🐀🐈🐈‍⬛🐩🐕🦮🐕‍🦺🐖🐎🫏🐄🐂🐃🦬🐏🐑🐐🦌🦙🦥🦘🦓🐘🦣🦏🦛🦒🐆🐅🐒🦍🦧🐪🐫🐿️🦫🦝🦨🦡🦔🦦🦇🪽🪶🐦🐦‍⬛🐓🐔🐣🐤🐥🦅🦉🦜🕊️🦤🦢🦆🪿🦩🦚🐦‍🔥🦃🐧🦭🦈🫍🐬🐋🐳🐟🐠🐡🦐🦞🦀🦑🐙🪼🦪🪸🫧🦂🕷️🕸️🐚🐌🐜🦗🪲🦟🪳🪰🐝🐞🦋🐛🪱🦠🐾";
const FOOD = "🍏🍎🍐🍊🍋🍋‍🟩🍌🍉🍇🍓🍈🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🫛🥦🥬🥒🌶️🫑🌽🥕🫒🧄🧅🥔🫜🍠🫚🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🫓🥪🥙🧆🌮🌯🫔🥗🥘🫕🥫🫙🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🫘🍯🥛🫗🍼🫖☕🍵🧃🥤🧋🍶🍺🍻🥂🍷🥃🍸🍹🧉🍾🧊🥄🍴🍽️🥣🥡🥢🧂";
const ACTIVITY = "⚽🏀🏈⚾🥎🎾🏐🏉🥏🎱🪀🏓🏸🏒🏑🥍🏏🪃🥅⛳🪁🛝🏹🎣🤿🥊🥋🎽🛹🛼🛷⛸️🥌🎿⛷️🏂🪂🏋️‍♀️🏋🏻🏋🏻‍♂️🤼🏻‍♀️🤼🏻🤼🏻‍♂️🤸🏻‍♀️🤸🏻🤸🏻‍♂️⛹🏻‍♀️⛹🏻⛹🏻‍♂️🤺🏋🏻🤾🏻‍♀️🤾🏻🤾🏻‍♂️🏌🏻‍♀️🏌🏻🏌🏻‍♂️🏇🏻🧘🏻‍♀️🧘🏻🧘🏻‍♂️🏄🏻‍♀️🏄🏻🏄🏻‍♂️🏊🏻‍♀️🏊🏻🏊🏻‍♂️🤽🏻‍♀️🤽🏻🤽🏻‍♂️🚣🏻‍♀️🚣🏻🚣🏻‍♂️🧗🏻‍♀️🧗🏻🧗🏻‍♂️🚵🏻‍♀️🚵🏻🚵🏻‍♂️🚴🏻‍♀️🚴🏻🚴🏻‍♂️🏆🥇🥈🥉🏅🎖️🏵️🎗️🎫🎟️🎪🤹🏻‍♀️🤹🏻🤹🏻‍♂️🎭🩰🎨🫟🎬🎤🎧🎼🎹🪇🥁🪘🎷🎺🪊🪗🎸🪕🪉🎻🪈🎲♟️🎯🎳🎮🎰🧩";
const TRAVEL = "🚗🚕🚙🚌🚎🏎️🚓🚑🚒🚐🛻🚚🚛🚜🦯🦽🦼🩼🛴🚲🛵🏍️🛺🛞🚨🚔🚍🚘🚖🚡🚠🚟🚃🚋🚞🚝🚄🚅🚈🚂🚆🚇🚊🚉✈️🛫🛬🛩️💺🛰️🚀🛸🚁🛶⛵🚤🛥️🛳️⛴️🚢🛟⚓🪝⛽🚧🚦🚥🚏🗺️🗿🗽🗼🏰🏯🏟️🎡🎢🎠⛲⛱️🏖️🏝️🏜️🌋⛰️🏔️🗻🏕️⛺🛖🏠🏡🏘️🏚️🏗️🏭🏢🏬🏣🏤🏥🏦🏨🏪🏫🏩💒🏛️⛪🕌🕍🛕🕋⛩️🛤️🛣️🗾🎑🏞️🌅🌄🌠🎇🎆🌇🌆🏙️🌃🌌🌉🌁";
const OBJECTS = "⌚📱📲💻⌨️🖥️🖨️🖱️🖲️🕹️🗜️💽💾💿📀📼📷📸📹🎥📽️🎞️📞☎️📟📠📺📻🎙️🎚️🎛️🧭⏱️⏲️⏰🕰️⌛⏳📡🔋🪫🔌💡🔦🕯️🪔🧯🛢️💸💵💴💶💷🪙💰💳🪪💎🪎⚖️🪜🧰🪛🔧🔨⚒️🛠️⛏️🪏🪚🔩⚙️🪤🧱⛓️⛓️‍💥🧲🔫💣🧨🪓🔪🗡️⚔️🛡️🚬⚰️🪦⚱️🏺🔮📿🧿🪬💈⚗️🔭🔬🕳️🩻🩹🩺💊💉🩸🧬🦠🧫🧪🌡️🧹🪠🧺🧻🚽🚰🚿🛁🛀🏻🧼🪥🪒🪮🧽🪣🧴🛎️🔑🗝️🚪🪑🛋️🛏️🛌🏻🧸🪆🖼️🪞🪟🛍️🛒🎁🎈🎏🎀🪄🪅🎊🎉🎎🪭🏮🎐🪩🧧✉️📩📨📧💌📥📤📦🏷️🪧📪📫📬📭📮📯📜📃📄📑🧾📊📈📉🗒️🗓️📆📅🗑️📇🗃️🗳️🗄️📋📁📂🗂️🗞️📰📓📔📒📕📗📘📙📚📖🔖🧷🔗📎🖇️📐📏🧮📌📍✂️🖊️🖋️✒️🖌️🖍️📝✏️🔍🔎🔏🔐🔒🔓";
const SYMBOLS = "🩷❤️🧡💛💚🩵💙💜🖤🩶🤍🤎💔❤️‍🔥❤️‍🩹❣️💕💞💓💗💖💘💝💟☮️✝️☪️🕉️☸️🪯✡️🔯🕎☯️☦️🛐⛎♈♉♊♋♌♍♎♏♐♑♒♓🆔⚛️🉑☢️☣️📴📳🈶🈚🈸🈺🈷️✴️🆚💮🉐㊙️㊗️🈴🈵🈹🈲🅰️🅱️🆎🆑🅾️🆘❌⭕🛑⛔📛🚫💯💢♨️🚷🚯🚳🚱🔞📵🚭❗❕❓❔‼️⁉️🔅🔆〽️⚠️🚸🔱⚜️🔰♻️✅🈯💹❇️✳️❎🌐💠Ⓜ️🌀💤🏧🚾♿🅿️🛗🈳🈂️🛂🛃🛄🛅🛜🚹🚺🚼🧑‍🧑‍🧒🧑‍🧑‍🧒‍🧒🧑‍🧒🧑‍🧒‍🧒🚻🚮🎦📶🈁🔣ℹ️🔤🔡🔠🆖🆗🆙🆒🆕🆓0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟🔢#️⃣*️⃣⏏️▶️⏸️⏯️⏹️⏺️⏭️⏮️⏩⏪⏫⏬◀️🔼🔽➡️⬅️⬆️⬇️↗️↘️↙️↖️↕️↔️↪️↩️⤴️⤵️🔀🔁🔂🔄🔃🎵🎶➕➖➗✖️🟰♾️💲💱™️©️®️👁️‍🗨️🔚🔙🔛🔝🔜〰️➰➿✔️☑️🔘🔴🟠🟡🟢🔵🟣⚫⚪🟤🔺🔻🔸🔹🔶🔷🔳🔲▪️▫️◾◽◼️◻️🟥🟧🟨🟩🟦🟪⬛⬜🟫🔈🔇🔉🔊🔔🔕📣📢💬💭🗯️♠️♣️♥️♦️🃏🎴🀄🕐🕑🕒🕓🕔🕕🕖🕗🕘🕙🕚🕛🕜🕝🕞🕟🕠🕡🕢🕣🕤🕥🕦🕧";
const FLAGS = "🏳️🏴🏴‍☠️🏁🚩🇺🇳🇦🇫🇦🇽🇦🇱🇩🇿🇦🇸🇦🇩🇦🇴🇦🇮🇦🇶🇦🇬🇦🇷🇦🇲🇦🇼🇦🇺🇦🇹🇦🇿🇧🇸🇧🇭🇧🇩🇧🇧🇧🇾🇧🇪🇧🇿🇧🇯🇧🇲🇧🇹🇧🇴🇧🇦🇧🇼🇧🇷🇻🇬🇧🇳🇧🇬🇧🇫🇧🇮🇰🇭🇨🇲🇨🇦🇮🇨🇨🇻🇧🇶🇰🇾🇨🇫🇹🇩🇮🇴🇨🇱🇨🇳🇨🇽🇨🇨🇨🇴🇰🇲🇨🇬🇨🇩🇨🇰🇨🇷🇨🇮🇭🇷🇨🇺🇨🇼🇨🇾🇨🇿🇩🇰🇩🇯🇩🇲🇩🇴🇪🇨🇪🇬🇸🇻🇬🇶🇪🇷🇪🇪🇸🇿🇪🇹🇪🇺🇫🇰🇫🇴🇫🇯🇫🇮🇫🇷🇬🇫🇵🇫🇹🇫🇬🇦🇬🇲🇬🇪🇩🇪🇬🇭🇬🇮🇬🇷🇬🇱🇬🇩🇬🇵🇬🇺🇬🇹🇬🇬🇬🇳🇬🇼🇬🇾🇭🇹🇭🇳🇭🇰🇭🇺🇮🇸🇮🇳🇮🇩🇮🇷🇮🇶🇮🇪🇮🇲🇮🇹🇯🇲🇯🇵🎌🇯🇪🇯🇴🇰🇿🇰🇪🇰🇮🇽🇰🇰🇼🇰🇬🇱🇦🇱🇻🇱🇧🇱🇸🇱🇷🇱🇾🇱🇮🇱🇹🇱🇺🇲🇴🇲🇬🇲🇼🇲🇾🇲🇻🇲🇱🇲🇹🇲🇭🇲🇶🇲🇷🇲🇺🇾🇹🇲🇽🇫🇲🇲🇩🇲🇨🇲🇳🇲🇪🇲🇸🇲🇦🇲🇿🇲🇲🇳🇦🇳🇷🇳🇵🇳🇱🇳🇨🇳🇿🇳🇮🇳🇪🇳🇬🇳🇺🇳🇫🇰🇵🇲🇰🇲🇵🇳🇴🇴🇲🇵🇰🇵🇼🇵🇸🇵🇦🇵🇬🇵🇾🇵🇪🇵🇭🇵🇳🇵🇱🇵🇹🇵🇷🇶🇦🇷🇪🇷🇴🇷🇺🇷🇼🇼🇸🇸🇲🇸🇹🇨🇶🇸🇦🇸🇳🇷🇸🇸🇨🇸🇱🇸🇬🇸🇽🇸🇰🇸🇮🇬🇸🇸🇧🇸🇴🇿🇦🇰🇷🇸🇸🇪🇸🇱🇰🇧🇱🇸🇭🇰🇳🇱🇨🇵🇲🇻🇨🇸🇩🇸🇷🇸🇪🇨🇭🇸🇾🇹🇼🇹🇯🇹🇿🇹🇭🇹🇱🇹🇬🇹🇰🇹🇴🇹🇹🇹🇳🇹🇷🇹🇲🇹🇨🇹🇻🇻🇮🇺🇬🇺🇦🇦🇪🇬🇧🇺🇸🇺🇾🇺🇿🇻🇺🇻🇦🇻🇪🇻🇳🇼🇫🇪🇭🇾🇪🇿🇲🇿🇼";

function split(s: string) {
  return s.split(/(?=\p{Extended_Pictographic})/u).filter(Boolean);
}

export default function EmoticonPicker({ onSelect, onClose, mode = "popover" }: Props) {
  const [tab, setTab] = useState<string>("smileys-people");
  const [recent, setRecent] = useState<string[]>([]);

  const categories: Record<string, string[]> = {
    recent: recent,
    "smileys-people": split(SMILEYS_PEOPLE),
    animals: split(ANIMALS),
    food: split(FOOD),
    activity: split(ACTIVITY),
    travel: split(TRAVEL),
    objects: split(OBJECTS),
    symbols: split(SYMBOLS),
    flags: split(FLAGS),
  };

  const currentList = categories[tab] || [];

  const handleSelect = (emoji: string) => {
    setRecent((prev) => [emoji, ...prev.filter((x) => x !== emoji)].slice(0, 24));
    onSelect(emoji);
  };

  const tabs: [string, string][] = [
    ["recent", "🕑 Recent"],
    ["smileys-people", "😀 Smileys & People"],
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
    return <div style={{ width: "100%", background: "#fff", borderTop: "1px solid #e5e5e5", overflow: "hidden", flexShrink: 0 }}>{content}</div>;
  }

  return <div style={{ position: "absolute", bottom: "100%", left: 0, width: 360, maxWidth: "92vw", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 50 }}>{content}</div>;
}
