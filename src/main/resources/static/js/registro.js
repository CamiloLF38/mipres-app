document.addEventListener('DOMContentLoaded', () => {
    let datosInicioSesion = validarSesionIniciada();

    if(datosInicioSesion.sesionIniciada && !window.location.pathname.includes('registro')){
        actualizarBarraNavegacion(datosInicioSesion);
    }

    if(datosInicioSesion.sesionIniciada && window.location.pathname.includes('registro')){
        window.location.href = "/index.html";
    }

    if(!datosInicioSesion.sesionIniciada && window.location.pathname.includes('dashboard')){
        window.location.href = "/index.html";
    }

    if(window.location.pathname.includes('registro')){
        // Referencias de UI
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        
        // Botones de intercambio
        const btnGoRegister = document.getElementById('go-to-register');
        const btnGoLogin = document.getElementById('go-to-login');

        // 1. Alternar entre Login y Registro
        btnGoRegister.addEventListener('click', (e) => {
            e.preventDefault();
            cargarFormularioRegistro(loginSection, registerSection);
        });

        btnGoLogin.addEventListener('click', (e) => {
            e.preventDefault();
            cargarFormularioLogin(loginSection, registerSection);
        });

        // 2. Manejo del Login (Llamada al Endpoint)
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await iniciarSesion();
        });

        // 3. Manejo del Registro
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await registrarUsuario();
        });
    }
});

const serverPath = 'http://localhost:8080';
//const serverPath = 'http://192.168.10.22:8080';
function validarSesionIniciada(){
    const token = sessionStorage.getItem('token');
    const datosUsuario = sessionStorage.getItem('datosUsuario');

    if(token !== undefined && token !== null && token !== "" && datosUsuario !== undefined && datosUsuario !== null && datosUsuario !== "" ){
        return {
            sesionIniciada: true,
            token: token,
            datosUsuario: JSON.parse(datosUsuario)
        };
    }
    return {
        sesionIniciada: false
    };
}

function actualizarBarraNavegacion(datosInicioSesion){
    const token = datosInicioSesion.token;
    const datosUsuario = datosInicioSesion.datosUsuario;

    if (!token) return;

    // eliminar login
    const loginItem = document.getElementById('loginItem');
    if (loginItem) {
        loginItem.remove();
    }

    const navList = document.getElementById('navUserSection');

    //LI nombre usuario
    const nombreUsuarioLI = document.createElement('li');
    nombreUsuarioLI.className = 'nav-item';
    nombreUsuarioLI.innerHTML = `
        <a class="nav-link dropdown-toggle fw-bold"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false">
            ${datosUsuario.nombre || 'Usuario'}
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
            <li>
                <button class="dropdown-item" id="btnCerrarSesion">
                    Cerrar sesión
                </button>
            </li>
        </ul>
    `;

    //LI Navegar al inicio
    const navegarInicioLI = document.createElement('li');
    navegarInicioLI.className = 'nav-item';

    const navInicioA = document.createElement('a');
    navInicioA.className = 'nav-link';
    navInicioA.textContent = 'Inicio';
    navInicioA.href = '/index.html';

    navegarInicioLI.appendChild(navInicioA);

    //LI Navegar a dashboard
    const navegarDashboardLI = document.createElement('li');
    navegarDashboardLI.className = 'nav-item';

    const Dashboard = document.createElement('a');
    Dashboard.className = 'nav-link';
    Dashboard.textContent = 'Dashboard';

    if(datosUsuario.rol === 'ADMIN'){
        Dashboard.href = '/admin/dashboard.html';
    }else if(datosUsuario.rol === 'CUIDADOR'){
        Dashboard.href = '/cuidador/dashboard.html';
    }else{
        Dashboard.href = '/paciente/dashboard.html';
    }

    navegarDashboardLI.appendChild(Dashboard);

    navList.appendChild(navegarInicioLI);
    navList.appendChild(navegarDashboardLI);
    navList.appendChild(nombreUsuarioLI);

    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/index.html';
    });
}

function cargarFormularioRegistro(loginSection, registerSection){
    loginSection.classList.add('d-none');
    registerSection.classList.remove('d-none');

}

function cargarFormularioLogin(loginSection, registerSection){
    registerSection.classList.add('d-none');
    loginSection.classList.remove('d-none');
}

async function iniciarSesion() {
    const cedula = document.getElementById('login-cedula').value;
    const pass = document.getElementById('login-pass').value;

    // Aquí iría tu llamada al backend
    let datosLogin = {
        numeroCedula: cedula,
        password: pass
    }

    try {
        const response = await fetch(serverPath+'/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Decimos al servidor que enviamos JSON
            },
            body: JSON.stringify(datosLogin) // Convertimos el objeto JS a texto JSON
        });

        const data = await response.json();

        if(response.ok){
            console.log(response);
            sessionStorage.setItem('token', data.token);
            let datosUsuario = {
                nombre: data.nombre,
                rol: data.rol,
                cedula: data.numeroCedula
            }
            sessionStorage.setItem('datosUsuario', JSON.stringify(datosUsuario));
            
            if(data.rol === 'ADMIN'){
                window.location.href = "/admin/dashboard.html";
            }else if(data.rol === 'CUIDADOR'){
                window.location.href = "/cuidador/dashboard.html";
            }else{
                window.location.href = "/paciente/dashboard.html";
            }
            //window.location.href = "../index.html"; // Regresamos al inicio
        }else{
            alert("ERROR!");
        }
    } catch (error) {
        alert("ERROR!");
    }
    
}

async function registrarUsuario(){
    const nombres = document.getElementById('reg-nombres').value;
    const apellidos = document.getElementById('reg-apellidos').value;
    const cedula = document.getElementById('reg-cedula').value;
    let rolUsuario = document.getElementById('reg-rol').value;
    const contrasena = document.getElementById('reg-pass').value;
    const confirmacionContrasena = document.getElementById('reg-confirmacion-pass').value;

    const errorPass = document.getElementById('error-pass');
    const inputConfirm = document.getElementById('reg-confirmacion-pass');

    // Limpiar estados previos
    errorPass.classList.add('d-none');
    inputConfirm.classList.remove('is-invalid');

    // Validación
    if (contrasena !== confirmacionContrasena) {
        errorPass.classList.remove('d-none');
        inputConfirm.classList.add('is-invalid');
        return;
    }

    if(rolUsuario === 'Cuidador'){
        rolUsuario = 'CUIDADOR'
    }else if(rolUsuario === 'Paciente'){
        rolUsuario = 'PACIENTE'
    }else{
        rolUsuario = 'ADMIN'
    }

    let datosUsuario = {
        nombre: nombres+' '+apellidos,
        numeroCedula: cedula,
        rol: rolUsuario,
        password: contrasena
    }

    console.log(datosUsuario);

    try {
        const response = await fetch(serverPath+'/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Decimos al servidor que enviamos JSON
            },
            body: JSON.stringify(datosUsuario) // Convertimos el objeto JS a texto JSON
        });

        // Manejar la respuesta del servidor
        if (response.ok) {
            alert("¡Registro exitoso en el servidor!");
            window.location.href = "/compartidos/registro.html";
        } else {
            console.error(response);
        }
    } catch (error) {
        console.error("Error registrando usuario:", error);
        alert("Error registrando usuario");
    }
    
}