import { useState, useEffect } from "react";

const PLATFORMS = ["YouTube", "Instagram", "TikTok", "Twitter/X", "Twitch", "LinkedIn", "Outro"];
const PLAT_COLOR = {
  YouTube: "#FF4444", Instagram: "#C13584", TikTok: "#00C2CB",
  "Twitter/X": "#aaaaaa", Twitch: "#9146FF", LinkedIn: "#0A66C2", Outro: "#666",
};
const STATUSES = ["Prospectando", "Contatado", "Em negociação", "Fechado", "Descartado"];
const STAT = {
  Prospectando:    ["#E0A020", "rgba(224,160,32,0.10)"],
  Contatado:       ["#9B8BFF", "rgba(155,139,255,0.10)"],
  "Em negociação": ["#2EC4A0", "rgba(46,196,160,0.10)"],
  Fechado:         ["#5DB87A", "rgba(93,184,122,0.10)"],
  Descartado:      ["#555",    "rgba(85,85,85,0.10)"],
};
const NICHES = ["Gaming","Lifestyle","Tech","Educação","Entretenimento","Fitness","Culinária","Finanças","Moda","Negócios","Música","Outro"];
const EMPTY = { nome:"", plataforma:"YouTube", nicho:"", seguidores:"", contato:"", status:"Prospectando", observacoes:"" };

const C = {
  bg:      "#080808",
  surface: "#101010",
  card:    "#131313",
  hover:   "#1A1A1A",
  border:  "#222222",
  border2: "#2A2A2A",
  accent:  "#FFFFFF",
  text:    "#F0F0F0",
  sub:     "#AAAAAA",
  muted:   "#555555",
  red:     "#FF4444",
};
const FF = "'Space Grotesk', system-ui, sans-serif";

const iSt = {
  display:"block", width:"100%", boxSizing:"border-box",
  background:"#0A0A0A", border:`1px solid ${C.border}`, borderRadius:8,
  padding:"9px 12px", color:C.text, fontSize:14, marginTop:5,
  fontFamily:FF, outline:"none",
};
const lSt = {
  fontSize:10, fontWeight:600, color:C.muted,
  textTransform:"uppercase", letterSpacing:"0.8px",
};

function initials(nome) {
  return nome.trim().split(" ").slice(0,2).map(w => w[0]?.toUpperCase()).join("");
}

