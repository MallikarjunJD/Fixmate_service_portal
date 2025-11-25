const services = [
    { keywords: ["ac", "air", "cool", "not", "cooling"], result: "AC Services & Repair" },
    { keywords: ["paint", "painter", "color", "wall"], result: "Home Painting" },
    { keywords: ["wood", "carpent", "door", "table"], result: "Carpentry" },
    { keywords: ["clean", "deep", "dust", "wash"], result: "Cleaning & Deep Cleaning" },
    { keywords: ["pest", "insect", "bug", "rat", "termite"], result: "Pest Control" },
    { keywords: ["fridge", "oven", "washing", "machine", "appliance"], result: "Appliance Repair" }
];

const input = document.getElementById("aiSearchInput");
const box = document.getElementById("aiSuggestions");

input.addEventListener("input", () => {
    let text = input.value.toLowerCase().trim();

    if (text === "") {
        box.classList.add("hidden");
        box.innerHTML = "";
        return;
    }

    let matched = [];

    services.forEach(service => {
        // Check every keyword
        service.keywords.forEach(kw => {
            // If text contains keyword OR keyword contains text (reverse match)
            if (text.includes(kw) || kw.includes(text)) {
                matched.push(service.result);
            }
        });
    });

    matched = [...new Set(matched)];

    if (matched.length === 0) {
        matched.push("No clear match. Try describing your issue.");
    }

    box.innerHTML = matched
        .map(item => `<div class="suggestion-item">${item}</div>`)
        .join("");

    box.classList.remove("hidden");
});

// Hide dropdown when clicking outside
document.addEventListener("click", e => {
    if (!e.target.closest(".ai-search-container")) {
        box.classList.add("hidden");
    }
});



// Dark mode toggle
const root = document.documentElement;
const toggleBtn = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.theme === "dark") {
  root.classList.add("dark");
  toggleBtn.textContent = "☀️";
}

toggleBtn.addEventListener("click", () => {
  if (root.classList.contains("dark")) {
    root.classList.remove("dark");
    localStorage.theme = "light";
    toggleBtn.textContent = "🌙";
  } else {
    root.classList.add("dark");
    localStorage.theme = "dark";
    toggleBtn.textContent = "☀️";
  }
});
