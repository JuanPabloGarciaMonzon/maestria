function notificacionSpinner() {
  Swal.fire({
      title: "Escaneo",
      html: "Espere mientras se hace un escaneo de su red.",
      timerProgressBar: true,
      allowEscapeKey: false,
      keyboard: false,
      allowOutsideClick: false,
      closeOnClickOutside: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
}

function notificacionSencilla(mensaje = "No se encontro ningún dispositivo", icono = "success") {
  Swal.fire({
      title: "Sistema de monitoreo",
      text: mensaje,
      icon: icono,
      allowEscapeKey: false,
      keyboard: false,
      allowOutsideClick: false,
      closeOnClickOutside: false
    });
}