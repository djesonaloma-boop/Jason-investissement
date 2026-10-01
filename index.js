"use strict";

/* =========================================================
   JASON INVEST
   INDEX.JS
========================================================= */


/* =========================================================
   API
========================================================= */

const API = {

  register: "/api/auth/register",

  login: "/api/auth/login",

  forgot:
    "/api/auth/forgot-password"

};


/* =========================================================
   ELEMENTS
========================================================= */

const loginTab =
  document.getElementById("loginTab");

const registerTab =
  document.getElementById("registerTab");

const loginForm =
  document.getElementById("loginForm");

const registerForm =
  document.getElementById("registerForm");

const forgotForm =
  document.getElementById(
    "forgotPasswordForm"
  );

const message =
  document.getElementById(
    "authMessage"
  );


/* =========================================================
   BOUTONS
========================================================= */

const loginButton =
  document.getElementById(
    "loginButton"
  );

const registerButton =
  document.getElementById(
    "registerButton"
  );

const forgotButton =
  document.getElementById(
    "forgotPasswordButton"
  );


/* =========================================================
   CHAMPS
========================================================= */

const loginEmail =
  document.getElementById(
    "loginEmail"
  );

const loginPassword =
  document.getElementById(
    "loginPassword"
  );


const registerName =
  document.getElementById(
    "registerName"
  );

const registerPhone =
  document.getElementById(
    "registerPhone"
  );

const registerEmail =
  document.getElementById(
    "registerEmail"
  );

const registerPassword =
  document.getElementById(
    "registerPassword"
  );

const registerPasswordConfirm =
  document.getElementById(
    "registerPasswordConfirm"
  );

const registerReferral =
  document.getElementById(
    "registerReferral"
  );


const forgotEmail =
  document.getElementById(
    "forgotEmail"
  );


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
  text,
  type = "error"
) {

  message.textContent = text;

  message.className =
    "message show " + type;

}


function clearMessage() {

  message.textContent = "";

  message.className =
    "message";

}


/* =========================================================
   AFFICHAGE CONNEXION
========================================================= */

function showLogin() {

  loginTab.classList.add("active");

  registerTab.classList.remove("active");

  loginForm.classList.add("active");

  registerForm.classList.remove("active");

  forgotForm.classList.remove("active");

  clearMessage();

}


/* =========================================================
   AFFICHAGE INSCRIPTION
========================================================= */

function showRegister() {

  registerTab.classList.add("active");

  loginTab.classList.remove("active");

  registerForm.classList.add("active");

  loginForm.classList.remove("active");

  forgotForm.classList.remove("active");

  clearMessage();

}


/* =========================================================
   AFFICHAGE MOT DE PASSE OUBLIÉ
========================================================= */

function showForgot() {

  loginForm.classList.remove("active");

  registerForm.classList.remove("active");

  forgotForm.classList.add("active");

  loginTab.classList.remove("active");

  registerTab.classList.remove("active");

  clearMessage();

}


/* =========================================================
   SCROLL
========================================================= */

function scrollAuth() {

  document
    .getElementById("auth")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* =========================================================
   BOUTON LOADING
========================================================= */

function loading(
  button,
  state,
  normalText
) {

  button.disabled = state;

  button.textContent =
    state
      ? "Veuillez patienter..."
      : normalText;

}


/* =========================================================
   EMAIL
========================================================= */

function emailValide(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

}


/* =========================================================
   TABS
========================================================= */

loginTab.addEventListener(
  "click",
  showLogin
);


registerTab.addEventListener(
  "click",
  showRegister
);


/* =========================================================
   HEADER
========================================================= */

document
  .getElementById("headerLoginBtn")
  .addEventListener(
    "click",
    function() {

      showLogin();

      scrollAuth();

    }
  );


document
  .getElementById("headerRegisterBtn")
  .addEventListener(
    "click",
    function() {

      showRegister();

      scrollAuth();

    }
  );


/* =========================================================
   OEIL MOT DE PASSE
========================================================= */

document
  .querySelectorAll("[data-eye]")
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        const id =
          this.dataset.eye;

        const input =
          document.getElementById(id);

        if (
          input.type === "password"
        ) {

          input.type = "text";

          this.textContent = "🙈";

        } else {

          input.type = "password";

          this.textContent = "👁";

        }

      }
    );

  });


/* =========================================================
   MOT DE PASSE OUBLIÉ
========================================================= */

document
  .getElementById(
    "forgotPasswordLink"
  )
  .addEventListener(
    "click",
    function() {

      showForgot();

      scrollAuth();

    }
  );


document
  .getElementById(
    "backToLogin"
  )
  .addEventListener(
    "click",
    function() {

      showLogin();

    }
  );


