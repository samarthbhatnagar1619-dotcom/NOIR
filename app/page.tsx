// NOIR — single-file Next.js page (App Router).
// 1) npx create-next-app@latest noir   (JavaScript, App Router)
// 2) Replace the entire contents of app/page.js with THIS file.
// 3) Optional: empty out app/globals.css.
// 4) npm run dev  ->  http://localhost:3000
// Make it yours: edit the PRODUCTS array + the JSX text. Brand name = "NOIR".
"use client";

import { useEffect, useRef, useState } from "react";

/* ============================ data ============================ */
const PRODUCTS = [
  {
    id: "noir", name: "Noir", price: 4900, finish: "Saffiano leather · brass trim",
    eyebrow: "The signature", cls: "",
    desc: "Full-grain saffiano leather wrapped over a steel frame, edged in a single line of brushed brass. The quiet original — at home on any surface, in any light.",
  },
  {
    id: "marquina", name: "Marquina", price: 6900, finish: "Black marble · white vein",
    eyebrow: "Stone edition", cls: "marble",
    desc: "Cut from a solid block of Nero Marquina marble, each piece carries its own white veining — so no two are ever exactly alike. Cool, weighted, permanent.",
  },
  {
    id: "onyx", name: "Onyx", price: 5400, finish: "Matte lacquer · gold edge",
    eyebrow: "Limited", cls: "onyx",
    desc: "Seven coats of hand-rubbed matte lacquer, finished with a fine gold edge. The deepest, most absolute black in the collection.",
  },
];
const SWATCH = {
  noir: "linear-gradient(135deg,#2a2723,#0b0a09)",
  marquina: "linear-gradient(135deg,#3a3733,#0b0a09 60%),radial-gradient(circle at 30% 30%,rgba(255,255,255,.4),transparent 35%)",
  onyx: "linear-gradient(135deg,#1a1816,#000)",
};
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

/* Lifestyle gallery.
   Drop your photos into  public/scenes/  with these exact filenames
   (hotel.jpg, salon.jpg, ...) and they appear automatically.
   Until then, each slot shows an elegant placeholder. */
const SCENES = [
  { file: "hotel.jpg", name: "The Hotel Suite", sub: "Nightstand · leather", span: "tall" },
  { file: "salon.jpg", name: "The Luxury Salon", sub: "Vanity · marble", span: "" },
  { file: "cafe.jpg", name: "The Café", sub: "Counter · leather", span: "" },
  { file: "study.jpg", name: "The Private Study", sub: "Desk · onyx", span: "wide" },
  { file: "bath.jpg", name: "The Marble Bath", sub: "Basin · marble", span: "" },
  { file: "lobby.jpg", name: "The Boutique Lobby", sub: "Console · leather", span: "" },
];
const NAV = [
  ["home", "Home"], ["collection", "Collection"],
  ["about", "About"], ["process", "Process"], ["contact", "Contact"],
];

/* ============================ the box ============================ */
function BoxFaces({ brand = "NOIR" }) {
  return (
    <>
      <div className="face back" />
      <div className="face left" />
      <div className="face right" />
      <div className="face bottom" />
      <div className="face top">
        <div className="slit" />
        <div className="tissue" />
      </div>
      <div className="face front">
        <span className="box__brand">{brand}</span>
      </div>
      <div className="box__sheen" />
    </>
  );
}

