// Frontend logic for the Movie Review App

const reviewForm = document.getElementById("reviewForm");
const reviewsDiv = document.getElementById("reviews");
const formError = document.getElementById("formError");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatLog = document.getElementById("chatLog");

/** Escape text before inserting it into HTML (prevents XSS). */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function stars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

/** Small helper around fetch that throws a readable error on failure. */
async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

// ---------- Reviews ----------

async function loadReviews() {
  try {
    const reviews = await api("/api/reviews");
    if (reviews.length === 0) {
      reviewsDiv.innerHTML = '<p class="muted">No reviews yet. Be the first!</p>';
      return;
    }
    reviewsDiv.innerHTML = reviews.map((r) => `
      <article class="review">
        <div class="review-head">
          <span><strong>${escapeHtml(r.title)}</strong>
            <span class="stars" title="${r.rating}/5">${stars(r.rating)}</span></span>
          <button class="btn-delete" data-id="${escapeHtml(r._id)}">Delete</button>
        </div>
        ${r.text ? `<p>${escapeHtml(r.text)}</p>` : ""}
      </article>`).join("");
  } catch (err) {
    reviewsDiv.innerHTML = `<p class="error">Could not load reviews: ${escapeHtml(err.message)}</p>`;
  }
}

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";

  const title = document.getElementById("title").value.trim();
  const rating = Number(document.getElementById("rating").value);
  const text = document.getElementById("text").value.trim();

  if (!title) {
    formError.textContent = "Please enter a movie title.";
    return;
  }

  try {
    await api("/api/reviews", { method: "POST", body: JSON.stringify({ title, rating, text }) });
    reviewForm.reset();
    loadReviews();
  } catch (err) {
    formError.textContent = err.message;
  }
});

// Event delegation: one listener handles every delete button
reviewsDiv.addEventListener("click", async (event) => {
  const button = event.target.closest(".btn-delete");
  if (!button || !confirm("Delete this review?")) return;
  try {
    await api(`/api/reviews/${button.dataset.id}`, { method: "DELETE" });
    loadReviews();
  } catch (err) {
    alert(err.message);
  }
});

// ---------- Chat ----------

function addChatMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text; // textContent is safe from XSS
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  chatInput.value = "";
  addChatMessage(message, "user");
  const pending = addChatMessage("Thinking...", "bot");
  const sendButton = chatForm.querySelector("button");
  sendButton.disabled = true;

  try {
    const data = await api("/api/chat", { method: "POST", body: JSON.stringify({ message }) });
    pending.textContent = data.reply;
  } catch (err) {
    pending.textContent = err.message;
    pending.classList.add("error");
  } finally {
    sendButton.disabled = false;
    chatLog.scrollTop = chatLog.scrollHeight;
  }
});

addChatMessage("Hi! Ask me for a movie recommendation based on the reviews here.", "bot");
loadReviews();
