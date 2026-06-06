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

        <div class="grid">
          <label class="field">
            Protein g
            <input name="protein" type="number" inputmode="numeric" placeholder="190" />
          </label>

          <label class="field">
            Carbs g
            <input name="carbs" type="number" inputmode="numeric" placeholder="250" />
          </label>

          <label class="field">
            Fat g
            <input name="fat" type="number" inputmode="numeric" placeholder="70" />
          </label>

          <label class="field">
            Fibre g
            <input name="fibre" type="number" inputmode="numeric" placeholder="30" />
          </label>
        </div>

        <label class="field">
          Sodium mg
          <input name="sodium" type="number" inputmode="numeric" placeholder="2500" />
        </label>

        <label class="field">
          Weight kg
          <input name="weightKg" type="number" step="0.1" inputmode="decimal" placeholder="100.2" />
        </label>

        <label class="field">
          Steps
          <input name="steps" type="number" inputmode="numeric" placeholder="12000" />
        </label>

        <div class="grid">
          <label class="field">
            Sleep hours
            <input name="sleepHours" type="number" step="0.1" inputmode="decimal" placeholder="7.5" />
          </label>

          <label class="field">
            Stress 1-10
            <input name="stress" type="number" inputmode="numeric" placeholder="5" />
          </label>

          <label class="field">
            Soreness 1-10
            <input name="soreness" type="number" inputmode="numeric" placeholder="4" />
          </label>

          <label class="field">
            Adherence %
            <input name="adherence" type="number" inputmode="numeric" value="100" />
          </label>
        </div>

        <label class="field">
          Notes
          <input name="notes" type="text" placeholder="Sleep poor, high stress, heavy legs..." />
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
                  <small>
                    ${entry.calories} kcal · P${entry.protein || 0} C${entry.carbs || 0} F${entry.fat || 0}
                    <br>
                    ${entry.weightKg}kg · ${entry.steps} steps · ${entry.sleepHours || 0}h sleep
                    ${entry.notes ? `<br>${entry.notes}` : ""}
                  </small>
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