/* ============================================================ */
export default function Noir() {
  const [entered, setEntered] = useState(false);
  const [coverLeaving, setCoverLeaving] = useState(false);
  const [page, setPage] = useState("home");
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [productOpen, setProductOpen] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [email, setEmail] = useState("");

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const boxRef = useRef(null);
  const coverCurtainRef = useRef(null);
  const pageCurtainRef = useRef(null);
  const toastTimer = useRef(null);
  const pageRef = useRef(page);
  pageRef.current = page;

  /* ---------- custom cursor ---------- */
  useEffect(() => {
    if (window.matchMedia("(pointer:coarse)").matches) return;
    const dot = dotRef.current, ring = ringRef.current;
   let mx = innerWidth / 2,
    my = innerHeight / 2,
    rx = mx,
    ry = my,
    raf: number | null = null;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      // cursor-parallax tilt of the persistent box, only while it's whole
      const pg = pageRef.current;
      if (boxRef.current && (pg === "home" || pg === "contact")) {
        const px = mx / innerWidth - 0.5, py = my / innerHeight - 0.5;
        boxRef.current.style.transform =
          `rotateX(${11 - py * 14}deg) rotateY(${-27 + px * 24}deg)`;
      }
    };
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    const over = (e) => { if (e.target.closest("[data-cursor],a,button")) ring.classList.add("hover"); };
    const out = (e) => { if (e.target.closest("[data-cursor],a,button")) ring.classList.remove("hover"); };
    addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  /* ---------- nav hide + scroll progress ---------- */
  useEffect(() => {
    const nav = document.getElementById("nav");
    const progress = document.getElementById("progress");
    let lastY = 0;
    const onScroll = () => {
      const y = scrollY, h = document.body.scrollHeight - innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      if (y > lastY && y > 200) nav.classList.add("hide"); else nav.classList.remove("hide");
      lastY = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- reveals re-run each page ---------- */
  useEffect(() => {
    if (!entered) return;
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }),
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    const t = setTimeout(() => document.querySelectorAll(".reveal,.line-mask").forEach((el) => obs.observe(el)), 30);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, [entered, page]);

  /* ---------- escape ---------- */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setCartOpen(false); if (productOpen) closeProduct(); } };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [productOpen]);

  /* ---------- cover reveal ---------- */
  const enter = () => {
    setCoverLeaving(true);
    const panels = coverCurtainRef.current.querySelectorAll(".curtain__panel");
    panels.forEach((p, i) => {
      p.style.transformOrigin = "bottom";
      p.style.transition = `transform .7s var(--ease) ${i * 0.06}s`;
      requestAnimationFrame(() => (p.style.transform = "scaleY(1)"));
    });
    setTimeout(() => {
      setEntered(true);
      document.documentElement.style.scrollBehavior = "smooth";
      panels.forEach((p, i) => {
        p.style.transformOrigin = "top";
        p.style.transition = `transform .7s var(--ease) ${i * 0.06}s`;
        p.style.transform = "scaleY(0)";
      });
    }, 950);
  };

  /* ---------- page navigation (box morphs as content swaps) ---------- */
  const goPage = (next) => {
    if (next === page || busy) { setCartOpen(false); return; }
    setBusy(true);
    setLeaving(true);
    setCartOpen(false);
    setTimeout(() => {
      // clear any cursor-tilt inline transform so the box CSS modes take over
      if (boxRef.current) boxRef.current.style.transform = "";
      setPage(next);
      scrollTo({ top: 0, behavior: "auto" });
      setLeaving(false);
      setTimeout(() => setBusy(false), 700);
    }, 460);
  };

  /* ---------- product detail (curtain) ---------- */
  const openProduct = (p) => {
    const cur = pageCurtainRef.current;
    cur.style.transition = "transform .55s var(--ease)";
    cur.style.transformOrigin = "bottom";
    requestAnimationFrame(() => (cur.style.transform = "scaleY(1)"));
    setTimeout(() => {
      setProduct(p); setProductOpen(true);
      document.body.style.overflow = "hidden";
      cur.style.transformOrigin = "top"; cur.style.transform = "scaleY(0)";
    }, 560);
  };
  const closeProduct = () => {
    const cur = pageCurtainRef.current;
    cur.style.transformOrigin = "bottom"; cur.style.transform = "scaleY(1)";
    setTimeout(() => {
      setProductOpen(false); document.body.style.overflow = "";
      cur.style.transformOrigin = "top"; cur.style.transform = "scaleY(0)";
    }, 560);
  };

  /* ---------- cart / toast / signup ---------- */
  const showToast = (msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  };
  const addToCart = () => {
    setCart((prev) => {
      const f = prev.find((c) => c.id === product.id);
      if (f) return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} added to cart`);
  };
  const removeItem = (id) => setCart((prev) => prev.filter((c) => c.id !== id));
  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const cartTotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const subscribe = () => {
    if (email && /.+@.+\..+/.test(email)) { showToast("You're on the list — welcome to NOIR"); setEmail(""); }
    else showToast("Please enter a valid email");
  };

  /* ============================================================ */
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Hanken+Grotesk:wght@300;400;500;600&display=swap"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="grain" />
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-dot" ref={dotRef} />

      {/* ---------- COVER ---------- */}
      <div
        className={"cover" + (coverLeaving ? " is-leaving" : "")}
        style={{ opacity: coverLeaving ? 0 : 1, transition: "opacity .6s ease .25s", display: entered ? "none" : undefined }}
      >
        <div className="cover__glow" />
        <p className="eyebrow cover__eyebrow">Premium Tissue Boxes · Est. MMXXIV</p>
        <h1 className="cover__mark" aria-label="NOIR">
          <span>N</span><span>O</span><span>I</span><span>R</span>
        </h1>
        <p className="cover__tag">Simple. Modern. Elegant.</p>
        <button className="cover__cta" onClick={enter} data-cursor>
          <span className="bar" /><span>Enter the house</span><span className="arrow">→</span>
        </button>
      </div>
      <div className="curtain" ref={coverCurtainRef}>
        <div className="curtain__panel" /><div className="curtain__panel" />
        <div className="curtain__panel" /><div className="curtain__panel" /><div className="curtain__panel" />
      </div>

      {/* ---------- persistent transforming box ---------- */}
      <div className={"box-scene " + page + (entered ? " on" : "")}>
        <div className="box-stage">
          <div className={"box" + (page === "process" ? " explode" : "")} ref={boxRef}>
            <BoxFaces />
          </div>
          <div className="box__shadow" />
        </div>
      </div>

      {/* ---------- NAV ---------- */}
      <nav className="nav" id="nav">
        <button className="nav__logo" onClick={() => goPage("home")} data-cursor>NOIR</button>
        <div className="nav__links">
          {NAV.map(([id, label]) => (
            <button key={id} className={"navlink" + (page === id ? " active" : "")} onClick={() => goPage(id)} data-cursor>{label}</button>
          ))}
        </div>
        <button className="nav__cart" onClick={() => setCartOpen(true)} data-cursor>
          Cart <span className="count">{cartCount}</span>
        </button>
      </nav>
      <div className="progress" id="progress" />

      {/* ---------- PAGES ---------- */}
      <main className={"site" + (entered ? " ready" : "")}>
        <div key={page} className={"pageview" + (leaving ? " out" : "")}>

          {page === "home" && (
            <>
              <section className="screen home-hero">
                <div className="col">
                  <p className="eyebrow reveal">Premium tissue boxes</p>
                  <h1 className="big line-mask"><span>Black,</span></h1>
                  <h1 className="big line-mask" style={{ transitionDelay: ".12s" }}><span><em>by design.</em></span></h1>
                  <p className="lead reveal d2">Full-grain leather, Italian marble and brushed brass — tissue boxes finished like objects, not accessories.</p>
                  <div className="row reveal d3">
                    <button className="btn" onClick={() => goPage("collection")} data-cursor>Explore the collection <span className="arrow">→</span></button>
                    <button className="btn ghost" onClick={() => goPage("process")} data-cursor>See the process</button>
                  </div>
                  <div className="stats reveal d4">
                    <div><b>100%</b>Hand finished</div>
                    <div><b>3</b>Materials</div>
                    <div><b>PARIS</b>· Delhi</div>
                  </div>
                </div>
                <div className="scrollcue"><span>Scroll</span><span className="ln" /></div>
              </section>

              <div className="marquee">
                <div className="marquee__track">
                  <span>Elegant</span><span className="dot">✦</span><span>Luxury</span><span className="dot">✦</span><span>Rigid</span><span className="dot">✦</span>
                  <span>Elegant</span><span className="dot">✦</span><span>Luxury</span><span className="dot">✦</span><span>Rigid</span><span className="dot">✦</span>
                  <span>Elegant</span><span className="dot">✦</span><span>Luxury</span><span className="dot">✦</span><span>Rigid</span><span className="dot">✦</span>
                  <span>Elegant</span><span className="dot">✦</span><span>Luxury</span><span className="dot">✦</span><span>Rigid</span><span className="dot">✦</span>
                </div>
              </div>

              <section className="screen short">
                <div className="split">
                  <h2 className="reveal">An object,<br />not an<br />afterthought.</h2>
                  <div>
                    <p className="reveal d1">Most tissue boxes are made to be hidden. We make ours to be noticed — weighted, tactile, and finished by hand so they hold their own beside the candle, the book, the marble.</p>
                    <p className="reveal d2">Designed for every space: the desk, the vanity, the table that guests actually see.</p>
                  </div>
                </div>
                <div className="trio reveal d2"><span>Simple.</span><span>Modern.</span><span>Elegant.</span></div>
              </section>

              {/* two-product showcase */}
              <section className="screen showcase">
                <div className="head">
                  <div><p className="eyebrow reveal">The pieces</p><h1 className="big reveal d1">Two materials,<br />one obsession.</h1></div>
                  <p className="note reveal d2">The boxes that started it all — photographed exactly as they ship.</p>
                </div>

                <div className="show-row reveal">
                  <figure className="show-media" data-cursor onClick={() => openProduct(PRODUCTS[0])}>
                    <img src="/products/leather.jpg" alt="NOIR leather tissue box with brass trim"
                      loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span className="show-tag">01</span>
                  </figure>
                  <div className="show-copy">
                    <p className="eyebrow reveal">Saffiano leather · brass</p>
                    <h2 className="reveal d1">The Noir</h2>
                    <p className="reveal d2">Full-grain saffiano leather pulled taut over a steel frame and edged in a single line of brushed brass. The original — quiet, tactile, and impossibly at home anywhere.</p>
                    <div className="show-foot reveal d3">
                      <span className="price">{fmt(PRODUCTS[0].price)}</span>
                      <button className="btn" onClick={(e) => { e.stopPropagation(); openProduct(PRODUCTS[0]); }} data-cursor>View piece <span className="arrow">→</span></button>
                    </div>
                  </div>
                </div>

                <div className="show-row reverse reveal">
                  <figure className="show-media" data-cursor onClick={() => openProduct(PRODUCTS[1])}>
                    <img src="/products/marble.jpg" alt="NOIR Nero Marquina marble tissue box"
                      loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span className="show-tag">02</span>
                  </figure>
                  <div className="show-copy">
                    <p className="eyebrow reveal">Nero Marquina marble</p>
                    <h2 className="reveal d1">The Marquina</h2>
                    <p className="reveal d2">Carved from a solid block of black marble, each piece keeps its own white veining — so no two are ever alike. Cool to the touch, weighted, permanent.</p>
                    <div className="show-foot reveal d3">
                      <span className="price">{fmt(PRODUCTS[1].price)}</span>
                      <button className="btn" onClick={(e) => { e.stopPropagation(); openProduct(PRODUCTS[1]); }} data-cursor>View piece <span className="arrow">→</span></button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="screen spaces" id="spaces">
                <div className="head">
                  <div><p className="eyebrow reveal">As seen in</p><h1 className="big reveal d1">At home,<br />anywhere.</h1></div>
                  <p className="note reveal d2">From the hotel suite to the corner café — NOIR is made to belong in the rooms people remember.</p>
                </div>
                <div className="scene-grid">
                  {SCENES.map((s, i) => (
                    <figure key={s.file} className={"scene reveal " + s.span + (i % 2 ? " d1" : "")} data-cursor>
                      <img
                        src={"/scenes/" + s.file}
                        alt={"NOIR tissue box — " + s.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      <figcaption>
                        <span className="scene__kicker">No. 0{i + 1}</span>
                        <span className="scene__name">{s.name}</span>
                        <span className="scene__sub">{s.sub}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            </>
          )}

          {page === "collection" && (
            <section className="screen">
              <div className="head">
                <div><p className="eyebrow reveal">The Collection</p><h1 className="big reveal d1">Three<br />finishes.</h1></div>
                <p className="note reveal d2">Each one a different material, the same obsessive finishing. Tap a piece to explore it.</p>
              </div>
              <div className="grid">
                {PRODUCTS.map((p, i) => (
                  <article key={p.id} className={"card reveal" + (i ? ` d${i}` : "")} data-cursor onClick={() => openProduct(p)}>
                    <div className="card__media">
                      <span className="card__num">0{i + 1} — {p.eyebrow}</span>
                      <div className={"minibox " + p.cls}><span className="mini-brand">NOIR</span></div>
                      <div className="card__cta">→</div>
                    </div>
                    <div className="card__info"><h3>{p.name}</h3><span className="price">{fmt(p.price)}</span></div>
                    <p className="card__desc">{p.finish}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {page === "about" && (
            <>
              <section className="screen aside-page">
                <div className="col">
                  <p className="eyebrow reveal">About</p>
                  <h1 className="big line-mask"><span>The studio.</span></h1>
                  <p className="lead reveal d2">NOIR began with a small frustration: every beautiful room ruined by an ugly box of tissues. So we made the box worth looking at.</p>
                  <p className="body reveal d3">We work in three materials only — full-grain saffiano leather, solid Nero Marquina marble, and hand-rubbed lacquer — each trimmed in a single line of brushed brass. Everything is assembled and finished by hand in small batches.</p>
                  <p className="body reveal d3">No logos shouting across the front. No plastic. Just quiet, permanent objects designed for every space.</p>
                </div>
                <div className="scrollcue"><span>Scroll</span><span className="ln" /></div>
              </section>
              <section className="screen short">
                <div className="trio big-trio reveal"><span>Simple.</span><span>Modern.</span><span>Elegant.</span></div>
                <div className="values">
                  {[["Materials first", "We start with the block of marble or the hide of leather, then design around it — never the reverse."],
                    ["Made by hand", "Cut, wrapped, trimmed and inspected by people, in small numbers, with their names on the box."],
                    ["Made to last", "No trends, no seasons. A NOIR box is meant to outlive the room it sits in."]].map(([h, b], i) => (
                      <div className={"value reveal" + (i ? ` d${i}` : "")} key={h}><h4>{h}</h4><p>{b}</p></div>
                    ))}
                </div>
              </section>
            </>
          )}

          {page === "process" && (
            <>
              <section className="screen aside-page">
                <div className="col">
                  <p className="eyebrow reveal">Process</p>
                  <h1 className="big line-mask"><span>Taken apart,</span></h1>
                  <h1 className="big line-mask" style={{ transitionDelay: ".12s" }}><span><em>perfected.</em></span></h1>
                  <p className="lead reveal d2">Every NOIR box is built from a handful of precise parts. Here it is, exploded — the way we see it on the bench.</p>
                  <p className="body reveal d3">Scroll to follow the four movements, from raw material to the finished object. When you leave this page, it puts itself back together.</p>
                </div>
                <div className="scrollcue"><span>Scroll</span><span className="ln" /></div>
              </section>
              <section className="screen short">
                <div className="steps">
                  {[["01", "Material", "We select the hide, the marble block or the lacquer base — graded by hand for grain, vein and depth of black."],
                    ["02", "Form", "The frame is cut to exact tolerances so every face meets at a true, seamless right angle."],
                    ["03", "Trim", "A single line of brushed brass is set into the edges by hand — the only ornament the box ever wears."],
                    ["04", "Finish", "Polished, inspected under raking light, signed, and wrapped before it ships to you."]].map(([n, h, b], i) => (
                      <div className={"step reveal" + (i ? ` d${i}` : "")} key={n}><div className="n">{n}</div><h4>{h}</h4><p>{b}</p></div>
                    ))}
                </div>
              </section>
            </>
          )}

          {page === "contact" && (
            <section className="screen contact-page">
              <p className="eyebrow reveal">Contact</p>
              <h1 className="big center reveal d1">Bring one<br /><em>home.</em></h1>
              <p className="lead center reveal d2">Join the list for first access to new finishes and limited editions — or write to the studio directly.</p>
              <div className="signup reveal d3">
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && subscribe()} data-cursor />
                <button onClick={subscribe} data-cursor>Subscribe →</button>
              </div>
              <div className="contact-grid reveal d4">
                <div><h5>Studio</h5><p>New Delhi · Paris</p></div>
                <div><h5>Write</h5><p>studio@noir.example</p></div>
                <div><h5>Follow</h5><p>@noir.objects</p></div>
              </div>
            </section>
          )}
        </div>

        {/* footer persists under every page */}
        <footer>
          <div className="foot-top">
            <div className="foot-logo">NOIR</div>
            <div className="foot-cols">
              <div><h5>Shop</h5>
                <button onClick={() => goPage("collection")} data-cursor>Collection</button>
                <button onClick={() => goPage("process")} data-cursor>Process</button>
                <button onClick={() => goPage("contact")} data-cursor>Gift card</button>
              </div>
              <div><h5>House</h5>
                <button onClick={() => goPage("about")} data-cursor>About</button>
                <button data-cursor>Materials</button>
                <button data-cursor>Journal</button>
              </div>
              <div><h5>Care</h5>
                <button data-cursor>Shipping</button>
                <button data-cursor>Returns</button>
                <button onClick={() => goPage("contact")} data-cursor>Contact</button>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© MMXXIV NOIR — Premium Tissue Boxes. New Delhi · Paris.</span>
            <span>Designed for every space.</span>
          </div>
        </footer>
      </main>

      {/* ---------- PRODUCT DETAIL ---------- */}
      <div className="page-curtain" ref={pageCurtainRef} />
      <section className={"product-page" + (productOpen ? " open" : "")}>
        <button className="pp-back" onClick={closeProduct} data-cursor><span className="arrow">←</span> Back to collection</button>
        <div className="pp-inner">
          <div className="pp-visual">
            <div className="box-stage static" style={{ perspective: 1400 }}>
              <div className={"box " + product.cls}><BoxFaces /></div>
              <div className="box__shadow" />
            </div>
          </div>
          <div className="pp-info">
            <p className="eyebrow">{product.eyebrow}</p>
            <h1>{product.name}</h1>
            <div className="pp-price">{fmt(product.price)}</div>
            <p className="pp-desc">{product.desc}</p>
            <div className="pp-finishes">
              {PRODUCTS.map((q) => (
                <div key={q.id} className={"sw" + (q.id === product.id ? " active" : "")}
                  style={{ background: SWATCH[q.id] }} title={q.name} onClick={() => setProduct(q)} data-cursor />
              ))}
            </div>
            <div className="pp-buy">
              <button className="btn" onClick={addToCart} data-cursor>Add to cart <span className="arrow">→</span></button>
              <span className="fineprint">Free shipping over ₹7,500</span>
            </div>
            <div className="pp-specs">
              <div className="spec-row"><span>Material</span><span>{product.finish}</span></div>
              <div className="spec-row"><span>Dimensions</span><span>26 × 13 × 9 cm</span></div>
              <div className="spec-row"><span>Fits</span><span>Standard rectangular refills</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CART ---------- */}
      <div className={"cart-scrim" + (cartOpen ? " open" : "")} onClick={() => setCartOpen(false)} />
      <aside className={"cart" + (cartOpen ? " open" : "")}>
        <div className="cart__head"><h3>Your cart</h3><button className="cart__close" onClick={() => setCartOpen(false)} data-cursor>✕</button></div>
        <div className="cart__items">
          {cart.length === 0 ? (<p className="cart__empty">Your cart is quietly empty.</p>) : (
            cart.map((c) => (
              <div className="ci" key={c.id}>
                <div className={"ci__img " + c.cls} />
                <div className="ci__t"><h4>{c.name}</h4><span>{fmt(c.price)} × {c.qty}</span></div>
                <button className="ci__rm" onClick={() => removeItem(c.id)} data-cursor>Remove</button>
              </div>
            ))
          )}
        </div>
        <div className="cart__foot">
          <div className="cart__total"><span>Total</span><b>{fmt(cartTotal)}</b></div>
          <button className="btn" onClick={() => showToast("Checkout is a demo on this site")} data-cursor>Checkout <span className="arrow">→</span></button>
        </div>
      </aside>

      <div className={"toast" + (toast.show ? " show" : "")}>{toast.msg}</div>
    </>
  );
}

/* ============================================================
   STYLES — inlined so this stays a single pasteable file
   ============================================================ */
const CSS = `
:root{
  --bg:#0c0b0a; --bg-2:#131110; --surface:#1a1714; --surface-2:#221e1a;
  --fg:#ECE6DA; --fg-soft:rgba(236,230,218,.56);
  --gold:#C2A572; --gold-2:#E0C690; --gold-soft:rgba(194,165,114,.4);
  --line:rgba(236,230,218,.13);
  --ease:cubic-bezier(.76,0,.24,1); --ease-out:cubic-bezier(.16,1,.3,1);
  --font-display:"Bodoni Moda"; --font-body:"Hanken Grotesk";
}
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:var(--font-body),system-ui,sans-serif!important;
  background:var(--bg)!important; color:var(--fg)!important;
  -webkit-font-smoothing:antialiased; overflow-x:hidden; cursor:none;
}
@media(pointer:coarse){body{cursor:auto}}
::selection{background:var(--gold);color:#0c0b0a}
h1,h2,h3,h4,.display{font-family:var(--font-display),serif;font-weight:400;letter-spacing:-.01em}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:none;border:none;background:none;color:inherit}
@media(pointer:coarse){button{cursor:pointer}}
.eyebrow{font-size:11px;letter-spacing:.34em;text-transform:uppercase;font-weight:500;color:var(--gold);
  display:inline-flex;align-items:center;gap:14px}
.eyebrow::before{content:"";width:26px;height:1px;background:var(--gold);opacity:.7}
.center .eyebrow,.contact-page .eyebrow{justify-content:center}
em{font-style:italic}

/* grain + vignette atmosphere */
.grain{position:fixed;inset:0;z-index:9000;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
body::after{content:"";position:fixed;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(120% 80% at 50% -10%,transparent,rgba(0,0,0,.5) 90%)}

/* cursor */
.cursor-dot,.cursor-ring{position:fixed;top:0;left:0;z-index:9999;pointer-events:none;border-radius:50%;will-change:transform}
.cursor-dot{width:6px;height:6px;background:var(--gold-2);transform:translate(-50%,-50%)}
.cursor-ring{width:42px;height:42px;border:1px solid rgba(236,230,218,.4);transform:translate(-50%,-50%);
  transition:width .35s var(--ease-out),height .35s var(--ease-out),background .35s,border-color .35s}
.cursor-ring.hover{width:64px;height:64px;background:rgba(194,165,114,.1);border-color:var(--gold)}
@media(pointer:coarse){.cursor-dot,.cursor-ring{display:none}}

/* cover */
.cover{position:fixed;inset:0;z-index:8000;background:#080706;color:var(--fg);
  display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden}
.cover__glow{position:absolute;width:120vmax;height:120vmax;border-radius:50%;
  background:radial-gradient(circle,rgba(194,165,114,.22),rgba(194,165,114,.05) 35%,transparent 60%);
  filter:blur(30px);animation:drift 16s ease-in-out infinite alternate}
@keyframes drift{from{transform:translate(-8%,-6%) scale(1)}to{transform:translate(8%,6%) scale(1.1)}}
.cover__eyebrow{opacity:0;transform:translateY(14px)}
.cover__mark{font-family:var(--font-display),serif;font-size:clamp(64px,15vw,200px);line-height:.9;letter-spacing:.04em;margin:.16em 0 .12em;display:flex}
.cover__mark span{display:inline-block;transform:translateY(110%);opacity:0}
.cover__tag{font-size:clamp(12px,1.4vw,15px);letter-spacing:.34em;text-transform:uppercase;color:var(--fg-soft);opacity:0;transform:translateY(14px);
  padding-bottom:18px;position:relative}
.cover__tag::after{content:"";position:absolute;left:50%;bottom:0;width:40px;height:1px;background:var(--gold);transform:translateX(-50%)}
.cover__cta{margin-top:clamp(34px,5vw,60px);display:inline-flex;align-items:center;gap:14px;padding:18px 4px;
  font-size:12px;letter-spacing:.24em;text-transform:uppercase;opacity:0;transform:translateY(14px)}
.cover__cta .bar{width:54px;height:1px;background:var(--gold);position:relative;overflow:hidden}
.cover__cta .bar::after{content:"";position:absolute;inset:0;background:var(--fg);transform:translateX(-100%);transition:transform .5s var(--ease)}
.cover__cta:hover .bar::after{transform:translateX(0)}
.cover__cta .arrow{transition:transform .5s var(--ease)}
.cover__cta:hover .arrow{transform:translateX(8px)}
.cover__eyebrow{animation:cFade 1s var(--ease-out) .15s forwards}
.cover__tag{animation:cFade 1s var(--ease-out) .8s forwards}
.cover__cta{animation:cFade 1s var(--ease-out) 1s forwards}
.cover__mark span{animation:cUp 1s var(--ease-out) forwards}
.cover__mark span:nth-child(1){animation-delay:.25s}.cover__mark span:nth-child(2){animation-delay:.33s}
.cover__mark span:nth-child(3){animation-delay:.41s}.cover__mark span:nth-child(4){animation-delay:.49s}
@keyframes cFade{to{opacity:1;transform:none}}@keyframes cUp{to{opacity:1;transform:translateY(0)}}

.curtain{position:fixed;inset:0;z-index:7900;pointer-events:none;display:flex}
.curtain__panel{flex:1;background:#080706;transform:scaleY(0);transform-origin:bottom}

/* nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:600;display:flex;align-items:center;justify-content:space-between;
  padding:22px clamp(20px,5vw,64px);transition:transform .5s var(--ease)}
.nav::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:linear-gradient(180deg,rgba(8,7,6,.85),transparent)}
.nav.hide{transform:translateY(-120%)}
.nav__logo{font-family:var(--font-display),serif;font-size:23px;letter-spacing:.22em;color:var(--fg);transition:opacity .3s}
.nav__logo:hover{opacity:.75}
.nav__links{display:flex;gap:clamp(14px,2.4vw,34px);align-items:center}
.navlink{font-size:11px;letter-spacing:.18em;text-transform:uppercase;position:relative;color:var(--fg-soft);transition:color .3s}
.navlink::after{content:"";position:absolute;left:0;bottom:-6px;width:100%;height:1px;background:var(--gold);transform:scaleX(0);transform-origin:right;transition:transform .45s var(--ease)}
.navlink:hover{color:var(--fg)}.navlink.active{color:var(--fg)}
.navlink:hover::after,.navlink.active::after{transform:scaleX(1);transform-origin:left}
.nav__cart{display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg);transition:color .3s}
.nav__cart:hover{color:var(--gold-2)}
.nav__cart .count{min-width:18px;height:18px;border:1px solid var(--gold-soft);border-radius:50%;display:grid;place-items:center;font-size:10px;color:var(--gold-2)}
@media(max-width:820px){.navlink{font-size:10px;letter-spacing:.12em}}
@media(max-width:560px){.nav__links{display:none}}
.progress{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold-2));z-index:650;width:0;box-shadow:0 0 12px rgba(194,165,114,.5)}
:focus-visible{outline:1px solid var(--gold);outline-offset:3px}

/* ============ persistent 3D box ============ */
.box-scene{position:absolute;top:0;left:0;right:0;height:100vh;z-index:2;pointer-events:none;display:grid;place-items:center;
  perspective:1600px;perspective-origin:50% 42%;opacity:0;transition:opacity .9s ease}
.box-scene.on{opacity:1}
/* readability veil: darkens the left (text) side, leaves the box crisp on the right */
.box-scene::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(102deg,rgba(8,7,6,.9) 0%,rgba(8,7,6,.55) 30%,rgba(8,7,6,.12) 50%,transparent 64%)}
.box-stage{position:relative;transform-style:preserve-3d;transition:transform 1.3s var(--ease);will-change:transform}
/* per-page positions/orientations */
.box-scene.home .box-stage{transform:translateX(31vw) translateY(-1vh) scale(1.42)}
.box-scene.contact .box-stage{transform:translateY(9vh) scale(.92);opacity:.4}
.box-scene.about .box-stage{transform:translateX(32vw) translateY(2vh) rotateY(-48deg) scale(1.2)}
.box-scene.process .box-stage{transform:translateX(30vw) scale(1.34)}
.box-scene.collection{opacity:0}
.box-scene.collection .box-stage{transform:scale(.6)}
@media(max-width:1024px){
  .box-scene::after{background:linear-gradient(180deg,transparent,rgba(8,7,6,.4))}
  .box-scene{opacity:0}.box-scene.on{opacity:.14}
  .box-scene .box-stage,.box-scene.home .box-stage,.box-scene.about .box-stage,.box-scene.process .box-stage{transform:translateY(8vh) scale(.92)!important}
}

.box{position:relative;width:336px;height:128px;transform-style:preserve-3d;
  transform:rotateX(11deg) rotateY(-27deg);transition:transform .25s ease-out}
.box-scene.process .box{animation:spin 30s linear infinite}
@keyframes spin{to{transform:rotateX(11deg) rotateY(333deg)}}

.face{position:absolute;left:50%;top:50%;
  border:1.4px solid transparent;
  border-image:linear-gradient(135deg,#F1DEAF 0%,#B4925B 42%,#6E5630 68%,#E6CD92 100%) 1;
  background:linear-gradient(160deg,#221c16,#0c0907);
  box-shadow:inset 0 0 46px rgba(0,0,0,.55);transition:transform 1s var(--ease)}
/* fine saffiano grain */
.face::before{content:"";position:absolute;inset:0;opacity:.45;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7 .5' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")}
.face.front,.face.back{width:336px;height:128px;margin:-64px 0 0 -168px}
.face.left,.face.right{width:152px;height:128px;margin:-64px 0 0 -76px}
.face.top,.face.bottom{width:336px;height:152px;margin:-76px 0 0 -168px}
.face.front{transform:translateZ(76px)}
.face.back{transform:rotateY(180deg) translateZ(76px)}
.face.right{transform:rotateY(90deg) translateZ(168px)}
.face.left{transform:rotateY(-90deg) translateZ(168px)}
.face.top{transform:rotateX(90deg) translateZ(64px)}
.face.bottom{transform:rotateX(-90deg) translateZ(64px)}
/* per-face lighting (key light upper-front-left) */
.face.top{background:radial-gradient(120% 150% at 30% -10%,rgba(214,190,132,.18),transparent 55%),linear-gradient(165deg,#2c251d,#161009)}
.face.front{background:linear-gradient(160deg,#241e17 0%,#16100b 70%,#0e0a07)}
.face.left{background:linear-gradient(160deg,#1d1812,#0c0906)}
.face.right{background:linear-gradient(160deg,#15110d,#070504)}
.face.back{background:linear-gradient(160deg,#120e0a,#050403)}
.face.bottom{background:#060504}
/* exploded view */
.box.explode .face.front{transform:translateZ(196px)}
.box.explode .face.back{transform:rotateY(180deg) translateZ(196px)}
.box.explode .face.right{transform:rotateY(90deg) translateZ(256px)}
.box.explode .face.left{transform:rotateY(-90deg) translateZ(256px)}
.box.explode .face.top{transform:rotateX(90deg) translateZ(200px)}
.box.explode .face.bottom{transform:rotateX(-90deg) translateZ(176px)}
.box.explode .tissue{transform:translate(-50%,-230%) rotate(-4deg)}

.box__brand{position:absolute;right:22px;bottom:18px;font-size:10px;letter-spacing:.42em;color:#E6CD92;opacity:.85;
  text-shadow:0 1px 1px rgba(0,0,0,.6)}
/* opening with a brushed-brass rim */
.slit{position:absolute;top:50%;left:50%;width:168px;height:30px;border-radius:50%;transform:translate(-50%,-50%);
  background:radial-gradient(120% 160% at 50% 0,#0b0907,#020201);
  box-shadow:inset 0 3px 10px #000,0 0 0 2px #0b0907,0 0 0 3.4px #B4925B,0 0 0 4px #6E5630,0 1px 4px rgba(0,0,0,.6)}
/* layered, softer tissue */
.tissue{position:absolute;top:50%;left:50%;width:74px;height:60px;transform:translate(-50%,-92%) rotate(-3deg);
  background:linear-gradient(165deg,#f7f2e9,#ddd5c6);border-radius:40% 44% 30% 34%/60% 56% 40% 44%;
  box-shadow:0 14px 26px rgba(0,0,0,.5),inset 0 -6px 12px rgba(0,0,0,.12),inset 0 6px 10px rgba(255,255,255,.5);
  transition:transform 1s var(--ease)}
.tissue::before,.tissue::after{content:"";position:absolute;border-radius:50% 46% 40% 44%/56% 52% 44% 40%}
.tissue::before{inset:-8px 14px 30px -6px;background:linear-gradient(160deg,#fffdf8,#e7ded0);transform:rotate(-12deg);box-shadow:0 6px 12px rgba(0,0,0,.25)}
.tissue::after{inset:-6px -8px 34px 18px;background:linear-gradient(200deg,#f3ede3,#d7cebd);transform:rotate(10deg);box-shadow:0 6px 12px rgba(0,0,0,.2)}
.box__sheen{position:absolute;inset:0;transform:translateZ(77px);pointer-events:none;border-radius:2px;
  background:linear-gradient(118deg,transparent 40%,rgba(255,255,255,.16) 49%,rgba(255,255,255,.05) 53%,transparent 60%);
  mix-blend-mode:screen;opacity:.5}
.box-scene.home:hover .box__sheen,.box-scene.contact:hover .box__sheen{opacity:1}
/* grounded contact shadow */
.box__shadow{position:absolute;left:50%;bottom:-104px;width:340px;height:60px;border-radius:50%;transform:translateX(-50%) rotateX(82deg);
  background:radial-gradient(closest-side,rgba(0,0,0,.65),rgba(0,0,0,.28) 55%,transparent 78%);filter:blur(10px)}

/* finishes -------------------------------------------------- */
/* Marquina marble */
.box.marble .face{border-image:linear-gradient(135deg,#fff,#9aa0a4 50%,#3a3d40 80%,#dfe3e6) 1}
.box.marble .face.top{background:radial-gradient(130% 80% at 70% 20%,rgba(255,255,255,.5),transparent 42%),linear-gradient(120deg,#26241f 0 44%,#e9e7e2 46%,#26241f 49%),linear-gradient(150deg,#1b1916,#070605)}
.box.marble .face.front{background:radial-gradient(80% 120% at 22% 18%,rgba(255,255,255,.42),transparent 36%),linear-gradient(58deg,#1a1815 0 60%,#cfcdc8 62%,#1a1815 66%),linear-gradient(160deg,#16140f,#070605)}
.box.marble .face.left,.box.marble .face.right{background:linear-gradient(120deg,#15130f 0 50%,#c9c7c2 52%,#15130f 56%),linear-gradient(160deg,#14120e,#060504)}
.box.marble .face::before{opacity:.12}
.box.marble .box__brand{color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
.box.marble .tissue{background:linear-gradient(165deg,#2a2723,#0d0b09)}
.box.marble .tissue::before{background:linear-gradient(160deg,#322e29,#141210)}
.box.marble .tissue::after{background:linear-gradient(200deg,#262320,#0c0a08)}
/* Onyx lacquer */
.box.onyx .face{border-image:linear-gradient(135deg,#F1DEAF,#9A7C4F 55%,#E6CD92) 1}
.box.onyx .face.top{background:radial-gradient(120% 150% at 40% -20%,rgba(255,255,255,.16),transparent 50%),linear-gradient(165deg,#191613,#000)}
.box.onyx .face.front{background:linear-gradient(160deg,#15120f,#000)}
.box.onyx .face.left{background:linear-gradient(160deg,#100e0b,#000)}
.box.onyx .face.right{background:linear-gradient(160deg,#0a0807,#000)}
.box.onyx .face::before{opacity:.08}

/* ============ pages ============ */
.site{opacity:0}
.site.ready{opacity:1;transition:opacity .8s ease}
.pageview{position:relative;z-index:3;animation:pageIn .9s var(--ease-out) both}
.pageview.out{opacity:0;transform:translateY(-18px);transition:opacity .42s var(--ease),transform .42s var(--ease)}
@keyframes pageIn{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}

.screen{position:relative;padding:clamp(120px,15vh,180px) clamp(20px,5vw,64px) clamp(80px,10vw,140px);max-width:1320px;margin:0 auto}
.screen.short{padding-top:clamp(40px,6vw,90px)}
.col{max-width:560px}
.aside-page .col,.home-hero .col{min-height:60vh;display:flex;flex-direction:column;justify-content:center}
.big{font-size:clamp(46px,8vw,118px);line-height:.9;letter-spacing:-.015em;text-wrap:balance}
.big.center{text-align:center}
.lead{max-width:440px;margin-top:26px;font-size:17px;line-height:1.65;color:var(--fg-soft)}
.lead.center{margin-left:auto;margin-right:auto;text-align:center}
.body{max-width:460px;margin-top:18px;font-size:15px;line-height:1.7;color:var(--fg-soft)}
.row{display:flex;gap:14px;margin-top:36px;flex-wrap:wrap}
.stats{display:flex;gap:36px;margin-top:44px;font-size:11px;letter-spacing:.08em;color:var(--fg-soft);text-transform:uppercase}
.stats b{font-family:var(--font-display),serif;font-size:26px;font-weight:400;display:block;color:var(--fg);letter-spacing:.04em;margin-bottom:4px}

.line-mask{overflow:hidden;display:block}
.line-mask>span{display:block;transform:translateY(108%);transition:transform 1.1s var(--ease)}
.line-mask.in>span{transform:none}
.reveal{opacity:0;transform:translateY(34px);transition:opacity 1s var(--ease-out),transform 1s var(--ease-out)}
.reveal.in{opacity:1;transform:none}
.reveal.d1{transition-delay:.08s}.reveal.d2{transition-delay:.16s}.reveal.d3{transition-delay:.24s}.reveal.d4{transition-delay:.32s}

.scrollcue{position:absolute;bottom:30px;left:clamp(20px,5vw,64px);font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:var(--fg-soft);display:flex;flex-direction:column;align-items:center;gap:10px}
.scrollcue .ln{width:1px;height:40px;background:var(--line);position:relative;overflow:hidden}
.scrollcue .ln::after{content:"";position:absolute;inset:0;background:var(--gold);animation:cue 2.2s var(--ease) infinite}
@keyframes cue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(100%)}}

.marquee{border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden;position:relative;z-index:3;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
.marquee__track{display:flex;gap:56px;white-space:nowrap;padding:24px 0;animation:slide 32s linear infinite;font-family:var(--font-display),serif;font-size:clamp(24px,4vw,48px);color:var(--fg)}
.marquee:hover .marquee__track{animation-play-state:paused}
.marquee__track .dot{color:var(--gold)}
@keyframes slide{to{transform:translateX(-50%)}}

.split{display:grid;grid-template-columns:1fr 1.4fr;gap:50px;align-items:start}
.split h2{font-size:clamp(30px,4.6vw,62px);line-height:1.02}
.split p{font-size:16px;line-height:1.7;color:var(--fg-soft);max-width:520px}
.split p+p{margin-top:18px}
@media(max-width:820px){.split{grid-template-columns:1fr;gap:24px}}
.trio{display:flex;gap:clamp(24px,6vw,80px);margin-top:70px;flex-wrap:wrap;font-family:var(--font-display),serif;font-size:clamp(28px,5vw,64px)}
.trio span{position:relative}
.trio span::after{content:"";position:absolute;left:0;bottom:-8px;width:34px;height:1px;background:var(--gold)}
.big-trio{margin-top:0;justify-content:center;text-align:center}

/* product showcase */
.showcase{padding-top:clamp(40px,6vw,90px)}
.show-row{display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(28px,5vw,70px);align-items:center;margin-top:clamp(40px,6vw,80px)}
.show-row.reverse{grid-template-columns:.85fr 1.15fr}
.show-row.reverse .show-media{order:2}
.show-media{position:relative;margin:0;border-radius:4px;overflow:hidden;border:1px solid var(--line);aspect-ratio:5/4;cursor:none;
  background:radial-gradient(120% 100% at 30% 0,rgba(194,165,114,.1),transparent 55%),linear-gradient(150deg,#1d1812,#0a0807)}
@media(pointer:coarse){.show-media{cursor:pointer}}
.show-media::before{content:"NOIR";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:0;
  font-family:var(--font-display),serif;font-size:34px;letter-spacing:.3em;color:rgba(194,165,114,.2)}
.show-media img{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:cover;
  transition:transform 1.1s var(--ease),filter .6s;filter:brightness(.96)}
.show-media:hover img{transform:scale(1.05);filter:brightness(1.04)}
.show-media::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(194,165,114,0);transition:box-shadow .5s}
.show-media:hover::after{box-shadow:inset 0 0 0 1px var(--gold-soft)}
.show-tag{position:absolute;top:18px;left:20px;z-index:2;font-family:var(--font-display),serif;font-size:30px;color:var(--gold-2);
  text-shadow:0 2px 8px rgba(0,0,0,.6)}
.show-copy h2{font-size:clamp(34px,5vw,68px);line-height:.98;margin:14px 0 18px}
.show-copy p{font-size:16px;line-height:1.7;color:var(--fg-soft);max-width:42ch}
.show-foot{display:flex;align-items:center;gap:26px;margin-top:30px;flex-wrap:wrap}
.show-foot .price{font-family:var(--font-display),serif;font-size:24px;color:var(--gold-2)}
@media(max-width:820px){
  .show-row,.show-row.reverse{grid-template-columns:1fr;gap:24px}
  .show-row.reverse .show-media{order:0}
}

/* lifestyle gallery */
.spaces{padding-top:clamp(40px,6vw,90px)}
.scene-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:230px;gap:18px}
.scene{position:relative;overflow:hidden;border-radius:4px;border:1px solid var(--line);margin:0;cursor:none;
  background:radial-gradient(120% 100% at 30% 0,rgba(194,165,114,.08),transparent 55%),repeating-linear-gradient(115deg,rgba(255,255,255,.012) 0 2px,transparent 2px 8px),linear-gradient(150deg,#1d1812,#0a0807)}
@media(pointer:coarse){.scene{cursor:pointer}}
.scene.tall{grid-row:span 2}
.scene.wide{grid-column:span 2}
.scene::before{content:"NOIR";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:0;
  font-family:var(--font-display),serif;font-size:30px;letter-spacing:.3em;color:rgba(194,165,114,.22)}
.scene img{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:cover;
  transition:transform 1.1s var(--ease),filter .6s;filter:grayscale(.15) brightness(.92)}
.scene:hover img{transform:scale(1.06);filter:grayscale(0) brightness(1)}
.scene figcaption{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:22px;display:flex;flex-direction:column;gap:3px;
  background:linear-gradient(0deg,rgba(6,5,4,.88),rgba(6,5,4,.25) 60%,transparent)}
.scene__kicker{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold)}
.scene__name{font-family:var(--font-display),serif;font-size:22px;line-height:1.05}
.scene__sub{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-soft)}
.scene::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(194,165,114,0);transition:box-shadow .5s}
.scene:hover::after{box-shadow:inset 0 0 0 1px var(--gold-soft)}
@media(max-width:900px){.scene-grid{grid-template-columns:repeat(2,1fr);grid-auto-rows:210px}.scene.tall{grid-row:span 1}}
@media(max-width:520px){.scene-grid{grid-template-columns:1fr}.scene.wide{grid-column:span 1}}

.values,.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:70px}
.steps{grid-template-columns:repeat(4,1fr)}
@media(max-width:820px){.values{grid-template-columns:1fr}.steps{grid-template-columns:1fr 1fr;gap:34px 28px}}
.value,.step{border-top:1px solid var(--line);padding-top:22px}
.value h4,.step h4{font-size:18px;margin-bottom:12px;font-weight:500}
.value p,.step p{font-size:14px;line-height:1.65;color:var(--fg-soft)}
.step .n{font-family:var(--font-display),serif;font-size:40px;color:var(--gold);margin-bottom:10px}

/* head + collection grid */
.head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:60px}
.note{max-width:300px;color:var(--fg-soft);font-size:14px;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
@media(max-width:820px){.grid{grid-template-columns:1fr;max-width:420px;margin:0 auto}}
.card{position:relative;cursor:none}
@media(pointer:coarse){.card{cursor:pointer}}
.card__media{position:relative;aspect-ratio:4/5;border-radius:4px;overflow:hidden;display:grid;place-items:center;
  background:radial-gradient(120% 100% at 50% 0,#221d19,#0a0908);border:1px solid var(--line);transition:transform .7s var(--ease),border-color .5s}
.card:hover .card__media{transform:translateY(-8px);border-color:var(--gold-soft);box-shadow:0 30px 60px rgba(0,0,0,.5),0 0 50px rgba(194,165,114,.12)}
.card__num{position:absolute;top:16px;left:18px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-soft)}
.card__cta{position:absolute;bottom:16px;right:18px;width:46px;height:46px;border:1px solid var(--gold);border-radius:50%;display:grid;place-items:center;color:var(--gold-2);transform:scale(.6);opacity:0;transition:.5s var(--ease)}
.card:hover .card__cta{transform:scale(1);opacity:1}
.card__info{display:flex;justify-content:space-between;align-items:baseline;margin-top:18px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.card__info h3{font-size:24px}.card__info .price{font-size:15px;color:var(--gold-2)}
.card__desc{margin-top:12px;font-size:12px;color:var(--fg-soft);letter-spacing:.02em}
.minibox{position:relative;width:62%;aspect-ratio:2/1;border:1px solid var(--gold-soft);border-radius:3px;
  background:linear-gradient(150deg,#231e1a,#0a0908);box-shadow:inset 0 0 30px rgba(0,0,0,.6),0 24px 40px rgba(0,0,0,.5);transition:transform .7s var(--ease)}
.card:hover .minibox{transform:rotate(-3deg) scale(1.05)}
.minibox::before{content:"";position:absolute;top:32%;left:50%;width:44%;height:14%;border-radius:50%;transform:translateX(-50%);background:#040302;box-shadow:0 0 0 1px var(--gold-soft)}
.mini-brand{position:absolute;right:10px;bottom:8px;font-size:7px;letter-spacing:.3em;color:var(--gold-2)}
.minibox.marble{background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.16),transparent 40%),linear-gradient(120deg,transparent 0 44%,rgba(255,255,255,.5) 46%,transparent 49%),linear-gradient(150deg,#1a1816,#070605)}
.minibox.onyx{background:linear-gradient(150deg,#161311,#000);border-color:var(--gold)}

/* contact */
.contact-page{text-align:center;min-height:74vh;display:flex;flex-direction:column;justify-content:center;align-items:center}
.signup{display:flex;max-width:440px;width:100%;margin:36px auto 0;border-bottom:1px solid var(--fg)}
.signup input{flex:1;background:none;border:none;outline:none;font-family:inherit;font-size:15px;padding:14px 4px;color:var(--fg)}
.signup input::placeholder{color:var(--fg-soft)}
.signup button{padding:14px 8px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-2)}
.contact-grid{display:flex;gap:clamp(30px,8vw,90px);margin-top:60px;flex-wrap:wrap;justify-content:center}
.contact-grid h5{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.contact-grid p{font-size:15px;color:var(--fg-soft)}

/* buttons */
.btn{display:inline-flex;align-items:center;gap:12px;padding:17px 32px;border-radius:40px;background:var(--gold);color:#0b0a09;
  font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;transition:transform .5s var(--ease),background .4s}
.btn:hover{transform:translateY(-3px);background:var(--gold-2)}
.btn .arrow{transition:transform .5s var(--ease)}.btn:hover .arrow{transform:translateX(6px)}
.btn.ghost{background:none;border:1px solid var(--line);color:var(--fg)}
.btn.ghost:hover{border-color:var(--gold);background:none}
.fineprint{font-size:12px;color:var(--fg-soft);letter-spacing:.04em}

/* footer */
footer{position:relative;z-index:3;padding:64px clamp(20px,5vw,64px) 40px;border-top:1px solid var(--line);background:var(--bg-2)}
.foot-top{display:flex;justify-content:space-between;flex-wrap:wrap;gap:30px}
.foot-logo{font-family:var(--font-display),serif;font-size:48px;letter-spacing:.1em}
.foot-cols{display:flex;gap:clamp(30px,6vw,90px);flex-wrap:wrap}
.foot-cols h5{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:16px}
.foot-cols button{display:block;font-size:14px;margin-bottom:10px;color:var(--fg-soft);transition:color .3s,padding-left .3s;text-align:left}
.foot-cols button:hover{color:var(--fg);padding-left:6px}
.foot-bottom{display:flex;justify-content:space-between;margin-top:50px;padding-top:24px;border-top:1px solid var(--line);font-size:12px;color:var(--fg-soft);flex-wrap:wrap;gap:12px}

/* product detail overlay */
.page-curtain{position:fixed;inset:0;z-index:780;background:#080706;transform:scaleY(0);transform-origin:bottom;pointer-events:none}
.product-page{position:fixed;inset:0;z-index:770;background:var(--bg);overflow-y:auto;visibility:hidden;opacity:0}
.product-page.open{visibility:visible;opacity:1}
.pp-inner{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
@media(max-width:820px){.pp-inner{grid-template-columns:1fr}}
.pp-visual{position:relative;display:grid;place-items:center;min-height:58vh;
  background:radial-gradient(120% 90% at 50% 20%,#1c1815,#070605)}
.pp-visual .box-stage.static{perspective:1400px;perspective-origin:50% 42%}
.pp-visual .box{transform:rotateX(11deg) rotateY(-27deg);animation:ppspin 40s linear infinite}
@keyframes ppspin{to{transform:rotateX(11deg) rotateY(333deg)}}
.pp-back{position:fixed;top:24px;left:clamp(20px,5vw,64px);z-index:790;display:flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg)}
.pp-back .arrow{transition:transform .4s var(--ease)}.pp-back:hover .arrow{transform:translateX(-6px)}
.pp-info{padding:clamp(40px,7vw,90px);display:flex;flex-direction:column;justify-content:center;max-width:620px}
.pp-info h1{font-size:clamp(44px,6vw,82px);line-height:.95;margin:14px 0 8px}
.pp-price{font-size:22px;color:var(--gold-2);margin:6px 0 26px}
.pp-desc{font-size:16px;line-height:1.7;color:var(--fg-soft);max-width:46ch}
.pp-finishes{display:flex;gap:14px;margin:34px 0}
.pp-finishes .sw{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);cursor:none}
.pp-finishes .sw.active{outline:1px solid var(--gold);outline-offset:3px}
@media(pointer:coarse){.pp-finishes .sw{cursor:pointer}}
.pp-buy{display:flex;gap:16px;align-items:center;margin-top:14px;flex-wrap:wrap}
.pp-specs{margin-top:46px}
.spec-row{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--line);font-size:14px}
.spec-row span:first-child{color:var(--fg-soft);letter-spacing:.08em;text-transform:uppercase;font-size:11px;align-self:center}

/* toast + cart */
.toast{position:fixed;bottom:30px;left:50%;transform:translate(-50%,140%);z-index:900;background:var(--gold);color:#0b0a09;
  padding:15px 26px;border-radius:40px;font-size:13px;letter-spacing:.04em;font-weight:500;transition:transform .5s var(--ease)}
.toast.show{transform:translate(-50%,0)}
.cart-scrim{position:fixed;inset:0;z-index:850;background:rgba(0,0,0,.55);opacity:0;visibility:hidden;transition:.4s}
.cart-scrim.open{opacity:1;visibility:visible}
.cart{position:fixed;top:0;right:0;bottom:0;width:min(420px,90vw);z-index:860;background:var(--surface);
  transform:translateX(100%);transition:transform .6s var(--ease);display:flex;flex-direction:column;padding:34px;border-left:1px solid var(--line)}
.cart.open{transform:none}
.cart__head{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px}
.cart__head h3{font-size:28px}.cart__close{font-size:20px}
.cart__items{flex:1;overflow-y:auto}.cart__empty{color:var(--fg-soft);font-size:14px;padding-top:20px}
.ci{display:flex;gap:16px;padding:18px 0;border-bottom:1px solid var(--line);align-items:center}
.ci__img{width:64px;height:64px;border-radius:3px;border:1px solid var(--gold-soft);flex-shrink:0;background:linear-gradient(150deg,#231e1a,#0a0908)}
.ci__img.marble{background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.16),transparent 40%),linear-gradient(150deg,#1a1816,#070605)}
.ci__img.onyx{background:linear-gradient(150deg,#161311,#000)}
.ci__t{flex:1}.ci__t h4{font-size:16px;font-weight:500}.ci__t span{font-size:12px;color:var(--fg-soft)}
.ci__rm{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-soft)}
.cart__foot{padding-top:24px;border-top:1px solid var(--gold-soft)}
.cart__total{display:flex;justify-content:space-between;font-size:16px;margin-bottom:20px}
.cart__total b{font-family:var(--font-display),serif;font-weight:400;font-size:22px;color:var(--gold-2)}
.cart .btn{width:100%;justify-content:center}

/* respect reduced-motion preferences */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.15s!important}
  .marquee__track,.box-scene.process .box,.pp-visual .box,.cover__glow,.scrollcue .ln::after{animation:none!important}
}
`;