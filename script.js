let tiempoInactividad;

// Mostrar/ocultar formularios
function mostrarLogin() {
  document.getElementById('registro').classList.add('hidden');
  document.getElementById('login').classList.remove('hidden');
}

function mostrarRegistro() {
  document.getElementById('login').classList.add('hidden');
  document.getElementById('registro').classList.remove('hidden');
}

// Función de registro con roles y validación
function validarContraseña(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return regex.test(password);
}

function registrar() {
  const usuario = document.getElementById('reg-usuario').value.trim();
  const correo = document.getElementById('reg-correo').value.trim().toLowerCase();
  const password = document.getElementById('reg-pass').value;
  const rolSeleccionado = document.querySelector('input[name="rol"]:checked');

  // Validación de campos vacíos
  if (!usuario || !correo || !password) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  // Validar correo
  if (!validarCorreo(correo)) {
    alert('Por favor, ingresa un correo electrónico válido.');
    return;
  }

  // Validar contraseña segura
  if (!validarContraseña(password)) {
    alert('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.');
    return;
  }

  // Validar rol
  if (!rolSeleccionado) {
    alert('Por favor, selecciona un rol.');
    return;
  }

  const rol = rolSeleccionado.value;

  // Verificar si el correo ya está registrado
  if (localStorage.getItem(correo)) {
    alert('Ya existe una cuenta registrada con este correo.');
    return;
  }

  // Verificar si la contraseña ya está en uso por otra cuenta
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === 'sesionActiva') continue;

    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && data.password === password) {
        alert('Esa contraseña ya está en uso por otra cuenta. Por favor elige una diferente.');
        return;
      }
    } catch (e) {
      console.warn('Dato inválido en localStorage:', key);
    }
  }

  // Guardar usuario en localStorage
  const usuarioData = {
    usuario,
    correo,
    password,
    rol,
  };

  localStorage.setItem(correo, JSON.stringify(usuarioData));
  alert(`¡Registro exitoso como ${rol}!`);
  mostrarLogin();
}

// Función de inicio de sesión con autenticación por roles
function iniciarSesion() {
  const identificador = document.getElementById('login-correo').value.trim().toLowerCase();
  const password = document.getElementById('login-pass').value;

  let usuarioData = null;
  let correoClave = null;

  // Buscar por correo o nombre de usuario
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key === "sesionActiva") continue;

    try {
      const data = JSON.parse(localStorage.getItem(key));

      if (
        (data.correo && data.correo.toLowerCase() === identificador) ||
        (data.usuario && data.usuario.toLowerCase() === identificador)
      ) {
        usuarioData = data;
        correoClave = data.correo;
        break;
      }
    } catch (e) {
      console.warn("Dato inválido:", key);
    }
  }

  if (!usuarioData) {
    alert('Usuario o correo no registrado.');
    return;
  }

  if (usuarioData.password === password) {
    alert(`Has iniciado sesión correctamente, ${usuarioData.usuario}.`);
    document.getElementById('mensaje-bienvenida').textContent = `¡Bienvenido, ${usuarioData.usuario}!`;
    document.getElementById('login').classList.add('hidden');
    document.getElementById('registro').classList.add('hidden');
    document.getElementById('bienvenida').classList.remove('hidden');
    localStorage.setItem('sesionActiva', correoClave);

    if (usuarioData.rol === "admin") {
      console.log("Acceso como Administrador");
      mostrarCuentasRegistradas();
    } else {
      console.log("Acceso como Usuario Regular");
      mostrarPanelUsuario(usuarioData);  // Aquí se llama a mostrarPanelUsuario cuando el usuario tiene rol "user"
      document.getElementById("lista-cuentas").classList.add("hidden");
    }

    iniciarTemporizadorInactividad();
  } else {
    alert('Contraseña incorrecta.');
  }
}

