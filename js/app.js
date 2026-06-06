import { getState, subscribe, seedDemoData } from "./data/store.js";
import { renderDashboard } from "./screens/dashboard.js";
import { renderLog, bindLogEvents } from "./screens/log.js";
import { renderDiagnostics } from "./screens/diagnostics.js";
import { renderReview } from "./screens/review.js";

const app = document.querySelector("#app");
const title = document.querySelector("#screen-title");

let route = "dashboard";

const screens = {
  dashboard: {
    title: "Dashboard",
    render: renderDashboard,
    bind: null
  },
  log: {
    title: "Log",
    render: renderLog,
    bind: bindLogEvents
  },
  diagnostics: {
    title: "Diagnostics",
    render: renderDiagnostics,
    bind: null
  },
  review: {
    title: "Review",
    render: renderReview,
    bind: null
  }
};

function setRoute(nextRoute) {
  route = nextRoute;
  render();
}

function render() {
  const screen = screens[route] || screens.dashboard;

  title.textContent = screen.title;
  app.innerHTML = screen.render(getState());

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.route === route);
  });

  screen.bind?.();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    setRoute(button.dataset.route);
  });
});

document.querySelector("#seed-demo")?.addEventListener("click", () => {
  seedDemoData();
});

subscribe(render);
render();