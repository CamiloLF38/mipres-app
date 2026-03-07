document.addEventListener('DOMContentLoaded', () => {
    const datosInicioSesion = validarSesionIniciada();
    modificarNombreSaludo(datosInicioSesion);

    // Configurar botones de las Cards
    document.getElementById('btn-gestion-mipres').addEventListener('click', consultarMisMipres);
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

function validarSesionIniciada(){
    const token = sessionStorage.getItem('token');
    const datosUsuario = sessionStorage.getItem('datosUsuario');

    if(token && datosUsuario){
        return {
            sesionIniciada: true,
            token: token,
            datosUsuario: JSON.parse(datosUsuario)
        };
    }
    return { sesionIniciada: false };
}

async function modificarNombreSaludo(sesion) {
    const nombreUsuario = sesion.datosUsuario.nombre;
    document.getElementById('sauldo-usuario-dashboard').innerText = `Hola ${nombreUsuario},`;
}

async function consultarMisMipres() {
    // Seleccionamos el contenedor principal para inyectar la tabla
    let container = document.getElementById('dynamic-content');
    if (!container) {
        container = document.createElement('section');
        container.id = 'dynamic-content';
        container.className = 'container mt-4';
        document.querySelector('main').appendChild(container);
    }

    const datosUser = JSON.parse(sessionStorage.getItem('datosUsuario'));
    const token = sessionStorage.getItem('token');

    container.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Mis Registros MIPRES</h5>
            </div>
            <div class="card-body" id="tabla-result">
                <p class="text-center">Cargando tus registros...</p>
            </div>
        </div>`;

    try {
        const response = await fetch(`${serverPath}/mipres/buscar-por-paciente/${datosUser.cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const mipresList = await response.json();

        const resultDiv = document.getElementById('tabla-result');

        if (mipresList.length === 0) {
            resultDiv.innerHTML = `<div class="alert alert-info">No tienes registros MIPRES asociados a tu cédula.</div>`;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>No. MIPRES</th>
                            <th>Medicamento</th>
                            <th>Estado</th>
                            <th>Vencimiento</th>
                        </tr>
                    </thead>
                    <tbody>`;

        mipresList.forEach(m => {
            const badgeClass = m.estado === 'DIRECCIONADO' ? 'bg-success' : 'bg-warning text-dark';
            html += `
                <tr>
                    <td class="fw-bold">${m.numeroMipres}</td>
                    <td>${m.medicamento}</td>
                    <td><span class="badge ${badgeClass}">${m.estado}</span></td>
                    <td>${m.fechaMaxDireccionamiento}</td>
                </tr>`;
        });

        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;

    } catch (error) {
        document.getElementById('tabla-result').innerHTML = `
            <div class="alert alert-danger">Error al conectar con el servidor. Intente más tarde.</div>`;
    }
}