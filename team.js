import { state, initials, countWeeks } from './data.js';

export function renderTeam() {
    const layout = document.getElementById('teamLayout');
    layout.innerHTML = '';

    [1, 2].forEach(group => {
        const members = state.people.filter(p => p.group === group).sort((a, b) => countWeeks(a.id) - countWeeks(b.id));
        const queue = [...members].sort((a, b) => countWeeks(a.id) - countWeeks(b.id));
        const minCount = queue.length > 0 ? countWeeks(queue[0].id) : 0;

        const panel = document.createElement('div');
        panel.className = `team-panel group-${group}`;
        panel.style.animationDelay = `${(group - 1) * 0.1}s`;

        let bodyHTML = '';
        if (members.length === 0) {
            bodyHTML = `
        <div class="empty-state">
          <p>Sin personas en este grupo.</p>
          <p>Pulsa "+ Agregar" para añadir.</p>
        </div>
      `;
        } else {
            bodyHTML = members.map((p, i) => {
                const count = countWeeks(p.id);
                return `
          <div class="member-row" style="animation-delay: ${i * 0.05}s">
            <div class="member-avatar group-${group}">${initials(p.name)}</div>
            <div class="member-info">
              <div class="name">${p.name}</div>
              <div class="weeks">${count} semana${count !== 1 ? 's' : ''} asignada${count !== 1 ? 's' : ''}</div>
            </div>
            <div class="member-actions">
              <button onclick="window.editPerson('${p.id}')"><i class="fas fa-edit"></i></button>
              <button class="delete" onclick="window.deletePerson('${p.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `;
            }).join('');
        }

        let queueHTML = '';
        if (queue.length > 0) {
            queueHTML = `
        <div class="queue-section">
          <div class="queue-label">Proximo turno</div>
          <div class="queue-chips">
            ${queue.map((p, i) => {
                const count = countWeeks(p.id);
                const isDone = count > minCount;
                const isNext = count === minCount && i === 0;
                return `<span class="queue-chip group-${group} ${isDone ? 'completed' : ''} ${isNext ? 'next' : ''}" title="${count} semanas">${p.name.split(' ')[0]}</span>`;
            }).join('')}
          </div>
        </div>
      `;
        }

        panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">
          <div class="panel-dot group-${group}"></div>
          <h3>Grupo ${group}</h3>
          <span class="panel-badge group-${group}">${members.length} persona${members.length !== 1 ? 's' : ''}</span>
        </div>
        <button class="btn btn-secondary" onclick="window.openPersonModal(${group})">
          <i class="fas fa-plus"></i><span>Agregar</span>
        </button>
      </div>
      <div class="panel-body">${bodyHTML}</div>
      ${queueHTML}
    `;

        layout.appendChild(panel);
    });
}

window.renderTeam = renderTeam;
