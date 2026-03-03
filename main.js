import './style.css';
import './data.js';
import './ui.js';
import './patches.js';
import './claves.js';
import './team.js';
import './actions.js';
import './app.js';
import './dbcreds.js';

window.onload = function () {
  if (window.checkAdmin) window.checkAdmin();
  if (window.navPeriod) window.navPeriod(0);
  if (window.navPatchesPeriod) window.navPatchesPeriod(0);
  if (window.loadClavesUI) window.loadClavesUI();
  if (window.buildDbCredsCards) window.buildDbCredsCards();
  if (window.showPage) window.showPage('calendar');
};
