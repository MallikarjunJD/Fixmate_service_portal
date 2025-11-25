// public/js/worker.js
// Worker dashboard client logic:
// - loads requests and active request
// - accept request
// - complete request
// - countdown timer for active request (SLA)
// - polling to refresh every 10s

// ----- CONFIG -----
// API endpoints used by this script.
// If your server uses different endpoints, update these strings.
const API = {
  getRequests: "/worker/api/requests",    // GET -> returns list of pending requests
  getActive: "/worker/api/active",        // GET -> returns worker's active request or null
  acceptRequest: (id) => `/worker/api/accept/${id}`,   // POST
  completeRequest: (id) => `/worker/api/complete/${id}`, // POST
  toggleAvailability: "/worker/api/availability" // POST { available: true/false } (optional)
};

// Priority to seconds mapping (your dev review: 2m, 5m, 10m, 15m)
const PRIORITY_SECONDS = {
  "Most Urgent": 2 * 60,
  "Urgent": 5 * 60,
  "Less Urgent": 10 * 60,
  "Not Urgent": 15 * 60
};

// Poll interval (ms)
const POLL_INTERVAL = 10_000;

let pollTimer = null;
let countdownTimer = null;
let countdownRemaining = 0; // seconds

// DOM elements (assumes worker.ejs contains these IDs)
const requestsListEl = document.getElementById("requests-list");
const activeContainerEl = document.getElementById("active-container");
const availabilityToggle = document.getElementById("availabilityToggle");
const statusLabel = document.getElementById("status-label");

// Section switching helper (if not present in your page)
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

