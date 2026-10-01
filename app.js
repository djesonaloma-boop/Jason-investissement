/* =========================================================
   JASON INVEST — APP.JS CENTRAL
   Contrôle de toutes les pages publiques
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const JASON_APP = {
    name: "JASON INVEST",

    /*
     * Lorsque ton API sera prête sur Vercel,
     * tu pourras mettre ici son URL.
     *
     * Exemple :
     * apiBase: "/api"
     */
    apiBase: "/api",

    currency: "FC",

    pages: {
        index: "index.html",
        dashboard: "dashboard.html",
        investissement: "investissement.html",
        activites: "activites.html",
        fidelite: "fidelite.html",
        parrainage: "parrainage.html",
        historique: "historique.html",
        notification: "notification.html",
        profil: "profil.html",
        support: "support.html",
        translation: "translation.html"
    }
};


/* =========================================================
   OUTILS GÉNÉRAUX
   ========================================================= */

const App = {

    get(id) {
        return document.getElementById(id);
    },

    qs(selector) {
        return document.querySelector(selector);
    },

    qsa(selector) {
        return document.querySelectorAll(selector);
    },

    formatMoney(value) {
        const number = Number(value) || 0;

        return new Intl.NumberFormat("fr-FR").format(number) +
            " " + JASON_APP.currency;
    },

    formatDate(date) {
        if (!date) return "—";

        const d = new Date(date);

        if (isNaN(d.getTime())) {
            return "—";
        }

        return d.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    },

    formatDateTime(date) {
        if (!date) return "—";

        const d = new Date(date);

        if (isNaN(d.getTime())) {
            return "—";
        }

        return d.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    },

    showMessage(message, type = "info") {

        let box = this.get("appMessage");

        if (!box) {
            box = document.createElement("div");
            box.id = "appMessage";

            box.style.position = "fixed";
            box.style.left = "20px";
            box.style.right = "20px";
            box.style.bottom = "20px";
            box.style.zIndex = "99999";
            box.style.padding = "15px 18px";
            box.style.borderRadius = "14px";
            box.style.fontWeight = "700";
            box.style.textAlign = "center";
            box.style.boxShadow = "0 15px 40px rgba(0,0,0,.35)";

            document.body.appendChild(box);
        }

        box.textContent = message;

        if (type === "success") {
            box.style.background = "#173d2c";
            box.style.color = "#9df2bd";
        }

        else if (type === "error") {
            box.style.background = "#4a1d24";
            box.style.color = "#ffb4bd";
        }

        else {
            box.style.background = "#18283d";
            box.style.color = "#ffffff";
        }

        clearTimeout(box._timer);

        box._timer = setTimeout(() => {
            box.remove();
        }, 3500);
    },

    go(page) {
        if (JASON_APP.pages[page]) {
            window.location.href = JASON_APP.pages[page];
        }
    }
};


/* =========================================================
   API CENTRAL
   ========================================================= */

const API = {

    async request(endpoint, options = {}) {

        const config = {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        };

        try {

            const response = await fetch(
                JASON_APP.apiBase + endpoint,
                config
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {

                if (response.status === 401) {
                    console.warn("Session utilisateur absente.");
                }

                throw new Error(
                    data.message ||
                    "Une erreur est survenue."
                );
            }

            return data;

        } catch (error) {

            console.error("API ERROR:", error);

            throw error;
        }
    },


    async me() {
        return this.request("/user/me");
    },


    async dashboard() {
        return this.request("/dashboard");
    },


    async investments() {
        return this.request("/investments");
    },


    async activities() {
        return this.request("/activities");
    },


    async fidelity() {
        return this.request("/fidelity");
    },


    async referral() {
        return this.request("/referral");
    },


    async history() {
        return this.request("/history");
    },


    async notifications() {
        return this.request("/notifications");
    },


    async paymentMethods() {
        return this.request("/payment-methods");
    },


    async support() {
        return this.request("/support");
    },


    async logout() {
        return this.request("/auth/logout", {
            method: "POST"
        });
    }
};


/* =========================================================
   NAVIGATION
   ========================================================= */

function initNavigation() {

    App.qsa("[data-page]").forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            if (JASON_APP.pages[page]) {
                App.go(page);
            }

        });

    });


    App.qsa("[data-action='logout']").forEach(button => {

        button.addEventListener("click", async () => {

            try {

                await API.logout();

            } catch (error) {

                console.warn(
                    "Déconnexion API indisponible."
                );

            }

            window.location.href =
                JASON_APP.pages.index;
        });

    });
}


