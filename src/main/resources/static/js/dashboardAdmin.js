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
function mostrarGestionMipres() {
    const container = document.getElementById('dynamic-content');
    container.classList.remove('d-none');

    // Inyectamos la estructura base con los Radio Buttons
    container.innerHTML = `
        <h4 class="mb-4">Gestión de MIPRES</h4>
        <div class="d-flex gap-4 mb-4">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="opcionMipres" id="radioNuevo" value="nuevo">
                <label class="form-check-label" for="radioNuevo">Ingresar nuevo Registro</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="opcionMipres" id="radioConsultar" value="consultar">
                <label class="form-check-label" for="radioConsultar">Consultar Registro Existente</label>
            </div>
        </div>
        <hr>
        <div id="mipres-form-container">
            </div>
        <div id="resultado-busqueda" class="mt-4"></div>
    `;

    // Escuchar cambios en los radio buttons
    document.querySelectorAll('input[name="opcionMipres"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'nuevo') {
                mostrarFormularioNuevoMipres();
            } else {
                mostrarInterfazConsulta();
            }
        });
    });
}

function mostrarInterfazConsulta() {
    const subContainer = document.getElementById('mipres-form-container');
    subContainer.innerHTML = `
        <h5>Consultar Registro</h5>
        <div class="row g-3 align-items-end">
            <div class="col-md-4">
                <label class="form-label">Buscar por:</label>
                <select id="tipo-busqueda" class="form-select">
                    <option value="cedula">Cédula de Paciente</option>
                    <option value="numero">Número de MIPRES</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label">Dato a buscar</label>
                <input type="text" id="valor-busqueda" class="form-control" placeholder="Ingrese el valor...">
            </div>
            <div class="col-md-2">
                <button class="btn btn-primary w-100" onclick="ejecutarBusqueda()">Buscar</button>
            </div>
        </div>
    `;
}

async function ejecutarBusqueda() {
    const tipo = document.getElementById('tipo-busqueda').value;
    const valor = document.getElementById('valor-busqueda').value;
    const token = sessionStorage.getItem('token');

    let url = (tipo === 'cedula')
        ? `${serverPath}/mipres/buscar-por-paciente/${valor}`
        : `${serverPath}/mipres/buscar-por-numero/${valor}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        // Si es por número de MIPRES devuelve un objeto único, lo convertimos a lista para la tabla
        const lista = Array.isArray(data) ? data : [data];
        renderizarTablaMipres(lista);
    } catch (error) {
        document.getElementById('resultado-busqueda').innerHTML =
            `<p class="text-danger">No se encontraron resultados para la búsqueda.</p>`;
    }
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

async function actualizarMipresEnServer(idMipres, event) {
    event.preventDefault();
    const token = sessionStorage.getItem('token');

    const datosActualizados = {
        medicamento: document.getElementById('edit-medicamento').value,
        molecula: document.getElementById('edit-molecula').value,
        cantidadAplicacionesAutorizadas: parseInt(document.getElementById('edit-cantidad').value),
        fechaMaxDireccionamiento: document.getElementById('edit-fechaMax').value,
        estado: document.getElementById('edit-estado').value // Nuevo campo
    };

    try {
        const response = await fetch(`${serverPath}/mipres/${idMipres}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosActualizados)
        });

        if (response.ok) {
            alert("MIPRES actualizado correctamente");
            mostrarGestionMipres();
        }
    } catch (error) {
        alert("Error al conectar con el servidor");
    }
}

async function guardarNuevoMipres(event) {
    event.preventDefault();
    const token = sessionStorage.getItem('token');

    const nuevoMipres = {
        numeroMipres: document.getElementById('num-mipres').value,
        pacienteCedula: document.getElementById('paciente-cedula-input').value,
        medicamento: document.getElementById('med-nombre').value,
        molecula: document.getElementById('med-molecula').value,
        cantidadAplicacionesAutorizadas: parseInt(document.getElementById('med-cantidad').value),
        fechaMaxDireccionamiento: document.getElementById('med-fecha').value
    };

    try {
        const response = await fetch(`${serverPath}/mipres`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nuevoMipres)
        });

        if(response.ok) {
            alert("MIPRES registrado con éxito");
            mostrarFormularioNuevoMipres(); // Reset form
        }
    } catch (error) {
        alert("Error al guardar");
    }
}

