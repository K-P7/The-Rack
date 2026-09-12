import React, { useState, useMemo } from "react";

const FONT_IMPORT_ID = "the-rack-fonts";

function useFonts() {
  React.useEffect(() => {
    if (document.getElementById(FONT_IMPORT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_IMPORT_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

// ---- Domain data -----------------------------------------------------

const COLORS = [
  { name: "Black", hex: "#1c1c1c", family: "neutral" },
  { name: "White", hex: "#f5f3ee", family: "neutral" },
  { name: "Grey", hex: "#9a958c", family: "neutral" },
  { name: "Navy", hex: "#22344a", family: "neutral" },
  { name: "Beige", hex: "#d8c7a8", family: "neutral" },
  { name: "Brown", hex: "#6b4a34", family: "warm" },
  { name: "Tan", hex: "#c19a6b", family: "warm" },
  { name: "Rust", hex: "#a6503a", family: "warm" },
  { name: "Mustard", hex: "#c99a2e", family: "warm" },
  { name: "Red", hex: "#a3352b", family: "warm" },
  { name: "Olive", hex: "#6f7748", family: "cool" },
  { name: "Forest Green", hex: "#33513f", family: "cool" },
  { name: "Denim Blue", hex: "#3d5a73", family: "cool" },
  { name: "Sky Blue", hex: "#6f95ab", family: "cool" },
  { name: "Purple", hex: "#5b4b6f", family: "cool" },
];

const STYLES = ["Casual", "Smart-casual", "Formal", "Sporty"];

const CATEGORY_META = {
  top: { label: "Tops", plural: "tops" },
  bottom: { label: "Bottoms", plural: "bottoms" },
  shoes: { label: "Shoes", plural: "shoes" },
};

const STARTER_ITEMS = [
  { id: "s1", category: "top", name: "White Oxford Shirt", color: "White", style: "Smart-casual" },
  { id: "s2", category: "top", name: "Grey T-Shirt", color: "Grey", style: "Casual" },
  { id: "s3", category: "bottom", name: "Navy Chinos", color: "Navy", style: "Smart-casual" },
  { id: "s4", category: "bottom", name: "Black Denim", color: "Black", style: "Casual" },
  { id: "s5", category: "shoes", name: "Tan Loafers", color: "Tan", style: "Smart-casual" },
  { id: "s6", category: "shoes", name: "White Sneakers", color: "White", style: "Casual" },
];

// ---- Matching logic ----------------------------------------------------

function colorFamily(colorName) {
  const c = COLORS.find((c) => c.name === colorName);
  return c ? c.family : "neutral";
}

function colorHex(colorName) {
  const c = COLORS.find((c) => c.name === colorName);
  return c ? c.hex : "#999";
}

function styleScore(styles) {
  const uniq = [...new Set(styles)];
  if (uniq.length === 1) return { score: 2, note: `all ${uniq[0].toLowerCase()}` };
  const bendable = new Set(["Casual", "Smart-casual"]);
  if (uniq.every((s) => bendable.has(s))) {
    return { score: 1, note: "casual and smart-casual mix well" };
  }
  if (uniq.includes("Formal") && uniq.includes("Sporty")) {
    return { score: -3, note: "formal and sporty clash" };
  }
  return { score: -1, note: "styles don't quite match" };
}

function colorScore(colors) {
  const families = colors.map(colorFamily);
  const neutralCount = families.filter((f) => f === "neutral").length;
  let score = 0;
  let note = "";

  if (neutralCount === families.length) {
    score = 2;
    note = "an all-neutral palette, easy to wear";
  } else if (neutralCount === families.length - 1) {
    score = 2;
    note = "neutrals ground the one standout color";
  } else {
    const nonNeutral = families.filter((f) => f !== "neutral");
    const uniqFamilies = new Set(nonNeutral);
    if (uniqFamilies.size === 1) {
      score = 1;
      note = `everything sits in the same ${[...uniqFamilies][0]} family`;
    } else {
      score = -2;
      note = "warm and cool tones are competing";
    }
  }
  return { score, note };
}

function buildOutfits(items) {
  const tops = items.filter((i) => i.category === "top");
  const bottoms = items.filter((i) => i.category === "bottom");
  const shoes = items.filter((i) => i.category === "shoes");

  const outfits = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const styles = [top.style, bottom.style, shoe.style];
        const colors = [top.color, bottom.color, shoe.color];
        const s = styleScore(styles);
        const c = colorScore(colors);
        outfits.push({
          top,
          bottom,
          shoe,
          score: s.score + c.score,
          notes: [c.note, s.note],
        });
      }
    }
  }
  return outfits.sort((a, b) => b.score - a.score);
}

// ---- Small UI pieces -----------------------------------------------------

function Swatch({ color, size = 14 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: colorHex(color),
        border: "1px solid rgba(0,0,0,0.25)",
        flexShrink: 0,
      }}
    />
  );
}

