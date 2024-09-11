Vue.createApp({
    data() {
      return {
        titulo: 'Monitor de sensores',
        parrafo: 'Esta página es un sistema de monitoreo web para obtener información importante acerca de la red, dispositivos conectados. Además de la información en tiempo real de una serie de sensores conectados al microcontrolador Arduino MEGA 2560. Todo esto para tener un control de una red domótica, para tener un control de que dispositivos podrían tener accesso a estos datos importantes.',
        temperatura: 'Buscando datos...',
        temperaturaGrafica: [],
        humedad: 'Buscando datos...',
        humedadGrafica: [],
        luz: 'Buscando datos...',
        luzGrafica: [],
        distancia: 'Buscando datos...',
        distanciaGrafica: [],
        red: 'Buscando red...',
        ssid: 'Buscando SSID...'
      }
    },
    mounted ()  {
      setInterval(this.obtenerRed, 5000);
      setInterval(this.obtenerDatos, 1000);
      flatpickr("#fecha", {
        dateFormat: "d-m-Y",
        altInput: true,
        altFormat: "d-m-Y",
        allowInput: true,
        locale: "es"
    });
    flatpickr("#hora", {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      locale: "es",
      allowInput: true,
  });
    },
    methods: {
       formatearFecha(fecha) {
        const partes = fecha.split("-");
        const dia = partes[0];
        const mes = partes[1];
        const anio = partes[2];
    
        // Formatear a yyyy-mm-dd
        return `${anio}-${mes}-${dia}`;
      },
      graficarPlot(x, y, tipoGrafico, titulo, tituloX, tituloY, div) {
        const trace = {
          x: x,
          y: y,
          type: tipoGrafico, // Tipo de gráfico: histograma
          marker: {color: 'rgba(75, 192, 192, 1)'}
        };

        const layout = {
          title: titulo,
          xaxis: {
            title: {
                text: tituloX,
                font: {
                    size: 12 // Tamaño de la fuente del título del eje X
                }
            },
            tickangle: 360, // Ajusta el ángulo de las etiquetas del eje X si es necesario
            tickfont: {
                size: 10 // Tamaño de la fuente de las etiquetas del eje X
            }
        },
        yaxis: {
            title: {
                text: tituloY,
                font: {
                    size: 12 // Tamaño de la fuente del título del eje Y
                }
            },
            tickfont: {
                size: 10 // Tamaño de la fuente de las etiquetas del eje Y
            }
        }
        };

        Plotly.newPlot(div, [trace], layout);
      },
      async llenarCards(devices) {
          const divTarjetas = document.getElementById('grupo_tarjetas');
          divTarjetas.innerHTML = '';
          var contadorDesconocidos = 0;
  
          devices.forEach(async device => {
            if (device.vendor == "Desconocido" || device.vendor == "Unknown") {
              contadorDesconocidos++;
            }
              const card = document.createElement('div');
              card.className = 'card';
  
              card.innerHTML = `
                  <div class="card-header">${device.vendor}</div>
                  <div class="card-body">
                      <p><strong>IP:</strong> ${device.ip}</p>
                      <p><strong>MAC:</strong> ${device.mac}</p>
                      <p><strong>Sistema operativo:</strong> ${device.os_type}</p>
                      <p><strong>Hostname:</strong> ${device.hostname}</p>
                  </div>
              `;
              divTarjetas.appendChild(card);
              await this.insertarConexion(device.vendor, device.mac, device.hostname, device.os_type, device.ip);
              Swal.close();
          });
          if (contadorDesconocidos > 0) {
            var mensaje = `Se encontraron ${contadorDesconocidos} dispositivos desconocidos. Se recomienda revisar sus dispositivos para evitar una intrusión.`;
            notificacionSencilla(mensaje, "warning");
          }
      },
      async insertarConexion(vendor, mac, hostname, os_type, ip) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `http://localhost:3000/insertarConexion?vendor=${vendor}&mac=${mac}&hostname=${hostname}&os_type=${os_type}&ip=${ip}`,
                method: 'POST',
                contentType: 'application/json',
                processData: false,
                success: (response) => {
                    console.log("Conexion exitosa");
                    resolve(response);  // Resolve the promise on success
                },
                error: (xhr, status, error) => {
                    notificacionSencilla("Error al insertar la conexión", "error");
                    console.error('Error en la solicitud:', error);
                    reject(error);  // Reject the promise on error
                }
            });
        });
      },
      async obtenerConexionesPorFecha() {
        var validacion = [];
        var grupoFecha = document.getElementById('grupo_fecha');
        var grupoHora = document.getElementById('grupo_hora');
        grupoFecha.hidden = false;
        grupoHora.hidden = true;
        try {
          validacion = validacionObtenerConexionesPorFecha();
          if (validacion["estado"] == "false") {
            notificacionSencilla(validacion["mensaje"], validacion["icono"]);
          }
          else {
            var fecha = document.getElementById('fecha').value;
            fecha = this.formatearFecha(fecha);
            $.ajax({
              url: `http://localhost:3000/obtenerConexionesPorDia?fecha=${fecha}`,
              method: 'GET',
              contentType: 'application/json',
              processData: false,
              success: (response) => {
                if (response != "null") {
                  var datos = JSON.parse(response);
                  const proveedores = datos.map(d =>  `${d.ipv4_host} - ${d.vendor_name}`);
                  const cantidades = datos.map(d => d.count);
                  var tipoGrafico = "bar";
                  var titulo = "Dispositivos conectados por fecha: " + fecha; 
                  var tituloX = "Dispositivos";
                  var tituloY = "Cantidad de Conexiones";
                  var div = document.getElementById('chart_dispositivos');
                  this.graficarPlot(proveedores, cantidades, tipoGrafico, titulo, tituloX, tituloY, div);
              } else {
                notificacionSencilla("No se encontró información en esta fecha.", "warning");
              }
                },
              error: (xhr, status, error) => {
                  notificacionSencilla("Ha ocurrido un error al obtener los dispositivos.", "error");
                  console.error('Error en la solicitud:', error);
              }
          });         
          }
          } catch (error) {
            console.error('Error al obtener los dispositivos conectados', error);
          }
      },
      async obtenerConexionesPorFechayHora() {
        var validacion = [];
        var grupoFecha = document.getElementById('grupo_fecha');
        var grupoHora = document.getElementById('grupo_hora');
        grupoFecha.hidden = false;
        grupoHora.hidden = false;
        try {
          var fecha = document.getElementById("fecha").value;
          fecha = this.formatearFecha(fecha);
          var hora = document.getElementById("hora").value;
          validacion = validacionObtenerConexionesPorFechayHora();
          if (validacion["estado"] == "false") {
            notificacionSencilla(validacion["mensaje"], validacion["icono"]);
          }
          else {
            $.ajax({
              url: `http://localhost:3000/obtenerConexionesPorDiayHora?fecha=${fecha}&hora=${hora}`,
              method: 'GET',
              contentType: 'application/json',
              processData: false,
              success: (response) => {
                if (response != "null") {
                  var datos = JSON.parse(response);
                  //var datos = response;
                  console.log(datos);
                  const proveedores = datos.map(d =>  `${d.ipv4_host} - ${d.vendor_name}`);
                  const cantidades = datos.map(d => d.count);
                  var tipoGrafico = "bar";
                  var titulo = "Dispositivos conectados por fecha: " + fecha + " y hora: " + hora; 
                  var tituloX = "Dispositivos";
                  var tituloY = "Cantidad de Conexiones";
                  var div = document.getElementById('chart_dispositivos');
                  this.graficarPlot(proveedores , cantidades, tipoGrafico, titulo, tituloX, tituloY, div);
              } else {
                notificacionSencilla("No se encontró información en esta fecha y hora.", "warning");
              }
                },
              error: (xhr, status, error) => {
                  notificacionSencilla("Ha ocurrido un error al obtener los dispositivos.", "error");
                  console.error('Error en la solicitud:', error);
              }
          });         
          }
          } catch (error) {
            console.error('Error al obtener los dispositivos conectados', error);
          }
      },
      async obtenerDatos() {
        try {
          const response = await fetch('http://192.168.10.130:81');
          const data = await response.json();
          this.temperatura = `${data.temperature} C°`
          this.humedad = `${data.humidity} %`;
          this.distancia = `${data.distance} cm`;
          this.luz = `${data.light} lux`;

          this.temperaturaGrafica.push(data.temperature);
          this.humedadGrafica.push(data.humidity);
          this.distanciaGrafica.push(data.distance);
          this.luzGrafica.push(data.light);
          

          TEMP = document.getElementById('chart_temp');
          Plotly.newPlot( TEMP, [{
          y: this.temperaturaGrafica }], {
          margin: { t: 0 } } );

          HUM = document.getElementById('chart_humed');
          Plotly.newPlot( HUM, [{
          y: this.humedadGrafica }], {
          margin: { t: 0 } } );

          DIST = document.getElementById('chart_dist');
          Plotly.newPlot( DIST, [{
          y: this.distanciaGrafica }], {
          margin: { t: 0 } } );

          LU = document.getElementById('chart_luz');
          Plotly.newPlot( LU, [{
          y: this.luzGrafica }], {
          margin: { t: 0 } } );
        } catch (error) {
          console.error('Error al obtener datos:', error);
        }
      },
      async obtenerRed() {
        try {
          const response = await fetch('http://localhost:5000/getNetwork');
          const data = await response.json();
          var nuevaRed = `${data.network}`;
          var nuevaSSID = `${data.ssid}`;
          if (this.red !== nuevaRed || this.ssid !== nuevaSSID) {
            this.red = nuevaRed;
            this.ssid = nuevaSSID;
            if (this.red !== 'Buscando red...') {
              mensaje = `La red a la que está conectado actualmente es ${this.ssid}. Se recomienda que si usted tiene acceso a la administración de su punto de acceso, por favor mantenga una política de cambio de contraseña periódica para evitar intrusiones.`;
              notificacionSencilla(mensaje, "warning");
            }
          }
        } catch (error) {
          console.error('Error al obtener la red', error);
        }
      },
      async obtenerDispositivosConectados() {
        try {
        var network = this.red;
        notificacionSpinner();
        $.ajax({
            url: `http://localhost:5000/scan?network=${network}`,
            method: 'GET',
            contentType: 'application/json',
            processData: false,
            success: (response) => {
              console.log(response.devices);
              if (response.devices && response.devices.length > 0) {
                this.llenarCards(response.devices);
              } else {
                notificacionSencilla("No se encontraron dispositivos.", "warning");
              }
            },
            error: (xhr, status, error) => {
                notificacionSencilla("Ha ocurrido un error al obtener los dispositivos.", "error");
                console.error('Error en la solicitud:', error);
            }
        });
        } catch (error) {
          console.error('Error al obtener los dispositivos conectados', error);
        }
      }
    }
  }).mount('#data');