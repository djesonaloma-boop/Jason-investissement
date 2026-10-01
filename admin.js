/* ==========================================================
   JASON INVEST — admin.js
   Contrôle de l'espace administrateur
========================================================== */

"use strict";

const API = "/api";

const state = {
  clients: [],
  plans: []
};


/* ==========================================================
   OUTILS
========================================================== */

const $ = (id) => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(value) {
  return new Intl.NumberFormat("fr-FR").format(
    Number(value || 0)
  ) + " FC";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(value);
  }

  return date.toLocaleString("fr-FR");
}

function toast(message, type = "") {
  const element = $("toast");

  if (!element) return;

  element.textContent = message;
  element.className = "toast show " + type;

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    element.className = "toast";
  }, 3500);
}


/* ==========================================================
   API
========================================================== */

async function api(path, options = {}) {

  const config = {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  };

  let response;

  try {

    response = await fetch(API + path, config);

  } catch (error) {

    throw new Error(
      "Impossible de contacter le serveur API."
    );

  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {

    const error = new Error(
      data.message ||
      data.error ||
      `Erreur serveur (${response.status})`
    );

    error.status = response.status;

    throw error;
  }

  return data;
}


/* ==========================================================
   CONNEXION ADMIN
========================================================== */

async function checkAdminSession() {

  try {

    await api("/auth/admin-me");

    showAdmin();

    await loadDashboard();

  } catch {

    if ($("adminLogin")) {
      $("adminLogin").classList.remove("hidden");
    }

    if ($("adminApp")) {
      $("adminApp").classList.add("hidden");
    }

  }
}


async function loginAdmin(event) {

  event.preventDefault();

  const identifier =
    $("adminIdentifier")?.value.trim();

  const password =
    $("adminPassword")?.value || "";

  const button =
    $("loginButton");

  const errorBox =
    $("loginError");

  if (errorBox) {
    errorBox.style.display = "none";
  }

  if (button) {
    button.disabled = true;
    button.textContent = "Connexion...";
  }

  try {

    await api("/auth/admin-login", {
      method: "POST",

      body: JSON.stringify({
        identifier,
        password
      })
    });

    if ($("adminPassword")) {
      $("adminPassword").value = "";
    }

    showAdmin();

    toast(
      "Connexion administrateur réussie.",
      "success"
    );

    await loadDashboard();

  } catch (error) {

    if (errorBox) {

      errorBox.textContent =
        error.message ||
        "Identifiants incorrects.";

      errorBox.style.display = "block";
    }

  } finally {

    if (button) {

      button.disabled = false;
      button.textContent = "🔐 Se connecter";

    }

  }
}


function showAdmin() {

  if ($("adminLogin")) {
    $("adminLogin").classList.add("hidden");
  }

  if ($("adminApp")) {
    $("adminApp").classList.remove("hidden");
  }
}


/* ==========================================================
   NAVIGATION
========================================================== */

const sectionTitles = {
  dashboard: "Dashboard",
  clients: "Clients",
  transactions: "Transactions",
  deposits: "Dépôts",
  withdrawals: "Retraits",
  payments: "Moyens de paiement",
  investments: "Investissements",
  activities: "Activités",
  fidelity: "Fidélité & VIP",
  referral: "Parrainage",
  notifications: "Notifications",
  support: "Support",
  settings: "Paramètres"
};


function openSection(name) {

  document
    .querySelectorAll(".admin-section")
    .forEach(section => {
      section.classList.remove("active");
    });

  document
    .querySelectorAll(".nav-btn[data-section]")
    .forEach(button => {
      button.classList.remove("active");
    });

  const section =
    $("section-" + name);

  if (section) {
    section.classList.add("active");
  }

  const button =
    document.querySelector(
      `.nav-btn[data-section="${name}"]`
    );

  if (button) {
    button.classList.add("active");
  }

  if ($("topbarTitle")) {
    $("topbarTitle").textContent =
      sectionTitles[name] ||
      "Administration";
  }

  if ($("sidebar")) {
    $("sidebar").classList.remove("open");
  }

  switch (name) {

    case "dashboard":
      loadDashboard();
      break;

    case "clients":
      loadClients();
      break;

    case "transactions":
      loadTransactions();
      break;

    case "deposits":
      loadDeposits();
      break;

    case "withdrawals":
      loadWithdrawals();
      break;

    case "payments":
      loadPaymentMethods();
      break;

    case "investments":
      loadInvestmentPlans();
      break;

    case "activities":
      loadActivities();
      break;

    case "notifications":
      loadNotifications();
      break;

    case "support":
      loadSupport();
      break;
  }
}


/* ==========================================================
   DASHBOARD
========================================================== */

async function loadDashboard() {

  const container =
    $("recentTransactions");

  if (container) {
    container.innerHTML =
      `<div class="loading">Chargement...</div>`;
  }

  try {

    const data =
      await api("/admin/dashboard");

    if ($("statClients")) {
      $("statClients").textContent =
        data.clients ??
        data.totalClients ??
        0;
    }

    if ($("statDeposits")) {
      $("statDeposits").textContent =
        data.deposits ??
        data.totalDeposits ??
        0;
    }

    if ($("statWithdrawals")) {
      $("statWithdrawals").textContent =
        data.withdrawals ??
        data.totalWithdrawals ??
        0;
    }

    if ($("statInvestments")) {
      $("statInvestments").textContent =
        data.investments ??
        data.totalInvestments ??
        0;
    }

    const transactions =
      data.recentTransactions ||
      data.transactions ||
      [];

    if (!container) return;

    if (!transactions.length) {

      container.innerHTML = `
        <div class="empty">
          <div class="empty-icon">🧾</div>
          Aucune transaction récente.
        </div>
      `;

      return;
    }

    container.innerHTML =
      transactions.slice(0, 8).map(item => `

        <div style="
          padding:12px 0;
          border-bottom:1px solid var(--border);
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            gap:10px;
          ">

            <strong>
              ${escapeHTML(
                item.description ||
                item.type ||
                "Transaction"
              )}
            </strong>

            <span>
              ${money(item.amount)}
            </span>

          </div>

          <div style="
            color:var(--muted);
            font-size:11px;
            margin-top:5px;
          ">
            ${formatDate(
              item.createdAt ||
              item.date
            )}
          </div>

        </div>

      `).join("");

  } catch (error) {

    if (container) {
      container.innerHTML = `
        <div class="empty">
          Impossible de charger les données.
        </div>
      `;
    }

  }
}


/* ==========================================================
   CLIENTS
========================================================== */

async function loadClients() {

  const table =
    $("clientsTable");

  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="6" class="empty">
        Chargement...
      </td>
    </tr>
  `;

  try {

    const data =
      await api("/admin/clients");

    state.clients =
      data.clients ||
      data ||
      [];

    renderClients(state.clients);

    populateClientSelect();

  } catch {

    table.innerHTML = `
      <tr>
        <td colspan="6" class="empty">
          Impossible de charger les clients.
        </td>
      </tr>
    `;

  }
}


function renderClients(clients) {

  const table =
    $("clientsTable");

  if (!table) return;

  if (!clients.length) {

    table.innerHTML = `
      <tr>
        <td colspan="6" class="empty">
          Aucun client trouvé.
        </td>
      </tr>
    `;

    return;
  }

  table.innerHTML =
    clients.map(client => {

      const id =
        client.id ||
        client._id ||
        client.userId ||
        "";

      return `

        <tr>

          <td>
            <strong>
              ${escapeHTML(
                client.name ||
                client.fullName ||
                "Client"
              )}
            </strong>

            <div style="
              color:var(--muted);
              font-size:11px;
              margin-top:3px;
            ">
              ${escapeHTML(
                client.email ||
                "—"
              )}
            </div>
          </td>

          <td>
            ${escapeHTML(
              client.phone ||
              "—"
            )}
          </td>

          <td>
            ${money(
              client.balance ??
              client.solde ??
              0
            )}
          </td>

          <td>
            ${escapeHTML(
              client.vip ||
              client.vipLevel ||
              "—"
            )}
          </td>

          <td>
            <span class="badge badge-green">
              ${escapeHTML(
                client.status ||
                "Actif"
              )}
            </span>
          </td>

          <td>
            <button
              class="btn btn-blue"
              onclick="selectClientForReset('${escapeHTML(id)}')"
            >
              🔑
            </button>
          </td>

        </tr>

      `;

    }).join("");
}


function populateClientSelect() {

  const select =
    $("passwordClient");

  if (!select) return;

  select.innerHTML = `
    <option value="">
      Sélectionner un client
    </option>
  `;

  state.clients.forEach(client => {

    const id =
      client.id ||
      client._id ||
      client.userId;

    const option =
      document.createElement("option");

    option.value = id;

    option.textContent =
      `${client.name || "Client"} — ${
        client.phone ||
        client.email ||
        id
      }`;

    select.appendChild(option);

  });
}


function selectClientForReset(id) {

  if ($("passwordClient")) {
    $("passwordClient").value = id;
  }

  if ($("newClientPassword")) {
    $("newClientPassword").focus();
  }
}


function generateTemporaryPassword() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "";

  for (let i = 0; i < 10; i++) {

    password +=
      chars[
        Math.floor(
          Math.random() * chars.length
        )
      ];

  }

  return password;
}


async function resetClientPassword() {

  const clientId =
    $("passwordClient")?.value;

  let password =
    $("newClientPassword")?.value.trim();

  if (!clientId) {

    toast(
      "Sélectionnez un client.",
      "error"
    );

    return;
  }

  if (!password) {

    password =
      generateTemporaryPassword();

    $("newClientPassword").value =
      password;
  }

  if (password.length < 8) {

    toast(
      "Le mot de passe doit contenir au moins 8 caractères.",
      "error"
    );

    return;
  }

  if (!confirm(
    "Réinitialiser le mot de passe de ce client ?"
  )) {
    return;
  }

  try {

    await api(
      `/admin/clients/${encodeURIComponent(clientId)}/reset-password`,
      {
        method: "POST",

        body: JSON.stringify({
          password
        })
      }
    );

    toast(
      "Mot de passe réinitialisé.",
      "success"
    );

    $("newClientPassword").value = "";

  } catch (error) {

    toast(
      error.message ||
      "Impossible de réinitialiser le mot de passe.",
      "error"
    );

  }
}


/* ==========================================================
   TRANSACTIONS
========================================================== */

async function loadTransactions() {

  const table =
    $("transactionsTable");

  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="6" class="empty">
        Chargement...
      </td>
    </tr>
  `;

  try {

    const data =
      await api("/admin/transactions");

    const rows =
      data.transactions ||
      data ||
      [];

    if (!rows.length) {

      table.innerHTML = `
        <tr>
          <td colspan="6" class="empty">
            Aucune transaction.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML =
      rows.map(item => `

        <tr>

          <td>
            ${formatDate(
              item.createdAt ||
              item.date
            )}
          </td>

          <td>
            ${escapeHTML(
              item.userName ||
              item.clientName ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              item.type ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              item.description ||
              "—"
            )}
          </td>

          <td>
            ${money(item.amount)}
          </td>

          <td>
            <span class="badge badge-blue">
              ${escapeHTML(
                item.status ||
                "—"
              )}
            </span>
          </td>

        </tr>

      `).join("");

  } catch {

    table.innerHTML = `
      <tr>
        <td colspan="6" class="empty">
          Erreur de chargement.
        </td>
      </tr>
    `;

  }
}


/* ==========================================================
   DEPOTS
========================================================== */

async function loadDeposits() {

  const table =
    $("depositsTable");

  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="7" class="empty">
        Chargement...
      </td>
    </tr>
  `;

  try {

    const data =
      await api("/admin/deposits");

    const rows =
      data.deposits ||
      data ||
      [];

    if (!rows.length) {

      table.innerHTML = `
        <tr>
          <td colspan="7" class="empty">
            Aucun dépôt.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML =
      rows.map(item => {

        const id =
          item.id ||
          item._id ||
          "";

        const status =
          String(
            item.status || ""
          ).toLowerCase();

        let badge =
          "badge-orange";

        if (
          status === "approved" ||
          status === "valid" ||
          status === "completed"
        ) {
          badge = "badge-green";
        }

        if (status === "rejected") {
          badge = "badge-red";
        }

        return `

          <tr>

            <td>
              ${formatDate(
                item.createdAt ||
                item.date
              )}
            </td>

            <td>
              ${escapeHTML(
                item.userName ||
                item.clientName ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                item.method ||
                item.paymentMethod ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                item.reference ||
                "—"
              )}
            </td>

            <td>
              ${money(item.amount)}
            </td>

            <td>
              <span class="badge ${badge}">
                ${escapeHTML(
                  item.status ||
                  "pending"
                )}
              </span>
            </td>

            <td>

              ${
                status === "pending" || !status
                  ? `
                    <button
                      class="btn btn-green"
                      onclick="approveDeposit('${escapeHTML(id)}')"
                    >
                      ✓
                    </button>

                    <button
                      class="btn btn-red"
                      onclick="rejectDeposit('${escapeHTML(id)}')"
                    >
                      ✕
                    </button>
                  `
                  : "—"
              }

            </td>

          </tr>

        `;

      }).join("");

  } catch {

    table.innerHTML = `
      <tr>
        <td colspan="7" class="empty">
          Erreur de chargement.
        </td>
      </tr>
    `;

  }
}


async function approveDeposit(id) {

  if (!confirm("Valider ce dépôt ?")) {
    return;
  }

  try {

    await api(
      `/admin/deposits/${encodeURIComponent(id)}/approve`,
      {
        method: "POST"
      }
    );

    toast(
      "Dépôt validé.",
      "success"
    );

    await loadDeposits();

  } catch (error) {

    toast(
      error.message ||
      "Impossible de valider le dépôt.",
      "error"
    );

  }
}


async function rejectDeposit(id) {

  if (!confirm("Refuser ce dépôt ?")) {
    return;
  }

  try {

    await api(
      `/admin/deposits/${encodeURIComponent(id)}/reject`,
      {
        method: "POST"
      }
    );

    toast(
      "Dépôt refusé.",
      "success"
    );

    await loadDeposits();

  } catch (error) {

    toast(
      error.message ||
      "Impossible de refuser le dépôt.",
      "error"
    );

  }
}


/* ==========================================================
   RETRAITS
========================================================== */

async function loadWithdrawals() {

  const table =
    $("withdrawalsTable");

  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="7" class="empty">
        Chargement...
      </td>
    </tr>
  `;

  try {

    const data =
      await api("/admin/withdrawals");

    const rows =
      data.withdrawals ||
      data ||
      [];

    if (!rows.length) {

      table.innerHTML = `
        <tr>
          <td colspan="7" class="empty">
            Aucun retrait.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML =
      rows.map(item => {

        const id =
          item.id ||
          item._id ||
          "";

        const status =
          String(
            item.status || ""
          ).toLowerCase();

        let badge =
          "badge-orange";

        if (
          status === "approved" ||
          status === "completed"
        ) {
          badge = "badge-green";
        }

        if (status === "rejected") {
          badge = "badge-red";
        }

        return `

          <tr>

            <td>
              ${formatDate(
                item.createdAt ||
                item.date
              )}
            </td>

            <td>
              ${escapeHTML(
                item.userName ||
                item.clientName ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                item.method ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                item.phone ||
                "—"
              )}
            </td>

            <td>
              ${money(item.amount)}
            </td>

            <td>
              <span class="badge ${badge}">
                ${escapeHTML(
                  item.status ||
                  "pending"
                )}
              </span>
            </td>

            <td>

              ${
                status === "pending" || !status
                  ? `
                    <button
                      class="btn btn-green"
                      onclick="approveWithdrawal('${escapeHTML(id)}')"
                    >
                      ✓
                    </button>

                    <button
                      class="btn btn-red"
                      onclick="rejectWithdrawal('${escapeHTML(id)}')"
                    >
                      ✕
                    </button>
                  `
                  : "—"
              }

            </td>

          </tr>

        `;

      }).join("");

  } catch {

    table.innerHTML = `
      <tr>
        <td colspan="7" class="empty">
          Erreur de chargement.
        </td>
      </tr>
    `;

  }
}


async function approveWithdrawal(id) {

  if (!confirm("Valider ce retrait ?")) {
    return;
  }

  try {

    await api(
      `/admin/withdrawals/${encodeURIComponent(id)}/approve`,
      {
        method: "POST"
      }
    );

    toast(
      "Retrait validé.",
      "success"
    );

    await loadWithdrawals();

  } catch (error) {

    toast(
      error.message ||
      "Impossible de valider le retrait.",
      "error"
    );

  }
}


async function rejectWithdrawal(id) {

  if (!confirm("Refuser ce retrait ?")) {
    return;
  }

  try {

    await api(
      `/admin/withdrawals/${encodeURIComponent(id)}/reject`,
      {
        method: "POST"
      }
    );

    toast(
      "Retrait refusé.",
      "success"
    );

    await loadWithdrawals();

  } catch (error) {

    toast(
      error.message ||
      "Impossible de refuser le retrait.",
      "error"
    );

  }
}


/* ==========================================================
   MOYENS DE PAIEMENT
========================================================== */

async function loadPaymentMethods() {

  const container =
    $("paymentMethodsList");

  if (!container) return;

  container.innerHTML =
    `<div class="loading">Chargement...</div>`;

  try {

    const data =
      await api("/admin/payment-methods");

    const methods =
      data.paymentMethods ||
      data.methods ||
      data ||
      [];

    if (!methods.length) {

      container.innerHTML = `
        <div class="empty">
          Aucun moyen de paiement configuré.
        </div>
      `;

      return;
    }

    container.innerHTML =
      methods.map(method => {

        const id =
          method.id ||
          method._id ||
          "";

        const active =
          method.active !== false;

        return `

          <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            padding:13px 0;
            border-bottom:1px solid var(--border);
          ">

            <div>

              <strong>
                ${escapeHTML(
                  method.name ||
                  "Paiement"
                )}
              </strong>

              <div style="
                color:var(--muted);
                font-size:11px;
                margin-top:4px;
              ">
                ${escapeHTML(
                  method.number ||
                  method.account ||
                  "—"
                )}
              </div>

            </div>

            <button
              class="btn ${
                active
                  ? "btn-green"
                  : "btn-red"
              }"
              onclick="togglePaymentMethod(
                '${escapeHTML(id)}',
                ${active}
              )"
            >
              ${active ? "Actif" : "Inactif"}
            </button>

          </div>

        `;

      }).join("");

  } catch {

    container.innerHTML = `
      <div class="empty">
        Impossible de charger les moyens de paiement.
      </div>
    `;

  }
}


async function addPaymentMethod() {

  const name =
    $("paymentName")?.value.trim();

  const number =
    $("paymentNumber")?.value.trim();

  const type =
    $("paymentType")?.value;

  if (!name) {

    toast(
      "Entrez le nom du moyen de paiement.",
      "error"
    );

    return;
  }

  try {

    await api("/admin/payment-methods", {
      method: "POST",

      body: JSON.stringify({
        name,
        number,
        type,
        active: true
      })
    });

    $("paymentName").value = "";
    $("paymentNumber").value = "";

    toast(
      "Moyen de paiement ajouté.",
      "success"
    );

    await loadPaymentMethods();

  } catch (error) {

    toast(
      error.message ||
      "Impossible d'ajouter le moyen.",
      "error"
    );

  }
}


async function togglePaymentMethod(id, active) {

  try {

    await api(
      `/admin/payment-methods/${encodeURIComponent(id)}`,
      {
        method: "PATCH",

        body: JSON.stringify({
          active: !active
        })
      }
    );

    await loadPaymentMethods();

  } catch (error) {

    toast(
      error.message ||
      "Impossible de modifier le moyen.",
      "error"
    );

  }
}


/* ==========================================================
   INVESTISSEMENTS
========================================================== */

const defaultPlans = [
  {
    name: "20 000 FC",
    amount: 20000,
    daily: 1500,
    total: 65000
  },
  {
    name: "50 000 FC",
    amount: 50000,
    daily: 4000,
    total: 170000
  },
  {
    name: "100 000 FC",
    amount: 100000,
    daily: 8000,
    total: 340000
  },
  {
    name: "300 000 FC",
    amount: 300000,
    daily: 24000,
    total: 1020000
  },
  {
    name: "500 000 FC",
    amount: 500000,
    daily: 40000,
    total: 1700000
  },
  {
    name: "1 000 000 FC",
    amount: 1000000,
    daily: 80000,
    total: 3400000
  },
  {
    name: "2 000 000 FC",
    amount: 2000000,
    daily: 160000,
    total: 6800000
  },
  {
    name: "3 000 000 FC",
    amount: 3000000,
    daily: 240000,
    total: 10200000
  },
  {
    name: "5 000 000 FC",
    amount: 5000000,
    daily: 400000,
    total: 17000000
  }
];


async function loadInvestmentPlans() {

  try {

    const data =
      await api("/admin/investments");

    state.plans =
      data.plans ||
      data.investments ||
      defaultPlans;

  } catch {

    state.plans =
      defaultPlans;

  }

  renderInvestmentPlans();
}


function renderInvestmentPlans() {

  const container =
    $("plansContainer");

  if (!container) return;

  container.innerHTML =
    state.plans.map((plan, index) => `

      <div class="plan-card">

        <h3>
          Plan ${index + 1}
        </h3>

        <div class="field">

          <label>Nom</label>

          <input
            data-plan="${index}"
            data-field="name"
            value="${escapeHTML(
              plan.name || ""
            )}"
          >

        </div>

        <div class="field">

          <label>Montant FC</label>

          <input
            type="number"
            data-plan="${index}"
            data-field="amount"
            value="${Number(
              plan.amount || 0
            )}"
          >

        </div>

        <div class="field">

          <label>Gain journalier FC</label>

          <input
            type="number"
            data-plan="${index}"
            data-field="daily"
            value="${Number(
              plan.daily || 0
            )}"
          >

        </div>

        <div class="field">

          <label>Total FC</label>

          <input
            type="number"
            data-plan="${index}"
            data-field="total"
            value="${Number(
              plan.total || 0
            )}"
          >

        </div>

      </div>

    `).join("");
}


async function saveInvestmentPlans() {

  const inputs =
    document.querySelectorAll(
      "[data-plan][data-field]"
    );

  const plans =
    state.plans.map((plan, index) => {

      const result = {
        ...plan
      };

      inputs.forEach(input => {

        if (
          Number(input.dataset.plan) !== index
        ) {
          return;
        }

        const field =
          input.dataset.field;

        result[field] =
          field === "name"
            ? input.value
            : Number(input.value || 0);

      });

      return result;

    });

  try {

    await api("/admin/investments", {
      method: "PUT",

      body: JSON.stringify({
        plans
      })
    });

    state.plans = plans;

    toast(
      "Plans enregistrés.",
      "success"
    );

  } catch (error) {

    toast(
      error.message ||
      "Impossible d'enregistrer les plans.",
      "error"
    );

  }
}


/* ==========================================================
   ACTIVITES
========================================================== */

async function loadActivities() {

  const container =
    $("activitiesList");

  if (!container) return;

  container.innerHTML =
    `<div class="loading">Chargement...</div>`;

  try {

    const data =
      await api("/admin/activities");

    const activities =
      data.activities ||
      data ||
      [];

    if (!activities.length) {

      container.innerHTML = `
        <div class="empty">
          Aucune activité publiée.
        </div>
      `;

      return;
    }

    container.innerHTML =
      activities.map(item => `

        <div style="
          padding:13px 0;
          border-bottom:1px solid var(--border);
        ">

          <strong>
            ${escapeHTML(
              item.title ||
              "Activité"
            )}
          </strong>

          <div style="
            color:var(--muted);
            font-size:11px;
            margin:5px 0;
          ">
            ${escapeHTML(
              item.category ||
              "annonce"
            )}
            ·
            ${formatDate(
              item.createdAt ||
              item.date
            )}
          </div>

          <div style="
            color:#c6d0de;
            font-size:13px;
          ">
            ${escapeHTML(
              item.description ||
              ""
            )}
          </div>

        </div>

      `).join("");

  } catch {

    container.innerHTML = `
      <div class="empty">
        Impossible de charger les activités.
      </div>
    `;

  }
}


async function publishActivity() {

  const title =
    $("activityTitle")?.value.trim();

  const category =
    $("activityCategory")?.value;

  const description =
    $("activityDescription")?.value.trim();

  if (!title || !description) {

    toast(
      "Remplissez le titre et la description.",
      "error"
    );

    return;
  }

  try {

    await api("/admin/activities", {
      method: "POST",

      body: JSON.stringify({
        title,
        category,
        description
      })
    });

    $("activityTitle").value = "";
    $("activityDescription").value = "";

    toast(
      "Activité publiée.",
      "success"
    );

    await loadActivities();

  } catch (error) {

    toast(
      error.message ||
      "Impossible de publier l'activité.",
      "error"
    );

  }
}


/* ==========================================================
   FIDELITE
========================================================== */

async function saveFidelity() {

  const data = {

    vip: {

      bronze:
        Number(
          $("vipBronze")?.value || 0
        ),

      silver:
        Number(
          $("vipSilver")?.value || 0
        ),

      gold:
        Number(
          $("vipGold")?.value || 0
        ),

      diamond:
        Number(
          $("vipDiamond")?.value || 0
        )

    },

    points: {

      per1000:
        Number(
          $("pointsPer1000")?.value || 0
        ),

      value:
        Number(
          $("pointsValue")?.value || 0
        )

    }

  };

  try {

    await api("/admin/fidelity", {
      method: "PUT",

      body: JSON.stringify(data)
    });

    toast(
      "Paramètres fidélité enregistrés.",
      "success"
    );

  } catch (error) {

    toast(
      error.message ||
      "Impossible d'enregistrer.",
      "error"
    );

  }
}


/* ==========================================================
   PARRAINAGE
========================================================== */

async function saveReferralSettings() {

  try {

    await api("/admin/referral", {
      method: "PUT",

      body: JSON.stringify({

        bonus:
          Number(
            $("referralBonus")?.value || 0
          ),

        prefix:
          $("referralPrefix")?.value.trim() ||
          "JAS-"

      })
    });

    toast(
      "Paramètres de parrainage enregistrés.",
      "success"
    );

  } catch (error) {

    toast(
      error.message ||
      "Impossible d'enregistrer.",
      "error"
    );

  }
}


/* ==========================================================
   NOTIFICATIONS
========================================================== */

async function loadNotifications() {

  const container =
    $("notificationsList");

  if (!container) return;

  container.innerHTML =
    `<div class="loading">Chargement...</div>`;

  try {

    const data =
      await api("/admin/notifications");

    const rows =
      data.notifications ||
      data ||
      [];

    if (!rows.length) {

      container.innerHTML = `
        <div class="empty">
          Aucune notification.
        </div>
      `;

      return;
    }

    container.innerHTML =
      rows.slice(0, 20).map(item => `

        <div style="
          padding:13px 0;
          border-bottom:1px solid var(--border);
        ">

          <strong>
            ${escapeHTML(
              item.title ||
              "Notification"
            )}
          </strong>

          <div style="
            color:#bdc9d8;
            font-size:13px;
            margin:5px 0;
          ">
            ${escapeHTML(
              item.message ||
              ""
            )}
          </div>

          <div style="
            color:var(--muted);
            font-size:11px;
          ">
            ${formatDate(
              item.createdAt ||
              item.date
            )}
          </div>

        </div>

      `).join("");

  } catch {

    container.innerHTML = `
      <div class="empty">
        Impossible de charger les notifications.
      </div>
    `;

  }
}


async function sendNotification() {

  const recipient =
    $("notificationRecipient")?.value;

  const type =
    $("notificationType")?.value;

  const title =
    $("notificationTitle")?.value.trim();

  const message =
    $("notificationMessage")?.value.trim();

  if (!title || !message) {

    toast(
      "Remplissez le titre et le message.",
      "error"
    );

    return;
  }

  try {

    await api("/admin/notifications", {
      method: "POST",

      body: JSON.stringify({
        recipient,
        type,
        title,
        message
      })
    });

    $("notificationTitle").value = "";
    $("notificationMessage").value = "";

    toast(
      "Notification envoyée.",
      "success"
    );

    await loadNotifications();

  } catch (error) {

    toast(
      error.message ||
      "Impossible d'envoyer la notification.",
      "error"
    );

  }
}


/* ==========================================================
   SUPPORT
========================================================== */

async function loadSupport() {

  const container =
    $("supportList");

  if (!container) return;

  container.innerHTML =
    `<div class="loading">Chargement...</div>`;

  try {

    const data =
      await api("/admin/support");

    const rows =
      data.requests ||
      data.support ||
      data ||
      [];

    if (!rows.length) {

      container.innerHTML = `
        <div class="empty">
          Aucune demande de support.
        </div>
      `;

      return;
    }

    container.innerHTML =
      rows.map(item => `

        <div style="
          padding:15px 0;
          border-bottom:1px solid var(--border);
        ">

          <strong>
            ${escapeHTML(
              item.subject ||
              item.title ||
              "Demande"
            )}
          </strong>

          <div style="
            color:var(--muted);
            font-size:11px;
            margin:5px 0;
          ">
            ${escapeHTML(
              item.userName ||
              item.clientName ||
              "Client"
            )}
            ·
            ${formatDate(
              item.createdAt ||
              item.date
            )}
          </div>

          <div style="
            color:#cbd5e2;
            font-size:13px;
          ">
            ${escapeHTML(
              item.message ||
              item.description ||
              ""
            )}
          </div>

        </div>

      `).join("");

  } catch {

    container.innerHTML = `
      <div class="empty">
        Impossible de charger le support.
      </div>
    `;

  }
}


/* ==========================================================
   PARAMETRES
========================================================== */

async function saveSettings() {

  const data = {

    name:
      $("settingName")?.value.trim(),

    currency:
      $("settingCurrency")?.value.trim(),

    whatsapp:
      $("settingWhatsapp")?.value.trim(),

    minDeposit:
      Number(
        $("settingMinDeposit")?.value || 0
      ),

    minWithdrawal:
      Number(
        $("settingMinWithdrawal")?.value || 0
      )

  };

  try {

    await api("/admin/settings", {
      method: "PUT",

      body: JSON.stringify(data)
    });

    toast(
      "Paramètres enregistrés.",
      "success"
    );

  } catch (error) {

    toast(
      error.message ||
      "Impossible d'enregistrer.",
      "error"
    );

  }
}


/* ==========================================================
   DECONNEXION
========================================================== */

async function logoutAdmin() {

  try {

    await api(
      "/auth/admin-logout",
      {
        method: "POST"
      }
    );

  } catch {}

  if ($("adminApp")) {
    $("adminApp").classList.add("hidden");
  }

  if ($("adminLogin")) {
    $("adminLogin").classList.remove("hidden");
  }

  if ($("adminIdentifier")) {
    $("adminIdentifier").value = "";
  }

  if ($("adminPassword")) {
    $("adminPassword").value = "";
  }

  toast(
    "Session administrateur fermée."
  );
}


/* ==========================================================
   EVENEMENTS
========================================================== */

function initAdmin() {

  const loginForm =
    $("loginForm");

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      loginAdmin
    );

  }


  document
    .querySelectorAll(
      ".nav-btn[data-section]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {
          openSection(
            button.dataset.section
          );
        }
      );

    });


  const mobileMenu =
    $("mobileMenu");

  if (mobileMenu) {

    mobileMenu.addEventListener(
      "click",
      () => {

        if ($("sidebar")) {
          $("sidebar").classList.toggle("open");
        }

      }
    );

  }


  const logout =
    $("logoutButton");

  if (logout) {

    logout.addEventListener(
      "click",
      logoutAdmin
    );

  }


  const search =
    $("clientSearch");

  if (search) {

    search.addEventListener(
      "input",
      function () {

        const query =
          this.value
            .toLowerCase()
            .trim();

        if (!query) {

          renderClients(
            state.clients
          );

          return;
        }

        const filtered =
          state.clients.filter(
            client => {

              const text = [

                client.name,
                client.fullName,
                client.email,
                client.phone

              ]
              .join(" ")
              .toLowerCase();

              return text.includes(query);

            }
          );

        renderClients(filtered);

      }
    );

  }


  checkAdminSession();

}


/* ==========================================================
   DEMARRAGE
========================================================== */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initAdmin
  );

} else {

  initAdmin();

}