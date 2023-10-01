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
});
