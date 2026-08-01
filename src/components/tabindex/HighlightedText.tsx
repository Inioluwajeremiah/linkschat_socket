import { Text } from "react-native";

export default function HighlightedText({
  text,
  query,
  style,
  highlightStyle,
}: {
  text: string;
  query: string;
  style?: any;
  highlightStyle?: any;
}) {
  if (!query.trim()) return <Text style={style}>{text}</Text>;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return <Text style={style}>{text}</Text>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.trim().length);
  const after = text.slice(idx + query.trim().length);
  return (
    <Text style={style} numberOfLines={1}>
      {before}
      <Text style={highlightStyle}>{match}</Text>
      {after}
    </Text>
  );
}