/* =========================================================
   MENU MOBILE
   ========================================================= */

function initMobileMenu() {

    const menuButton =
        App.get("menuButton") ||
        App.qs(".menu-button") ||
        App.qs(".mobile-menu");

    const sidebar =
        App.qs(".sidebar") ||
        App.qs(".side-menu");

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });


    document.addEventListener("click", event => {

        if (
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            sidebar.classList.remove("open");
        }

    });
}


/* =========================================================
   AFFICHAGE UTILISATEUR
   ========================================================= */

function displayUser(user) {

    if (!user) return;


    const names = [
        "userName",
        "profileName",
        "dashboardName",
        "welcomeName"
    ];

    names.forEach(id => {

        const element = App.get(id);

        if (element && user.name) {
            element.textContent = user.name;
        }

    });


    const emailElements = [
        "userEmail",
        "profileEmail"
    ];

    emailElements.forEach(id => {

        const element = App.get(id);

        if (element && user.email) {
            element.textContent = user.email;
        }

    });


    const phoneElements = [
        "userPhone",
        "profilePhone"
    ];

    phoneElements.forEach(id => {

        const element = App.get(id);

        if (element && user.phone) {
            element.textContent = user.phone;
        }

    });


    const balance =
        user.balance ??
        user.solde ??
        user.availableBalance ??
        0;

    App.qsa("[data-balance]").forEach(element => {

        element.textContent =
            App.formatMoney(balance);

    });


    const points =
        user.points ??
        user.fidelityPoints ??
        0;

    App.qsa("[data-points]").forEach(element => {

        element.textContent =
            Number(points).toLocaleString("fr-FR");

    });


    const vip =
        user.vip ||
        user.vipLevel ||
        "Bronze";

    App.qsa("[data-vip]").forEach(element => {

        element.textContent = vip;

    });


    const referral =
        user.referralCode ||
        user.parrainageCode ||
        user.referral_code ||
        "";

    App.qsa("[data-referral-code]").forEach(element => {

        element.textContent =
            referral || "JAS-XXXXXX";

    });
}


/* =========================================================
   CHARGEMENT DU PROFIL
   ========================================================= */

