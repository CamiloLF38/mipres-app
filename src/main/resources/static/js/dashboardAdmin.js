document.addEventListener('DOMContentLoaded', () => {
    const datosInicioSesion = validarSesionIniciada();
    llamarHelloWorld();

    // Configurar botones de las Cards
    document.getElementById('btn-gestion-mipres').addEventListener('click', mostrarGestionMipres);
    document.getElementById('btn-nuevo-paciente').addEventListener('click', mostrarFormularioPaciente);
});

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

async function llamarHelloWorld() {
    const token = sessionStorage.getItem('token');

    if (!token) {
        alert('No hay sesión activa');
        return;
    }

    try {
        const response = await fetch(serverPath + '/mipres/helloWorld', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.text();

        const helloWorldP = document.getElementById("testHelloWorld");
        helloWorldP.innerText = data;
    } catch (error) {
        
    }
}

// --- GESTION Y BUSQUEDA DE MIPRES ---
async function mostrarGestionMipres() {
    const container = document.getElementById('dynamic-content');
    container.classList.remove('d-none');
    
    container.innerHTML = `
        <h4 class="mb-3">Gestión de MIPRES</h4>
        <div class="input-group mb-4">
            <input type="text" id="search-cedula" class="form-control" placeholder="Cédula del Paciente">
            <button class="btn btn-primary" onclick="buscarPacienteYMipres()">Buscar</button>
        </div>
        <div id="resultado-busqueda"></div>
    `;
}

async function buscarPacienteYMipres() {
    const cedula = document.getElementById('search-cedula').value;
    const token = sessionStorage.getItem('token');

    try {
        // Debes crear este endpoint en tu Controller de Java
        const response = await fetch(`${serverPath}/mipres/buscar-por-paciente/${cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        renderizarTablaMipres(data);
    } catch (error) {
        document.getElementById('resultado-busqueda').innerHTML = `<p class="text-danger">No se encontró el paciente.</p>`;
    }
}

function renderizarTablaMipres(mipresList) {
    let html = `
        <table class="table mt-3">
            <thead>
                <tr>
                    <th>No. MIPRES</th>
                    <th>Medicamento</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>`;
    
    mipresList.forEach(m => {
        html += `
            <tr>
                <td>${m.numeroMipres}</td>
                <td>${m.medicamento}</td>
                <td><span class="badge bg-info">${m.estado}</span></td>
                <td><button class="btn btn-sm btn-outline-warning" onclick="editarMipres(${m.id})">Actualizar</button></td>
            </tr>`;
    });
    
    html += `</tbody></table>`;
    document.getElementById('resultado-busqueda').innerHTML = html;
}

// --- INSERTAR NUEVO PACIENTE ---
function mostrarFormularioPaciente() {
    const container = document.getElementById('dynamic-content');
    container.classList.remove('d-none');
    
    container.innerHTML = `
        <h4 class="mb-3">Registrar Nuevo Paciente</h4>
        <form id="form-nuevo-paciente" onsubmit="guardarPaciente(event)">
            <div class="mb-3">
                <label class="form-label">Nombre Completo</label>
                <input type="text" id="pac-nombre" class="form-control" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Documento de Identidad</label>
                <input type="text" id="pac-documento" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-success">Guardar Paciente</button>
        </form>
    `;
}

async function buscarPaciente() {
    const cedula = document.getElementById('inputBusquedaCedula').value;
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch(`${serverPath}/pacientes/buscar/${cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json(); // Retorna objeto con datos de paciente y su lista de MIPRES
        pintarResultadosPaciente(data);
    } catch (error) {
        alert("Paciente no encontrado");
    }
}

async function guardarNuevoMipres() {
    const nuevoMipres = {
        numeroMipres: document.getElementById('numMipres').value,
        pacienteId: idPacienteSeleccionado, // Obtenido tras la búsqueda
        medicamento: document.getElementById('medicamento').value,
        molecula: document.getElementById('molecula').value,
        cantidadAplicacionesAutorizadas: parseInt(document.getElementById('cantidad').value),
        fechaMaxDireccionamiento: document.getElementById('fechaMax').value
    };

    const response = await fetch(`${serverPath}/mipres`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(nuevoMipres)
    });
    
    if(response.ok) alert("MIPRES registrado con éxito");
}