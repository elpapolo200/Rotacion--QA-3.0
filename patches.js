diff --git a/patches.js b/patches.js
index 7e02d29649c37fbe9de02c14c6690a44e5d54ea5..7c448f85321aa23db8d75279c8d1709f9bfa88fe 100644
--- a/patches.js
+++ b/patches.js
@@ -5,70 +5,70 @@ export function renderPatchesCalendar() {
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
-              ${DAYS.map((d, i) => `<th class="${i === 0 ? 'tuesday' : ''}">${d}</th>`).join('')}
+              ${DAYS.map((d, i) => `<th class="${i === 0 ? 'monday' : ''}">${d}</th>`).join('')}
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
-                daysHTML += `<td><div class="day-cell ${isToday ? 'today' : ''} ${isMonday && !isToday ? 'tuesday' : ''} ${isOther ? 'other-month' : ''}">${day.getDate()}</div></td>`;
+                daysHTML += `<td><div class="day-cell ${isToday ? 'today' : ''} ${isMonday && !isToday ? 'monday' : ''} ${isOther ? 'other-month' : ''}">${day.getDate()}</div></td>`;
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
