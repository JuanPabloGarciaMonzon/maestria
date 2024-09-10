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
      //setInterval(this.obtenerDatos, 1000);
    },
    methods: {
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
      async obtenerConexiones() {
        DISPO = document.getElementById('chart_dispositivos');
        var validacion = [];
        try {
          validacion = validacionObtenerConexiones();
          if (validacion["estado"] == "false") {
            notificacionSencilla(validacion["mensaje"], validacion["icono"]);
          }
          else {
            var fecha = document.getElementById('fecha').value;
            $.ajax({
              url: `http://localhost:3000/obtenerConexionesPorDia?fecha=${fecha}`,
              method: 'GET',
              contentType: 'application/json',
              processData: false,
              success: (response) => {
                console.log("Datos recibidos:", response);
                if (response != "null") {
                // Convertir la respuesta JSON en un objeto JavaScript
                var datos = JSON.parse(response);
                
                // Extraer los nombres de proveedores y las cantidades para el histograma
                const proveedores = datos.map(d => d.cantidad_conexiones);
                const cantidades = datos.map(d => d.count);
                
                const trace = {
                  x: proveedores,
                  y: cantidades,
                  type: 'bar', // Tipo de gráfico: histograma
                  marker: {color: 'rgba(75, 192, 192, 1)'}
                };
        
                const layout = {
                  title: 'Conexiones de Dispositivo de fecha: ' + fecha,
                  xaxis: {title: 'Dispositivo'},
                  yaxis: {title: 'Número de Conexiones'}
                };
        
                Plotly.newPlot(DISPO, [trace], layout);
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