function ItemCard({ item, onRemove }) {
  return (
    <div
      style={{
        background: "#F3EFE6",
        border: "1px solid #d8d0bd",
        borderRadius: 4,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        position: "relative",
      }}
    >
      <Swatch color={item.color} size={18} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Zilla Slab', serif",
            fontWeight: 600,
            fontSize: 15,
            color: "#20242B",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#7a7362" }}>
          {item.color} · {item.style}
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        style={{
          background: "none",
          border: "none",
          color: "#a6503a",
          fontSize: 18,
          cursor: "pointer",
          lineHeight: 1,
          padding: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}

function OutfitCard({ outfit, rank }) {
  const { top, bottom, shoe, notes } = outfit;
  return (
    <div
      style={{
        background: "#1B2A38",
        borderRadius: 6,
        padding: "18px 20px",
        color: "#F3EFE6",
        border: "1px solid #2c4056",
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          letterSpacing: 0.4,
          color: "#C9A15A",
          marginBottom: 10,
        }}
      >
        Pairing {rank}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {[top, bottom, shoe].map((it) => (
          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Swatch color={it.color} size={14} />
            <span style={{ fontFamily: "'Zilla Slab', serif", fontSize: 16, fontWeight: 600 }}>
              {it.name}
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9db0c2" }}>
              {it.category === "top" ? "top" : it.category === "bottom" ? "bottom" : "shoes"}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: "#c7d2dc",
          borderTop: "1px solid #2c4056",
          paddingTop: 10,
        }}
      >
        {notes.filter(Boolean).join(" · ")}
      </div>
    </div>
  );
}

// ---- Main app -----------------------------------------------------

export default function TheRack() {
  useFonts();
  const [items, setItems] = useState(STARTER_ITEMS);
  const [category, setCategory] = useState("top");
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0].name);
  const [style, setStyle] = useState(STYLES[0]);
  const [showOutfits, setShowOutfits] = useState(false);

  const outfits = useMemo(() => buildOutfits(items), [items]);
  const topOutfits = outfits.slice(0, 3);

  const counts = {
    top: items.filter((i) => i.category === "top").length,
    bottom: items.filter((i) => i.category === "bottom").length,
    shoes: items.filter((i) => i.category === "shoes").length,
  };
  const canSuggest = counts.top > 0 && counts.bottom > 0 && counts.shoes > 0;

  function addItem(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: `${Date.now()}`, category, name: name.trim(), color, style },
    ]);
    setName("");
    setShowOutfits(false);
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setShowOutfits(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F1720",
        padding: "32px 16px 60px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "'Zilla Slab', serif",
              fontWeight: 700,
              fontSize: 34,
              color: "#F3EFE6",
              margin: 0,
            }}
          >
            The Rack
          </h1>
          <p style={{ color: "#8fa0af", fontSize: 14, marginTop: 6, maxWidth: 420 }}>
            Log what's in your closet. Get outfit pairings that actually work together.
          </p>
        </header>

        <form
          onSubmit={addItem}
          style={{
            background: "#152130",
            border: "1px solid #253345",
            borderRadius: 6,
            padding: 18,
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <button
                type="button"
                key={key}
                onClick={() => setCategory(key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "1px solid " + (category === key ? "#C9A15A" : "#2c4056"),
                  background: category === key ? "#C9A15A" : "transparent",
                  color: category === key ? "#1B2A38" : "#c7d2dc",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {meta.label.slice(0, -1)}
              </button>
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              category === "top"
                ? "e.g. Blue linen shirt"
                : category === "bottom"
                ? "e.g. Khaki trousers"
                : "e.g. Brown derby shoes"
            }
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              borderRadius: 4,
              border: "1px solid #2c4056",
              background: "#0F1720",
              color: "#F3EFE6",
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              marginBottom: 12,
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                flex: "1 1 140px",
                padding: "8px 10px",
                borderRadius: 4,
                border: "1px solid #2c4056",
                background: "#0F1720",
                color: "#F3EFE6",
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
              }}
            >
              {COLORS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={{
                flex: "1 1 140px",
                padding: "8px 10px",
                borderRadius: 4,
                border: "1px solid #2c4056",
                background: "#0F1720",
                color: "#F3EFE6",
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
              }}
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 4,
              border: "none",
              background: "#A6503A",
              color: "#F3EFE6",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Add to closet
          </button>
        </form>

        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr", marginBottom: 28 }}>
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const catItems = items.filter((i) => i.category === key);
            return (
              <div key={key}>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: "#8fa0af",
                    marginBottom: 8,
                  }}
                >
                  {meta.label} ({catItems.length})
                </div>
                {catItems.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#546374", fontStyle: "italic" }}>
                    Nothing added yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {catItems.map((item) => (
                      <ItemCard key={item.id} item={item} onRemove={removeItem} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowOutfits(true)}
          disabled={!canSuggest}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 4,
            border: "none",
            background: canSuggest ? "#C9A15A" : "#2c3440",
            color: canSuggest ? "#1B2A38" : "#5c6773",
            fontFamily: "'Zilla Slab', serif",
            fontWeight: 700,
            fontSize: 16,
            cursor: canSuggest ? "pointer" : "not-allowed",
            marginBottom: 24,
          }}
        >
          Suggest outfits
        </button>
        {!canSuggest && (
          <p style={{ marginTop: -16, marginBottom: 24, fontSize: 12, color: "#546374" }}>
            Add at least one top, one bottom, and one pair of shoes to get suggestions.
          </p>
        )}

        {showOutfits && canSuggest && (
          <div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "#8fa0af",
                marginBottom: 12,
              }}
            >
              Top {topOutfits.length} pairings from your closet
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topOutfits.map((o, idx) => (
                <OutfitCard key={`${o.top.id}-${o.bottom.id}-${o.shoe.id}`} outfit={o} rank={idx + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}