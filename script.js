const API = 'https://dummyjson.com';

const pantallaLogin = document.getElementById('pantalla_login');
const pantallaPanel = document.getElementById('pantalla_panel');
const formLogin = document.getElementById('form_login');
const inputUsuario = document.getElementById('usuario');
const inputContrasena = document.getElementById('contrasena');
const errorLogin = document.getElementById('error_login');
const btnEntrar = document.getElementById('btn_entrar');
const perfilFoto = document.getElementById('perfil_foto');
const perfilNombre = document.getElementById('perfil_nombre');
const perfilCorreo = document.getElementById('perfil_correo');
const perfilEdad = document.getElementById('perfil_edad');
const perfilTelefono = document.getElementById('perfil_telefono');
const btnCerrarSesion = document.getElementById('btn_cerrar_sesion');

let usuario = null;

async function traer(url, opciones = {}) {
    const res = await fetch(url, opciones);

    if (!res.ok) throw new Error(res.status);

    return res.json();
}

function mostrarLogin() {
    pantallaLogin.hidden = false;
    pantallaPanel.hidden = true;
}

function mostrarPanel() {
    pantallaLogin.hidden = true;
    pantallaPanel.hidden = false;
}

async function cargarPanel() {
    const token = localStorage.getItem('token');

    try {
        usuario = await traer(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { firstName, lastName, email, age, phone, image } = usuario;
        perfilFoto.src = image;
        perfilNombre.textContent = `${firstName} ${lastName}`;
        perfilCorreo.textContent = email;
        perfilEdad.textContent = age;
        perfilTelefono.textContent = phone;

        mostrarPanel();
    } catch (err) {
        if (err.message === '401') {
            localStorage.removeItem('token');
        } else {
            errorLogin.textContent = `No se pudo cargar tu perfil (${err.message})`;
        }
        mostrarLogin();
    }
}

formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault(); // que el form no recargue la pagina

    errorLogin.textContent = '';
    btnEntrar.disabled = true;
    btnEntrar.textContent = 'Entrando…';

    try {
        const { accessToken } = await traer(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: inputUsuario.value,
                password: inputContrasena.value
            })
        });

        localStorage.setItem('token', accessToken);
        await cargarPanel();
    } catch (err) {
        errorLogin.textContent = err.message === '400'
            ? 'Usuario o contraseña incorrectos'
            : `No se pudo iniciar sesion (${err.message})`;
    } finally {
        btnEntrar.disabled = false;
        btnEntrar.textContent = 'Iniciar sesion';
    }
});

btnCerrarSesion.addEventListener('click', () => {
    localStorage.removeItem('token');
    usuario = null;
    inputContrasena.value = '';
    mostrarLogin();
});

if (localStorage.getItem('token')) {
    cargarPanel();
}
