document.addEventListener('DOMContentLoaded', () => {
    const datosInicioSesion = validarSesionIniciada();
    modificarNombreSaludo(datosInicioSesion);

    // Configurar botones de las Cards
    document.getElementById('btn-nuevo-paciente').addEventListener('click', mostrarMenuPacientesCuidador);
    document.getElementById('btn-vencimientos-pacientes').addEventListener('click', mostrarProximosVencimientos);
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

async function modificarNombreSaludo(datosInicioSesion) {
    const nombreUsuario = datosInicioSesion.datosUsuario.nombre;
    document.getElementById('sauldo-usuario-dashboard').innerText = "Hola "+nombreUsuario+",";

}

function mostrarMenuPacientesCuidador() {
    const container = document.getElementById('dynamic-content');
    container.classList.remove('d-none');

    container.innerHTML = `
        <div class="p-3">
            <h4>Gestión de Mis Pacientes</h4>
            <div class="d-flex gap-4 my-3">
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="opcionPac" id="optConsultar" value="CONSULTAR" checked>
                    <label class="form-check-label" for="optConsultar">Consultar mis pacientes</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="opcionPac" id="optRegistrar" value="REGISTRAR">
                    <label class="form-check-label" for="optRegistrar">Registrar paciente</label>
                </div>
            </div>
            <hr>
            <div id="sub-seccion-pacientes"></div>
        </div>
    `;

    // Listener para cambiar entre sub-vistas
    document.querySelectorAll('input[name="opcionPac"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === "CONSULTAR") consultarMisPacientes();
            else mostrarFormularioRegistroPaciente();
        });
    });

    // Carga inicial
    consultarMisPacientes();
}

async function consultarMisPacientes() {
    const subContainer = document.getElementById('sub-seccion-pacientes');
    const datosUser = JSON.parse(sessionStorage.getItem('datosUsuario'));
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch(`${serverPath}/mipres/pacientes-por-cuidador/${datosUser.cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pacientes = await response.json();

        if (pacientes.length === 0) {
            subContainer.innerHTML = `<div class="alert alert-info">No tienes pacientes asociados actualmente.</div>`;
            return;
        }

        let html = `
            <table class="table table-hover mt-3">
                <thead>
                    <tr>
                        <th>Cédula</th>
                        <th>Nombre</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>`;

        pacientes.forEach(p => {
            html += `
                <tr>
                    <td>${p.cedula}</td>
                    <td>${p.nombre}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="verMipresDePaciente('${p.cedula}')">Consultar MIPRES</button>
                        <button class="btn btn-sm btn-danger" onclick="desasociarPaciente(${p.id})">Desasociar</button>
                    </td>
                </tr>`;
        });

        html += `</tbody></table>`;
        subContainer.innerHTML = html;
    } catch (e) {
        subContainer.innerHTML = "Error al cargar pacientes.";
    }
}

async function desasociarPaciente(idPaciente) {
    if (!confirm("¿Seguro que deseas desasociar a este paciente? Perderás acceso a sus datos.")) return;

    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch(`${serverPath}/mipres/desasociar-paciente/${idPaciente}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Paciente desasociado correctamente");
            consultarMisPacientes();
        }
    } catch (e) {
        alert("Error al desasociar");
    }
}

async function verMipresDePaciente(cedula) {
    const subContainer = document.getElementById('sub-seccion-pacientes');
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch(`${serverPath}/mipres/buscar-por-paciente/${cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const mipresList = await response.json();

        let html = `<button class="btn btn-secondary btn-sm mb-3" onclick="consultarMisPacientes()">← Volver</button>
                    <h5>Historial MIPRES - Paciente: ${cedula}</h5>`;

        if (mipresList.length === 0) {
            html += `<div class="alert alert-warning">No hay registros para este paciente.</div>`;
        } else {
            html += `<div class="list-group">`;
            mipresList.forEach(m => {
                html += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1 fw-bold">${m.medicamento}</h6>
                            <span class="badge bg-primary">${m.estado}</span>
                        </div>
                        <p class="mb-1 text-muted small">No. MIPRES: ${m.numeroMipres}</p>
                        <small class="text-danger">📅 Vence el: <strong>${m.fechaMaxDireccionamiento}</strong></small>
                    </div>`;
            });
            html += `</div>`;
        }
        subContainer.innerHTML = html;
    } catch (e) {
        alert("Error al consultar detalles.");
    }
}

function mostrarFormularioRegistroPaciente() {
    const subContainer = document.getElementById('sub-seccion-pacientes');

    subContainer.innerHTML = `
        <div class="card mt-3 border-primary">
            <div class="card-body">
                <h5>Registrar o Vincular Paciente</h5>
                <p class="text-muted small">Si el paciente ya existe, se asociará a tu cuenta. Si no, se creará un nuevo registro.</p>
                <form id="form-vincular-paciente" onsubmit="procesarRegistroVinculacion(event)">
                    <div class="mb-3">
                        <label class="form-label">Nombre Completo</label>
                        <input type="text" id="nombre-paciente" class="form-control" placeholder="Nombre del paciente" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Cédula del Paciente</label>
                        <input type="text" id="cedula-paciente" class="form-control" placeholder="Número de identificación" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Confirmar Registro</button>
                </form>
            </div>
        </div>
    `;
}

async function procesarRegistroVinculacion(event) {
    event.preventDefault();
    const token = sessionStorage.getItem('token');
    const datosUser = JSON.parse(sessionStorage.getItem('datosUsuario'));

    const pacienteData = {
        nombre: document.getElementById('nombre-paciente').value,
        cedula: document.getElementById('cedula-paciente').value
    };

    try {
        const url = `${serverPath}/mipres/registrar-vincular-paciente?cedulaCuidador=${datosUser.cedula}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pacienteData)
        });

        if (response.ok) {
            alert("Operación exitosa: El paciente ahora está bajo tu cuidado.");
            document.getElementById('optConsultar').checked = true;
            consultarMisPacientes();
        } else {
            alert("No se pudo procesar la solicitud.");
        }
    } catch (e) {
        alert("Error de conexión.");
    }
}

async function mostrarProximosVencimientos() {
    const container = document.getElementById('dynamic-content');
    const datosUser = JSON.parse(sessionStorage.getItem('datosUsuario'));
    const token = sessionStorage.getItem('token');

    container.innerHTML = `<h4>Alertas de Entrega (MIPRES Direccionados)</h4><hr><div id="lista-vencimientos">Cargando...</div>`;

    try {
        const response = await fetch(`${serverPath}/mipres/vencimientos-cuidador/${datosUser.cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const vencimientos = await response.json();
        const listaDiv = document.getElementById('lista-vencimientos');

        if (vencimientos.length === 0) {
            listaDiv.innerHTML = `<div class="alert alert-success">No hay entregas pendientes por vencer en los próximos 5 días.</div>`;
            return;
        }

        let html = `<div class="row">`;
        vencimientos.forEach(v => {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card border-warning shadow-sm">
                        <div class="card-body">
                            <h6 class="card-title fw-bold text-dark">Próximo a vencer</h6>
                            <p class="small mb-1"><strong>Paciente:</strong> ${v.paciente.nombre}</p>
                            <p class="small mb-1"><strong>Medicamento:</strong> ${v.medicamento}</p>
                            <div class="alert alert-light p-2 mb-0 border">
                                <small class="text-danger fw-bold">Fecha Límite: ${v.fechaMaxDireccionamiento}</small>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        html += `</div>`;
        listaDiv.innerHTML = html;
    } catch (e) {
        listaDiv.innerHTML = "Error en la consulta de alertas.";
    }
}