async function loadCurrentUser() {

    try {

        const result = await API.me();

        const user =
            result.user ||
            result.data ||
            result;

        if (user) {
            displayUser(user);
        }

        window.JASON_USER = user;

        return user;

    } catch (error) {

        console.warn(
            "Impossible de charger le profil :",
            error.message
        );

        return null;
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function loadDashboard() {

    if (
        !App.get("dashboard") &&
        !App.qs("[data-dashboard]")
    ) {
        return;
    }

    try {

        const result = await API.dashboard();

        const data =
            result.data ||
            result.dashboard ||
            result;

        if (!data) return;


        const values = {

            balance:
                data.balance ??
                data.solde ??
                0,

            investment:
                data.investment ??
                data.investments ??
                0,

            points:
                data.points ??
                0,

            referrals:
                data.referrals ??
                data.parrainage ??
                0,

            vip:
                data.vip ??
                data.vipLevel ??
                "Bronze"

        };


        App.qsa("[data-dashboard-balance]")
            .forEach(el => {
                el.textContent =
                    App.formatMoney(values.balance);
            });


        App.qsa("[data-investments]")
            .forEach(el => {
                el.textContent =
                    App.formatMoney(values.investment);
            });


        App.qsa("[data-dashboard-points]")
            .forEach(el => {
                el.textContent =
                    values.points;
            });


        App.qsa("[data-referrals]")
            .forEach(el => {
                el.textContent =
                    values.referrals;
            });


        App.qsa("[data-dashboard-vip]")
            .forEach(el => {
                el.textContent =
                    values.vip;
            });

    } catch (error) {

        console.warn(
            "Dashboard non disponible :",
            error.message
        );
    }
}


/* =========================================================
   INVESTISSEMENT
   ========================================================= */

async function loadInvestments() {

    if (
        !App.qs("[data-investments-list]") &&
        !App.qs(".investment-list")
    ) {
        return;
    }

    try {

        const result =
            await API.investments();

        const investments =
            result.investments ||
            result.data ||
            [];

        window.JASON_INVESTMENTS =
            investments;

        document.dispatchEvent(
            new CustomEvent(
                "jason:investments",
                {
                    detail: investments
                }
            )
        );

    } catch (error) {

        console.warn(
            "Investissements non disponibles."
        );
    }
}


/* =========================================================
   ACTIVITÉS
   ========================================================= */

async function loadActivities() {

    if (
        !App.qs("[data-activities]") &&
        !App.qs(".activities-list")
    ) {
        return;
    }

    try {

        const result =
            await API.activities();

        const activities =
            result.activities ||
            result.data ||
            [];

        window.JASON_ACTIVITIES =
            activities;

        document.dispatchEvent(
            new CustomEvent(
                "jason:activities",
                {
                    detail: activities
                }
            )
        );

    } catch (error) {

        console.warn(
            "Activités non disponibles."
        );
    }
}


/* =========================================================
   FIDÉLITÉ
   ========================================================= */

async function loadFidelity() {

    if (
        !App.qs("[data-fidelity]") &&
        !App.qs(".vip-grid")
    ) {
        return;
    }

    try {

        const result =
            await API.fidelity();

        const data =
            result.data ||
            result;

        if (!data) return;


        const points =
            data.points ??
            data.fidelityPoints ??
            0;

        App.qsa("[data-fidelity-points]")
            .forEach(el => {
                el.textContent =
                    points;
            });


        const vip =
            data.vip ||
            data.vipLevel ||
            "Bronze";

        App.qsa("[data-fidelity-vip]")
            .forEach(el => {
                el.textContent =
                    vip;
            });

    } catch (error) {

        console.warn(
            "Fidélité non disponible."
        );
    }
}


/* =========================================================
   PARRAINAGE
   ========================================================= */

async function loadReferral() {

    if (
        !App.get("referralCode") &&
        !App.qs("[data-referral-code]")
    ) {
        return;
    }

    try {

        const result =
            await API.referral();

        const data =
            result.data ||
            result;

        if (!data) return;


        const code =
            data.referralCode ||
            data.code ||
            "JAS-XXXXXX";


        App.qsa("[data-referral-code]")
            .forEach(el => {
                el.textContent =
                    code;
            });


        const link =
            data.referralLink ||
            (
                window.location.origin +
                "/index.html?ref=" +
                encodeURIComponent(code)
            );


        App.qsa("[data-referral-link]")
            .forEach(el => {
                el.textContent =
                    link;
            });


        const count =
            data.referrals ??
            data.count ??
            0;


        App.qsa("[data-referrals-count]")
            .forEach(el => {
                el.textContent =
                    count;
            });

    } catch (error) {

        console.warn(
            "Parrainage non disponible."
        );
    }
}


/* =========================================================
   HISTORIQUE
   ========================================================= */

async function loadHistory() {

    if (
        !App.qs("[data-history]") &&
        !App.qs(".history-table")
    ) {
        return;
    }

    try {

        const result =
            await API.history();

        const history =
            result.transactions ||
            result.history ||
            result.data ||
            [];

        window.JASON_HISTORY =
            history;

        document.dispatchEvent(
            new CustomEvent(
                "jason:history",
                {
                    detail: history
                }
            )
        );

    } catch (error) {

        console.warn(
            "Historique non disponible."
        );
    }
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

async function loadNotifications() {

    if (
        !App.qs("[data-notifications]") &&
        !App.qs(".notification-list")
    ) {
        return;
    }

    try {

        const result =
            await API.notifications();

        const notifications =
            result.notifications ||
            result.data ||
            [];

        window.JASON_NOTIFICATIONS =
            notifications;


        const unread =
            notifications.filter(
                item =>
                    item.read === false ||
                    item.read === 0
            ).length;


        App.qsa("[data-unread-count]")
            .forEach(el => {
                el.textContent =
                    unread;
            });


        document.dispatchEvent(
            new CustomEvent(
                "jason:notifications",
                {
                    detail: notifications
                }
            )
        );

    } catch (error) {

        console.warn(
            "Notifications non disponibles."
        );
    }
}


/* =========================================================
   MOYENS DE PAIEMENT
   ========================================================= */

async function loadPaymentMethods() {

    if (
        !App.qs("[data-payment-methods]") &&
        !App.qs("#paymentMethods")
    ) {
        return;
    }

    try {

        const result =
            await API.paymentMethods();

        const methods =
            result.methods ||
            result.paymentMethods ||
            result.data ||
            [];

        window.JASON_PAYMENT_METHODS =
            methods;

        document.dispatchEvent(
            new CustomEvent(
                "jason:payment-methods",
                {
                    detail: methods
                }
            )
        );

    } catch (error) {

        console.warn(
            "Moyens de paiement non disponibles."
        );
    }
}


/* =========================================================
   COPIER DANS LE PRESSE-PAPIER
   ========================================================= */

async function copyText(text) {

    if (!text) return false;

    try {

        await navigator.clipboard.writeText(text);

        App.showMessage(
            "Copié avec succès.",
            "success"
        );

        return true;

    } catch (error) {

        const input =
            document.createElement("textarea");

        input.value = text;

        document.body.appendChild(input);

        input.select();

        try {
            document.execCommand("copy");

            App.showMessage(
                "Copié avec succès.",
                "success"
            );

            input.remove();

            return true;

        } catch {

            input.remove();

            App.showMessage(
                "Impossible de copier.",
                "error"
            );

            return false;
        }
    }
}


/* =========================================================
   BOUTONS COPIER
   ========================================================= */

function initCopyButtons() {

    App.qsa("[data-copy]").forEach(button => {

        button.addEventListener("click", () => {

            const selector =
                button.dataset.copy;

            const target =
                App.qs(selector);

            if (!target) return;

            copyText(
                target.value ||
                target.textContent
            );

        });

    });


    const copyReferral =
        App.get("copyReferral");

    if (copyReferral) {

        copyReferral.addEventListener(
            "click",
            () => {

                const element =
                    App.get("referralCode");

                if (element) {
                    copyText(
                        element.textContent
                    );
                }

            }
        );
    }


    const copyLink =
        App.get("copyLink");

    if (copyLink) {

        copyLink.addEventListener(
            "click",
            () => {

                const element =
                    App.get("referralLink");

                if (element) {
                    copyText(
                        element.textContent
                    );
                }

            }
        );
    }
}


/* =========================================================
   FORMULAIRE DE DÉPÔT / RETRAIT
   ========================================================= */

function initPaymentForms() {

    const depositForm =
        App.get("depositForm");

    if (depositForm) {

        depositForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                App.showMessage(
                    "La demande de dépôt sera connectée à l'API.",
                    "info"
                );

                /*
                 * Plus tard :
                 *
                 * await API.request("/deposits", {
                 *     method: "POST",
                 *     body: JSON.stringify(...)
                 * });
                 */
            }
        );
    }


    const withdrawForm =
        App.get("withdrawForm");

    if (withdrawForm) {

        withdrawForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                App.showMessage(
                    "La demande de retrait sera connectée à l'API.",
                    "info"
                );

                /*
                 * Plus tard :
                 *
                 * await API.request("/withdrawals", {
                 *     method: "POST",
                 *     body: JSON.stringify(...)
                 * });
                 */
            }
        );
    }
}


/* =========================================================
   DÉMARRAGE AUTOMATIQUE
   ========================================================= */

async function initJasonInvest() {

    console.log(
        "JASON INVEST — app.js chargé."
    );


    initNavigation();

    initMobileMenu();

    initCopyButtons();

    initPaymentForms();


    /*
     * Chargement du profil.
     */
    await loadCurrentUser();


    /*
     * Chargements selon la page.
     * Une page qui n'a pas les éléments
     * correspondants est simplement ignorée.
     */

    await loadDashboard();

    await loadInvestments();

    await loadActivities();

    await loadFidelity();

    await loadReferral();

    await loadHistory();

    await loadNotifications();

    await loadPaymentMethods();


    document.dispatchEvent(
        new CustomEvent(
            "jason:ready"
        )
    );
}


/* =========================================================
   LANCEMENT
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initJasonInvest
    );

} else {

    initJasonInvest();

}