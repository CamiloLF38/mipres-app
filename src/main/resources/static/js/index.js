document.addEventListener('DOMContentLoaded', () => {
    const datosInicioSesion = validarSesionIniciada();

    if(datosInicioSesion.sesionIniciada && window.location.pathname.includes('index')){
        modificarHeroResumen(datosInicioSesion.datosUsuario.rol)
    }

    if(datosInicioSesion.sesionIniciada){
        removerSeccionComoFunciona();
    }

});

function modificarHeroResumen(rol){
    const contHeroResumen = document.getElementById('heroResumen');

    const btnGoRegister = document.getElementById('btnRegistroLogin');
    if (btnGoRegister) {
        btnGoRegister.remove();
    }

    const goToDashboard = document.createElement('a');
    goToDashboard.className = 'btn btn-light btn-lg fw-semibold';
    goToDashboard.textContent = 'Ver Dashboard';
    if(rol === 'ADMIN'){
        goToDashboard.href = '/admin/dashboard.html';
    }else if(rol === 'CUIDADOR'){
        goToDashboard.href = '/cuidador/dashboard.html';
    }else{
        goToDashboard.href = '/paciente/dashboard.html';
    }
    
    contHeroResumen.appendChild(goToDashboard);
}

function removerSeccionComoFunciona(){
    const seccionComoFunciona = document.getElementById('seccionComoFunciona');
    if(seccionComoFunciona){
        seccionComoFunciona.remove();
    }
}