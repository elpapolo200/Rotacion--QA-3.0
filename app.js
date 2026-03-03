import { state, SESSION_HOURS, ADMIN_PIN, ENVS, MONTHS } from './data.js';

window.showToast = function (message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle success' : 'exclamation-circle error'}"></i><span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

// ==================== ADMIN ====================
window.checkAdmin = function () {
    const exp = sessionStorage.getItem('admin_exp');
    state.isAdmin = exp && Date.now() < parseInt(exp);
    updateAdminUI();
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}
window.grantAdmin = function () {
    sessionStorage.setItem('admin_exp', (Date.now() + SESSION_HOURS * 3600000).toString());
    state.isAdmin = true; updateAdminUI(); window.showToast(`🛡️ Acceso admin concedido`);
}
window.logoutAdmin = function () {
    sessionStorage.removeItem('admin_exp'); state.isAdmin = false; updateAdminUI();
    if (state.currentPage === 'team') window.showPage('calendar', document.querySelector('.nav-item'));
    window.showToast('🔒 Sesión cerrada');
}
function updateAdminUI() {
    const badge = document.getElementById('adminBadge');
    if (badge) badge.classList.toggle('visible', state.isAdmin);
    const teamLock = document.getElementById('teamLock');
    if (teamLock) teamLock.className = state.isAdmin ? 'fas fa-lock-open lock-icon' : 'fas fa-lock lock-icon';
    const navTeam = document.getElementById('navTeam');
    if (navTeam) navTeam.classList.toggle('purple', state.isAdmin && state.currentPage === 'team');
    const onCal = state.currentPage === 'calendar';
    const onPat = state.currentPage === 'patches';
    const btnAutoAssign = document.getElementById('btnAutoAssign');
    if (btnAutoAssign) { btnAutoAssign.classList.toggle('hidden', !onCal); btnAutoAssign.style.opacity = state.isAdmin ? '1' : '0.6'; }
    const btnAutoAssignPatches = document.getElementById('btnAutoAssignPatches');
    if (btnAutoAssignPatches) { btnAutoAssignPatches.classList.toggle('hidden', !onPat); btnAutoAssignPatches.style.opacity = state.isAdmin ? '1' : '0.6'; }
    const btnAddPerson = document.getElementById('btnAddPerson');
    if (btnAddPerson) btnAddPerson.classList.toggle('hidden', !state.isAdmin || state.currentPage !== 'team');
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
    const titles = { calendar: 'Rotación Semanal', patches: 'Rotación Patches', claves: 'Claves de Ambiente', team: 'Gestión de Equipo' };
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
    else { state.patchesYear += dir; }
    const lbl = document.getElementById('patchesPeriodLabel');
    if (lbl) lbl.textContent = state.patchesView === 'month' ? `${MONTHS[state.patchesMonth]} ${state.patchesYear}` : `Año ${state.patchesYear}`;
    if (window.renderPatchesCalendar) { window.renderPatchesCalendar(); window.renderPatchesBanner(); }
}
window.setPatchesView = (view) => {
    state.patchesView = view; document.getElementById('btnPatchesMonth').classList.toggle('active', view === 'month'); document.getElementById('btnPatchesYear').classList.toggle('active', view === 'year');
    document.getElementById('patchesGrid').className = `calendar-grid ${view}-view`;
    window.navPatchesPeriod(0);
}

// PIN
window.pinKey = function (key) {
    if (state.pin.length >= 4) return;
    state.pin += key; updatePinDots();
    if (state.pin.length === 4) setTimeout(checkPin, 150);
}
window.pinDelete = () => { state.pin = state.pin.slice(0, -1); updatePinDots(); }
function updatePinDots() {
    document.querySelectorAll('.pin-dot').forEach((dot, i) => { dot.classList.toggle('filled', i < state.pin.length); dot.classList.remove('error'); });
}
function checkPin() {
    if (state.pin === ADMIN_PIN) {
        window.grantAdmin(); window.closeModalDirect('pinModal');
        if (state.pinCallback) { state.pinCallback(); state.pinCallback = null; }
    } else {
        document.querySelectorAll('.pin-dot').forEach(dot => { dot.classList.remove('filled'); dot.classList.add('error'); });
        const sub = document.getElementById('pinSubtitle');
        if (sub) { sub.textContent = 'PIN incorrecto.'; sub.classList.add('error'); }
        const modal = document.querySelector('.pin-modal');
        if (modal) {
            modal.classList.add('animate-shake');
            setTimeout(() => { state.pin = ''; updatePinDots(); modal.classList.remove('animate-shake'); }, 800);
        }
    }
}