/* =========================================================
   INSCRIPTION
========================================================= */

registerForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    clearMessage();


    const name =
      registerName.value.trim();

    const phone =
      registerPhone.value.trim();

    const email =
      registerEmail.value
        .trim()
        .toLowerCase();

    const password =
      registerPassword.value;

    const confirmation =
      registerPasswordConfirm.value;

    const referral =
      registerReferral.value.trim();


    /* =========================
       NOM
    ========================== */

    if (name.length < 2) {

      showMessage(
        "Veuillez entrer votre nom complet."
      );

      return;

    }


    /* =========================
       TÉLÉPHONE
    ========================== */

    if (phone.length < 6) {

      showMessage(
        "Veuillez entrer un numéro de téléphone valide."
      );

      return;

    }


    /* =========================
       EMAIL
    ========================== */

    if (!emailValide(email)) {

      showMessage(
        "Veuillez entrer une adresse Gmail/e-mail valide."
      );

      return;

    }


    /* =========================
       PASSWORD
    ========================== */

    if (password.length < 8) {

      showMessage(
        "Le mot de passe doit contenir au moins 8 caractères."
      );

      return;

    }


    /* =========================
       CONFIRMATION
    ========================== */

    if (password !== confirmation) {

      showMessage(
        "Les deux mots de passe ne correspondent pas."
      );

      return;

    }


    loading(
      registerButton,
      true,
      "Créer mon compte"
    );


    try {

      const response =
        await fetch(
          API.register,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            credentials: "include",

            body: JSON.stringify({

              name,

              phone,

              email,

              password,

              referral:
                referral || null

            })

          }
        );


      const data =
        await response
          .json()
          .catch(() => ({}));


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Impossible de créer le compte."
        );

      }


      showMessage(
        "Compte créé avec succès. Redirection...",
        "success"
      );


      /*
        IMPORTANT :
        après inscription réussie,
        on va directement dans dash.html.
      */

      setTimeout(
        function() {

          window.location.href =
            "dash.html";

        },
        500
      );


    } catch (error) {

      console.error(
        error
      );

      showMessage(
        error.message ||
        "Une erreur est survenue."
      );

    } finally {

      loading(
        registerButton,
        false,
        "Créer mon compte"
      );

    }

  }
);


/* =========================================================
   CONNEXION
========================================================= */

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    clearMessage();


    const email =
      loginEmail.value
        .trim()
        .toLowerCase();

    const password =
      loginPassword.value;


    if (!emailValide(email)) {

      showMessage(
        "Veuillez entrer une adresse Gmail/e-mail valide."
      );

      return;

    }


    if (!password) {

      showMessage(
        "Veuillez entrer votre mot de passe."
      );

      return;

    }


    loading(
      loginButton,
      true,
      "Se connecter"
    );


    try {

      const response =
        await fetch(
          API.login,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            credentials: "include",

            body: JSON.stringify({

              email,

              password

            })

          }
        );


      const data =
        await response
          .json()
          .catch(() => ({}));


      if (!response.ok) {

        throw new Error(
          data.message ||
          "E-mail ou mot de passe incorrect."
        );

      }


      showMessage(
        "Connexion réussie. Redirection...",
        "success"
      );


      /*
        Connexion réussie :
        direction dash.html
      */

      setTimeout(
        function() {

          window.location.href =
            "dash.html";

        },
        500
      );


    } catch (error) {

      console.error(
        error
      );

      showMessage(
        error.message ||
        "Impossible de se connecter."
      );

    } finally {

      loading(
        loginButton,
        false,
        "Se connecter"
      );

    }

  }
);


/* =========================================================
   MOT DE PASSE OUBLIÉ
========================================================= */

forgotForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    clearMessage();


    const email =
      forgotEmail.value
        .trim()
        .toLowerCase();


    if (!emailValide(email)) {

      showMessage(
        "Veuillez entrer une adresse Gmail/e-mail valide."
      );

      return;

    }


    loading(
      forgotButton,
      true,
      "Réinitialiser le mot de passe"
    );


    try {

      const response =
        await fetch(
          API.forgot,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            credentials: "include",

            body: JSON.stringify({

              email

            })

          }
        );


      const data =
        await response
          .json()
          .catch(() => ({}));


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Impossible de traiter la demande."
        );

      }


      showMessage(
        data.message ||
        "La demande de récupération a été envoyée.",
        "success"
      );


      forgotForm.reset();


    } catch (error) {

      console.error(
        error
      );

      showMessage(
        error.message ||
        "Impossible de traiter la demande."
      );

    } finally {

      loading(
        forgotButton,
        false,
        "Réinitialiser le mot de passe"
      );

    }

  }
);


/* =========================================================
   DÉMARRAGE
========================================================= */

showLogin();