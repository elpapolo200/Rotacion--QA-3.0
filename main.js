diff --git a/main.js b/main.js
index 150ebdc20c7dd4a850f8aff35705cbad7d9c953a..10691fd64a2b24e4d77e2d3efca63be1c75fb64f 100644
--- a/main.js
+++ b/main.js
@@ -1,18 +1,14 @@
 import './style.css';
 import './data.js';
 import './ui.js';
 import './patches.js';
 import './claves.js';
 import './team.js';
 import './actions.js';
 import './app.js';
 import './dbcreds.js';
+import { initAuth } from './auth.js';
 
 window.onload = function () {
-  if (window.checkAdmin) window.checkAdmin();
-  if (window.navPeriod) window.navPeriod(0);
-  if (window.navPatchesPeriod) window.navPatchesPeriod(0);
-  if (window.loadClavesUI) window.loadClavesUI();
-  if (window.buildDbCredsCards) window.buildDbCredsCards();
-  if (window.showPage) window.showPage('calendar');
+  initAuth();
 };
