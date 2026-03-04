diff --git a/auth.js b/auth.js
new file mode 100644
index 0000000000000000000000000000000000000000..003ed221e8758eb08acb1aae6d97f2f2c7300df6
--- /dev/null
+++ b/auth.js
@@ -0,0 +1,213 @@
+const firebaseConfig = {
+    apiKey: 'REEMPLAZAR_API_KEY',
+    authDomain: 'REEMPLAZAR_AUTH_DOMAIN',
+    projectId: 'REEMPLAZAR_PROJECT_ID',
+    storageBucket: 'REEMPLAZAR_STORAGE_BUCKET',
+    messagingSenderId: 'REEMPLAZAR_MESSAGING_SENDER_ID',
+    appId: 'REEMPLAZAR_APP_ID'
+};
+
+const LOCAL_USERS_KEY = 'qa_local_users';
+const LOCAL_SESSION_KEY = 'qa_local_session';
+
+let authMode = 'login';
+let authProvider = 'local';
+
+function hasFirebaseConfig() {
+    return Object.values(firebaseConfig).every(v => v && !String(v).startsWith('REEMPLAZAR_'));
+}
+
+function getLocalUsers() {
+    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
+}
+
+function saveLocalUsers(users) {
+    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
+}
+
+function getLocalSession() {
+    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
+}
+
+function saveLocalSession(user) {
+    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
+}
+
+function clearLocalSession() {
+    localStorage.removeItem(LOCAL_SESSION_KEY);
+}
+
+function setAuthLoading(isLoading) {
+    const btn = document.getElementById('authSubmitBtn');
+    if (!btn) return;
+    btn.disabled = isLoading;
+    btn.innerHTML = isLoading
+        ? '<i class="fas fa-spinner fa-spin"></i> Procesando...'
+        : (authMode === 'login'
+            ? '<i class="fas fa-right-to-bracket"></i> Entrar'
+            : '<i class="fas fa-user-plus"></i> Crear cuenta');
+}
+
+function updateAuthTexts() {
+    const title = document.getElementById('authTitle');
+    const subtitle = document.getElementById('authSubtitle');
+    const switchBtn = document.getElementById('authSwitchBtn');
+    const nameGroup = document.getElementById('authNameGroup');
+    if (!title || !subtitle || !switchBtn || !nameGroup) return;
+
+    const isRegister = authMode === 'register';
+    title.textContent = isRegister ? 'Crear cuenta' : 'Iniciar sesión';
+
+    if (authProvider === 'firebase') {
+        subtitle.textContent = isRegister
+            ? 'Regístrate para ingresar a QATOOLS (Firebase).'
+            : 'Usa tu cuenta para entrar al site (Firebase).';
+    } else {
+        subtitle.textContent = isRegister
+            ? 'Regístrate para ingresar a QATOOLS (modo local).'
+            : 'Inicia sesión para entrar al site (modo local).';
+    }
+
+    switchBtn.textContent = isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
+    nameGroup.classList.toggle('hidden', !isRegister);
+    setAuthLoading(false);
+}
+
+function showAppForUser(user) {
+    const gate = document.getElementById('authGate');
+    const app = document.getElementById('mainApp');
+    const label = document.getElementById('authUserLabel');
+    const loader = document.getElementById('loader');
+
+    if (label) label.textContent = user.displayName || user.nombre || user.email || 'Usuario';
+    if (gate) gate.classList.add('hidden');
+    if (app) app.classList.remove('app-hidden');
+    if (loader) loader.style.display = 'none';
+
+    if (window.checkAdmin) window.checkAdmin();
+    if (window.navPeriod) window.navPeriod(0);
+    if (window.navPatchesPeriod) window.navPatchesPeriod(0);
+    if (window.loadClavesUI) window.loadClavesUI();
+    if (window.buildDbCredsCards) window.buildDbCredsCards();
+    if (window.showPage) window.showPage('calendar');
+}
+
+function showAuthGate() {
+    const gate = document.getElementById('authGate');
+    const app = document.getElementById('mainApp');
+    const loader = document.getElementById('loader');
+    if (gate) gate.classList.remove('hidden');
+    if (app) app.classList.add('app-hidden');
+    if (loader) loader.style.display = 'none';
+}
+
+async function submitWithFirebase({ email, password, name }) {
+    if (authMode === 'register') {
+        const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
+        await cred.user.updateProfile({ displayName: name });
+        await firebase.firestore().collection('usuarios').doc(cred.user.uid).set({
+            uid: cred.user.uid,
+            nombre: name,
+            email: cred.user.email,
+            creadoEn: firebase.firestore.FieldValue.serverTimestamp()
+        });
+        window.showToast('✅ Cuenta creada correctamente en Firebase.');
+    } else {
+        await firebase.auth().signInWithEmailAndPassword(email, password);
+        window.showToast('✅ Bienvenido a QATOOLS.');
+    }
+}
+
+function submitWithLocal({ email, password, name }) {
+    const users = getLocalUsers();
+
+    if (authMode === 'register') {
+        const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
+        if (exists) throw new Error('LOCAL_EMAIL_EXISTS');
+
+        const newUser = {
+            id: `local_${Date.now()}`,
+            email,
+            password,
+            nombre: name,
+            displayName: name
+        };
+        users.push(newUser);
+        saveLocalUsers(users);
+        saveLocalSession(newUser);
+        showAppForUser(newUser);
+        window.showToast('✅ Cuenta creada (modo local).');
+        return;
+    }
+
+    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
+    if (!user) throw new Error('LOCAL_INVALID_CREDENTIALS');
+
+    saveLocalSession(user);
+    showAppForUser(user);
+    window.showToast('✅ Bienvenido a QATOOLS (modo local).');
+}
+
+window.toggleAuthMode = function () {
+    authMode = authMode === 'login' ? 'register' : 'login';
+    updateAuthTexts();
+}
+
+window.submitAuthForm = async function () {
+    const email = document.getElementById('authEmail')?.value.trim();
+    const password = document.getElementById('authPassword')?.value;
+    const name = document.getElementById('authName')?.value.trim();
+
+    if (!email || !password) return window.showToast('Completa correo y contraseña.', 'error');
+    if (authMode === 'register' && !name) return window.showToast('Ingresa tu nombre.', 'error');
+
+    try {
+        setAuthLoading(true);
+
+        if (authProvider === 'firebase') {
+            await submitWithFirebase({ email, password, name });
+        } else {
+            submitWithLocal({ email, password, name });
+        }
+    } catch (error) {
+        const msg = error?.code === 'auth/email-already-in-use' || error?.message === 'LOCAL_EMAIL_EXISTS' ? 'Ese correo ya está registrado.'
+            : error?.code === 'auth/wrong-password' || error?.code === 'auth/user-not-found' || error?.message === 'LOCAL_INVALID_CREDENTIALS' ? 'Credenciales inválidas.'
+                : error?.code === 'auth/weak-password' ? 'La contraseña debe tener al menos 6 caracteres.'
+                    : 'No se pudo completar la autenticación.';
+        window.showToast(msg, 'error');
+    } finally {
+        setAuthLoading(false);
+    }
+}
+
+window.logoutUser = async function () {
+    if (authProvider === 'firebase' && window.firebase?.auth) {
+        await firebase.auth().signOut();
+    } else {
+        clearLocalSession();
+        showAuthGate();
+    }
+
+    window.showToast('Sesión cerrada.');
+}
+
+export function initAuth() {
+    authProvider = (window.firebase?.auth && hasFirebaseConfig()) ? 'firebase' : 'local';
+    updateAuthTexts();
+
+    if (authProvider === 'firebase') {
+        if (!window.firebase.apps.length) firebase.initializeApp(firebaseConfig);
+
+        firebase.auth().onAuthStateChanged((user) => {
+            if (user) showAppForUser(user);
+            else showAuthGate();
+        });
+        return;
+    }
+
+    const localUser = getLocalSession();
+    if (localUser) showAppForUser(localUser);
+    else showAuthGate();
+
+    window.showToast('Modo local activo. Configura Firebase en auth.js para guardar usuarios en la nube.', 'error');
+}