export default function App() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [search, setSearch]     = useState("");
  const [fSt, setFSt]           = useState("");
  const [fPl, setFPl]           = useState("");
  const [hovered, setHovered]   = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    (async () => {
      try {
        const r = await window.storage.get("prospeccao_v1");
        if (r) setCreators(JSON.parse(r.value));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = async (list) => {
    try { await window.storage.set("prospeccao_v1", JSON.stringify(list)); } catch {}
  };

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setModal(true); };

  const save = () => {
    if (!form.nome.trim()) return;
    const list = editId != null
      ? creators.map(c => c.id === editId ? { ...form, id: editId } : c)
      : [...creators, { ...form, id: Date.now() }];
    setCreators(list); persist(list); setModal(false);
  };

  const del = (id) => {
    const list = creators.filter(c => c.id !== id);
    setCreators(list); persist(list);
    setDelConfirm(null);
  };

  const filtered = creators.filter(c =>
    (!search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.nicho?.toLowerCase().includes(search.toLowerCase())) &&
    (!fSt || c.status === fSt) &&
    (!fPl || c.plataforma === fPl)
  );

  const sf = { fontFamily: FF };
  const statusCounts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: creators.filter(c => c.status === s).length }), {});

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, ...sf }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:"24px 28px 20px", background:C.surface }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:6 }}>
              Editor de Vídeo
            </div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:C.text, letterSpacing:"-0.5px" }}>
              Prospecção
            </h1>
          </div>
          <button onClick={openAdd} style={{
            background:C.accent, color:"#000", border:"none", borderRadius:8,
            padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer", ...sf,
            letterSpacing:"0.2px",
          }}>+ Adicionar</button>
        </div>

        {/* Stats row */}
        {creators.length > 0 && (
          <div style={{ display:"flex", gap:20, marginTop:18, paddingTop:18, borderTop:`1px solid ${C.border}`, flexWrap:"wrap" }}>
            <div>
              <div style={lSt}>Total</div>
              <div style={{ fontSize:20, fontWeight:700, marginTop:4 }}>{creators.length}</div>
            </div>
            {STATUSES.filter(s => statusCounts[s] > 0).map(s => {
              const [sc] = STAT[s];
              const active = fSt === s;
              return (
                <div key={s} onClick={() => setFSt(active ? "" : s)} style={{
                  cursor:"pointer", opacity: fSt && !active ? 0.35 : 1,
                  transition:"opacity 0.15s",
                }}>
                  <div style={{ ...lSt, color: active ? sc : C.muted }}>{s}</div>
                  <div style={{ fontSize:20, fontWeight:700, marginTop:4, color: active ? sc : C.text }}>
                    {statusCounts[s]}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou nicho..."
            style={{
              flex:1, minWidth:160, background:C.bg,
              border:`1px solid ${C.border2}`, borderRadius:8,
              padding:"8px 13px", color:C.text, fontSize:13, ...sf, outline:"none",
            }}
          />
          <select value={fPl} onChange={e => setFPl(e.target.value)} style={{
            background:C.bg, border:`1px solid ${C.border2}`, borderRadius:8,
            padding:"8px 13px", color: fPl ? C.text : C.muted,
            fontSize:13, ...sf, cursor:"pointer", outline:"none",
          }}>
            <option value="">Todas as plataformas</option>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding:"22px 28px" }}>
        {loading ? (
          <p style={{ textAlign:"center", color:C.muted, padding:"40px 0" }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"70px 0" }}>
            <div style={{ fontSize:38, marginBottom:14 }}>🎯</div>
            <p style={{ color:C.muted, fontSize:14, margin:0 }}>
              {creators.length === 0
                ? "Nenhum criador ainda. Clique em + Adicionar para começar."
                : "Nenhum resultado para os filtros aplicados."}
            </p>
          </div>
        ) : (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",
            gap:12,
          }}>
            {filtered.map(c => {
              const pc = PLAT_COLOR[c.plataforma] || "#888";
              const [sc, sb] = STAT[c.status] || STAT.Prospectando;
              const isHov = hovered === c.id;
              const isDel = delConfirm === c.id;

              return (
                <div key={c.id}
                  style={{
                    background: isHov ? C.hover : C.card,
                    border:`1px solid ${isHov ? C.border2 : C.border}`,
                    borderRadius:12,
                    overflow:"hidden",
                    transition:"transform 0.15s, background 0.15s, border-color 0.15s, box-shadow 0.15s",
                    transform: isHov ? "translateY(-3px)" : "none",
                    boxShadow: isHov ? "0 12px 40px rgba(0,0,0,0.5)" : "none",
                    display:"flex", flexDirection:"column",
                  }}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Card top */}
                  <div style={{
                    padding:"18px 18px 14px",
                    borderBottom:`1px solid ${C.border}`,
                    position:"relative",
                  }}>
                    {/* Subtle platform color line at very top */}
                    <div style={{
                      position:"absolute", top:0, left:0, right:0, height:2,
                      background:`linear-gradient(90deg, ${pc}, transparent)`,
                    }} />

                    {/* Avatar + platform badge row */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                      <div style={{
                        width:44, height:44, borderRadius:10,
                        background:`${pc}18`,
                        border:`1px solid ${pc}30`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:15, fontWeight:700, color:pc,
                      }}>
                        {initials(c.nome) || "?"}
                      </div>
                      <span style={{
                        background: `${pc}15`,
                        color: pc,
                        border:`1px solid ${pc}30`,
                        borderRadius:6, padding:"3px 9px",
                        fontSize:11, fontWeight:700, letterSpacing:"0.3px",
                      }}>{c.plataforma}</span>
                    </div>

                    {/* Name */}
                    <div style={{ fontWeight:700, fontSize:15, lineHeight:1.25, color:C.text }}>
                      {c.nome}
                    </div>
                    {c.nicho && (
                      <div style={{ fontSize:12, color:C.sub, marginTop:3 }}>{c.nicho}</div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding:"14px 18px", flex:1, display:"flex", flexDirection:"column", gap:12 }}>

                    {/* Seguidores + Status */}
                    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
                      {c.seguidores ? (
                        <div>
                          <div style={lSt}>Seguidores</div>
                          <div style={{ fontSize:16, fontWeight:700, marginTop:3, color:C.text }}>{c.seguidores}</div>
                        </div>
                      ) : <div />}
                      <span style={{
                        background: sb, color: sc,
                        border:`1px solid ${sc}30`,
                        borderRadius:6, padding:"4px 10px",
                        fontSize:11, fontWeight:700, letterSpacing:"0.2px",
                      }}>{c.status}</span>
                    </div>

                    {/* Contato */}
                    {c.contato && (
                      <div>
                        <div style={lSt}>Contato</div>
                        <div style={{
                          fontSize:12, marginTop:4, color:C.sub,
                          wordBreak:"break-all", lineHeight:1.4,
                        }}>{c.contato}</div>
                      </div>
                    )}

                    {/* Observações */}
                    {c.observacoes && (
                      <div style={{
                        background:"#0A0A0A",
                        border:`1px solid ${C.border}`,
                        borderRadius:8, padding:"9px 11px",
                      }}>
                        <div style={lSt}>Obs.</div>
                        <div style={{
                          fontSize:12, color:C.muted, marginTop:4,
                          lineHeight:1.55,
                          display:"-webkit-box", WebkitLineClamp:3,
                          WebkitBoxOrient:"vertical", overflow:"hidden",
                        }}>{c.observacoes}</div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    borderTop:`1px solid ${C.border}`,
                    padding:"10px 18px",
                    display:"flex", gap:6,
                    background: isHov ? "#161616" : C.card,
                    transition:"background 0.15s",
                  }}>
                    {isDel ? (
                      <>
                        <span style={{ fontSize:12, color:C.muted, alignSelf:"center", marginRight:"auto" }}>
                          Tem certeza?
                        </span>
                        <button onClick={() => del(c.id)} style={{
                          background:"rgba(255,68,68,0.12)", border:"1px solid rgba(255,68,68,0.3)",
                          borderRadius:6, color:C.red, cursor:"pointer",
                          padding:"5px 14px", fontSize:12, fontWeight:700, ...sf,
                        }}>Remover</button>
                        <button onClick={() => setDelConfirm(null)} style={{
                          background:"transparent", border:`1px solid ${C.border}`,
                          borderRadius:6, color:C.muted, cursor:"pointer",
                          padding:"5px 10px", fontSize:12, ...sf,
                        }}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openEdit(c)} style={{
                          flex:1, background:"transparent",
                          border:`1px solid ${C.border2}`,
                          borderRadius:6, color:C.sub, cursor:"pointer",
                          padding:"6px 0", fontSize:12, fontWeight:500, ...sf,
                          transition:"border-color 0.1s, color 0.1s",
                        }}>Editar</button>
                        <button onClick={() => setDelConfirm(c.id)} style={{
                          background:"transparent", border:`1px solid ${C.border}`,
                          borderRadius:6, color:C.muted, cursor:"pointer",
                          padding:"6px 12px", fontSize:12, ...sf,
                        }}>✕</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div
          style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center",
            zIndex:999, padding:16,
          }}
          onClick={e => e.target === e.currentTarget && setModal(false)}
        >
          <div style={{
            background:"#111111", border:`1px solid ${C.border2}`,
            borderRadius:14, width:"100%", maxWidth:460, padding:28, ...sf,
            maxHeight:"90vh", overflowY:"auto",
          }}>
            <h2 style={{ margin:"0 0 24px", fontSize:17, fontWeight:700, color:C.text }}>
              {editId != null ? "Editar criador" : "Novo criador"}
            </h2>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <div style={lSt}>Nome / Canal *</div>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome:e.target.value }))}
                  placeholder="ex: Felipe Neto" style={iSt} />
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={lSt}>Plataforma</div>
                  <select value={form.plataforma} onChange={e => setForm(f => ({ ...f, plataforma:e.target.value }))}
                    style={{ ...iSt, cursor:"pointer" }}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ flex:1 }}>
                  <div style={lSt}>Nicho</div>
                  <select value={form.nicho} onChange={e => setForm(f => ({ ...f, nicho:e.target.value }))}
                    style={{ ...iSt, cursor:"pointer" }}>
                    <option value="">— Selecionar —</option>
                    {NICHES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={lSt}>Seguidores</div>
                  <input value={form.seguidores} onChange={e => setForm(f => ({ ...f, seguidores:e.target.value }))}
                    placeholder="ex: 1.2M" style={iSt} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={lSt}>Status</div>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status:e.target.value }))}
                    style={{ ...iSt, cursor:"pointer" }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div style={lSt}>Contato</div>
                <input value={form.contato} onChange={e => setForm(f => ({ ...f, contato:e.target.value }))}
                  placeholder="e-mail, WhatsApp, @usuario..." style={iSt} />
              </div>
              <div>
                <div style={lSt}>Observações</div>
                <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes:e.target.value }))}
                  placeholder="Notas sobre esse criador..." rows={3}
                  style={{ ...iSt, resize:"vertical" }} />
              </div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"flex-end" }}>
              <button onClick={() => setModal(false)} style={{
                background:"transparent", border:`1px solid ${C.border2}`,
                borderRadius:8, color:C.muted, padding:"9px 20px",
                fontSize:13, cursor:"pointer", ...sf,
              }}>Cancelar</button>
              <button onClick={save} style={{
                background:C.accent, border:"none", borderRadius:8,
                color:"#000", padding:"9px 26px", fontSize:13,
                fontWeight:700, cursor:"pointer", ...sf,
              }}>{editId != null ? "Salvar" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
