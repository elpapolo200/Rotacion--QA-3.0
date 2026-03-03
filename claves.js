import { state, ENVS } from './data.js';

export function loadClavesUI() {
    const ds = state.claves || {};
    ENVS.forEach(env => {
        const userEl = document.getElementById(`${env}_user`);
        const passEl = document.getElementById(`${env}_pass`);
        if (userEl) userEl.value = ds[`${env}_user`] || '';
        if (passEl) passEl.value = ds[`${env}_pass`] || '';
    });
}

export function buildClaveCards() {
    const grids = {
        normal: document.getElementById('clavesGrid'),
        patches: document.getElementById('clavesGridPatches')
    };

    const envDefs = [
        { id: 'mgqa1', icon: 'fa-server', label: 'MGQA1', badge: 'Ambiente', css: 'blue' },
        { id: 'mgqa2', icon: 'fa-server', label: 'MGQA2', badge: 'Ambiente', css: 'purple' },
        { id: 'mgqa3', icon: 'fa-server', label: 'MGQA3', badge: 'Ambiente', css: 'green' },
        { id: 'pmgqa1', icon: 'fa-code-branch', label: 'Patch en MGQA1', badge: 'Patch', css: 'orange', isPatch: true },
        { id: 'pmgqa2', icon: 'fa-code-branch', label: 'Patch en MGQA2', badge: 'Patch', css: 'orange', isPatch: true },
        { id: 'pmgqa3', icon: 'fa-code-branch', label: 'Patch en MGQA3', badge: 'Patch', css: 'orange', isPatch: true },
        { id: 'pmgpostqa', icon: 'fa-code-branch', label: 'Patch en MGPOSTQA', badge: 'Patch', css: 'orange', isPatch: true },
    ];

    envDefs.forEach(env => {
        let iconBg = '';
        let badgeBg = '';
        if (env.css === 'blue') { iconBg = 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'; badgeBg = 'background:rgba(59,130,246,0.15);color:var(--accent-blue-light);border-color:rgba(59,130,246,0.25);'; }
        if (env.css === 'purple') { iconBg = 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)'; badgeBg = 'background:rgba(139,92,246,0.15);color:var(--accent-purple-light);border-color:rgba(139,92,246,0.25);'; }
        if (env.css === 'green') { iconBg = 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'; badgeBg = 'background:rgba(16,185,129,0.15);color:#34d399;border-color:rgba(16,185,129,0.25);'; }
        if (env.css === 'orange') { iconBg = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'; badgeBg = 'background:rgba(245,158,11,0.15);color:#fbbf24;border-color:rgba(245,158,11,0.25);'; }

        const html = `
      <div class="clave-card" id="card_${env.id}">
        <div class="clave-card-header">
          <div class="env-icon" style="background:${iconBg}"><i class="fas ${env.icon}"></i></div>
          <h3>${env.label}</h3>
          <span class="env-badge" style="${badgeBg}">${env.badge}</span>
        </div>
        <div class="clave-card-body">
          <div class="clave-field">
            <label><i class="fas fa-user"></i> Username</label>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="clave-input-wrap"><input type="text" id="${env.id}_user" placeholder="—" disabled></div>
              <button class="clave-copy-btn" onclick="window.copyField('${env.id}_user')" title="Copiar"><i class="fas fa-copy"></i></button>
            </div>
          </div>
          <div class="clave-field">
            <label><i class="fas fa-lock"></i> Clave</label>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="clave-input-wrap"><input type="text" id="${env.id}_pass" placeholder="—" disabled></div>
              <button class="clave-copy-btn" onclick="window.copyField('${env.id}_pass')" title="Copiar"><i class="fas fa-copy"></i></button>
            </div>
          </div>
        </div>
        <div class="clave-card-footer">
          <span class="clave-admin-hint" id="hint_${env.id}"><i class="fas fa-lock"></i> Solo admin puede editar</span>
          <button class="clave-edit-btn hidden" id="editBtn_${env.id}" onclick="window.toggleEditClave('${env.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
        </div>
      </div>
    `;

        if (env.isPatch) grids.patches.innerHTML += html;
        else grids.normal.innerHTML += html;
    });
}

window.loadClavesUI = loadClavesUI;
