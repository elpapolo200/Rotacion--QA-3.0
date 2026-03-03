import { state, saveState, uid, countWeeks, getTuesdayWeeks, getMondayWeeks, weekKey, countPW, ENVS } from './data.js';

window.openAssign = function (key, weekNum, group) {
    state.assignKey = key; state.assignGroup = group;
    document.getElementById('assignWeekLabel').textContent = `Semana ${weekNum} · ${key}`;
    document.getElementById('assignGroupBadge').textContent = `Grupo ${group}`;
    document.getElementById('assignGroupBadge').className = `badge group-${group}`;
    const select = document.getElementById('assignSelect');
    const groupPeople = state.people.filter(p => p.group === group).sort((a, b) => countWeeks(a.id) - countWeeks(b.id));
    select.innerHTML = '<option value="">— Sin asignar —</option>' + groupPeople.map(p => `<option value="${p.id}" ${state.assignments[key] === p.id ? 'selected' : ''}>${p.name} (${countWeeks(p.id)} semanas)</option>`).join('');
    openModal('assignModal');
}
window.saveAssign = function () {
    const personId = document.getElementById('assignSelect').value;
    if (personId) state.assignments[state.assignKey] = personId; else delete state.assignments[state.assignKey];
    saveState(); closeModalDirect('assignModal'); showToast('✅ Asignacion guardada'); renderCalendar(); renderCoordinatorBanner();
}
window.clearAssign = function () {
    delete state.assignments[state.assignKey]; saveState(); closeModalDirect('assignModal'); showToast('🗑️ Asignacion eliminada'); renderCalendar(); renderCoordinatorBanner();
}

// Patches Assign
window.openPatchesAssign = function (key, weekNum) {
    state.patchesAssignKey = key;
    document.getElementById('patchesAssignWeekLabel').textContent = `Semana de Patches ${weekNum} · ${key}`;
    const select = document.getElementById('patchesAssignSelect');
    const allPeople = [...state.people].sort((a, b) => countPW(a.id) - countPW(b.id));
    select.innerHTML = '<option value="">— Sin asignar —</option>' + allPeople.map(p => `<option value="${p.id}" ${state.patchesAssignments[key] === p.id ? 'selected' : ''}>${p.name} (${countPW(p.id)} patches)</option>`).join('');
    openModal('patchesAssignModal');
}
window.savePatchesAssign = function () {
    const personId = document.getElementById('patchesAssignSelect').value;
    if (personId) state.patchesAssignments[state.patchesAssignKey] = personId; else delete state.patchesAssignments[state.patchesAssignKey];
    saveState(); closeModalDirect('patchesAssignModal'); showToast('✅ Patches guardados'); renderPatchesCalendar(); renderPatchesBanner();
}
window.clearPatchesAssign = function () {
    delete state.patchesAssignments[state.patchesAssignKey]; saveState(); closeModalDirect('patchesAssignModal'); showToast('🗑️ Patches eliminados'); renderPatchesCalendar(); renderPatchesBanner();
}

// People logic
window.openPersonModal = function (defaultGroup = 1) {
    state.editPersonId = null; state.selectedGroup = defaultGroup;
    document.getElementById('personModalTitle').textContent = 'Nueva Persona';
    document.getElementById('personName').value = '';
    updateGroupSelection(); openModal('personModal');
    setTimeout(() => document.getElementById('personName').focus(), 100);
}
window.editPerson = function (id) {
    const person = state.people.find(p => p.id === id); if (!person) return;
    state.editPersonId = id; state.selectedGroup = person.group;
    document.getElementById('personModalTitle').textContent = 'Editar Persona';
    document.getElementById('personName').value = person.name;
    updateGroupSelection(); openModal('personModal');
    setTimeout(() => document.getElementById('personName').focus(), 100);
}
window.selectGroup = function (group) { state.selectedGroup = group; updateGroupSelection(); }
window.updateGroupSelection = function () {
    document.getElementById('optGroup1').className = `group-option ${state.selectedGroup === 1 ? 'selected' : ''} group-1`;
    document.getElementById('optGroup2').className = `group-option ${state.selectedGroup === 2 ? 'selected' : ''} group-2`;
}
window.savePerson = function () {
    const name = document.getElementById('personName').value.trim();
    if (!name) return showToast('Ingresa un nombre', 'error');
    if (state.editPersonId) {
        const person = state.people.find(p => p.id === state.editPersonId);
        if (person.group !== state.selectedGroup) {
            Object.keys(state.assignments).forEach(k => { if (state.assignments[k] === person.id) delete state.assignments[k]; });
            showToast(`✅ ${name} movido al Grupo ${state.selectedGroup}`);
        } else showToast('✅ Persona actualizada');
        person.name = name; person.group = state.selectedGroup;
    } else {
        state.people.push({ id: uid(), name, group: state.selectedGroup }); showToast(`✅ ${name} agregado al Grupo ${state.selectedGroup}`);
    }
    saveState(); closeModalDirect('personModal'); renderTeam();
}
window.deletePerson = function (id) {
    const person = state.people.find(p => p.id === id);
    if (!confirm(`Eliminar a ${person.name}? Se borraran sus asignaciones.`)) return;
    state.people = state.people.filter(p => p.id !== id);
    Object.keys(state.assignments).forEach(k => { if (state.assignments[k] === id) delete state.assignments[k]; });
    Object.keys(state.patchesAssignments).forEach(k => { if (state.patchesAssignments[k] === id) delete state.patchesAssignments[k]; });
    saveState(); showToast(`🗑️ ${person.name} eliminado`); renderTeam();
}

