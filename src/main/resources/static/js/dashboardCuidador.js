document.addEventListener('DOMContentLoaded', () => {
    const datosInicioSesion = validarSesionIniciada();
    modificarNombreSaludo(datosInicioSesion);

    // Configurar botones de las Cards
    document.getElementById('btn-nuevo-paciente').addEventListener('click', mostrarFormularioPaciente);
    document.getElementById('btn-consultar-mipres').addEventListener('click', mostrarGestionMipres);
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