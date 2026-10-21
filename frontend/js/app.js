// Controlador de la Interfaz Gráfica (Estilo Moderno Travel Glassmorphism)
document.addEventListener('DOMContentLoaded', () => {
  const api = window.apiClient;

  // Contenedores Principales
  const authCanvas = document.getElementById('authCanvas');
  const dashboardCanvas = document.getElementById('dashboardCanvas');
  const loginFormView = document.getElementById('loginFormView');
  const registerFormView = document.getElementById('registerFormView');

  // Alternadores de formulario
  const goToRegisterLink = document.getElementById('goToRegisterLink');
  const goToLoginLink = document.getElementById('goToLoginLink');
  const homeCircleBtn = document.getElementById('homeCircleBtn');

  // Formularios
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const submitLoginBtn = document.getElementById('submitLoginBtn');
  const submitRegBtn = document.getElementById('submitRegBtn');

  // Botones de Relleno Rápido & Demo
  const fillGuestBtn = document.getElementById('fillGuestBtn');
  const fillAdminBtn = document.getElementById('fillAdminBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const forgotPassLink = document.getElementById('forgotPassLink');
  const pingStatusBtn = document.getElementById('pingStatusBtn');

  // Dashboard & Sesión
  const dashUserName = document.getElementById('dashUserName');
  const dashUserEmail = document.getElementById('dashUserEmail');
  const dashRoleBadge = document.getElementById('dashRoleBadge');
  const dashUserId = document.getElementById('dashUserId');
  const dashJwtToken = document.getElementById('dashJwtToken');
  const logoutBtn = document.getElementById('logoutBtn');
  const testRbacBtn = document.getElementById('testRbacBtn');
  const rbacFeedback = document.getElementById('rbacFeedback');

  // Indicadores & Logs
  const gatewayDot = document.getElementById('gatewayDot');
  const authDot = document.getElementById('authDot');
  const consoleLogs = document.getElementById('consoleLogs');
  const toastShelf = document.getElementById('toastShelf');

  // Sistema de Notificaciones Toast
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '🛑';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastShelf.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Consola de Tráfico HTTP en Tiempo Real
  api.onLog((log) => {
    const entry = document.createElement('div');
    const statusType = log.status >= 200 && log.status < 300 ? 'success' : (log.status >= 400 ? 'error' : 'info');
    entry.className = `console-entry ${statusType}`;
    
    entry.innerHTML = `
      <span>[${log.timestamp}]</span>
      <strong>${log.method}</strong>
      <span>${log.endpoint}</span>
      <span style="margin-left: auto;">${log.status || 'ERR'} (${log.durationMs}ms)</span>
    `;
    
    consoleLogs.prepend(entry);
    if (consoleLogs.children.length > 25) {
      consoleLogs.removeChild(consoleLogs.lastChild);
    }
  });

  // Alternar entre Login y Registro
  goToRegisterLink?.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormView.style.display = 'none';
    registerFormView.style.display = 'block';
  });

  goToLoginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    registerFormView.style.display = 'none';
    loginFormView.style.display = 'block';
  });

  homeCircleBtn?.addEventListener('click', () => {
    registerFormView.style.display = 'none';
    loginFormView.style.display = 'block';
    showToast('Vista de acceso restablecida', 'info');
  });

  // Botones de Relleno Rápido para Presentación
  fillGuestBtn?.addEventListener('click', () => {
    document.getElementById('loginEmail').value = 'carlos.huesped@hotel.com';
    document.getElementById('loginPassword').value = 'Password123!';
    showToast('Credenciales de Huésped cargadas', 'info');
  });

  fillAdminBtn?.addEventListener('click', () => {
    document.getElementById('loginEmail').value = 'admin.hotel@hotel.com';
    document.getElementById('loginPassword').value = 'AdminSecret2026!';
    showToast('Credenciales de Administrador cargadas', 'info');
  });

  googleLoginBtn?.addEventListener('click', () => {
    showToast('OAuth2 Google simulado para el microservicio de Auth', 'info');
  });

  forgotPassLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Recuperación por correo planificada en Notifications Service', 'info');
  });

  pingStatusBtn?.addEventListener('click', () => {
    checkSystemHealth(true);
  });

  // Sincronización de Vista de Sesión
  function refreshSessionView() {
    const token = api.getToken();
    const user = api.getCurrentUser();

    if (token && user) {
      authCanvas.style.display = 'none';
      dashboardCanvas.classList.add('active');

      dashUserName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Huésped';
      dashUserEmail.textContent = user.email || 'correo@hotel.com';
      dashUserId.textContent = user.id || 'N/A';
      dashJwtToken.textContent = token;

      const role = user.role || 'GUEST';
      dashRoleBadge.textContent = role;
      dashRoleBadge.className = `dash-badge ${role.toLowerCase()}`;
    } else {
      authCanvas.style.display = 'flex';
      dashboardCanvas.classList.remove('active');
      loginFormView.style.display = 'block';
      registerFormView.style.display = 'none';
    }
  }

  // Envío de Formulario de Inicio de Sesión
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      submitLoginBtn.disabled = true;
      submitLoginBtn.innerHTML = '<span>VERIFICANDO...</span>';

      const response = await api.login(email, password);
      showToast(`¡Bienvenido, ${response.user?.firstName || 'Usuario'}!`, 'success');
      refreshSessionView();
    } catch (err) {
      showToast(err.message || 'Error al iniciar sesión', 'error');
    } finally {
      submitLoginBtn.disabled = false;
      submitLoginBtn.innerHTML = '<span>INICIAR SESIÓN</span>';
    }
  });

  // Envío de Formulario de Registro
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;

    try {
      submitRegBtn.disabled = true;
      submitRegBtn.innerHTML = '<span>REGISTRANDO...</span>';

      const response = await api.register({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        role,
        password,
      });

      showToast('¡Cuenta creada con éxito! Iniciando sesión...', 'success');
      api.saveSession(response.accessToken, response.user);
      refreshSessionView();
    } catch (err) {
      showToast(err.message || 'Error al registrar', 'error');
    } finally {
      submitRegBtn.disabled = false;
      submitRegBtn.innerHTML = '<span>REGISTRARSE</span>';
    }
  });

  // Cerrar Sesión
  logoutBtn?.addEventListener('click', () => {
    api.clearSession();
    showToast('Sesión finalizada', 'info');
    refreshSessionView();
  });

  // Prueba de Permisos RBAC
  testRbacBtn?.addEventListener('click', async () => {
    rbacFeedback.style.display = 'block';
    rbacFeedback.innerHTML = '<span style="color: #38bdf8;">Consultando GET /api/auth/admin-only vía Gateway...</span>';

    try {
      const res = await api.testAdminOnly();
      rbacFeedback.innerHTML = `
        <div style="color: #34d399; font-weight: 700; margin-bottom: 0.35rem;">
          ✅ [200 OK - AUTORIZADO COMO HOTEL_ADMIN]
        </div>
        <pre style="font-size: 0.76rem; color: #e2e8f0;">${JSON.stringify(res, null, 2)}</pre>
      `;
      showToast('Acceso autorizado como Administrador', 'success');
    } catch (err) {
      rbacFeedback.innerHTML = `
        <div style="color: #f87171; font-weight: 700; margin-bottom: 0.35rem;">
          🛑 [403 FORBIDDEN - DENEGADO POR ROLES GUARD]
        </div>
        <div style="font-size: 0.8rem; color: #fecdd3;">${err.message}</div>
        <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.4rem;">
          * El token actual no tiene el rol HOTEL_ADMIN requerido.
        </div>
      `;
      showToast('Acceso denegado: Se requiere rol HOTEL_ADMIN', 'error');
    }
  });

  // Monitoreo de Salud de Microservicios
  async function checkSystemHealth(manual = false) {
    try {
      await api.checkGatewayHealth();
      gatewayDot.className = 'dot online';
    } catch {
      gatewayDot.className = 'dot offline';
    }

    try {
      const services = await api.checkServicesHealth();
      const auth = services?.services?.find(s => s.service === 'auth-service');
      if (auth && auth.status === 'ONLINE') {
        authDot.className = 'dot online';
      } else {
        authDot.className = 'dot offline';
      }
    } catch {
      authDot.className = 'dot offline';
    }

    if (manual) {
      showToast('Estado de microservicios actualizado', 'info');
    }
  }

  // Inicialización
  refreshSessionView();
  checkSystemHealth();
  setInterval(checkSystemHealth, 9000);
});
