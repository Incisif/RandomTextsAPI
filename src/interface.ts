document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("login-link") as HTMLAnchorElement;
  console.log(loginLink);

  loginLink.addEventListener("click", (event: Event) => {
    event.preventDefault();
    console.log("Login link clicked");

    // Create layout to darken background
    const layout: HTMLDivElement = document.createElement("div");
    layout.className = "login-layout";

    // Create modal
    const modal: HTMLDivElement = document.createElement("div");
    modal.className = "login-modal";
    //Add Title
    const title: HTMLHeadingElement = document.createElement("h1");
    title.className = "login-modal__title";
    title.innerHTML = "Login";
    // Add close button to the modal
    const closeModalButton: HTMLSpanElement = document.createElement("div");
    closeModalButton.innerHTML = "&times;";
    closeModalButton.className = "login-modal__close-button";

    // Add input fields
    const passwordInput: HTMLInputElement = document.createElement("input");
    passwordInput.type = "text";
    passwordInput.placeholder = "Password";
    passwordInput.className = "login-modal__input";

    const emailInput: HTMLInputElement = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Email";
    emailInput.className = "login-modal__input";

    //Add submit button
    const submitButton: HTMLButtonElement = document.createElement("button");
    submitButton.type = "submit";
    submitButton.innerText = "";

    submitButton.className = "login-modal__submit-button";
    //Add submit button text
    const submitButtonText: HTMLSpanElement = document.createElement("span");
    submitButtonText.innerHTML = "Submit";
    submitButtonText.className = "login-modal__submit-button-text";
    // Append elements to modal and modal to layout
    modal.appendChild(title);
    modal.appendChild(closeModalButton);
    modal.appendChild(passwordInput);
    modal.appendChild(emailInput);
    modal.appendChild(submitButton);
    submitButton.appendChild(submitButtonText);
    layout.appendChild(modal);

    // Append layout to body
    document.body.appendChild(layout);

    // Add event listeners to close the modal
    closeModalButton.addEventListener("click", () => {
      document.body.removeChild(layout);
    });

    layout.addEventListener("click", (event: Event) => {
      if (event.target === layout) {
        document.body.removeChild(layout);
      }
    });
  });
  // Ajout d'un nouvel événement pour le lien "Register"
  const registerLink = document.getElementById(
    "register-link"
  ) as HTMLAnchorElement;

  registerLink.addEventListener("click", (event: Event) => {
    event.preventDefault();
    console.log("register link clicked");

    // Code pour créer le layout et la modale de "Register"
    // La logique est similaire à celle de la modale de login
    const layout: HTMLDivElement = document.createElement("div");
    layout.className = "login-layout";

    const modal: HTMLDivElement = document.createElement("div");
    modal.className = "login-modal";

    const title: HTMLHeadingElement = document.createElement("h1");
    title.className = "login-modal__title";
    title.innerHTML = "Register";

    const closeModalButton: HTMLSpanElement = document.createElement("div");
    closeModalButton.innerHTML = "&times;";
    closeModalButton.className = "login-modal__close-button";

    const emailInput: HTMLInputElement = createInput("email", "Email");
    const firstnameInput: HTMLInputElement = createInput("text", "First Name");
    const lastnameInput: HTMLInputElement = createInput("text", "Last Name");
    const usernameInput: HTMLInputElement = createInput("text", "Username");
    const passwordInput: HTMLInputElement = createInput("password", "Password");

    const submitButton: HTMLButtonElement = createButton("Submit");

    modal.appendChild(title);
    modal.appendChild(closeModalButton);
    modal.appendChild(emailInput);
    modal.appendChild(firstnameInput);
    modal.appendChild(lastnameInput);
    modal.appendChild(usernameInput);
    modal.appendChild(passwordInput);
    modal.appendChild(submitButton);
    layout.appendChild(modal);

    document.body.appendChild(layout);

    closeModalButton.addEventListener("click", () => {
      document.body.removeChild(layout);
    });
    submitButton.addEventListener("click", async (e) => {
      e.preventDefault();

      const userData = {
        email: emailInput.value,
        firstName: firstnameInput.value,
        lastName: lastnameInput.value,
        username: usernameInput.value,
        password: passwordInput.value,
      };

      try {
        const response = await fetch("http://localhost:3000/user/createUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
          // Console log pour afficher la réponse HTTP
    console.log(userData);
        if (response.ok) {
          const data = await response.json();
          console.log("Utilisateur créé : ", data);
          // Fermez la modale ici si nécessaire
        } else {
          const data = await response.json();
          console.log("Erreur lors de la création de l'utilisateur : ", data);
        }
      } catch (error) {
        console.log("Erreur réseau ou serveur : ", error);
      }
    });
    layout.addEventListener("click", (event: Event) => {
      if (event.target === layout) {
        document.body.removeChild(layout);
      }
    });
  });

  function createInput(type: string, placeholder: string): HTMLInputElement {
    const input: HTMLInputElement = document.createElement("input");
    input.type = type;
    input.placeholder = placeholder;
    input.className = "login-modal__input";
    return input;
  }

  function createButton(text: string): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement("button");
    button.type = "submit";
    button.innerText = text;
    button.className = "login-modal__submit-button";
    return button;
  }
});
