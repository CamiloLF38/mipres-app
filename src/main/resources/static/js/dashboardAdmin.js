document.addEventListener('DOMContentLoaded', () => {
    const datosInicioSesion = validarSesionIniciada();
    llamarHelloWorld();
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


