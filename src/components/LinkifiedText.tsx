import { Linking, Text, TextProps } from "react-native";
import { useTheme } from "@/context/ThemeContext";

// Matches http(s) URLs, "www." hosts, bare domains on common TLDs
// (e.g. linkschat.app/invite) and email addresses.
const LINK_RE =
  /(\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b)|(\bhttps?:\/\/[^\s<>"]+)|(\bwww\.[^\s<>"]+)|(\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|ng|co|app|dev|me|info|edu|gov|tv|ly|gg|xyz|ai|uk)\b(?:\/[^\s<>"]*)?)/gi;

// Punctuation that usually ends the sentence rather than the URL.
const TRAILING_RE = /[.,!?;:'")\]]$/;

type Part = { text: string; href?: string };

export function parseLinks(input: string): Part[] {
  const parts: Part[] = [];
  let last = 0;
  for (const m of input.matchAll(LINK_RE)) {
    let raw = m[0];
    const start = m.index ?? 0;
    // Trim trailing punctuation one char at a time, but keep a ")" that
    // closes a "(" inside the URL (e.g. Wikipedia links).
    while (TRAILING_RE.test(raw)) {
      const ch = raw[raw.length - 1];
      if (
        ch === ")" &&
        (raw.match(/\(/g)?.length ?? 0) >= (raw.match(/\)/g)?.length ?? 0)
      )
        break;
      raw = raw.slice(0, -1);
    }
    if (!raw) continue;
    if (start > last) parts.push({ text: input.slice(last, start) });
    const href = m[1]
      ? `mailto:${raw}`
      : /^https?:\/\//i.test(raw)
      ? raw
      : `https://${raw}`;
    parts.push({ text: raw, href });
    last = start + raw.length;
  }
  if (last < input.length) parts.push({ text: input.slice(last) });
  return parts;
}

interface Props extends TextProps {
  children: string;
  // Forwarded to link spans: a link becomes the touch responder, so
  // without this long-pressing a link wouldn't open the message menu.
  onLinkLongPress?: () => void;
}

export default function LinkifiedText({
  children,
  onLinkLongPress,
  ...rest
}: Props) {
  const { isDark } = useTheme();
  const linkColor = isDark ? "#53BDEB" : "#027EB5";
  const parts = parseLinks(children || "");

  return (
    <Text {...rest}>
      {parts.map((p, i) =>
        p.href ? (
          <Text
            key={i}
            style={{ color: linkColor, textDecorationLine: "underline" }}
            onPress={() => Linking.openURL(p.href!).catch(() => {})}
            onLongPress={onLinkLongPress}
            suppressHighlighting
          >
            {p.text}
          </Text>
        ) : (
          p.text
        )
      )}
    </Text>
  );
}
