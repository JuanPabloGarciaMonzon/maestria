function validacionObtenerConexiones() {
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