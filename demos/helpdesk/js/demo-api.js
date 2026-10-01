// Modo demonstração: intercepta as chamadas a /api/* e responde no próprio navegador,
// com dados exportados do backend real (FastAPI). As regras de validação, as transições
// de status e o isolamento por empresa imitam as do servidor. Nada sai do navegador.
(() => {
  const realFetch = window.fetch.bind(window);
  const STATE_KEY = "helpdesk-demo-state-v1";
  const THRESHOLD = 80.0;
  const USERS = {
    "admin@helpdesk.com.br": "admin12345",
    "empresa1@cliente.com.br": "empresa12345",
  };
  const CAN_SEE_CLIENTS_PAGE = { "admin@helpdesk.com.br": true };

  let dbPromise = null;
  function load() {
    if (!dbPromise) {
      dbPromise = (async () => {
        try {
          const saved = sessionStorage.getItem(STATE_KEY);
          if (saved) return JSON.parse(saved);
        } catch (e) {}
        const res = await realFetch(new URL("data.json", document.baseURI));
        return res.json();
      })();
    }
    return dbPromise;
  }
  function save(db) {
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify(db)); } catch (e) {}
  }

  const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const fail = (status, error, detail) => ({ status, body: { error, detail } });
  const ok = (body, status = 200) => ({ status, body });
  const notFound = (what, id) => fail(404, "not_found", `${what} com id ${id} nao foi encontrado.`);
  const like = (v, term) => String(v ?? "").toLowerCase().includes(term);
  const nextId = (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

  function page(items, q, defLimit = 20) {
    const limit = Math.min(Math.max(parseInt(q.get("limit") || defLimit, 10), 1), 100);
    const offset = Math.max(parseInt(q.get("offset") || 0, 10), 0);
    return { items: items.slice(offset, offset + limit), total: items.length, limit, offset, has_more: offset + limit < items.length };
  }

  function sortBy(items, q, columns) {
    const col = columns[q.get("sort")];
    if (!col) return items;
    const dir = q.get("order") === "desc" ? -1 : 1;
    return [...items].sort((a, b) => {
      const x = col(a), y = col(b);
      if (x == null) return 1;
      if (y == null) return -1;
      return (typeof x === "number" ? x - y : String(x).localeCompare(String(y), "pt-BR")) * dir;
    });
  }

  function validate(rules) {
    const msgs = rules.filter(([okRule]) => !okRule).map(([, msg]) => msg);
    return msgs.length ? fail(422, "validation_error", msgs.join(" ")) : null;
  }
  const len = (v) => String(v ?? "").trim().length;

  function recompute(u) {
    const t = u.tickets;
    const by = (s) => t.filter((x) => x.status === s).length;
    Object.assign(u.summary, {
      total_clientes: u.clients.length,
      total_chamados: t.length,
      chamados_abertos: by("ABERTO"),
      chamados_em_andamento: by("EM_ANDAMENTO"),
      chamados_finalizados: by("FINALIZADO"),
      total_equipamentos: u.equipments.length,
      alertas_criticos_abertos: u.alerts.filter((a) => a.status === "ABERTO").length,
      total_alertas: u.alerts.length,
    });
    const labels = Object.fromEntries(u.categories.map((c) => [c.value, c.label]));
    const cats = {};
    for (const x of t) {
      const c = (cats[x.category] ??= { category: x.category, category_label: labels[x.category], total: 0, abertos: 0, em_andamento: 0, finalizados: 0 });
      c.total++;
      c[{ ABERTO: "abertos", EM_ANDAMENTO: "em_andamento", FINALIZADO: "finalizados" }[x.status]]++;
    }
    u.byCategory = Object.values(cats).sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
    u.summary.top_categoria = u.byCategory[0]?.category ?? null;
  }

  function userFromToken(headers) {
    const h = headers && (headers.Authorization || headers.authorization);
    const email = h && h.startsWith("Bearer demo:") ? h.slice("Bearer demo:".length) : null;
    return email && USERS[email] ? email : null;
  }

  async function route(method, path, query, body, headers) {
    const db = await load();

    if (method === "POST" && path === "/auth/login") {
      const err = validate([[len(body?.password) >= 8, "O campo 'password' precisa ter pelo menos 8 caracteres."]]);
      if (err) return err;
      const email = String(body.email || "").trim().toLowerCase();
      if (USERS[email] !== body.password) return fail(401, "unauthorized", "E-mail ou senha incorretos.");
      return ok({ access_token: `demo:${email}`, token_type: "bearer", expires_in: 28800, user: db[email].user });
    }
    if (method === "POST" && path === "/auth/logout") return ok(null, 204);

    const email = userFromToken(headers);
    if (!email) return fail(401, "unauthorized", "Faca login para acessar este recurso.");
    const u = db[email];
    const scope = u.user.client_id;
    const parts = path.split("/").filter(Boolean);
    const [res, idRaw, sub] = parts;
    const id = idRaw && /^\d+$/.test(idRaw) ? Number(idRaw) : null;
    const commit = (r) => { recompute(u); save(db); return r; };

    if (path === "/auth/me") return ok(u.user);

    if (res === "analytics") {
      if (idRaw === "summary") return ok(u.summary);
      if (idRaw === "tickets-by-category") return ok(u.byCategory);
      if (idRaw === "category-resolution-time") return ok(u.resolution);
      if (idRaw === "customer-ranking") {
        const count = {};
        for (const t of u.tickets) count[t.client_id] = (count[t.client_id] || 0) + 1;
        const rows = u.clients.filter((c) => count[c.id])
          .map((c) => ({ client_id: c.id, client_name: c.name, company: c.company, total: count[c.id] }))
          .sort((a, b) => b.total - a.total || a.client_name.localeCompare(b.client_name))
          .slice(0, parseInt(query.get("limit") || 10, 10))
          .map((r, i) => ({ position: i + 1, ...r }));
        return ok(rows);
      }
    }

    if (res === "clients") {
      if (method === "GET" && idRaw === "options") {
        const term = (query.get("search") || "").trim().toLowerCase();
        return ok(u.clients.filter((c) => !term || like(c.name, term) || like(c.company, term))
          .sort((a, b) => a.company.localeCompare(b.company, "pt-BR"))
          .map(({ id, name, company }) => ({ id, name, company })));
      }
      if (method === "GET" && !idRaw) {
        const term = (query.get("search") || "").trim().toLowerCase();
        let items = u.clients.filter((c) => !term || like(c.name, term) || like(c.company, term) || like(c.email, term));
        items = [...items].sort((a, b) => a.company.localeCompare(b.company, "pt-BR"));
        items = sortBy(items, query, { name: (c) => c.name, company: (c) => c.company, email: (c) => c.email, created_at: (c) => c.created_at });
        return ok(page(items, query));
      }
      if (method === "POST" && !idRaw) {
        if (scope) return fail(403, "forbidden", "Apenas a empresa de TI pode cadastrar clientes.");
        const err = validate([
          [len(body.name) >= 5, "O nome precisa ter pelo menos 5 caracteres."],
          [len(body.company) >= 10, "A empresa precisa ter pelo menos 10 caracteres."],
          [/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || ""), "Informe um e-mail valido."],
          [String(body.phone || "").replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."],
        ]);
        if (err) return err;
        if (u.clients.some((c) => c.email.toLowerCase() === body.email.toLowerCase()))
          return fail(409, "conflict", `Ja existe um cliente cadastrado com o e-mail '${body.email}'.`);
        const c = { name: body.name.trim(), company: body.company.trim(), email: body.email.trim(), phone: body.phone.trim(), id: nextId(u.clients), created_at: now() };
        u.clients.push(c);
        return commit(ok(c, 201));
      }
      if (id != null) {
        const c = u.clients.find((x) => x.id === id);
        if (!c) return notFound("Cliente", id);
        if (scope && scope !== id) return fail(403, "forbidden", "Voce nao tem acesso aos dados deste cliente.");
        if (method === "GET" && !sub) return ok(c);
        if (method === "GET" && sub === "tickets") {
          const st = query.get("status");
          const items = u.tickets.filter((t) => t.client_id === id && (!st || t.status === st))
            .sort((a, b) => b.opened_at.localeCompare(a.opened_at));
          return ok(page(items, query));
        }
        if (method === "DELETE") {
          const nt = u.tickets.filter((t) => t.client_id === id).length;
          const ne = u.equipments.filter((e) => e.client_id === id).length;
          if (nt || ne) return fail(409, "conflict", `Nao e' possivel excluir o cliente '${c.name}': ele possui ${nt} chamado(s) e ${ne} equipamento(s) vinculados. Historico de atendimento nao pode ser apagado.`);
          u.clients = u.clients.filter((x) => x.id !== id);
          return commit(ok(null, 204));
        }
      }
    }

    if (res === "tickets") {
      if (method === "GET" && idRaw === "categories") return ok(u.categories);
      if (method === "GET" && !idRaw) {
        const f = (k) => query.get(k);
        const term = (f("search") || "").trim().toLowerCase();
        let items = u.tickets.filter((t) =>
          (!f("status") || t.status === f("status")) &&
          (!f("priority") || t.priority === f("priority")) &&
          (!f("category") || t.category === f("category")) &&
          (!f("client_id") || t.client_id === Number(f("client_id"))) &&
          (!term || like(t.title, term) || like(t.description, term) || like(t.subcategory, term)));
        items = [...items].sort((a, b) => b.opened_at.localeCompare(a.opened_at) || b.id - a.id);
        const prio = { BAIXA: 1, MEDIA: 2, ALTA: 3, CRITICA: 4 };
        items = sortBy(items, query, {
          id: (t) => t.id, title: (t) => t.title, company: (t) => t.client.company, category: (t) => t.category_label,
          priority: (t) => prio[t.priority] ?? 0, status: (t) => t.status, opened_at: (t) => t.opened_at,
        });
        return ok(page(items, query));
      }
      if (method === "POST" && !idRaw) {
        const clientId = scope || Number(body.client_id);
        const client = u.clients.find((c) => c.id === clientId);
        if (!client) return notFound("Cliente", body.client_id);
        const cat = u.categories.find((c) => c.value === body.category);
        const err = validate([
          [len(body.title) >= 3, "O titulo precisa ter pelo menos 3 caracteres."],
          [len(body.description) >= 5, "A descricao precisa ter pelo menos 5 caracteres."],
          [!!cat, "Escolha uma categoria valida."],
        ]);
        if (err) return err;
        const t = {
          id: nextId(u.tickets), client_id: client.id, client: { id: client.id, name: client.name, company: client.company },
          title: body.title.trim(), description: body.description.trim(), category: body.category, subcategory: body.subcategory || null,
          priority: body.priority || "MEDIA", status: "ABERTO", opened_at: now(), closed_at: null, category_label: cat.label,
        };
        u.tickets.push(t);
        return commit(ok(t, 201));
      }
      if (id != null) {
        const t = u.tickets.find((x) => x.id === id);
        if (!t) return notFound("Chamado", id);
        if (scope && t.client_id !== scope) return fail(403, "forbidden", "Voce nao tem acesso a este chamado.");
        if (method === "GET" && !sub) return ok(t);
        if (method === "PATCH" && sub === "status") {
          const allowed = { ABERTO: ["EM_ANDAMENTO", "FINALIZADO"], EM_ANDAMENTO: ["ABERTO", "FINALIZADO"], FINALIZADO: [] }[t.status];
          if (!allowed.includes(body.status)) {
            return fail(409, "business_rule_violation",
              `Transicao de status invalida: o chamado #${id} esta '${t.status}' e nao pode ir para '${body.status}'. ` +
              `Transicoes permitidas a partir de '${t.status}': ${[...allowed].sort().join(", ") || "nenhum"}.`);
          }
          t.status = body.status;
          if (body.status === "FINALIZADO") t.closed_at = now();
          return commit(ok(t));
        }
      }
    }

    if (res === "equipments") {
      if (method === "GET" && idRaw === "anomalies") return ok(u.anomalies);
      if (method === "GET" && !idRaw) {
        const f = (k) => query.get(k);
        const term = (f("search") || "").trim().toLowerCase();
        let items = u.equipments.filter((e) =>
          (!f("client_id") || e.client_id === Number(f("client_id"))) &&
          (!f("status") || e.status === f("status")) &&
          (!term || like(e.identifier, term) || like(e.name, term) || like(e.location, term) || like(e.client.company, term) || like(e.client.name, term)));
        items = sortBy(items, query, {
          identifier: (e) => e.identifier, name: (e) => e.name, company: (e) => e.client.company, location: (e) => e.location, status: (e) => e.status,
        });
        return ok(page(items, query));
      }
      if (method === "POST" && !idRaw) {
        const clientId = scope || Number(body.client_id);
        const client = u.clients.find((c) => c.id === clientId);
        if (!client) return notFound("Cliente", body.client_id);
        const err = validate([
          [len(body.identifier) >= 2, "A identificacao precisa ter pelo menos 2 caracteres."],
          [len(body.name) >= 2, "O nome precisa ter pelo menos 2 caracteres."],
        ]);
        if (err) return err;
        if (u.equipments.some((e) => e.identifier.toLowerCase() === body.identifier.trim().toLowerCase()))
          return fail(409, "conflict", `Ja existe um equipamento com a identificacao '${body.identifier.trim()}'.`);
        const e = {
          id: nextId(u.equipments), client_id: client.id, client: { id: client.id, name: client.name, company: client.company },
          identifier: body.identifier.trim(), name: body.name.trim(), location: body.location?.trim() || null, status: body.status || "ONLINE",
          created_at: now(), last_temperature: null, last_reading_at: null, open_alerts: 0,
        };
        u.equipments.push(e);
        u.readings[e.id] = [];
        return commit(ok(e, 201));
      }
      if (id != null) {
        const e = u.equipments.find((x) => x.id === id);
        if (!e) return notFound("Equipamento", id);
        if (scope && e.client_id !== scope) return fail(403, "forbidden", "Voce nao tem acesso a este equipamento.");
        if (method === "GET" && !sub) return ok(e);
        if (method === "GET" && sub === "readings") {
          return ok((u.readings[id] || []).slice(0, parseInt(query.get("limit") || 100, 10)));
        }
        if (method === "POST" && sub === "readings") {
          const temp = Number(body.temperature);
          const err = validate([[Number.isFinite(temp) && temp >= -50 && temp <= 200, "A temperatura precisa estar entre -50 e 200 C."]]);
          if (err) return err;
          const all = Object.values(u.readings).flat();
          const reading = { id: all.reduce((m, r) => Math.max(m, r.id), 0) + 1, equipment_id: id, temperature: temp, status: body.status || e.status, recorded_at: now() };
          (u.readings[id] ||= []).unshift(reading);
          e.last_temperature = temp;
          e.last_reading_at = reading.recorded_at;
          let alert = null;
          if (temp > THRESHOLD) {
            alert = {
              id: nextId(u.alerts), equipment_id: id, reading_id: reading.id, alert_type: "TEMPERATURA_CRITICA", temperature: temp,
              message: `Temperatura critica detectada no equipamento ${e.identifier}: ${temp.toFixed(1)} C (limite configurado: ${THRESHOLD.toFixed(1)} C).`,
              status: "ABERTO", created_at: reading.recorded_at, equipment_identifier: e.identifier, equipment_name: e.name, client_company: e.client.company,
            };
            u.alerts.unshift(alert);
            e.open_alerts++;
          }
          return commit(ok({ reading, critical_condition_detected: !!alert, alert, threshold: THRESHOLD }, 201));
        }
      }
    }

    if (res === "alerts") {
      if (method === "GET" && !idRaw) {
        const f = (k) => query.get(k);
        let items = u.alerts.filter((a) => (!f("status") || a.status === f("status")) && (!f("equipment_id") || a.equipment_id === Number(f("equipment_id"))));
        items = sortBy(items, query, {
          id: (a) => a.id, identifier: (a) => a.equipment_identifier, company: (a) => a.client_company,
          temperature: (a) => a.temperature, status: (a) => a.status, created_at: (a) => a.created_at,
        });
        return ok(page(items, query));
      }
      if (method === "PATCH" && id != null && sub === "status") {
        const a = u.alerts.find((x) => x.id === id);
        if (!a) return notFound("Alerta", id);
        const e = u.equipments.find((x) => x.id === a.equipment_id);
        if (scope && e && e.client_id !== scope) return fail(403, "forbidden", "Voce nao tem acesso a este equipamento.");
        if (e && a.status === "ABERTO" && body.status !== "ABERTO") e.open_alerts = Math.max(0, e.open_alerts - 1);
        if (e && a.status !== "ABERTO" && body.status === "ABERTO") e.open_alerts++;
        a.status = body.status;
        return commit(ok(a));
      }
    }

    return fail(404, "not_found", `Rota ${method} /api${path} nao existe nesta demonstracao.`);
  }

  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (!url.pathname.startsWith("/api/")) return realFetch(input, options);
    const method = (options.method || "GET").toUpperCase();
    let body = null;
    try { body = options.body ? JSON.parse(options.body) : null; } catch (e) {}
    await new Promise((r) => setTimeout(r, 120));
    const r = await route(method, url.pathname.slice(4), url.searchParams, body, options.headers);
    return new Response(r.status === 204 || r.body == null ? null : JSON.stringify(r.body), {
      status: r.status, headers: { "Content-Type": "application/json" },
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const tag = document.createElement("div");
    tag.setAttribute("role", "note");
    tag.innerHTML = 'Demo: API simulada no navegador com dados fictícios · <a href="https://github.com/BragaDudu/helpdesk-monitoring-platform" target="_blank" rel="noopener">código real (FastAPI)</a> · <button type="button">reiniciar dados</button>';
    tag.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:9999;width:max-content;max-width:calc(100% - 24px);text-align:center;font:12px/1.4 system-ui,sans-serif;background:rgba(17,17,20,.92);color:#e4e4e7;padding:8px 12px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.35)";
    tag.querySelector("a").style.color = "#93c5fd";
    const btn = tag.querySelector("button");
    btn.style.cssText = "font:inherit;color:#93c5fd;background:none;border:0;padding:0;text-decoration:underline;cursor:pointer";
    btn.addEventListener("click", () => {
      try { sessionStorage.removeItem(STATE_KEY); } catch (e) {}
      location.reload();
    });
    document.body.appendChild(tag);
  });
})();
