import { state, MONTHS, DAYS, ENVS, initials, countWeeks, countPW, getTuesdayWeeks, getWeeksForMonth, getCurrentWeekNum, getMondayWeeks, getPatchWeeksForMonth, getCurrentPatchWeekNum, weekKey } from './data.js';

export function renderCalendar() {
    const isMonth = state.view === 'month';
    const start = isMonth ? state.month : 0;
    const end = isMonth ? state.month : 11;
    const today = new Date();
    const currentWeekNum = getCurrentWeekNum(state.year);
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    for (let m = start; m <= end; m++) {
        const weeks = getWeeksForMonth(state.year, m);
        const assignedCount = weeks.filter(w => state.assignments[weekKey(state.year, w.n)]).length;

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
              ${DAYS.map((d, i) => `<th class="${i === 1 ? 'tuesday' : ''}">${d}</th>`).join('')}
              <th>Responsable</th>
              <th>Grp</th>
            </tr>
          </thead>
          <tbody>
    `;

        weeks.forEach((week) => {
            const key = weekKey(state.year, week.n);
            const personId = state.assignments[key];
            const person = personId ? state.people.find(p => p.id === personId) : null;
            const isCurrentWeek = week.n === currentWeekNum;
            const monday = new Date(week.date); monday.setDate(week.date.getDate() - 1);

            let daysHTML = '';
            for (let d = 0; d < 7; d++) {
                const day = new Date(monday); day.setDate(monday.getDate() + d);
                const isToday = day.toDateString() === today.toDateString();
                const isOther = day.getMonth() !== m;
                const isTuesday = d === 1;
                daysHTML += `<td><div class="day-cell ${isToday ? 'today' : ''} ${isTuesday && !isToday ? 'tuesday' : ''} ${isOther ? 'other-month' : ''}">${day.getDate()}</div></td>`;
            }

            tableHTML += `
        <tr class="calendar-row ${isCurrentWeek ? 'current-week' : ''}">
          <td><button class="week-number ${isCurrentWeek ? 'current' : ''}" onclick="requireAdmin(() => window.openAssign('${key}', ${week.n}, ${week.grp}))">${week.n}</button></td>
          ${daysHTML}
          <td>
            <button class="week-pill ${person ? `group-${person.group}` : 'unassigned'}" onclick="requireAdmin(() => window.openAssign('${key}', ${week.n}, ${week.grp}))">
              ${person ? person.name.split(' ')[0] : (state.isAdmin ? '+ Asignar' : person ? person.name.split(' ')[0] : '— —')}
            </button>
          </td>
          <td><span class="group-badge group-${week.grp}">G${week.grp}</span></td>
        </tr>
      `;
        });

        tableHTML += '</tbody></table></div>';
        card.innerHTML = tableHTML;
        grid.appendChild(card);
    }
}

export function renderCoordinatorBanner() {
    const todayYear = new Date().getFullYear();
    const weeks = getTuesdayWeeks(todayYear);
    if (weeks.length === 0) return;

    const currentWeekNum = getCurrentWeekNum(todayYear);
    const currentIndex = weeks.findIndex(w => w.n === currentWeekNum);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const currentKey = weekKey(todayYear, weeks[safeIndex].n);
    const currentPersonId = state.assignments[currentKey];
    const currentPerson = currentPersonId ? state.people.find(p => p.id === currentPersonId) : null;
    const currentGroup = currentPerson ? currentPerson.group : weeks[safeIndex].grp;

    let nextPerson = null, nextGroup = 1, nextWeekNum = null;
    for (let i = safeIndex + 1; i < weeks.length; i++) {
        const key = weekKey(todayYear, weeks[i].n);
        const nextId = state.assignments[key];
        if (nextId) { nextPerson = state.people.find(p => p.id === nextId) || null; nextWeekNum = weeks[i].n; nextGroup = weeks[i].grp; break; }
        if (i === safeIndex + 1) { nextWeekNum = weeks[i].n; nextGroup = weeks[i].grp; }
    }
    if (!nextWeekNum && weeks.length > 1) { nextWeekNum = weeks[weeks.length - 1].n; nextGroup = weeks[weeks.length - 1].grp; }

    document.getElementById('coordinatorBanner').innerHTML = `
    <div class="coord-card current ${currentGroup === 2 ? 'purple' : ''}">
      <div class="coord-glow ${currentGroup === 1 ? 'blue' : 'purple'} top-right"></div>
      <div class="coord-header">
        <div class="coord-dot ${currentGroup === 1 ? 'blue' : 'purple'}"></div>
        <span class="coord-label">Coordinador esta semana</span>
        <span class="coord-badge ${currentGroup === 1 ? 'blue' : 'purple'}">Sem ${weeks[safeIndex].n}</span>
      </div>
      <div class="coord-body">
        <div class="coord-avatar ${currentGroup === 1 ? 'blue' : 'purple'}">${currentPerson ? initials(currentPerson.name) : '—'}</div>
        <div class="coord-info">
          <h3>${currentPerson ? currentPerson.name : 'Sin asignar'}</h3>
          <p>Grupo ${currentGroup} • ${currentPerson ? 'Asignado' : 'Pendiente de asignacion'}</p>
        </div>
      </div>
    </div>
    <div class="coord-arrow"><i class="fas fa-arrow-right"></i></div>
    <div class="coord-card next ${nextGroup === 1 ? 'blue' : ''}">
      <div class="coord-glow ${nextGroup === 1 ? 'blue' : 'purple'} top-left"></div>
      <div class="coord-header">
        <div class="coord-dot ${nextGroup === 1 ? 'blue' : 'purple'}"></div>
        <span class="coord-label">Proximo coordinador</span>
        ${nextWeekNum ? `<span class="coord-badge ${nextGroup === 1 ? 'blue' : 'purple'}">Sem ${nextWeekNum}</span>` : ''}
      </div>
      <div class="coord-body">
        <div class="coord-avatar ${nextGroup === 1 ? 'blue' : 'purple'} ${!nextPerson ? 'muted' : ''}">${nextPerson ? initials(nextPerson.name) : '—'}</div>
        <div class="coord-info">
          <h3>${nextPerson ? nextPerson.name : 'Sin asignar'}</h3>
          <p>Grupo ${nextGroup} • ${nextPerson ? 'Siguiente turno' : 'Pendiente de asignacion'}</p>
        </div>
      </div>
    </div>
  `;
}

// Do the same for patches...
window.renderCalendar = renderCalendar;
window.renderCoordinatorBanner = renderCoordinatorBanner;
