const API = 'https://dummyjson.com';

// Pantallas
const pantallaLogin = document.getElementById('pantalla_login');
const pantallaPanel = document.getElementById('pantalla_panel');

// Login
const formLogin = document.getElementById('form_login');
const inputUsuario = document.getElementById('usuario');
const inputContrasena = document.getElementById('contrasena');
const errorLogin = document.getElementById('error_login');
const btnEntrar = document.getElementById('btn_entrar');

// Perfil
const perfilFoto = document.getElementById('perfil_foto');
const perfilNombre = document.getElementById('perfil_nombre');
const perfilCorreo = document.getElementById('perfil_correo');
const perfilEdad = document.getElementById('perfil_edad');
const perfilTelefono = document.getElementById('perfil_telefono');
const btnCerrarSesion = document.getElementById('btn_cerrar_sesion');

// Tareas
const estado = document.getElementById('estado');
const listaTareas = document.getElementById('lista_tareas');

// Resumen
const resumenTotal = document.getElementById('total');
const resumenCompletadas = document.getElementById('completadas');
const resumenPendientes = document.getElementById('pendientes');
const resumenPorcentaje = document.getElementById('porcentaje');

let usuario = null;
let tareas = [];

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
        cargarTareas();
    } catch (err) {
        if (err.message === '401') {
            localStorage.removeItem('token');
        } else {
            errorLogin.textContent = `No se pudo cargar tu perfil (${err.message})`;
        }
        mostrarLogin();
    }
}

async function cargarTareas() {
    estado.textContent = 'Cargando tareas...';

    try {
        const { todos } = await traer(`${API}/todos/user/${usuario.id}`);
        tareas = todos;
        estado.textContent = '';
        pintarLista();
    } catch (err) {
        estado.textContent = `No se pudieron cargar las tareas (${err.message})`;
    }
}

function crearItem(tarea) {
    const li = document.createElement('li');

    const casilla = document.createElement('input');
    casilla.type = 'checkbox';
    casilla.checked = tarea.completed;

    const texto = document.createElement('span');
    texto.textContent = tarea.todo;

    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';

    li.appendChild(casilla);
    li.appendChild(texto);
    li.appendChild(btnEliminar);

    return li;
}

function pintarLista() {
    listaTareas.innerHTML = '';

    const items = tareas.map(crearItem);
    items.forEach(li => listaTareas.appendChild(li));

    actualizarResumen();
}

function actualizarResumen() {
    const total = tareas.length;
    const completadas = tareas.reduce((cuenta, tarea) => tarea.completed ? cuenta + 1 : cuenta, 0);

    resumenTotal.textContent = total;
    resumenCompletadas.textContent = completadas;
    resumenPendientes.textContent = total - completadas;
    resumenPorcentaje.textContent = total === 0 ? 0 : (completadas / total * 100).toFixed(0);
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