// Mostrar panel de usuario
function mostrarPanelUsuario(usuario) {
  document.getElementById("registro").classList.add("hidden");
  document.getElementById("login").classList.add("hidden");
  document.getElementById("bienvenida").classList.add("hidden");
  document.getElementById("panel-usuario").classList.remove("hidden");

  document.getElementById("info-nombre").textContent = usuario.usuario;
  document.getElementById("info-correo").textContent = usuario.correo;
  document.getElementById("usuario-nombre").textContent = `Bienvenido, ${usuario.usuario}`;
}

// Función de cierre de sesión
function cerrarSesion() {
  localStorage.removeItem('sesionActiva');
  alert('Sesión cerrada.');
  document.getElementById('bienvenida').classList.add('hidden');
  document.getElementById('login').classList.remove('hidden');
  document.getElementById('login-correo').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('registro').classList.add('hidden');
  document.getElementById("panel-usuario").classList.add("hidden");
}

// Mantener sesión iniciada tras recargar
window.onload = function () {
  localStorage.removeItem('sesionActiva'); //  Forzamos que siempre empiece sin sesión activa

  document.getElementById('registro').classList.add('hidden');
  document.getElementById('bienvenida').classList.add('hidden');
  document.getElementById('login').classList.remove('hidden');

  document.getElementById('login-correo').value = '';
  document.getElementById('login-pass').value = '';
};

// Cierre automático por inactividad
function iniciarTemporizadorInactividad() {
  tiempoInactividad = setTimeout(() => {
    alert('Tu sesión ha expirado por inactividad.');
    cerrarSesion();
  }, 300000); // 5 minutos
}

// Detectar actividad del usuario
document.addEventListener('mousemove', resetearTemporizador);
document.addEventListener('keydown', resetearTemporizador);

function resetearTemporizador() {
  clearTimeout(tiempoInactividad);
  iniciarTemporizadorInactividad();
}

// Función de recuperación de contraseña (simulada)
function recuperarContraseña() {
  const correo = prompt("Ingresa tu correo para recuperar la contraseña:");

  if (!correo) {
    alert("Por favor ingresa un correo.");
    return;
  }

  // Verificar si el correo está registrado
  const usuarioData = localStorage.getItem(correo);
  if (!usuarioData) {
    alert('No hay una cuenta registrada con ese correo.');
    return;
  }

  const data = JSON.parse(usuarioData);

  // Simulamos la "recuperación" de la contraseña
  setTimeout(() => {
    alert(`Te hemos enviado un correo para recuperar tu contraseña. Tu contraseña es: ${data.password}`);
  }, 1500); // Simulamos un retraso de 1.5 segundos
}

// Mostrar/ocultar contraseña
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}


function mostrarCuentasRegistradas() {
  const cuerpoTabla = document.getElementById("cuentas-registradas");
  cuerpoTabla.innerHTML = ""; // Limpiar tabla

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key === "sesionActiva") continue;

    try {
      const datos = JSON.parse(localStorage.getItem(key));
      if (!datos || !datos.usuario || !datos.correo || !datos.rol) continue;

      const fila = document.createElement("tr");

      const celUsuario = document.createElement("td");
      celUsuario.textContent = datos.usuario;

      const celCorreo = document.createElement("td");
      celCorreo.textContent = datos.correo;

      const celRol = document.createElement("td");
      celRol.textContent = datos.rol;

      const celAccion = document.createElement("td");
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.onclick = () => {
        if (confirm(`¿Eliminar la cuenta de ${datos.usuario}?`)) {
          localStorage.removeItem(datos.correo);
          mostrarCuentasRegistradas();
        }
      };
      celAccion.appendChild(btnEliminar);

      fila.appendChild(celUsuario);
      fila.appendChild(celCorreo);
      fila.appendChild(celRol);
      fila.appendChild(celAccion);
      cuerpoTabla.appendChild(fila);
    } catch (e) {
      console.warn("Dato inválido en localStorage:", key);
    }
  }

  document.getElementById("lista-cuentas").classList.remove("hidden");
}


function validarCorreo(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

function verificarCorreo() {
  const correo = document.getElementById('reg-correo').value.trim();
  if (!validarCorreo(correo)) {
    alert('El formato del correo no es válido.');
  }
}


