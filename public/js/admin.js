 function showSection(sectionId) {
      document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
      document.getElementById(sectionId).classList.remove("hidden");

      document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active-nav"));

      const targetBtn = Array.from(document.querySelectorAll(".nav-btn"))
            .find(btn => btn.textContent.trim().toLowerCase() === sectionId.toLowerCase());
      if (targetBtn) targetBtn.classList.add("active-nav");
    }

    showSection("dashboard");