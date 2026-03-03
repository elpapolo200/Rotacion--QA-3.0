import { state } from './data.js';

const DB_COUNT = 8;

function getDbData() {
    return JSON.parse(localStorage.getItem('qa_dbcreds') || '[]');
}
function saveDbData(data) {
    localStorage.setItem('qa_dbcreds', JSON.stringify(data));
}

export function buildDbCredsCards() {
    const grid = document.getElementById('dbCredsGrid');
    if (!grid) return;

    let data = getDbData();
    // Initialize if empty
    if (data.length < DB_COUNT) {
        while (data.length < DB_COUNT) {
            data.push({ name: '', user: '', pass: '' });
        }
        saveDbData(data);
    }

    grid.innerHTML = '';

    data.forEach((db, i) => {
        const card = document.createElement('div');
        card.className = 'db-card';
        card.style.animationDelay = `${i * 0.05}s`;
        card.id = `dbCard_${i}`;

        card.innerHTML = `
      <div class="db-card-header">
        <div class="db-num">${i + 1}</div>
        <input 
          class="db-name-input"
          id="dbName_${i}"
          type="text"
          placeholder="Nombre de base de datos..."
          value="${escapeHtml(db.name)}"
          disabled
        />
      </div>
      <div class="db-card-body">
        <div class="db-field">
          <label><i class="fas fa-user"></i> Username</label>
          <div class="db-input-row">
            <div class="db-input-wrap">
              <input type="text" id="dbUser_${i}" placeholder="—" value="${escapeHtml(db.user)}" disabled />
            </div>
            <button class="db-copy-btn" onclick="window.copyDbField('dbUser_${i}')" title="Copiar usuario">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        <div class="db-field">
          <label><i class="fas fa-lock"></i> Clave</label>
          <div class="db-input-row">
            <div class="db-input-wrap">
              <input type="password" id="dbPass_${i}" placeholder="—" value="${escapeHtml(db.pass)}" disabled />
              <button class="db-eye-btn" onclick="window.toggleDbEye(${i})" id="dbEye_${i}" title="Mostrar/ocultar">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <button class="db-copy-btn" onclick="window.copyDbField('dbPass_${i}')" title="Copiar clave">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="db-card-footer">
        <span class="db-admin-hint" id="dbHint_${i}"><i class="fas fa-lock"></i> Solo admin puede editar</span>
        <button class="db-edit-btn hidden" id="dbEditBtn_${i}" onclick="window.toggleEditDbCard(${i})">
          <i class="fas fa-edit"></i> Editar
        </button>
      </div>
    `;

        grid.appendChild(card);
    });

    // Apply admin visibility right after building
    updateDbCardsAdminUI();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.toggleDbEye = function (i) {
    const passEl = document.getElementById(`dbPass_${i}`);
    const eyeBtn = document.getElementById(`dbEye_${i}`);
    if (!passEl) return;
    const isHidden = passEl.type === 'password';
    passEl.type = isHidden ? 'text' : 'password';
    eyeBtn.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}

window.copyDbField = function (inputId) {
    const el = document.getElementById(inputId);
    if (el && el.value) {
        navigator.clipboard.writeText(el.value);
        window.showToast('Copiado al portapapeles');
    } else {
        window.showToast('Nada que copiar', 'error');
    }
}

window.toggleEditDbCard = function (i) {
    const btn = document.getElementById(`dbEditBtn_${i}`);
    const nameEl = document.getElementById(`dbName_${i}`);
    const userEl = document.getElementById(`dbUser_${i}`);
    const passEl = document.getElementById(`dbPass_${i}`);
    const card = document.getElementById(`dbCard_${i}`);
    const isEditing = card.classList.contains('db-editing');

    if (isEditing) {
        // Save
        const data = getDbData();
        data[i] = {
            name: nameEl.value.trim(),
            user: userEl.value,
            pass: passEl.value
        };
        saveDbData(data);
        nameEl.disabled = true;
        userEl.disabled = true;
        passEl.disabled = true;
        card.classList.remove('db-editing');
        btn.innerHTML = '<i class="fas fa-edit"></i> Editar';
        btn.classList.remove('saving');
        window.showToast(`✅ BD ${i + 1} guardada`);
    } else {
        // Edit
        nameEl.disabled = false;
        userEl.disabled = false;
        passEl.disabled = false;
        passEl.type = 'text'; // Show password while editing
        document.getElementById(`dbEye_${i}`).innerHTML = '<i class="fas fa-eye-slash"></i>';
        card.classList.add('db-editing');
        btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
        btn.classList.add('saving');
        nameEl.focus();
    }
}

export function updateDbCardsAdminUI() {
    for (let i = 0; i < DB_COUNT; i++) {
        const btn = document.getElementById(`dbEditBtn_${i}`);
        const hint = document.getElementById(`dbHint_${i}`);
        if (!btn || !hint) return;
        if (state.isAdmin) {
            btn.classList.remove('hidden');
            hint.classList.add('hidden');
        } else {
            btn.classList.add('hidden');
            hint.classList.remove('hidden');
            // If being edited, close it
            const card = document.getElementById(`dbCard_${i}`);
            if (card && card.classList.contains('db-editing')) {
                // save current values
                window.toggleEditDbCard(i);
            }
        }
    }
}

window.buildDbCredsCards = buildDbCredsCards;
window.updateDbCardsAdminUI = updateDbCardsAdminUI;
