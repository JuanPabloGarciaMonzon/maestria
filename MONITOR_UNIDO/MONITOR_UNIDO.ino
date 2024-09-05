#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_TSL2561_U.h>
#include <SPI.h>
#include <DHT.h>
#include <Ethernet.h>

//VARIABLES DE CONFIGURACION DE MODULO ETHERNET W5100
byte mac[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192,168,10,130);
EthernetServer server(81);

//VARIABLES DE CONFIGURACION DE SENSOR DE LUZ
float LUZ;
Adafruit_TSL2561_Unified tsl = Adafruit_TSL2561_Unified(TSL2561_ADDR_FLOAT, 12345);

//VARIABLES DE CONFIGURACION DE SENSOR MC-SR04
int TRIG = A8;
int ECO = A9;
int DURACION;
int DISTANCIA;

//VARIABLES DE CONFIGURACION DE SENSOR DHT22
float TEMPERATURA;
float HUMEDAD;
#define DHTPIN A2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void configureSensorLuz(void)
{
  tsl.enableAutoRange(true);
  tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_13MS); 
}

void configureSensorProximidad(void)
{
  pinMode(TRIG, OUTPUT);
  pinMode(ECO, INPUT);
}

void configureModuloEthernet(void)
{
  Ethernet.begin(mac, ip);
  server.begin();
  Serial.print("server is at ");
  Serial.println(Ethernet.localIP());
}

void datosSensorLuz(void)
{
  sensors_event_t event;
  tsl.getEvent(&event);
  LUZ = event.light;
}

void datosSensorProximidad(void)
{
  digitalWrite(TRIG, HIGH);
  delay(1000);
  digitalWrite(TRIG, LOW);
  DURACION = pulseIn(ECO, HIGH);
  DISTANCIA = DURACION / 58.2;
}

void datosSensorTemperaturaHumedad(void)
{
  HUMEDAD = dht.readHumidity();
  TEMPERATURA = dht.readTemperature();
}

void setup() {
  Serial.begin(9600);
  dht.begin();
  tsl.begin();
  configureModuloEthernet();
  configureSensorLuz();
  configureSensorProximidad();
}

void loop() {
  EthernetClient client = server.available();
  datosSensorProximidad();
  datosSensorLuz();
  datosSensorTemperaturaHumedad();
  if (client) {
    Serial.println("new client");
    boolean currentLineIsBlank = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        Serial.write(c);
        if (c == '\n' && currentLineIsBlank) {
          //Crear el paquete JSON
          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: application/json");
          client.println("Access-Control-Allow-Origin: *");
          client.println("Connnection: close");
          client.println();
          client.print("{\"temperature\":");
          client.print(TEMPERATURA, 1);
          client.print(", \"humidity\":");
          client.print(HUMEDAD, 0);
          client.print(", \"light\":");
          client.print(LUZ, 0);
          client.print(", \"distance\":");
          client.print(DISTANCIA, 1);
          client.println("}");
          break;
        }
        if (c == '\n') {
          currentLineIsBlank = true;
        } 
        else if (c != '\r') {
          currentLineIsBlank = false;
        }
      }
    }
    //Darle al navegador web tiempo para recibir los datos.
    delay(1000);
    client.stop();
    Serial.println("client disonnected");
  }
}