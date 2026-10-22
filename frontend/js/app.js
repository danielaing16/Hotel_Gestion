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
  const hotelsDot = document.getElementById('hotelsDot');
  const consoleLogs = document.getElementById('consoleLogs');
  const toastShelf = document.getElementById('toastShelf');

  // Elementos de Hotels Service
  const openCreateHotelBtn = document.getElementById('openCreateHotelBtn');
  const seedHotelsBtn = document.getElementById('seedHotelsBtn');
  const refreshHotelsBtn = document.getElementById('refreshHotelsBtn');
  const filterHotelSearch = document.getElementById('filterHotelSearch');
  const filterHotelCity = document.getElementById('filterHotelCity');
  const filterHotelStars = document.getElementById('filterHotelStars');
  const filterPetFriendly = document.getElementById('filterPetFriendly');
  const hotelsGrid = document.getElementById('hotelsGrid');

  // Modales de Hotel
  const hotelDetailModal = document.getElementById('hotelDetailModal');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
  const hotelFormModal = document.getElementById('hotelFormModal');
  const closeFormModalBtn = document.getElementById('closeFormModalBtn');
  const hotelUpsertForm = document.getElementById('hotelUpsertForm');
  const hotelFormTitle = document.getElementById('hotelFormTitle');
  const submitHotelFormBtn = document.getElementById('submitHotelFormBtn');


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

      // Mostrar botón de creación de hotel únicamente a HOTEL_ADMIN
      if (openCreateHotelBtn) {
        openCreateHotelBtn.style.display = role === 'HOTEL_ADMIN' ? 'inline-flex' : 'none';
      }

      loadHotels();
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

  // ==========================================================
  // Hotels Service: Lógica de Catálogo y Administración (RBAC)
  // ==========================================================


  let currentHotelsCache = [];

  async function loadHotels() {
    if (!hotelsGrid) return;

    hotelsGrid.innerHTML = `
      <div class="empty-hotels-box" style="grid-column: 1 / -1;">
        <span>Consultando hoteles en tiempo real vía Gateway...</span>
      </div>
    `;

    const filters = {
      search: filterHotelSearch?.value?.trim() || undefined,
      city: filterHotelCity?.value || undefined,
      stars: filterHotelStars?.value || undefined,
      petFriendly: filterPetFriendly?.checked ? true : undefined,
    };

    try {
      const response = await api.getHotels(filters);
      const hotels = response?.data || [];
      currentHotelsCache = hotels;
      renderHotels(hotels);
    } catch (err) {
      hotelsGrid.innerHTML = `
        <div class="empty-hotels-box" style="grid-column: 1 / -1; border-color: rgba(239, 68, 68, 0.4);">
          <span style="color: #f87171;">⚠️ No se pudo conectar con Hotels Service (puerto 3002)</span>
          <div style="font-size: 0.78rem; color: var(--text-dim);">${err.message}</div>
          <button id="retryHotelsBtn" class="btn-hotel-secondary" style="margin-top: 0.5rem;">Reintentar</button>
        </div>
      `;
      document.getElementById('retryHotelsBtn')?.addEventListener('click', loadHotels);
    }
  }

  function renderHotels(hotels) {
    if (!hotelsGrid) return;

    if (!hotels || hotels.length === 0) {
      hotelsGrid.innerHTML = `
        <div class="empty-hotels-box" style="grid-column: 1 / -1;">
          <span style="font-size: 1.5rem;">🏨</span>
          <span>No se encontraron hoteles con los filtros seleccionados</span>
          <div style="font-size: 0.78rem; color: var(--text-dim);">Prueba cambiando la ciudad o haz clic en "Cargar Demo" para sembrar datos.</div>
        </div>
      `;
      return;
    }

    const currentUser = api.getCurrentUser();
    const isAdmin = currentUser?.role === 'HOTEL_ADMIN';

    hotelsGrid.innerHTML = hotels.map(hotel => {
      const firstImg = (hotel.images && hotel.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
      const starsStr = '⭐'.repeat(Math.max(1, Math.min(5, hotel.stars || 4)));
      const amenitiesPills = (hotel.amenities || []).slice(0, 4).map(a => `<span class="amenity-pill">${a}</span>`).join('');
      const isOwnerOrAdmin = isAdmin; // Administradores hoteleros gestionan sedes

      return `
        <div class="hotel-card" data-hotel-id="${hotel.id}">
          <div class="hotel-img-banner">
            <img src="${firstImg}" alt="${hotel.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'">
            <div class="badge-stars">${starsStr}</div>
            <div class="badge-city">${hotel.city || 'Colombia'}</div>
          </div>

          <div class="hotel-card-content">
            <div class="hotel-card-name">${hotel.name}</div>
            <div class="hotel-card-location">
              <span>📍</span> <span>${hotel.address || hotel.city}</span>
            </div>
            <p class="hotel-card-desc">${hotel.description || 'Sin descripción disponible'}</p>

            <div class="hotel-amenities-tags">
              ${amenitiesPills}
              ${hotel.petFriendly ? '<span class="amenity-pill" style="color: #34d399; border-color: rgba(52, 211, 153, 0.3);">🐾 Pet-friendly</span>' : ''}
            </div>

            <div class="hotel-card-footer">
              <div class="hotel-times-meta">
                In: ${hotel.checkInTime || '15:00'} | Out: ${hotel.checkOutTime || '11:00'}
              </div>

              <div class="hotel-card-btns">
                <button class="btn-card-sm primary view-hotel-btn" data-id="${hotel.id}">
                  Detalle
                </button>
                ${isOwnerOrAdmin ? `
                  <button class="btn-card-sm edit-hotel-btn" data-id="${hotel.id}" style="background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;">
                    Editar
                  </button>
                  <button class="btn-card-sm danger delete-hotel-btn" data-id="${hotel.id}" data-name="${hotel.name}">
                    ✕
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Asignar eventos de botones de tarjeta
    document.querySelectorAll('.view-hotel-btn').forEach(btn => {
      btn.addEventListener('click', () => openHotelDetail(btn.dataset.id));
    });

    document.querySelectorAll('.edit-hotel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hotel = currentHotelsCache.find(h => h.id === btn.dataset.id);
        if (hotel) openHotelForm(hotel);
      });
    });

    document.querySelectorAll('.delete-hotel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleDeleteHotel(btn.dataset.id, btn.dataset.name);
      });
    });
  }

  // Visualizar Detalle de Hotel
  async function openHotelDetail(hotelId) {
    try {
      const hotel = await api.getHotelById(hotelId);
      if (!hotel) return;

      document.getElementById('detailTitle').textContent = hotel.name;
      document.getElementById('detailAddress').textContent = `📍 ${hotel.address}, ${hotel.city}, ${hotel.country || 'Colombia'}`;
      document.getElementById('detailDescription').textContent = hotel.description;
      document.getElementById('detailStars').textContent = '⭐'.repeat(hotel.stars || 5);
      document.getElementById('detailCity').textContent = hotel.city;
      
      const firstImg = (hotel.images && hotel.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
      document.getElementById('detailImg').src = firstImg;

      const amenitiesBox = document.getElementById('detailAmenities');
      amenitiesBox.innerHTML = (hotel.amenities || []).map(a => `<span class="amenity-pill">${a}</span>`).join('');

      document.getElementById('detailCheckIn').textContent = hotel.checkInTime || '15:00';
      document.getElementById('detailCheckOut').textContent = hotel.checkOutTime || '11:00';
      document.getElementById('detailPetFriendly').innerHTML = hotel.petFriendly 
        ? '<span style="color: #34d399;">✅ Sí, admite mascotas</span>' 
        : '<span style="color: #94a3b8;">❌ No admite mascotas</span>';
      document.getElementById('detailContact').textContent = `📞 ${hotel.phone || 'N/A'} | ✉️ ${hotel.email || 'N/A'}`;
      document.getElementById('detailCancellation').textContent = hotel.cancellationPolicy || 'Cancelación estándar.';

      hotelDetailModal.style.display = 'flex';
    } catch (err) {
      showToast(`Error al consultar detalle del hotel: ${err.message}`, 'error');
    }
  }

  // Abrir Formulario Crear / Editar Hotel (Solo HOTEL_ADMIN)
  function openHotelForm(hotel = null) {
    hotelUpsertForm.reset();

    if (hotel) {
      hotelFormTitle.textContent = '✏️ Editar Sede Hotelera';
      document.getElementById('formHotelId').value = hotel.id;
      document.getElementById('formHotelName').value = hotel.name || '';
      document.getElementById('formHotelDesc').value = hotel.description || '';
      document.getElementById('formHotelStars').value = hotel.stars || '4';
      document.getElementById('formHotelCity').value = hotel.city || '';
      document.getElementById('formHotelAddress').value = hotel.address || '';
      document.getElementById('formHotelCountry').value = hotel.country || 'Colombia';
      document.getElementById('formHotelPhone').value = hotel.phone || '';
      document.getElementById('formHotelEmail').value = hotel.email || '';
      document.getElementById('formHotelImages').value = (hotel.images || []).join(', ');
      document.getElementById('formHotelAmenities').value = (hotel.amenities || []).join(', ');
      document.getElementById('formHotelCheckIn').value = hotel.checkInTime || '15:00';
      document.getElementById('formHotelCheckOut').value = hotel.checkOutTime || '11:00';
      document.getElementById('formHotelCancel').value = hotel.cancellationPolicy || '';
      document.getElementById('formHotelPetFriendly').checked = !!hotel.petFriendly;
    } else {
      hotelFormTitle.textContent = '🏢 Registrar Nueva Sede Hotelera';
      document.getElementById('formHotelId').value = '';
    }

    hotelFormModal.style.display = 'flex';
  }

  // Guardar Hotel (POST / PUT)
  hotelUpsertForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('formHotelId').value;
    const name = document.getElementById('formHotelName').value.trim();
    const description = document.getElementById('formHotelDesc').value.trim();
    const stars = parseInt(document.getElementById('formHotelStars').value, 10);
    const city = document.getElementById('formHotelCity').value.trim();
    const address = document.getElementById('formHotelAddress').value.trim();
    const country = document.getElementById('formHotelCountry').value.trim() || 'Colombia';
    const phone = document.getElementById('formHotelPhone').value.trim();
    const email = document.getElementById('formHotelEmail').value.trim();
    
    const rawImages = document.getElementById('formHotelImages').value.trim();
    const images = rawImages ? rawImages.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    const rawAmenities = document.getElementById('formHotelAmenities').value.trim();
    const amenities = rawAmenities ? rawAmenities.split(',').map(s => s.trim()).filter(Boolean) : ['WiFi', 'Piscina'];

    const checkInTime = document.getElementById('formHotelCheckIn').value.trim() || '15:00';
    const checkOutTime = document.getElementById('formHotelCheckOut').value.trim() || '11:00';
    const cancellationPolicy = document.getElementById('formHotelCancel').value.trim();
    const petFriendly = document.getElementById('formHotelPetFriendly').checked;

    const payload = {
      name,
      description,
      stars,
      city,
      address,
      country,
      phone,
      email,
      images,
      amenities,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      petFriendly,
    };

    try {
      submitHotelFormBtn.disabled = true;
      submitHotelFormBtn.innerHTML = '<span>GUARDANDO EN POSTGRESQL...</span>';

      if (id) {
        await api.updateHotel(id, payload);
        showToast(`Hotel '${name}' actualizado con éxito`, 'success');
      } else {
        await api.createHotel(payload);
        showToast(`Hotel '${name}' registrado y publicado exitosamente`, 'success');
      }

      hotelFormModal.style.display = 'none';
      await loadHotels();
    } catch (err) {
      showToast(err.message || 'Error al persistir hotel', 'error');
    } finally {
      submitHotelFormBtn.disabled = false;
      submitHotelFormBtn.innerHTML = '<span>GUARDAR HOTEL</span>';
    }
  });

  // Desactivar Hotel
  async function handleDeleteHotel(id, name) {
    if (!confirm(`¿Estás seguro de desactivar el hotel "${name}"?`)) return;

    try {
      await api.deleteHotel(id);
      showToast(`Hotel "${name}" desactivado exitosamente`, 'info');
      await loadHotels();
    } catch (err) {
      showToast(err.message || 'Error al desactivar hotel', 'error');
    }
  }

  // Botones y Filtros de Hotels
  openCreateHotelBtn?.addEventListener('click', () => openHotelForm(null));
  
  seedHotelsBtn?.addEventListener('click', async () => {
    try {
      showToast('Insertando catálogo de hoteles demo...', 'info');
      const res = await api.seedHotels();
      showToast(res.message || 'Semilla ejecutada con éxito', 'success');
      await loadHotels();
    } catch (err) {
      showToast(err.message || 'Error al ejecutar seed', 'error');
    }
  });

  refreshHotelsBtn?.addEventListener('click', () => {
    loadHotels();
    showToast('Catálogo de hoteles actualizado', 'info');
  });

  // Cerrar Modales
  closeDetailModalBtn?.addEventListener('click', () => {
    hotelDetailModal.style.display = 'none';
  });

  closeFormModalBtn?.addEventListener('click', () => {
    hotelFormModal.style.display = 'none';
  });

  hotelDetailModal?.addEventListener('click', (e) => {
    if (e.target === hotelDetailModal) hotelDetailModal.style.display = 'none';
  });

  hotelFormModal?.addEventListener('click', (e) => {
    if (e.target === hotelFormModal) hotelFormModal.style.display = 'none';
  });

  // Filtros interactivos con debounce
  let filterTimer = null;
  function triggerFilterDebounce() {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(loadHotels, 350);
  }

  filterHotelSearch?.addEventListener('input', triggerFilterDebounce);
  filterHotelCity?.addEventListener('change', loadHotels);
  filterHotelStars?.addEventListener('change', loadHotels);
  filterPetFriendly?.addEventListener('change', loadHotels);

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

      const hotels = services?.services?.find(s => s.service === 'hotels-service');
      if (hotels && hotels.status === 'ONLINE') {
        hotelsDot.className = 'dot online';
      } else {
        hotelsDot.className = 'dot offline';
      }
    } catch {
      authDot.className = 'dot offline';
      hotelsDot.className = 'dot offline';
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

