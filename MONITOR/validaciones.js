function validacionObtenerConexionesPorFecha() {
    var respuesta = [];
    var fecha = document.getElementById('fecha').value;
    var mensaje = "";
    var estado = "";
    var icono = "";
    if (fecha == "") {
        mensaje = "Por favor ingrese una fecha.";
        estado = "false";
        icono = "warning";
    }
    respuesta["estado"] = estado;
    respuesta["mensaje"] = mensaje;
    respuesta["icono"] = icono;
    return respuesta
}

function validacionObtenerConexionesPorFechayHora() {
    var respuesta = [];
    var fecha = document.getElementById('fecha').value;
    var hora = document.getElementById('hora').value;
    var mensaje = "";
    var estado = "";
    var icono = "";
    if (fecha == "") {
        mensaje = "Por favor debe ingresar una fecha.";
        estado = "false";
        icono = "warning";
    }
    if (hora == "") {
        mensaje = "Por favor debe ingresar una hora.";
        estado = "false";
        icono = "warning";
    }
    if (fecha == "" && hora == "") {
        mensaje = "Por favor ingresar una fecha y una hora.";
        estado = "false";
        icono = "info";
    }
    respuesta["estado"] = estado;
    respuesta["mensaje"] = mensaje;
    respuesta["icono"] = icono;
    return respuesta
}