// Auto Assign
window.autoAssign = function () {
    if (state.people.length === 0) return showToast('Agrega personas primero', 'error');
    const weeks = getTuesdayWeeks(state.year); let count = 0;
    [1, 2].forEach(g => {
        const groupWeeks = weeks.filter(w => w.grp === g); const members = state.people.filter(p => p.group === g);
        if (members.length === 0) return;
        const counts = members.map(p => countWeeks(p.id)); const minCount = Math.min(...counts);
        let startIdx = members.findIndex(p => countWeeks(p.id) === minCount); if (startIdx === -1) startIdx = 0;
        const order = []; for (let i = 0; i < members.length; i++) order.push(members[(startIdx + i) % members.length]);
        let idx = 0;
        groupWeeks.forEach(w => {
            const key = weekKey(state.year, w.n);
            if (state.assignments[key]) return;
            state.assignments[key] = order[idx % order.length].id; idx++; count++;
        });
    });
    saveState(); showToast(count === 0 ? 'Todas las semanas ya asignadas' : `⚡ ${count} semanas asignadas`); renderCalendar(); renderCoordinatorBanner();
}

window.autoAssignPatches = function () {
    if (state.people.length === 0) return showToast('Agrega personas primero', 'error');
    const weeks = getMondayWeeks(state.patchesYear); let count = 0;
    const allMembers = [...state.people].sort((a, b) => countPW(a.id) - countPW(b.id));
    if (allMembers.length === 0) return;
    const minCount = countPW(allMembers[0].id); let startIdx = allMembers.findIndex(p => countPW(p.id) === minCount); if (startIdx === -1) startIdx = 0;
    const order = []; for (let i = 0; i < allMembers.length; i++) order.push(allMembers[(startIdx + i) % allMembers.length]);
    let idx = 0;
    weeks.forEach(w => {
        const key = weekKey(state.patchesYear, w.n);
        if (state.patchesAssignments[key]) return;
        state.patchesAssignments[key] = order[idx % order.length].id; idx++; count++;
    });
    saveState(); showToast(count === 0 ? 'Todas las semanas ya estan asignadas' : `⚡ ${count} semanas Patches auto-asignadas`); renderPatchesCalendar(); renderPatchesBanner();
}

// Claves Management
window.copyField = function (id) {
    const el = document.getElementById(id);
    if (el && el.value) { navigator.clipboard.writeText(el.value); showToast('Copiado al portapapeles'); }
    else showToast('Nada que copiar', 'error');
}
window.toggleEditClave = function (env) {
    const card = document.getElementById(`card_${env}`); const btn = document.getElementById(`editBtn_${env}`);
    const userEl = document.getElementById(`${env}_user`); const passEl = document.getElementById(`${env}_pass`);
    const isEditing = card.classList.contains('clave-editing');
    if (isEditing) { // Save
        state.claves[`${env}_user`] = userEl.value; state.claves[`${env}_pass`] = passEl.value; saveState();
        userEl.disabled = true; passEl.disabled = true; card.classList.remove('clave-editing');
        btn.innerHTML = '<i class="fas fa-edit"></i> Editar'; btn.classList.remove('saving'); showToast('Datos guardados');
    } else { // Edit
        userEl.disabled = false; passEl.disabled = false; card.classList.add('clave-editing');
        btn.innerHTML = '<i class="fas fa-save"></i> Guardar'; btn.classList.add('saving'); userEl.focus();
    }
}
window.updateClavesAdminUI = function (env) {
    const btn = document.getElementById(`editBtn_${env}`); const hint = document.getElementById(`hint_${env}`);
    if (!btn || !hint) return;
    if (state.isAdmin) { btn.classList.remove('hidden'); hint.classList.add('hidden'); }
    else {
        btn.classList.add('hidden'); hint.classList.remove('hidden');
        const card = document.getElementById(`card_${env}`);
        if (card && card.classList.contains('clave-editing')) { window.toggleEditClave(env); window.loadClavesUI(); }
    }
}
