import { useEffect, useRef, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import supabase from "./supabase";

function IconHome({ active }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${active ? "text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function IconCloset({ active }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${active ? "text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16" />
      <path d="M12 6c0-2-1-3-3-3S6 4 6 6" />
      <path d="M4 6l8 8 8-8" />
    </svg>
  );
}

function IconChat({ active }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${active ? "text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5h16v10H8l-4 4V5z" />
    </svg>
  );
}

function IconStar({ active }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${active ? "text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3.5l2.6 5.2 5.8.8-4.2 4.1 1 5.9-5.2-2.7-5.2 2.7 1-5.9-4.2-4.1 5.8-.8L12 3.5z" />
    </svg>
  );
}

function BottomNav() {
  const items = [
    { to: "/home", label: "Home", icon: IconHome },
    { to: "/closet", label: "Closet", icon: IconCloset },
    { to: "/chat", label: "Chat", icon: IconChat },
    { to: "/favorites", label: "Favorites", icon: IconStar },
  ];

  return (
    <nav className="sticky bottom-0 border-t border-gray-100 bg-white px-4 py-2">
      <ul className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className="flex flex-col items-center justify-center gap-1 py-1 text-xs">
              {({ isActive }) => (
                <>
                  <item.icon active={isActive} />
                  <span className={isActive ? "text-primary font-medium" : "text-gray-500"}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AppShell({ children, gradient = false, hideBottomNav = false }) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[390px] bg-white shadow-sm">
      <main className={`${gradient ? "bg-gradient-to-b from-[#FFF0E8] to-[#E8E4F8]" : "bg-white"} min-h-screen px-5 pb-28 pt-8`}>
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

function PillButton({ children, variant = "primary", className = "", ...props }) {
  const base = "w-full rounded-[100px] px-5 py-3 text-sm font-semibold transition";
  const styles =
    variant === "outline"
      ? "border border-primary text-primary bg-white"
      : "bg-primary text-white";

  return (
    <button type="button" className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Field({ label, type = "text", placeholder, value, onChange, name, required = false, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function OnboardingSplash() {
  return (
    <AppShell gradient hideBottomNav>
      <div className="flex min-h-[80vh] flex-col justify-between">
        <div className="pt-14">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">ModeMuse</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-gray-900">Your AI wardrobe stylist</h1>
          <p className="mt-4 text-sm text-gray-600">Upload your closet, mix looks, and get instant outfit ideas.</p>
        </div>
        <div className="space-y-3 pb-10">
          <NavLink to="/signup" className="block">
            <PillButton>Sign Up</PillButton>
          </NavLink>
          <NavLink to="/login" className="block">
            <PillButton variant="outline">Log In</PillButton>
          </NavLink>
        </div>
      </div>
    </AppShell>
  );
}

function SignUpScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    console.log('Sign up clicked, email:', email, 'supabase URL:', import.meta.env.VITE_SUPABASE_URL);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name.trim() || undefined,
        },
      },
    });
    console.log('Supabase response:', data, 'error:', error);

    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/home", { replace: true });
  }

  return (
    <AppShell gradient hideBottomNav>
      <div className="pt-8">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-1 text-sm text-gray-600">Start building your digital wardrobe.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSignUp}>
          <Field
            label="Name"
            name="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <div className="pt-2">
            <PillButton
              type="submit"
              onClick={handleSignUp}
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-70" : ""}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </PillButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function LogInScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogIn(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate("/home", { replace: true });
  }

  return (
    <AppShell gradient hideBottomNav>
      <div className="pt-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-600">Log in to continue with ModeMuse.</p>
        <form className="mt-8 space-y-4" onSubmit={handleLogIn}>
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <div className="pt-2">
            <PillButton type="submit" disabled={isSubmitting} className={isSubmitting ? "opacity-70" : ""}>
              {isSubmitting ? "Logging in..." : "Log In"}
            </PillButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function FlatLayCard({ images, caption, children, pulsing }) {
  const slots = [
    { top: "6%", left: "4%", width: "44%", rotate: "-5deg", zIndex: 1 },
    { top: "22%", left: "26%", width: "48%", rotate: "2deg", zIndex: 4 },
    { top: "4%", right: "4%", left: "auto", width: "42%", rotate: "6deg", zIndex: 2 },
    { bottom: "8%", left: "6%", top: "auto", width: "30%", rotate: "-3deg", zIndex: 3 },
  ];
  return (
    <div style={{ borderRadius: "24px", background: "linear-gradient(145deg, #FDF6F0, #F5F0FA)", overflow: "hidden", position: "relative" }}>
      <div
        className={pulsing ? "flatlayPulse" : ""}
        style={{ position: "relative", width: "100%", paddingBottom: "115%", overflow: "hidden", transition: "opacity 0.3s ease" }}
      >
        {images.slice(0, 4).map((url, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: slots[i]?.top,
              left: slots[i]?.left,
              right: slots[i]?.right || "auto",
              bottom: slots[i]?.bottom || "auto",
              width: slots[i]?.width || "40%",
              aspectRatio: "3/4",
              borderRadius: "14px",
              overflow: "hidden",
              transform: `rotate(${slots[i]?.rotate || "0deg"})`,
              zIndex: slots[i]?.zIndex || 1,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              background: "#FFFFFF",
            }}
          >
            <img src={url} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
          </div>
        ))}
      </div>
      {(caption || children) && (
        <div style={{ padding: "14px 16px 16px", textAlign: "center" }}>
          {caption && (
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#3d355b", letterSpacing: "0.02em" }}>{caption}</p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

function getDisplayName(user) {
  if (!user) return "";
  const meta = user.user_metadata || {};
  const raw = meta.display_name || meta.first_name || meta.full_name?.split(" ")[0] || "";
  if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1);
  const emailPrefix = (user.email || "").split("@")[0] || "";
  return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
}

function HomeScreen() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [weatherLabel, setWeatherLabel] = useState("");
  const [userName, setUserName] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [suggestionCaption, setSuggestionCaption] = useState("");
  const [suggestionVibe, setSuggestionVibe] = useState("Today's Look");
  const [loadingOutfit, setLoadingOutfit] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const closetDataRef = useRef([]);
  const weatherRef = useRef({ tempF: null, cityName: "" });
  const previousUrlsRef = useRef([]);

  function parseOutfitResponse(text) {
    const urlRegex = /https?:\/\/[^\s)>\]]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|avif)(?:[^\s)>\]]*)/gi;
    const urls = [...new Set(text.match(urlRegex) || [])];

    // Extract vibe
    const vibeMatch = text.match(/VIBE:\s*(.+)/i);
    const vibe = vibeMatch ? vibeMatch[1].replace(/\*\*/g, "").trim() : "Today's Look";

    // Extract why
    const whyMatch = text.match(/WHY:\s*(.+)/i);
    let caption = whyMatch ? whyMatch[1].trim() : "";
    if (!caption) {
      caption = text;
      urls.forEach((u) => { caption = caption.replaceAll(u, ""); });
      caption = caption.replace(/VIBE:.*$/im, "").replace(/ITEMS:.*$/im, "").replace(/WHY:.*$/im, "");
      caption = caption.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\n{2,}/g, " ").replace(/^\s*[-•]\s*/gm, "").trim();
    }

    return { urls: urls.slice(0, 4), caption: caption || "Your daily look", vibe };
  }

  async function fetchOutfitSuggestion(extraInstruction) {
    const data = closetDataRef.current;
    const { tempF, cityName } = weatherRef.current;
    if (!data.length) return null;

    const imageBlocks = data.flatMap((item, i) => [
      { type: "text", text: `Item ${i + 1} (${item.image_url}):` },
      { type: "image", source: { type: "url", url: item.image_url } },
    ]);

    const weatherContext = tempF !== null
      ? `The current weather is ${tempF}°F in ${cityName}.`
      : "Weather is unknown.";

    const prompt = `${weatherContext} Build a complete outfit from my closet with exactly 4 items: 1) a Top, 2) a Bottom (or Dress), 3) Shoes, 4) an Accessory or Outerwear piece. If my closet is missing one of these categories, note what's missing.${extraInstruction ? " " + extraInstruction : ""}

Respond in this exact format:
VIBE: [a short 2-4 word style descriptor like "Casual Friday Vibes" or "Clean Girl Energy" or "Weekend Brunch Ready"]
ITEMS:
[image URL 1]
[image URL 2]
[image URL 3]
[image URL 4]
WHY: [one short sentence about the look]`;

    const response = await fetch("/api/anthropic/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Here are all my clothing items:" },
            ...imageBlocks,
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    const result = await response.json();
    if (!response.ok) return null;
    return parseOutfitResponse(result.content?.[0]?.text || "");
  }

  useEffect(() => {
    async function init() {
      // Fetch weather
      await new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(); return; }
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const [weatherRes, geoRes] = await Promise.all([
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`),
              fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`),
            ]);
            const weatherData = await weatherRes.json();
            const geoData = await geoRes.json();
            const tempF = Math.round(weatherData.current_weather?.temperature || 0);
            const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || "";
            const state = geoData.address?.state || "";
            const stateShort = state.length > 3 ? state.slice(0, 2).toUpperCase() : state;
            const cityName = `${city}${stateShort ? ", " + stateShort : ""}`;
            weatherRef.current = { tempF, cityName };
            setWeather(`${tempF}°F · ${cityName}`);
            setWeatherLabel(`${tempF}°F ${cityName}`);
          } catch { /* silent */ }
          resolve();
        }, () => resolve());
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingOutfit(false); return; }
      setUserName(getDisplayName(user));

      const { data, count } = await supabase
        .from("clothing_items")
        .select("image_url", { count: "exact" })
        .eq("user_id", user.id);

      setItemCount(count || 0);
      closetDataRef.current = data || [];
      if (!data || data.length === 0) { setLoadingOutfit(false); return; }

      try {
        const result = await fetchOutfitSuggestion();
        if (result) {
          setSuggestedImages(result.urls);
          setSuggestionCaption(result.caption);
          setSuggestionVibe(result.vibe);
          previousUrlsRef.current = result.urls;
        }
      } catch { /* silent */ }
      setLoadingOutfit(false);
    }

    init();
  }, []);

  async function handleNewLook() {
    setRegenerating(true);
    try {
      const prevUrls = previousUrlsRef.current;
      const avoidList = prevUrls.length > 0
        ? `Suggest a completely different outfit combination. Do NOT use these items: ${prevUrls.join(", ")}.`
        : "Suggest a completely different outfit combination, not the one you suggested before.";
      const result = await fetchOutfitSuggestion(avoidList);
      if (result) {
        setSuggestedImages(result.urls);
        setSuggestionCaption(result.caption);
        previousUrlsRef.current = result.urls;
      }
    } catch { /* silent */ }
    setRegenerating(false);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxWidth: "390px",
        margin: "0 auto",
        background: "linear-gradient(180deg, #FFF0E8 0%, #f3eefa 50%, #E8E4F8 100%)",
        position: "relative",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 90px" }}>
        {/* Weather pill */}
        <div style={{ display: "flex", justifyContent: "center", padding: "18px 16px 0" }}>
          {weather && (
            <span
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                borderRadius: "100px",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#555",
              }}
            >
              {weather}
            </span>
          )}
        </div>

        {/* Headline */}
        <div style={{ padding: "20px 24px 0", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#1a1a2e", lineHeight: "1.2" }}>
            What will you<br />wear today?
          </h1>
        </div>

        {/* User avatar + name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "20px 24px 0", textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7C6FE0, #9B8FFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </div>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#1a1a2e" }}>
            {userName ? `${userName}'s Closet` : "My Closet"}
          </p>
        </div>

        {/* Daily outfit suggestion */}
        <div style={{ padding: "24px 20px 0" }}>
          {loadingOutfit ? (
            <div
              style={{
                borderRadius: "24px",
                background: "#f0ede6",
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, color: "#999", fontSize: "14px" }}>Styling your daily look...</p>
            </div>
          ) : suggestedImages.length > 0 ? (
            <FlatLayCard
              images={suggestedImages}
              caption={suggestionVibe}
              pulsing={regenerating}
            >
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#888", lineHeight: "1.4" }}>
                {suggestionCaption}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  style={{
                    border: "none",
                    background: "linear-gradient(135deg, #7C6FE0 0%, #9B8FFF 100%)",
                    color: "white",
                    borderRadius: "100px",
                    padding: "10px 24px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(124,111,224,0.3)",
                  }}
                >
                  Get Styled
                </button>
                <button
                  type="button"
                  onClick={handleNewLook}
                  disabled={regenerating}
                  style={{
                    border: "1.5px solid #7C6FE0",
                    background: "transparent",
                    color: "#7C6FE0",
                    borderRadius: "100px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: regenerating ? "default" : "pointer",
                    opacity: regenerating ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "opacity 0.2s",
                  }}
                >
                  <span style={{ display: "inline-block", transform: regenerating ? "none" : "scaleX(-1)", fontSize: "14px" }}>↻</span>
                  {regenerating ? "Styling..." : "New Look"}
                </button>
              </div>
            </FlatLayCard>
          ) : (
            <div
              style={{
                borderRadius: "24px",
                background: "#f0ede6",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>
                {itemCount === 0 ? "Upload items to get daily outfit suggestions." : "Couldn't generate a suggestion right now."}
              </p>
              <button
                type="button"
                onClick={() => navigate(itemCount === 0 ? "/upload" : "/chat")}
                style={{
                  marginTop: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #7C6FE0 0%, #9B8FFF 100%)",
                  color: "white",
                  borderRadius: "100px",
                  padding: "10px 28px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {itemCount === 0 ? "Upload First Item" : "Get Styled"}
              </button>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", padding: "20px 24px 0" }}>
          <span
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(6px)",
              borderRadius: "100px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#3d355b",
            }}
          >
            {itemCount} Item{itemCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <BottomNav />
      <style>{`
        @keyframes flatLayPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .flatlayPulse {
          animation: flatLayPulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}


function ClosetScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [activeCategory, setActiveCategory] = useState("View All");
  const [activeCardId, setActiveCardId] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeProgress, setReanalyzeProgress] = useState("");
  const [reanalyzeDone, setReanalyzeDone] = useState(false);

  const categories = ["View All", "Apparel", "Tops", "Bottoms", "Dresses", "Skirts", "Shoes", "Bags", "Accessories", "Activewear"];

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      setIsLoadingItems(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) setIsLoadingItems(false);
        return;
      }

      const { data, error } = await supabase
        .from("clothing_items")
        .select("id, image_url, public_id, name, category, tags, is_favorited")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (isMounted) {
        setItems(error ? [] : (data || []).map((item) => ({
          ...item,
          _hasDbName: !!item.name,
          name: item.name || "Clothing Item",
          category: item.category || "Apparel",
          tags: item.tags || ["Apparel"],
          is_favorited: !!item.is_favorited,
        })));
        setIsLoadingItems(false);
      }
    }

    loadItems();
    return () => { isMounted = false; };
  }, []);

  async function handleDelete(itemId) {
    if (!window.confirm("Remove this item from your closet?")) return;
    const { error } = await supabase.from("clothing_items").delete().eq("id", itemId);
    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setActiveCardId(null);
  }

  async function handleToggleFavorite(itemId) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const newValue = !item.is_favorited;
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, is_favorited: newValue } : i));
    const { error } = await supabase
      .from("clothing_items")
      .update({ is_favorited: newValue })
      .eq("id", itemId);
    if (error) {
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, is_favorited: !newValue } : i));
      alert(`Failed to update favorite: ${error.message}`);
    }
  }

  const needsReanalysis = items.some((i) => !i._hasDbName);

  async function handleReanalyze() {
    const toAnalyze = items.filter((i) => !i._hasDbName);
    if (!toAnalyze.length) return;
    setReanalyzing(true);
    for (let idx = 0; idx < toAnalyze.length; idx++) {
      const item = toAnalyze[idx];
      setReanalyzeProgress(`Analyzing ${idx + 1} of ${toAnalyze.length}...`);
      const meta = await analyzeClothingImage(item.image_url);
      const { error } = await supabase
        .from("clothing_items")
        .update({ name: meta.name, category: meta.category, tags: meta.tags })
        .eq("id", item.id);
      if (!error) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, name: meta.name, category: meta.category, tags: meta.tags, _hasDbName: true } : i
          )
        );
      }
    }
    setReanalyzing(false);
    setReanalyzeProgress("");
    setReanalyzeDone(true);
  }

  const filteredItems = activeCategory === "View All"
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxWidth: "390px",
        margin: "0 auto",
        background: "white",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>My Wardrobe</h1>
          <span style={{ fontSize: "18px" }}>🔔</span>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <span
            style={{
              background: "#f3f1fc",
              color: "#7C6FE0",
              borderRadius: "100px",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
          <span
            style={{
              background: "#f3f1fc",
              color: "#7C6FE0",
              borderRadius: "100px",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            0 outfits
          </span>
        </div>

        {/* Re-analyze button */}
        {!isLoadingItems && needsReanalysis && !reanalyzeDone && (
          <button
            type="button"
            disabled={reanalyzing}
            onClick={handleReanalyze}
            style={{
              marginTop: "10px",
              width: "100%",
              border: "1px dashed #7C6FE0",
              borderRadius: "12px",
              padding: "10px",
              fontSize: "13px",
              fontWeight: 500,
              background: reanalyzing ? "#f3f1fc" : "white",
              color: "#7C6FE0",
              cursor: reanalyzing ? "default" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {reanalyzing ? reanalyzeProgress : "Re-analyze Closet — auto-name & categorize all items"}
          </button>
        )}
      </div>

      {/* Category chips */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "14px 16px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            style={{
              flexShrink: 0,
              border: activeCategory === cat ? "none" : "1px solid #e0e0e0",
              borderRadius: "100px",
              padding: "7px 16px",
              fontSize: "12px",
              fontWeight: 500,
              background: activeCategory === cat ? "#7C6FE0" : "white",
              color: activeCategory === cat ? "white" : "#555",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filters + Sort */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px 10px",
        }}
      >
        <button
          type="button"
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "12px",
            background: "white",
            color: "#555",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ fontSize: "11px" }}>☰</span> Filters
        </button>
        <button
          type="button"
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "12px",
            background: "white",
            color: "#555",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Sort By <span style={{ fontSize: "10px" }}>▼</span>
        </button>
      </div>

      {/* Grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 16px 100px",
        }}
      >
        {isLoadingItems ? (
          <p style={{ textAlign: "center", color: "#999", fontSize: "14px", marginTop: "40px" }}>Loading your wardrobe...</p>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "40px", color: "#999" }}>
            <p style={{ fontSize: "14px" }}>{items.length === 0 ? "Your closet is empty. Tap + to add items." : "No items in this category."}</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{ position: "relative", cursor: "pointer", minWidth: 0, overflow: "hidden" }}
                onClick={() => setActiveCardId(activeCardId === item.id ? null : item.id)}
              >
                {/* Overlay controls */}
                {activeCardId === item.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 0,
                      paddingBottom: "100%",
                      zIndex: 2,
                      borderRadius: "16px",
                      background: "rgba(0,0,0,0.3)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item.id); }}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "calc(50% - 30px)",
                        transform: "translateY(-50%)",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.95)",
                        fontSize: "18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: item.is_favorited ? "#7C6FE0" : "#888",
                      }}
                    >
                      {item.is_favorited ? "★" : "☆"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "calc(50% + 18px)",
                        transform: "translateY(-50%)",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.95)",
                        fontSize: "16px",
                        cursor: "pointer",
                        color: "#e53e3e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Image */}
                <div
                  style={{
                    aspectRatio: "1",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#f5f5f7",
                    border: "1px solid #eee",
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Name */}
                <p
                  style={{
                    margin: "8px 0 4px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1a1a2e",
                    lineHeight: "1.3",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </p>

                {/* Outfit photo badge */}
                {(Array.isArray(item.tags) ? item.tags : (item.tags || "").split(",")).some((t) => t.replace(/["\[\]]/g, "").trim() === "outfit_photo") && (
                  <p style={{ margin: "0 0 4px", fontSize: "10px", color: "#999" }}>📸 From outfit photo</p>
                )}

                {/* Tags */}
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {(typeof item.tags === 'string' ? item.tags.split(',') : item.tags || []).filter((t) => t.replace(/["\[\]]/g, "").trim() !== "outfit_photo").map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "#f3f1fc",
                        color: "#7C6FE0",
                        borderRadius: "100px",
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontWeight: 500,
                      }}
                    >
                      {tag.replace(/["\[\]]/g, '').trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating + button */}
      <button
        type="button"
        onClick={() => navigate("/upload")}
        style={{
          position: "absolute",
          bottom: "80px",
          right: "20px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "none",
          background: "#7C6FE0",
          color: "white",
          fontSize: "28px",
          fontWeight: 300,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(124,111,224,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        +
      </button>

      <BottomNav />
    </div>
  );
}

async function analyzeClothingImage(imageUrl) {
  try {
    const response = await fetch("/api/anthropic/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "url", url: imageUrl } },
              {
                type: "text",
                text: "Look at this clothing item. Return ONLY a JSON object with these fields: name (specific item name like 'Floral Midi Skirt'), category (one of: Tops, Bottoms, Dresses, Skirts, Shoes, Bags, Accessories, Activewear), tags (array of 2-3 descriptive words). No other text.",
              },
            ],
          },
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error("Vision API failed");
    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      name: parsed.name || "Clothing Item",
      category: parsed.category || "Apparel",
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : ["Apparel"],
    };
  } catch (err) {
    console.error("[analyzeClothingImage] Failed, using fallback:", err);
    return { name: "Clothing Item", category: "Apparel", tags: ["Apparel"] };
  }
}

function UploadScreen() {
  const [mode, setMode] = useState("single");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [wornFile, setWornFile] = useState(null);
  const [wornPreview, setWornPreview] = useState(null);
  const [wornPhase, setWornPhase] = useState("pick"); // pick | analyzing | confirm | saving
  const [detectedItems, setDetectedItems] = useState([]);
  const navigate = useNavigate();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      if (wornPreview) URL.revokeObjectURL(wornPreview);
    };
  }, [selectedFiles, wornPreview]);

  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Cloudinary upload failed");
    return data;
  }

  // Single item upload
  async function uploadSingleImage(file, userId) {
    const cloudinaryData = await uploadToCloudinary(file);
    const meta = await analyzeClothingImage(cloudinaryData.secure_url);
    const { error } = await supabase
      .from("clothing_items")
      .insert({
        user_id: userId,
        image_url: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id,
        name: meta.name,
        category: meta.category,
        tags: meta.tags,
      })
      .select();
    if (error) throw new Error(error.message);
  }

  async function handleUploadSelectedImages() {
    if (!selectedFiles.length || uploading) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Upload failed: not logged in."); return; }
      for (const item of selectedFiles) {
        await uploadSingleImage(item.file, user.id);
      }
      navigate("/closet");
    } catch (err) {
      console.error("[handleUploadSelectedImages] Error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  // Worn photo flow
  async function handleWornAnalyze() {
    if (!wornFile) return;
    setWornPhase("analyzing");
    try {
      const cloudinaryData = await uploadToCloudinary(wornFile);
      const imageUrl = cloudinaryData.secure_url;

      const response = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "url", url: imageUrl } },
              { type: "text", text: "Analyze this photo of a person wearing clothes. Identify every distinct clothing item and accessory you can see. For each item return a JSON array where each object has: name (specific item name like 'Black Leather Moto Jacket'), category (one of: Tops, Bottoms, Dresses, Skirts, Shoes, Bags, Accessories, Outerwear), tags (array of 2-3 descriptive words), confidence (high/medium/low). Return ONLY the JSON array, no other text." },
            ],
          }],
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Vision API failed");

      const text = result.content?.[0]?.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array in response");

      const parsed = JSON.parse(jsonMatch[0]);
      setDetectedItems(parsed.map((item, i) => ({
        ...item,
        id: i,
        checked: true,
        imageUrl: imageUrl,
        publicId: cloudinaryData.public_id,
      })));
      setWornPhase("confirm");
    } catch (err) {
      console.error("[handleWornAnalyze] Error:", err);
      alert(`Analysis failed: ${err.message}`);
      setWornPhase("pick");
    }
  }

  async function handleWornSave() {
    const confirmed = detectedItems.filter((i) => i.checked);
    if (!confirmed.length) { alert("Select at least one item."); return; }
    setWornPhase("saving");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Not logged in."); return; }

      for (const item of confirmed) {
        const tags = [...(Array.isArray(item.tags) ? item.tags : []), "outfit_photo"];
        const { error } = await supabase
          .from("clothing_items")
          .insert({
            user_id: user.id,
            image_url: item.imageUrl,
            public_id: item.publicId,
            name: item.name || "Clothing Item",
            category: item.category || "Tops",
            tags: tags,
          })
          .select();
        if (error) throw new Error(error.message);
      }
      navigate("/closet");
    } catch (err) {
      alert(`Save failed: ${err.message}`);
      setWornPhase("confirm");
    }
  }

  const openFilePicker = (forWorn) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = !forWorn;
    input.accept = "image/*";
    input.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      if (forWorn && files[0]) {
        setWornFile(files[0]);
        setWornPreview(URL.createObjectURL(files[0]));
      } else {
        const previews = files.map((file) => ({
          file,
          id: Math.random().toString(36).slice(2),
          previewUrl: URL.createObjectURL(file),
        }));
        setSelectedFiles((prev) => [...prev, ...previews]);
      }
    };
    input.click();
  };

  const openCamera = (forWorn) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      if (forWorn && files[0]) {
        setWornFile(files[0]);
        setWornPreview(URL.createObjectURL(files[0]));
      } else {
        const previews = files.map((file) => ({
          file,
          id: Math.random().toString(36).slice(2),
          previewUrl: URL.createObjectURL(file),
        }));
        setSelectedFiles((prev) => [...prev, ...previews]);
      }
    };
    input.click();
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const toggleStyle = { display: "flex", borderRadius: "100px", background: "#f3f1fc", padding: "3px", marginBottom: "20px" };
  const tabStyle = (active) => ({
    flex: 1,
    padding: "10px 0",
    borderRadius: "100px",
    border: "none",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: active ? "#7C6FE0" : "transparent",
    color: active ? "white" : "#7C6FE0",
    transition: "all 0.2s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", maxWidth: "390px", margin: "0 auto", background: "white" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 100px" }}>
        {/* Mode toggle */}
        <div style={toggleStyle}>
          <button type="button" style={tabStyle(mode === "single")} onClick={() => setMode("single")}>Single Item</button>
          <button type="button" style={tabStyle(mode === "worn")} onClick={() => setMode("worn")}>Worn Photo</button>
        </div>

        {mode === "single" && (
          <>
            <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "6px" }}>Photograph Your Item</h1>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "18px" }}>Upload a picture of your clothing on the floor, hanger, or wall.</p>

            <div
              onClick={() => openFilePicker(false)}
              style={{
                border: "2px dashed #C8C4F0",
                borderRadius: "16px",
                padding: "36px 20px",
                textAlign: "center",
                cursor: "pointer",
                background: "#FAFAFA",
                marginBottom: "14px",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>🖼</div>
              <p style={{ fontSize: "13px", color: "#999" }}>Select file</p>
            </div>

            <p style={{ textAlign: "center", color: "#999", marginBottom: "14px", fontSize: "13px" }}>or</p>

            <button onClick={() => openCamera(false)} style={{ width: "100%", padding: "12px", borderRadius: "100px", background: "#EEECfA", border: "none", color: "#7C6FE0", fontWeight: "600", fontSize: "13px", cursor: "pointer", marginBottom: "18px" }}>
              📷 Open Camera
            </button>

            {selectedFiles.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
                {selectedFiles.map((f) => (
                  <div key={f.id} style={{ position: "relative", aspectRatio: "1", borderRadius: "12px", overflow: "hidden" }}>
                    <img src={f.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => removeFile(f.id)} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: "20px", height: "20px", color: "white", cursor: "pointer", fontSize: "12px" }}>x</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode === "worn" && (
          <>
            <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "6px" }}>Upload Worn Photo</h1>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "18px" }}>Upload a photo of you wearing an outfit. We'll identify each piece.</p>

            {wornPhase === "pick" && (
              <>
                <div
                  onClick={() => openFilePicker(true)}
                  style={{
                    border: "2px dashed #C8C4F0",
                    borderRadius: "16px",
                    padding: "36px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#FAFAFA",
                    marginBottom: "14px",
                  }}
                >
                  {wornPreview ? (
                    <img src={wornPreview} alt="Worn outfit" style={{ width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "12px" }} />
                  ) : (
                    <>
                      <div style={{ fontSize: "28px", marginBottom: "6px" }}>👤</div>
                      <p style={{ fontSize: "13px", color: "#999" }}>Select outfit photo</p>
                    </>
                  )}
                </div>

                <p style={{ textAlign: "center", color: "#999", marginBottom: "14px", fontSize: "13px" }}>or</p>

                <button onClick={() => openCamera(true)} style={{ width: "100%", padding: "12px", borderRadius: "100px", background: "#EEECfA", border: "none", color: "#7C6FE0", fontWeight: "600", fontSize: "13px", cursor: "pointer", marginBottom: "18px" }}>
                  📷 Take Photo
                </button>
              </>
            )}

            {wornPhase === "analyzing" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                {wornPreview && <img src={wornPreview} alt="" style={{ width: "60%", borderRadius: "16px", marginBottom: "16px", opacity: 0.7 }} />}
                <p style={{ color: "#7C6FE0", fontWeight: 600, fontSize: "14px" }}>Analyzing your outfit...</p>
                <p style={{ color: "#999", fontSize: "12px", marginTop: "4px" }}>Identifying each clothing piece</p>
              </div>
            )}

            {wornPhase === "confirm" && (
              <>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "12px" }}>
                  Found {detectedItems.length} item{detectedItems.length !== 1 ? "s" : ""} — deselect any that are wrong:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {detectedItems.map((item) => (
                    <label
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 14px",
                        borderRadius: "14px",
                        border: item.checked ? "1.5px solid #7C6FE0" : "1.5px solid #e0e0e0",
                        background: item.checked ? "#f9f8ff" : "#fafafa",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => setDetectedItems((prev) => prev.map((d) => d.id === item.id ? { ...d, checked: !d.checked } : d))}
                        style={{ accentColor: "#7C6FE0", width: "18px", height: "18px", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>{item.name}</p>
                        <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ background: "#f3f1fc", color: "#7C6FE0", borderRadius: "100px", padding: "2px 8px", fontSize: "10px", fontWeight: 500 }}>
                            {item.category}
                          </span>
                          {(item.tags || []).map((tag) => (
                            <span key={tag} style={{ background: "#f0f0f0", color: "#888", borderRadius: "100px", padding: "2px 8px", fontSize: "10px" }}>
                              {tag}
                            </span>
                          ))}
                          <span style={{ fontSize: "10px", color: item.confidence === "high" ? "#22c55e" : item.confidence === "medium" ? "#f59e0b" : "#ef4444" }}>
                            {item.confidence}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}

            {wornPhase === "saving" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#7C6FE0", fontWeight: 600, fontSize: "14px" }}>Saving {detectedItems.filter((i) => i.checked).length} items to your closet...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "0 20px 20px" }}>
        {mode === "single" && selectedFiles.length > 0 && (
          <button onClick={handleUploadSelectedImages} disabled={uploading} style={{ width: "100%", padding: "14px", borderRadius: "100px", background: "#7C6FE0", border: "none", color: "white", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
            {uploading ? "Analyzing & uploading..." : `Continue (${selectedFiles.length} item${selectedFiles.length !== 1 ? "s" : ""})`}
          </button>
        )}
        {mode === "worn" && wornPhase === "pick" && wornFile && (
          <button onClick={handleWornAnalyze} style={{ width: "100%", padding: "14px", borderRadius: "100px", background: "#7C6FE0", border: "none", color: "white", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
            Analyze Outfit
          </button>
        )}
        {mode === "worn" && wornPhase === "confirm" && (
          <button onClick={handleWornSave} style={{ width: "100%", padding: "14px", borderRadius: "100px", background: "#7C6FE0", border: "none", color: "white", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
            Save {detectedItems.filter((i) => i.checked).length} Item{detectedItems.filter((i) => i.checked).length !== 1 ? "s" : ""} to Closet
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function ChatScreen() {
  const [inputValue, setInputValue] = useState("");
  const [phase, setPhase] = useState("initial");
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const occasions = [
    "Wedding Guest",
    "Birthday Party",
    "Date Night",
    "Concert",
    "Office",
    "Vacation",
    "Outdoor Picnic",
  ];

  function parseAiResponse(text) {
    const imageUrlRegex = /https?:\/\/[^\s)>\]]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|avif)(?:[^\s)>\]]*)/gi;
    const imageUrls = [...new Set(text.match(imageUrlRegex) || [])];
    let description = text;
    imageUrls.forEach((url) => {
      description = description.replaceAll(url, "");
    });
    description = description
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/^#+\s+/gm, "")
      .replace(/\s*\(\s*\)/g, "")
      .replace(/\s*\[\s*\]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const shoppingLinkRegex = /(https:\/\/www\.google\.com\/search\?tbm=shop&q=[^\s)>\]]+)/gi;
    const shoppingLinks = description.match(shoppingLinkRegex) || [];

    return { imageUrls, description, shoppingLinks };
  }

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setUserMessage(trimmed);
    setInputValue("");
    setPhase("loading");
    setAiResponse("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in first.");
        setPhase("initial");
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from("clothing_items")
        .select("image_url")
        .eq("user_id", user.id);

      if (itemsError) throw new Error(`Failed to fetch wardrobe: ${itemsError.message}`);
      if (!items || items.length === 0) {
        alert("Your closet is empty! Upload some items first.");
        setPhase("initial");
        return;
      }

      const imageBlocks = items.flatMap((item, i) => [
        { type: "text", text: `Item ${i + 1} (${item.image_url}):` },
        { type: "image", source: { type: "url", url: item.image_url } },
      ]);

      const response = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: `You are the user's stylish best friend who lives and breathes fashion. You talk like a knowledgeable, trendy friend — not a generic AI. Reference current aesthetics when relevant: clean girl, quiet luxury, coastal grandmother, Y2K, old money, mob wife, coquette, Hailey Bieber street style, Gen Z minimalism, etc.

Format every response with these sections:

YOUR LOOK
List each piece you're pulling from their closet. For each item, write the item name and include its image URL on the same line. Be specific about what you see in the image.

WHY IT WORKS
2-3 sentences max. Reference specific trends or aesthetics. Sound like you're hyping up a friend, not writing an essay.

COMPLETE THE LOOK (optional)
Suggest 1-2 specific items they could add to elevate the outfit — ONLY if there's a genuine gap. Frame these as optional additions, not replacements. For each suggestion include:
- The specific item name and why it would elevate the look
- A Google Shopping link formatted as: https://www.google.com/search?tbm=shop&q=item+name+here (use + for spaces in the query)

Keep an anti-overconsumption angle — celebrate what they already own and only suggest purchases that genuinely fill a gap. Never suggest buying something they already have a version of.`,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Here are all the clothing items in my closet:" },
                ...imageBlocks,
                { type: "text", text: `I need an outfit for: ${trimmed}\n\nLook at each clothing item image carefully. Pick the best combination from what I own for this occasion. For each item you pick, include its image URL (shown before each image as "Item N (url):").` },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || `API error: ${response.status}`);
      }

      const text = data.content?.[0]?.text || "Sorry, I couldn't generate a suggestion.";
      setAiResponse(text);
      setPhase("result");
    } catch (err) {
      console.error("[ChatScreen] Error:", err);
      alert(`Something went wrong: ${err.message}`);
      setPhase("initial");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxWidth: "390px",
        margin: "0 auto",
        background: "white",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>Stylist Chat</strong>
        <span aria-label="Notifications" role="img">
          🔔
        </span>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {phase === "initial" && (
          <>
            <div
              style={{
                background: "#EEEcFA",
                borderRadius: "16px",
                padding: "12px 16px",
                color: "#3d355b",
                fontSize: "14px",
                lineHeight: "1.4",
              }}
            >
              <span style={{ color: "#7C6FE0", marginRight: "6px" }}>✦</span>
              Hiya! I'm your style assistant. I'll peek in your closet and suggest outfits!
            </div>

            <div style={{ flex: 1 }} />

            <div
              style={{
                border: "1px solid #eee",
                borderRadius: "16px",
                padding: "14px",
                background: "white",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#4b3db2", fontWeight: 500 }}>
                ✦ Need outfit ideas? Here are some occasions...
              </p>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {occasions.map((occasion) => (
                  <button
                    key={occasion}
                    type="button"
                    onClick={() => setInputValue(occasion)}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "100px",
                      padding: "6px 14px",
                      fontSize: "13px",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    {occasion}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {(phase === "loading" || phase === "result") && (
          <>
            <div
              style={{
                marginLeft: "auto",
                maxWidth: "85%",
                background: "white",
                border: "1px solid #eee",
                borderRadius: "16px 16px 4px 16px",
                padding: "10px 14px",
                fontSize: "14px",
              }}
            >
              {userMessage}
            </div>

            {phase === "loading" && (
              <>
                <p style={{ margin: 0, color: "#7C6FE0", fontWeight: 500, fontSize: "14px" }}>
                  ✦ Checking your wardrobe for the perfect outfit!
                </p>
                <div
                  style={{
                    borderRadius: "16px",
                    padding: "18px",
                    background: "linear-gradient(180deg, #C8C4F0 0%, #A8A4E0 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span className="hanger-fade hanger-1" style={{ fontSize: "24px" }}>
                    🪝
                  </span>
                  <span className="hanger-fade hanger-2" style={{ fontSize: "24px" }}>
                    🪝
                  </span>
                  <span className="hanger-fade hanger-3" style={{ fontSize: "24px" }}>
                    🪝
                  </span>
                </div>
              </>
            )}

            {phase === "result" && (() => {
              const { imageUrls, description } = parseAiResponse(aiResponse);

              function renderTextWithLinks(text) {
                const linkRegex = /(https:\/\/www\.google\.com\/search\?tbm=shop&q=[^\s)>\]]+)/g;
                const parts = text.split(linkRegex);
                return parts.map((part, i) => {
                  if (linkRegex.test(part)) {
                    const queryMatch = part.match(/q=([^&\s]+)/);
                    const label = queryMatch ? decodeURIComponent(queryMatch[1].replace(/\+/g, " ")) : "Shop";
                    return (
                      <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#7C6FE0",
                          fontWeight: 500,
                          textDecoration: "none",
                          borderBottom: "1px solid #c4bef0",
                        }}
                      >
                        Shop {label} &rarr;
                      </a>
                    );
                  }
                  return <span key={i}>{part}</span>;
                });
              }

              return (
                <>
                  <p style={{ margin: 0, color: "#7C6FE0", fontWeight: 600, fontSize: "13px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    ✦ Your Look
                  </p>

                  {imageUrls.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        padding: "12px",
                        borderRadius: "20px",
                        background: "linear-gradient(160deg, #f8f7fc 0%, #eeeaf8 100%)",
                      }}
                    >
                      {imageUrls.map((url, i) => (
                        <div
                          key={i}
                          style={{
                            position: "relative",
                            aspectRatio: "1",
                            borderRadius: "14px",
                            overflow: "hidden",
                            background: "#fff",
                            boxShadow: "0 2px 12px rgba(124,111,224,0.08)",
                          }}
                        >
                          <img
                            src={url}
                            alt={`Outfit item ${i + 1}`}
                            style={{
                              display: "block",
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #eee",
                      borderRadius: "16px",
                      padding: "14px 16px",
                      fontSize: "14px",
                      lineHeight: "1.65",
                      color: "#3d355b",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {renderTextWithLinks(description)}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setInputValue(userMessage);
                        handleSend();
                      }}
                      style={{
                        flex: 1,
                        border: "none",
                        background: "linear-gradient(135deg, #7C6FE0 0%, #9B8FFF 100%)",
                        color: "white",
                        borderRadius: "100px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Try Another Look
                    </button>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #eee",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          background: "white",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Outfit For Today..."
            style={{
              width: "100%",
              borderRadius: "100px",
              border: "1px solid #ddd",
              padding: "10px 38px 10px 16px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8b8b8b",
              fontSize: "15px",
            }}
          >
            🎤
          </span>
        </div>
        <button
          type="button"
          onClick={handleSend}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "#7C6FE0",
            border: "none",
            cursor: "pointer",
            color: "white",
          }}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
      <BottomNav />
      <style>{`
        @keyframes hangerFadeIn {
          0% { opacity: 0.2; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hanger-fade {
          opacity: 0.2;
          animation: hangerFadeIn 0.6s ease forwards;
        }
        .hanger-1 { animation-delay: 0s; }
        .hanger-2 { animation-delay: 0.2s; }
        .hanger-3 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}

function FavoritesScreen() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (isMounted) setIsLoading(false); return; }
      const { data, error } = await supabase
        .from("clothing_items")
        .select("id, image_url, name, category, tags, is_favorited")
        .eq("user_id", user.id)
        .eq("is_favorited", true)
        .order("created_at", { ascending: false });
      if (isMounted) {
        setItems(error ? [] : (data || []).map((item) => ({
          ...item,
          name: item.name || "Clothing Item",
          tags: item.tags || [],
        })));
        setIsLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  async function handleUnfavorite(itemId) {
    const { error } = await supabase
      .from("clothing_items")
      .update({ is_favorited: false })
      .eq("id", itemId);
    if (error) { alert(`Failed: ${error.message}`); return; }
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  // Group favorited items into "outfits" of 3 for flat lay display
  const outfitGroups = [];
  for (let i = 0; i < items.length; i += 3) {
    outfitGroups.push(items.slice(i, i + 3));
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxWidth: "390px",
        margin: "0 auto",
        background: "white",
        position: "relative",
      }}
    >
      <div style={{ padding: "20px 16px 0" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>Favorites</h1>
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#888" }}>
          {items.length} saved piece{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }}>
        {isLoading ? (
          <p style={{ textAlign: "center", color: "#999", fontSize: "14px", marginTop: "40px" }}>Loading favorites...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "60px", color: "#999" }}>
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>☆</p>
            <p style={{ fontSize: "14px" }}>No favorites yet. Tap the star on items in your closet to save them here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {outfitGroups.map((group, gi) => {
              const groupImages = group.map((item) => item.image_url);
              const label = group.map((item) => item.name).join(" + ");
              const categoryLabel = group[0]?.category || "Outfit";
              return (
                <div key={gi} style={{ position: "relative" }}>
                  {/* Unfavorite buttons */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      zIndex: 10,
                      display: "flex",
                      gap: "4px",
                    }}
                  >
                    {group.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleUnfavorite(item.id)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(255,255,255,0.9)",
                          fontSize: "14px",
                          cursor: "pointer",
                          color: "#7C6FE0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <FlatLayCard
                    images={groupImages}
                    caption={categoryLabel}
                  >
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "11px",
                        color: "#888",
                        lineHeight: "1.3",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </p>
                  </FlatLayCard>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const onboardingRoutes = ["/", "/signup", "/login"];
  const isOnboarding = onboardingRoutes.includes(location.pathname);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f8]">
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    );
  }

  function protectedElement(element) {
    return session ? element : <Navigate to="/" replace />;
  }

  function publicElement(element) {
    return session ? <Navigate to="/home" replace /> : element;
  }

  return (
    <div className={`min-h-screen ${isOnboarding ? "bg-gradient-to-b from-[#FFF0E8] to-[#E8E4F8]" : "bg-[#f4f4f8]"}`}>
      <Routes>
        <Route path="/" element={publicElement(<OnboardingSplash />)} />
        <Route path="/signup" element={publicElement(<SignUpScreen />)} />
        <Route path="/login" element={publicElement(<LogInScreen />)} />
        <Route path="/home" element={protectedElement(<HomeScreen />)} />
        <Route path="/closet" element={protectedElement(<ClosetScreen />)} />
        <Route path="/upload" element={protectedElement(<UploadScreen />)} />
        <Route path="/chat" element={protectedElement(<ChatScreen />)} />
        <Route path="/favorites" element={protectedElement(<FavoritesScreen />)} />
        <Route path="*" element={<Navigate to={session ? "/home" : "/"} replace />} />
      </Routes>
    </div>
  );
}

export default AppRouter;
