import { addEntry, deleteEntry } from "../data/store.js";

export function renderLog(state) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [...state.entries].reverse().slice(0, 14);

  return `
    <section class="card">
      <h2>Daily Log</h2>

      <form id="entry-form" class="form">
        <label class="field">
          Date
          <input name="date" type="date" value="${today}" />
        </label>

        <label class="field">
          Calories
          <input name="calories" type="number" inputmode="numeric" placeholder="2500" />
        </label>

        <label class="field">
          Weight kg
          <input name="weightKg" type="number" step="0.1" inputmode="decimal" placeholder="100.2" />
        </label>

        <label class="field">
          Steps
          <input name="steps" type="number" inputmode="numeric" placeholder="12000" />
        </label>

        <label class="field">
          Adherence %
          <input name="adherence" type="number" inputmode="numeric" value="100" />
        </label>

        <button class="primary-button" type="submit">Save Entry</button>
      </form>
    </section>

    <section class="card">
      <h2>Recent Entries</h2>

      ${
        entries.length
          ? entries.map(entry => `
              <div class="entry">
                <div>
                  <strong>${entry.date}</strong><br>
                  <small>${entry.calories} kcal · ${entry.weightKg}kg · ${entry.steps} steps</small>
                </div>

                <button class="delete-btn" data-delete="${entry.id}">
                  Delete
                </button>
              </div>
            `).join("")
          : `<p class="note">No entries yet. Add today or load demo data.</p>`
      }
    </section>
  `;
}

export function bindLogEvents() {
  const form = document.querySelector("#entry-form");

  form?.addEventListener("submit", event => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    addEntry(data);
    form.reset();
  });

  document.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => {
      deleteEntry(button.dataset.delete);
    });
  });
}