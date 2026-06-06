import { addEntry, deleteEntry } from "../data/store.js";
import { calculateDataQuality } from "../quality/dataQualityEngine.js";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function valueOrBlank(entry, key) {
  return entry && entry[key] ? entry[key] : "";
}

export function renderLog(state) {
  const today = todayString();
  const entries = [...state.entries].reverse().slice(0, 14);
  const quality = calculateDataQuality(state);
  const todayEntry = quality.today;

  return `
    <section class="card">
      <p class="eyebrow">Today</p>
      <h2>Fast Check-in</h2>

      <p class="note">
        Complete the core signals first. Advanced signals improve diagnosis quality.
      </p>

      <div class="quick-row">
        <button class="quick-chip" data-fill-adherence="100">Perfect day</button>
        <button class="quick-chip" data-fill-stress="7">High stress</button>
        <button class="quick-chip" data-fill-soreness="8">Sore</button>
      </div>
    </section>

    <section class="card">
      <h2>Daily Log</h2>

      <form id="entry-form" class="form">
        <label class="field">
          Date
          <input name="date" type="date" value="${today}" />
        </label>

        <label class="field">
          Calories
          <input name="calories" type="number" inputmode="numeric" placeholder="2500" value="${valueOrBlank(todayEntry, "calories")}" />
        </label>

        <div class="grid">
          <label class="field">
            Protein g
            <input name="protein" type="number" inputmode="numeric" placeholder="190" value="${valueOrBlank(todayEntry, "protein")}" />
          </label>

          <label class="field">
            Carbs g
            <input name="carbs" type="number" inputmode="numeric" placeholder="250" value="${valueOrBlank(todayEntry, "carbs")}" />
          </label>

          <label class="field">
            Fat g
            <input name="fat" type="number" inputmode="numeric" placeholder="70" value="${valueOrBlank(todayEntry, "fat")}" />
          </label>

          <label class="field">
            Fibre g
            <input name="fibre" type="number" inputmode="numeric" placeholder="30" value="${valueOrBlank(todayEntry, "fibre")}" />
          </label>
        </div>

        <label class="field">
          Sodium mg
          <input name="sodium" type="number" inputmode="numeric" placeholder="2500" value="${valueOrBlank(todayEntry, "sodium")}" />
        </label>

        <label class="field">
          Weight kg
          <input name="weightKg" type="number" step="0.1" inputmode="decimal" placeholder="100.2" value="${valueOrBlank(todayEntry, "weightKg")}" />
        </label>

        <label class="field">
          Steps
          <input name="steps" type="number" inputmode="numeric" placeholder="12000" value="${valueOrBlank(todayEntry, "steps")}" />
        </label>

        <div class="grid">
          <label class="field">
            Sleep hours
            <input name="sleepHours" type="number" step="0.1" inputmode="decimal" placeholder="7.5" value="${valueOrBlank(todayEntry, "sleepHours")}" />
          </label>

          <label class="field">
            Stress 1-10
            <input name="stress" type="number" inputmode="numeric" placeholder="5" value="${valueOrBlank(todayEntry, "stress")}" />
          </label>

          <label class="field">
            Soreness 1-10
            <input name="soreness" type="number" inputmode="numeric" placeholder="4" value="${valueOrBlank(todayEntry, "soreness")}" />
          </label>

          <label class="field">
            Adherence %
            <input name="adherence" type="number" inputmode="numeric" value="${valueOrBlank(todayEntry, "adherence") || 100}" />
          </label>
        </div>

        <label class="field">
          Notes
          <input name="notes" type="text" placeholder="Sleep poor, high stress, heavy legs..." value="${todayEntry?.notes || ""}" />
        </label>

        <button class="primary-button" type="submit">Save Entry</button>
      </form>
    </section>

    <section class="card">
      <h2>Today’s Completeness</h2>

      <div class="quality-ring" style="--value:${quality.score}%">
        <div class="quality-ring-inner">${quality.score}%</div>
      </div>

      <p class="note">${quality.label}</p>

      <div class="checklist">
        ${quality.todayChecks.map(item => `
          <div class="check-item">
            <span>${item.label}</span>
            <span>${item.complete ? "Done" : "Missing"}</span>
          </div>
        `).join("")}
      </div>
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

  document.querySelector("[data-fill-adherence]")?.addEventListener("click", () => {
    form.elements.adherence.value = "100";
    form.elements.stress.value = form.elements.stress.value || "3";
    form.elements.soreness.value = form.elements.soreness.value || "3";
  });

  document.querySelector("[data-fill-stress]")?.addEventListener("click", () => {
    form.elements.stress.value = "7";
  });

  document.querySelector("[data-fill-soreness]")?.addEventListener("click", () => {
    form.elements.soreness.value = "8";
  });

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