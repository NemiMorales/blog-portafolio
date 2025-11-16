import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_POSTS = "bitacora-blog-posts";

const TAGS = ["Todos", "Dev", "Arte", "Vida personal", "Estudios"];

const DEFAULT_POSTS = [
  {
    id: "1",
    title: "Bienvenida a la Bitácora Entre Dos Mundos",
    content:
      "Este es un mini blog creado con React para mi portafolio. Aquí mezclo desarrollo, arte y vida personal, tal como soy en la realidad. La idea es tener un espacio donde pueda escribir sobre lo que aprendo, lo que creo y lo que siento.",
    tag: "Vida personal",
    status: "Publicado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Control Ninja: finanzas personales en modo dev",
    content:
      "Control Ninja es un organizador de finanzas en React con filtros por día, semana y mes, categorías personalizables y localStorage. Lo diseñé pensando en gente real que necesita entender en qué se le va la plata sin morir en Excel.",
    tag: "Dev",
    status: "Publicado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Katanas & Coffee Store: de acuarelas a ecommerce",
    content:
      "Un mini ecommerce ficticio donde junto ilustración, stickers y un carrito hecho en React. Me sirve para practicar UI, estados y también imaginar cómo se vería una tienda con todo lo que me gusta.",
    tag: "Arte",
    status: "Borrador",
    createdAt: new Date().toISOString(),
  },
];

