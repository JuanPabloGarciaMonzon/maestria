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
        red: 'Buscando red...'
      }
    },
    mounted ()  {
      setInterval(this.obtenerRed, 5000);
      setInterval(this.obtenerDatos, 1000);
    },
    methods: {
      llenarCards(devices) {
          const divTarjetas = document.getElementById('grupo_tarjetas');
          divTarjetas.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas tarjetas
          var contadorDesconocidos = 0;
  
          devices.forEach(device => {
            if (device.vendor == "Desconocido" || device.vendor == "Unknown") {
              contadorDesconocidos++;
            }
              const card = document.createElement('div');
              card.className = 'card';
  
              // Agregar contenido a la tarjeta
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
              Swal.close();
          });
          if (contadorDesconocidos > 0) {
            var mensaje = `Se encontraron ${contadorDesconocidos} dispositivos desconocidos. Se recomienda revisar sus dispositivos para evitar una intrusión.`;
            notificacionSencilla(mensaje, "warning");
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
          if (this.red !== nuevaRed) {
            this.red = nuevaRed;
            if (this.red !== 'Buscando red...') {
              notificacionSencilla(
                `La red a la que está conectado actualmente es ${this.red}. Se recomienda que si usted tiene acceso a la administración de su punto de acceso, por favor mantenga una política de cambio de contraseña periódica para evitar intrusiones.`,
                "warning"
              );
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
                notificacionSencilla("No se encontraron dispositivos.");
              }
            },
            error: (xhr, status, error) => {
                notificacionSencilla("Ha ocurrido un error al obtener los dispositivos.");
                console.error('Error en la solicitud:', error);
            }
        });
        } catch (error) {
          console.error('Error al obtener los dispositivos conectados', error);
        }
      }
    }
  }).mount('#data');