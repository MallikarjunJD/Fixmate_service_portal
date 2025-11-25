const tabButtons = document.querySelectorAll(".tab-btn");
const forms = {
    admin: document.getElementById("admin-form"),
    customer: document.getElementById("customer-form"),
    worker: document.getElementById("worker-form")
};

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Remove active class
        tabButtons.forEach(b => b.classList.remove("active-tab"));

        // Set selected button as active
        btn.classList.add("active-tab");

        // Hide all forms
        Object.values(forms).forEach(f => f.classList.add("hidden"));

        // Show selected form
        forms[btn.dataset.role].classList.remove("hidden");
    });
});
