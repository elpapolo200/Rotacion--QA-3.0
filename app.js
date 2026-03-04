diff --git a/app.js b/app.js
index 49bbec1c01624e867d6ab0baa1eaa8d69429e605..5cdac292af95bcdccfba9a268a9d1c8c4308e68d 100644
--- a/app.js
+++ b/app.js
@@ -45,51 +45,51 @@ function updateAdminUI() {
     if (window.updateClavesAdminUI) ENVS.forEach(env => window.updateClavesAdminUI(env));
     if (window.updateDbCardsAdminUI) window.updateDbCardsAdminUI();
 }
 window.requireAdmin = function (callback) {
     if (state.isAdmin) { callback(); } else {
         state.pinCallback = callback; state.pin = ''; updatePinDots();
         document.getElementById('pinSubtitle').textContent = 'Ingresa el PIN de 4 dígitos';
         document.getElementById('pinSubtitle').classList.remove('error');
         window.openModal('pinModal');
     }
 }
 window.handleTeamClick = () => window.requireAdmin(() => window.showPage('team', document.getElementById('navTeam')));
 
 // ==================== MODALS & NAVIGATION ====================
 window.openModal = (id) => document.getElementById(id).classList.add('open');
 window.closeModalDirect = (id) => document.getElementById(id).classList.remove('open');
 window.closeModal = (e, id) => { if (e.target === document.getElementById(id)) window.closeModalDirect(id); }
 window.toggleSidebar = () => { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('mobileOverlay').classList.toggle('open'); }
 
 window.showPage = function (page, el) {
     state.currentPage = page;
     document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
     document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active', 'purple'));
     document.getElementById(`page${page.charAt(0).toUpperCase() + page.slice(1)}`).classList.add('active');
     if (el) el.classList.add('active');
-    const titles = { calendar: 'Rotación Semanal', patches: 'Rotación Patches', claves: 'Claves de Ambiente', team: 'Gestión de Equipo' };
+    const titles = { calendar: 'Rotación Semanal', patches: 'Rotación Patches', claves: 'Claves Ambientes', team: 'Gestión de Equipo' };
     document.getElementById('pageTitle').textContent = titles[page] || page;
     updateAdminUI();
 
     if (page === 'calendar' && window.renderCalendar) { window.renderCalendar(); window.renderCoordinatorBanner(); }
     else if (page === 'patches' && window.renderPatchesCalendar) { window.renderPatchesCalendar(); window.renderPatchesBanner(); }
     else if (page === 'claves' && window.loadClavesUI) { window.loadClavesUI(); }
     else if (page === 'team' && window.renderTeam) { window.renderTeam(); }
     if (window.innerWidth < 768) window.toggleSidebar();
 }
 
 // Date View Controls
 window.navPeriod = (dir) => {
     if (state.view === 'month') { state.month += dir; if (state.month < 0) { state.month = 11; state.year--; } if (state.month > 11) { state.month = 0; state.year++; } }
     else { state.year += dir; }
     const lbl = document.getElementById('periodLabel');
     if (lbl) lbl.textContent = state.view === 'month' ? `${MONTHS[state.month]} ${state.year}` : `Año ${state.year}`;
     if (window.renderCalendar) { window.renderCalendar(); window.renderCoordinatorBanner(); }
 }
 window.setView = (view) => {
     state.view = view; document.getElementById('btnMonth').classList.toggle('active', view === 'month'); document.getElementById('btnYear').classList.toggle('active', view === 'year');
     document.getElementById('calendarGrid').className = `calendar-grid ${view}-view`;
     window.navPeriod(0); // update label
 }
 window.navPatchesPeriod = (dir) => {
     if (state.patchesView === 'month') { state.patchesMonth += dir; if (state.patchesMonth < 0) { state.patchesMonth = 11; state.patchesYear--; } if (state.patchesMonth > 11) { state.patchesMonth = 0; state.patchesYear++; } }