// Utility: safe fetch with JSON
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error(`Request failed ${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json().catch(()=>null);
}

// Render available requests
function renderRequests(requests) {
  if (!requestsListEl) return;
  requestsListEl.innerHTML = "";

  if (!requests || requests.length === 0) {
    requestsListEl.innerHTML = `<p class="text-gray-500">No available requests.</p>`;
    return;
  }

  requests.forEach(r => {
    const wrapper = document.createElement("div");
    wrapper.className = "bg-white p-5 rounded-xl shadow";

    wrapper.innerHTML = `
      <h3 class="text-lg font-bold">${escapeHtml(r.serviceName)}</h3>
      <p><strong>Customer:</strong> ${escapeHtml(r.customerName || r.customer)}</p>
      <p><strong>Location:</strong> ${escapeHtml(r.location || r.address || '')}</p>
      <p><strong>Priority:</strong> ${escapeHtml(r.priority)}</p>
      <div class="mt-3">
        <button data-id="${r._id}" class="accept-btn bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700 w-full">
          Accept Request
        </button>
      </div>
    `;

    requestsListEl.appendChild(wrapper);
  });

  // attach accept handlers
  Array.from(document.querySelectorAll(".accept-btn")).forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = btn.dataset.id;
      btn.disabled = true;
      btn.textContent = "Accepting...";
      try {
        await acceptRequest(id);
        // refresh UI after accept
        await refreshAll();
        showSection("active-request");
      } catch (err) {
        console.error(err);
        alert("Failed to accept request: " + (err.message || err));
      } finally {
        btn.disabled = false;
        btn.textContent = "Accept Request";
      }
    });
  });
}

// Render active request
function renderActive(active) {
  if (!activeContainerEl) return;
  activeContainerEl.innerHTML = "";

  if (!active) {
    activeContainerEl.innerHTML = `<p class="text-gray-500">No active request.</p>`;
    stopCountdown();
    return;
  }

  // compute timer initial seconds
  let durationSeconds = PRIORITY_SECONDS[active.priority] ?? PRIORITY_SECONDS["Not Urgent"];
  // determine accepted timestamp (backend should set acceptedAt)
  const acceptedAtIso = active.acceptedAt || active.updatedAt || active.createdAt;
  const acceptedAt = acceptedAtIso ? new Date(acceptedAtIso) : new Date();
  // calculate elapsed
  const elapsedSec = Math.floor((Date.now() - acceptedAt.getTime()) / 1000);
  countdownRemaining = Math.max(0, durationSeconds - elapsedSec);

  // build markup
  const markup = document.createElement("div");
  markup.className = "bg-white p-6 rounded-xl shadow space-y-3";
  markup.innerHTML = `
    <h3 class="text-xl font-bold">${escapeHtml(active.serviceName)}</h3>
    <p><strong>Customer:</strong> ${escapeHtml(active.customerName)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(active.customerPhone || active.customerPhone)}</p>
    <p><strong>Location:</strong> ${escapeHtml(active.location)}</p>
    <p><strong>Priority:</strong> ${escapeHtml(active.priority)}</p>
    <p><strong>Time Left:</strong> <span id="countdown-timer">--:--</span></p>
    <div class="mt-3">
      <button id="complete-btn" class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 w-full">
        Mark Completed
      </button>
    </div>
  `;

  activeContainerEl.appendChild(markup);

  // attach complete handler
  const completeBtn = document.getElementById("complete-btn");
  if (completeBtn) {
    completeBtn.addEventListener("click", async () => {
      completeBtn.disabled = true;
      completeBtn.textContent = "Completing...";
      try {
        await completeRequest(active._id);
        await refreshAll();
      } catch (err) {
        console.error(err);
        alert("Failed to complete request: " + (err.message || err));
      } finally {
        completeBtn.disabled = false;
        completeBtn.textContent = "Mark Completed";
      }
    });
  }

  // start countdown
  startCountdown(countdownRemaining, async () => {
    // callback when time runs out -> SLA breach
    console.warn("SLA timer reached 0 for request", active._id);
    // Optionally notify server or change UI. We'll call an SLA endpoint if you have one:
    // await fetch(`/worker/api/sla/${active._id}`, { method: 'POST' });
    // For now just refresh to pick up new status.
    await refreshAll();
  });
}

// Accept request via API
async function acceptRequest(id) {
  // POST to accept endpoint
  const url = API.acceptRequest(id);
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error(`Accept failed: ${res.status} ${txt}`);
  }
  return res.json();
}

// Complete request via API
async function completeRequest(id) {
  const url = API.completeRequest(id);
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error(`Complete failed: ${res.status} ${txt}`);
  }
  return res.json();
}

// Fetch and update both lists
async function refreshAll() {
  try {
    const [requests, active] = await Promise.allSettled([
      fetchJson(API.getRequests),
      fetchJson(API.getActive)
    ]);

    // handle results (either fulfilled or rejected)
    if (requests.status === "fulfilled") {
      renderRequests(requests.value || []);
    } else {
      console.error("Failed to load requests:", requests.reason);
    }

    if (active.status === "fulfilled") {
      renderActive(active.value);
    } else {
      console.error("Failed to load active request:", active.reason);
    }
  } catch (err) {
    console.error("refreshAll error:", err);
  }
}

// ----- COUNTDOWN logic -----
function startCountdown(seconds, onZero) {
  stopCountdown();
  const displayEl = document.getElementById("countdown-timer");
  if (!displayEl) return;

  let remaining = seconds;
  function tick() {
    displayEl.textContent = formatSeconds(remaining);
    if (remaining <= 0) {
      stopCountdown();
      if (typeof onZero === "function") onZero();
      return;
    }
    remaining--;
  }
  // initial
  tick();
  countdownTimer = setInterval(tick, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function formatSeconds(s) {
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// small html escape for injected content
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ----- AVAILABILITY TOGGLE (optional) -----
if (availabilityToggle) {
  availabilityToggle.addEventListener("change", async () => {
    const available = availabilityToggle.checked;
    if (statusLabel) statusLabel.textContent = available ? "Available" : "Busy";
    // try to push to server if endpoint present
    try {
      await fetch(API.toggleAvailability, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available })
      });
    } catch (err) {
      console.warn("Availability toggle failed (server may not implement endpoint):", err);
    }
  });
}

// polling
function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(refreshAll, POLL_INTERVAL);
  refreshAll();
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  startPolling();
});
