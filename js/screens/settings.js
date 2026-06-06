import { updateUserSettings } from "../data/store.js";

export function renderSettings(state) {
  const user = state.user;

  return `
    <section class="card">
      <h2>Engine Settings</h2>

      <p class="note">
        These values control the diagnostic model. V1 uses them to compare expected fat loss
        against actual trend movement.
      </p>

      <form id="settings-form" class="form">
        <label class="field">
          Name
          <input name="name" type="text" value="${user.name || ""}" />
        </label>

        <label class="field">
          Start Weight kg
          <input name="startWeightKg" type="number" step="0.1" value="${user.startWeightKg}" />
        </label>

        <label class="field">
          Goal Weight kg
          <input name="goalWeightKg" type="number" step="0.1" value="${user.goalWeightKg}" />
        </label>

        <label class="field">
          Target Loss kg / week
          <input name="targetRateKgPerWeek" type="number" step="0.1" value="${user.targetRateKgPerWeek}" />
        </label>

        <label class="field">
          Estimated TDEE
          <input name="estimatedTdee" type="number" value="${user.estimatedTdee}" />
        </label>

        <label class="field">
          Minimum Calories Warning
          <input name="minimumCalories" type="number" value="${user.minimumCalories}" />
        </label>

        <label class="field">
          High Step Threshold
          <input name="highStepThreshold" type="number" value="${user.highStepThreshold}" />
        </label>

        <button class="primary-button" type="submit">
          Save Engine Settings
        </button>
      </form>
    </section>
  `;
}

export function bindSettingsEvents() {
  const form = document.querySelector("#settings-form");

  form?.addEventListener("submit", event => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    updateUserSettings(data);
  });
}