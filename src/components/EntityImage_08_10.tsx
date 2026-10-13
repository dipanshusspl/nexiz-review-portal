/** Shows the uploaded image, or a coloured letter tile when no image was added yet. */
export default function EntityImage({ url, name, size = 56 }: { url?: string | null; name: string; size?: number }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} width={size} height={size} className="ent-img" style={{ width: size, height: size }} loading="lazy" />;
  }
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className="ent-fallback" style={{ width: size, height: size, background: `hsl(${hue} 45% 92%)`, color: `hsl(${hue} 55% 30%)`, fontSize: size * 0.42 }}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