function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const [filterTag, setFilterTag] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    tag: "Dev",
    status: "Borrador",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_POSTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          setSelectedPostId(parsed[0]?.id || null);
          return;
        }
      } catch {
        // ignore
      }
    }
    setPosts(DEFAULT_POSTS);
    setSelectedPostId(DEFAULT_POSTS[0].id);
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts));
    }
  }, [posts]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      content: "",
      tag: "Dev",
      status: "Borrador",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) return;

    if (editingId) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title,
                content,
                tag: form.tag,
                status: form.status,
              }
            : p
        )
      );
    } else {
      const newPost = {
        id: crypto.randomUUID(),
        title,
        content,
        tag: form.tag,
        status: form.status,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      setSelectedPostId(newPost.id);
    }

    resetForm();
  };

  const handleEditPost = (post) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      content: post.content,
      tag: post.tag,
      status: post.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (selectedPostId === id) {
      const remaining = posts.filter((p) => p.id !== id);
      setSelectedPostId(remaining[0]?.id || null);
    }
    if (editingId === id) {
      resetForm();
    }
  };

  const handleSelectPost = (id) => {
    setSelectedPostId(id);
  };

  // FILTROS / ORDEN
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (filterTag !== "Todos") {
      result = result.filter((p) => p.tag === filterTag);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.content.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortBy === "newest") return dateB - dateA;
      return dateA - dateB;
    });

    return result;
  }, [posts, filterTag, search, sortBy]);

  const publishedPosts = filteredPosts.filter(
    (p) => p.status === "Publicado"
  );
  const drafts = filteredPosts.filter((p) => p.status === "Borrador");

  const heroPost = publishedPosts[0] || filteredPosts[0] || null;
  const moreStories = filteredPosts.filter((p) => p.id !== heroPost?.id);
  const selectedPost =
    filteredPosts.find((p) => p.id === selectedPostId) || heroPost;

  useEffect(() => {
    if (!selectedPost && filteredPosts.length > 0) {
      setSelectedPostId(filteredPosts[0].id);
    }
  }, [selectedPost, filteredPosts]);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.status === "Publicado").length;
  const draftCount = posts.filter((p) => p.status === "Borrador").length;

  return (
    <div className="mag-app">
      {/* NAV SUPERIOR */}
      <header className="mag-nav">
        <div className="mag-nav-left">
          <span className="mag-logo">ENTRE DOS MUNDOS</span>
        </div>
        <nav className="mag-nav-center">
          {TAGS.filter((t) => t !== "Todos").map((tag) => (
            <button
              key={tag}
              className={`mag-nav-link ${
                filterTag === tag ? "active" : ""
              }`}
              onClick={() => setFilterTag(tag)}
            >
              {tag.toUpperCase()}
            </button>
          ))}
          <button
            className={`mag-nav-link ${filterTag === "Todos" ? "active" : ""}`}
            onClick={() => setFilterTag("Todos")}
          >
            TODO
          </button>
        </nav>
        <div className="mag-nav-right">
          <input
            type="text"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="mag-main">
        {/* HERO EDITORIAL */}
        {heroPost && (
          <section className="mag-hero">
            <div className="mag-hero-image">
              {/* área simulada de imagen */}
              <span className="mag-hero-tag">{heroPost.tag}</span>
            </div>
            <div className="mag-hero-text">
              <p className="mag-hero-kicker">HISTORIA DESTACADA</p>
              <h1 onClick={() => handleSelectPost(heroPost.id)}>
                {heroPost.title}
              </h1>
              <p className="mag-hero-meta">
                {formatDate(heroPost.createdAt)} ·{" "}
                {heroPost.status === "Publicado"
                  ? "Publicado"
                  : "Borrador"}
              </p>
              <p className="mag-hero-excerpt">
                {heroPost.content.length > 260
                  ? heroPost.content.slice(0, 260) + "…"
                  : heroPost.content}
              </p>
              <button
                className="mag-hero-btn"
                onClick={() => handleSelectPost(heroPost.id)}
              >
                Leer artículo
              </button>
            </div>
          </section>
        )}

        {/* GRID + SIDEBAR */}
        <section className="mag-content">
          <div className="mag-left">
            {/* MÁS HISTORIAS */}
            <section className="mag-section">
              <div className="mag-section-header">
                <h2>Últimas historias</h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguas</option>
                </select>
              </div>

              {filteredPosts.length === 0 ? (
                <p className="muted">
                  No hay artículos para mostrar con este filtro.
                </p>
              ) : (
                <div className="mag-grid">
                  {moreStories.map((post) => (
                    <article
                      key={post.id}
                      className="mag-card"
                      onClick={() => handleSelectPost(post.id)}
                    >
                      <div className="mag-card-image" />
                      <div className="mag-card-body">
                        <span className="mag-card-tag">
                          {post.tag}
                        </span>
                        <h3>{post.title}</h3>
                        <p>
                          {post.content.length > 120
                            ? post.content.slice(0, 120) + "…"
                            : post.content}
                        </p>
                        <span className="mag-card-meta">
                          {formatDate(post.createdAt)} ·{" "}
                          {post.status === "Publicado"
                            ? "Publicado"
                            : "Borrador"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ARTÍCULO SELECCIONADO ABAJO, ESTILO LECTURA */}
            {selectedPost && (
              <section className="mag-article">
                <p className="mag-article-tag">
                  {selectedPost.tag.toUpperCase()}
                </p>
                <h2>{selectedPost.title}</h2>
                <p className="mag-article-meta">
                  {formatDate(selectedPost.createdAt)} ·{" "}
                  {selectedPost.status === "Publicado"
                    ? "Publicado"
                    : "Borrador"}
                </p>
                <div className="mag-article-content">
                  {selectedPost.content}
                </div>
                <div className="mag-article-actions">
                  <button
                    className="mag-link-btn"
                    onClick={() => handleEditPost(selectedPost)}
                  >
                    Editar artículo
                  </button>
                  <button
                    className="mag-link-btn danger"
                    onClick={() => handleDeletePost(selectedPost.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR: SOBRE MÍ + ESTADÍSTICAS + PANEL DE ESCRITURA */}
          <aside className="mag-right">
            <section className="mag-sidebar-card">
              <h3>Sobre mí</h3>
              <p>
                Soy <strong>Noemí</strong>, mezclo{" "}
                <strong>arte</strong> y <strong>código</strong>.  
                Esta bitácora es mi lugar para escribir sobre proyectos, procesos
                y la vida entre esos dos mundos.
              </p>
            </section>

            <section className="mag-sidebar-card">
              <h3>Resumen del blog</h3>
              <ul className="mag-stats">
                <li>
                  <span>Total artículos</span>
                  <strong>{totalPosts}</strong>
                </li>
                <li>
                  <span>Publicados</span>
                  <strong>{publishedCount}</strong>
                </li>
                <li>
                  <span>Borradores</span>
                  <strong>{draftCount}</strong>
                </li>
              </ul>
            </section>

            <section className="mag-sidebar-card">
              <div className="mag-sidebar-header">
                <h3>{editingId ? "Editar artículo" : "Nuevo artículo"}</h3>
                {editingId && (
                  <button className="mag-small-link" onClick={resetForm}>
                    cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="mag-form">
                <div className="mag-form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Ej. Mezclando arte y frontend"
                    value={form.title}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="mag-form-inline">
                  <div className="mag-form-group">
                    <label>Categoría</label>
                    <select
                      name="tag"
                      value={form.tag}
                      onChange={handleFormChange}
                    >
                      {TAGS.filter((t) => t !== "Todos").map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mag-form-group">
                    <label>Estado</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                    >
                      <option value="Borrador">Borrador</option>
                      <option value="Publicado">Publicado</option>
                    </select>
                  </div>
                </div>
                <div className="mag-form-group">
                  <label>Contenido</label>
                  <textarea
                    name="content"
                    rows={6}
                    placeholder="Escribe aquí tu artículo…"
                    value={form.content}
                    onChange={handleFormChange}
                  />
                </div>
                <button type="submit" className="mag-submit-btn">
                  {editingId ? "Guardar cambios" : "Publicar / guardar"}
                </button>
              </form>
            </section>
          </aside>
        </section>
      </main>

      <footer className="mag-footer">
        <small>Entre Dos Mundos · Blog hecho con React ✨</small>
      </footer>
    </div>
  );
}

export default App;