function renderizarTablaMipres(mipresList) {
    const resultadoDiv = document.getElementById('resultado-busqueda');

    let html = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mt-3">
                <thead class="table-light">
                    <tr>
                        <th>No. MIPRES</th>
                        <th>Cédula Paciente</th>
                        <th>Medicamento</th>
                        <th>Molécula</th>
                        <th>Cant. Autorizada</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>`;

    mipresList.forEach(m => {
        const cedulaPaciente = m.paciente ? m.paciente.cedula : 'N/A';
        // Convertimos el objeto a string para pasarlo a la función de edición
        const dataString = JSON.stringify(m).replace(/"/g, '&quot;');

        html += `
            <tr>
                <td><span class="fw-bold">${m.numeroMipres}</span></td>
                <td>${cedulaPaciente}</td>
                <td>${m.medicamento}</td>
                <td>${m.molecula}</td>
                <td>${m.cantidadAplicacionesAutorizadas}</td>
                <td><span class="badge bg-info">${m.estado}</span></td>
                <td>
                    <a href="#" class="fw-bold a-estilo-actualizar"
                       onclick="prepararEdicion('${dataString}', event)">Actualizar</a>
                </td>
            </tr>`;
    });

    html += `</tbody></table></div>`;
    resultadoDiv.innerHTML = html;
}

function prepararEdicion(mipresJson, event) {
    if(event) event.preventDefault();
    const mipres = JSON.parse(mipresJson);

    // 1. Dibujamos el formulario (usando tu estructura previa)
    editarMipres(mipres.id);

    // 2. Llenamos los campos con los datos actuales
    document.getElementById('edit-medicamento').value = mipres.medicamento;
    document.getElementById('edit-molecula').value = mipres.molecula;
    document.getElementById('edit-cantidad').value = mipres.cantidadAplicacionesAutorizadas;
    document.getElementById('edit-fechaMax').value = mipres.fechaMaxDireccionamiento;
    document.getElementById('edit-estado').value = mipres.estado;
}

// Mantenemos esta función para renderizar el cascarón del formulario
function editarMipres(idMipres) {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div class="card border-warning mt-3">
            <div class="card-header bg-warning text-dark d-flex justify-content-between">
                <h5 class="mb-0">Actualizar Registro MIPRES</h5>
                <small>ID Interno: ${idMipres}</small>
            </div>
            <div class="card-body">
                <form onsubmit="actualizarMipresEnServer(${idMipres}, event)" class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Medicamento</label>
                        <input type="text" id="edit-medicamento" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Molécula</label>
                        <input type="text" id="edit-molecula" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Cantidad</label>
                        <input type="number" id="edit-cantidad" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Fecha Máxima</label>
                        <input type="date" id="edit-fechaMax" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Estado</label>
                        <select id="edit-estado" class="form-select" required>
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="DIRECCIONADO">DIRECCIONADO</option>
                            <option value="VENCIDO">VENCIDO</option>
                        </select>
                    </div>
                    <div class="col-12 text-end mt-4">
                        <button type="button" class="btn btn-secondary me-2" onclick="mostrarGestionMipres()">Cancelar</button>
                        <button type="submit" class="btn btn-warning px-4">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function mostrarFormularioNuevoMipres() {
    const subContainer = document.getElementById('mipres-form-container');
    const resultadoBusqueda = document.getElementById('resultado-busqueda');

    // Limpiamos cualquier tabla de búsqueda previa para enfocar el formulario
    if (resultadoBusqueda) resultadoBusqueda.innerHTML = "";

    subContainer.innerHTML = `
        <div class="card border-success mt-3">
            <div class="card-header bg-success text-white">
                <h5 class="mb-0">Ingresar Nuevo Registro de MIPRES</h5>
            </div>
            <div class="card-body">
                <form id="form-registro-mipres" class="row g-3" onsubmit="guardarNuevoMipres(event)">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Cédula del Paciente</label>
                        <input type="text" id="paciente-cedula-input" class="form-control"
                               placeholder="Ingrese el número de cédula registrado" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Número de MIPRES</label>
                        <input type="text" id="num-mipres" class="form-control"
                               placeholder="Ej: 202603061234" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Medicamento</label>
                        <input type="text" id="med-nombre" class="form-control"
                               placeholder="Nombre comercial" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Molécula</label>
                        <input type="text" id="med-molecula" class="form-control"
                               placeholder="Componente activo" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Cantidad Autorizada</label>
                        <input type="number" id="med-cantidad" class="form-control"
                               min="1" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Fecha Máxima Direccionamiento</label>
                        <input type="date" id="med-fecha" class="form-control" required>
                    </div>
                    <div class="col-12 text-end mt-4">
                        <button type="button" class="btn btn-secondary me-2" onclick="mostrarGestionMipres()">Cancelar</button>
                        <button type="submit" class="btn btn-success px-4">Guardar MIPRES</button>
                    </div>
                </form>
            </div>
        </div>
    `;
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

async function guardarPaciente(event) {
    event.preventDefault();
    const token = sessionStorage.getItem('token');
    const nombre = document.getElementById('pac-nombre').value;
    const cedula = document.getElementById('pac-documento').value; // Cambiar nombre de variable por claridad

    const nuevoPaciente = {
        nombre: nombre,
        cedula: cedula // ANTES: documento. AHORA: cedula (Consistente con Java)
    };

    try {
        const response = await fetch(`${serverPath}/mipres/paciente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nuevoPaciente)
        });

        if (response.ok) {
            alert("Paciente guardado con éxito");
            document.getElementById('form-nuevo-paciente').reset();
            // Opcional: ocultar el contenedor después de guardar
            // document.getElementById('dynamic-content').classList.add('d-none');
        } else {
            const errorData = await response.json();
            alert("Error: " + (errorData.message || "No se pudo guardar el paciente"));
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Error de conexión con el servidor");
    }
}
