import { state, MONTHS, DAYS, initials, countPW, getMondayWeeks, getPatchWeeksForMonth, getCurrentPatchWeekNum, weekKey } from './data.js';

export function renderPatchesCalendar() {
    const isMonth = state.patchesView === 'month';
    const start = isMonth ? state.patchesMonth : 0;
    const end = isMonth ? state.patchesMonth : 11;
    const today = new Date();
    const currentWeekNum = getCurrentPatchWeekNum(state.patchesYear);
    const grid = document.getElementById('patchesGrid');
    grid.innerHTML = '';

    for (let m = start; m <= end; m++) {
        const weeks = getPatchWeeksForMonth(state.patchesYear, m);
        const assignedCount = weeks.filter(w => state.patchesAssignments[weekKey(state.patchesYear, w.n)]).length;

        const card = document.createElement('div');
        card.className = 'month-card';
        card.style.animationDelay = `${(m - start) * 0.05}s`;

        let tableHTML = `
      <div class="month-header">
        <h4>${MONTHS[m]}</h4>
        <span class="month-badge">${assignedCount}/${weeks.length} asignadas</span>
      </div>
      <div style="overflow-x:auto;">
        <table class="calendar-table">
          <thead>
            <tr>
              <th>#</th>
              ${DAYS.map((d, i) => `<th class="${i === 0 ? 'tuesday' : ''}">${d}</th>`).join('')}
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
    `;

        weeks.forEach((week) => {
            const key = weekKey(state.patchesYear, week.n);
            const personId = state.patchesAssignments[key];
            const person = personId ? state.people.find(p => p.id === personId) : null;
            const isCurrentWeek = week.n === currentWeekNum;

            let daysHTML = '';
            for (let d = 0; d < 7; d++) {
                const day = new Date(week.date); day.setDate(week.date.getDate() + d);
                const isToday = day.toDateString() === today.toDateString();
                const isOther = day.getMonth() !== m;
                const isMonday = d === 0;
                daysHTML += `<td><div class="day-cell ${isToday ? 'today' : ''} ${isMonday && !isToday ? 'tuesday' : ''} ${isOther ? 'other-month' : ''}">${day.getDate()}</div></td>`;
            }

            tableHTML += `
        <tr class="calendar-row ${isCurrentWeek ? 'current-week' : ''}">
          <td><button class="week-number ${isCurrentWeek ? 'current' : ''}" onclick="requireAdmin(() => window.openPatchesAssign('${key}', ${week.n}))">${week.n}</button></td>
          ${daysHTML}
          <td>
            <button class="week-pill ${person ? `group-${person.group}` : 'unassigned'}" onclick="requireAdmin(() => window.openPatchesAssign('${key}', ${week.n}))">
              ${person ? person.name.split(' ')[0] : (state.isAdmin ? '+ Asignar' : person ? person.name.split(' ')[0] : '— —')}
            </button>
          </td>
        </tr>
      `;
        });

        tableHTML += '</tbody></table></div>';
        card.innerHTML = tableHTML;
        grid.appendChild(card);
    }
}

export function renderPatchesBanner() {
    const todayYear = new Date().getFullYear();
    const weeks = getMondayWeeks(todayYear);
    if (weeks.length === 0) return;
    const currentWeekNum = getCurrentPatchWeekNum(todayYear);
    const currentIndex = weeks.findIndex(w => w.n === currentWeekNum);
    const currentKey = weekKey(todayYear, currentWeekNum);
    const currentPersonId = state.patchesAssignments[currentKey];
    const currentPerson = currentPersonId ? state.people.find(p => p.id === currentPersonId) : null;
    const currentGroup = currentPerson ? currentPerson.group : (weeks[currentIndex]?.grp || 1);

    let nextPerson = null, nextGroup = 1, nextWeekNum = null;
    for (let i = currentIndex + 1; i < weeks.length; i++) {
        nextWeekNum = weeks[i].n; nextGroup = weeks[i].grp;
        const nextId = state.patchesAssignments[weekKey(todayYear, weeks[i].n)];
        nextPerson = nextId ? state.people.find(p => p.id === nextId) || null : null;
        break;
    }

    document.getElementById('patchesBanner').innerHTML = `
    <div class="coord-card current ${currentGroup === 2 ? 'purple' : ''}">
      <div class="coord-glow ${currentGroup === 1 ? 'blue' : 'purple'} top-right"></div>
      <div class="coord-header">
        <div class="coord-dot ${currentGroup === 1 ? 'blue' : 'purple'}"></div>
        <span class="coord-label">Semana Actual Patches</span>
        <span class="coord-badge ${currentGroup === 1 ? 'blue' : 'purple'}">Sem ${currentWeekNum}</span>
      </div>
      <div class="coord-body">
        <div class="coord-avatar ${currentGroup === 1 ? 'blue' : 'purple'}">${currentPerson ? initials(currentPerson.name) : '—'}</div>
        <div class="coord-info">
          <h3>${currentPerson ? currentPerson.name : 'Sin asignar'}</h3>
          <p>${currentPerson ? 'Encargado de Patches' : 'Pendiente de asignacion'}</p>
        </div>
      </div>
    </div>
    <div class="coord-arrow"><i class="fas fa-arrow-right"></i></div>
    <div class="coord-card next ${nextGroup === 1 ? 'blue' : ''}">
      <div class="coord-glow ${nextGroup === 1 ? 'blue' : 'purple'} top-left"></div>
      <div class="coord-header">
        <div class="coord-dot ${nextGroup === 1 ? 'blue' : 'purple'}"></div>
        <span class="coord-label">Proxima semana Patches</span>
        ${nextWeekNum ? `<span class="coord-badge ${nextGroup === 1 ? 'blue' : 'purple'}">Sem ${nextWeekNum}</span>` : ''}
      </div>
      <div class="coord-body">
        <div class="coord-avatar ${nextGroup === 1 ? 'blue' : 'purple'} ${!nextPerson ? 'muted' : ''}">${nextPerson ? initials(nextPerson.name) : '—'}</div>
        <div class="coord-info">
          <h3>${nextPerson ? nextPerson.name : 'Sin asignar'}</h3>
          <p>${nextPerson ? 'Siguiente turno' : 'Pendiente de asignacion'}</p>
        </div>
      </div>
    </div>
  `;
}

window.renderPatchesCalendar = renderPatchesCalendar;
window.renderPatchesBanner = renderPatchesBanner;
