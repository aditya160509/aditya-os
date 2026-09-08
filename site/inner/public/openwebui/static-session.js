/* Static-site session for the Open WebUI frontend: the Python backend is not
   present, so seed the token the app looks for before boot. The outer Express
   server answers /api/* with canned config and an offline user. */
try {
  if (!localStorage.getItem('token')) localStorage.setItem('token', 'static');
  localStorage.setItem('locale', localStorage.getItem('locale') || 'en-US');
} catch (e) {}
