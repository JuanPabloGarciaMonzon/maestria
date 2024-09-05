int ANALOG_IN_PIN = A0;			// trigger en pin 10
int SENSOR_VALUE = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  SENSOR_VALUE = analogRead(ANALOG_IN_PIN);
  Serial.print("VALOR = ");
  Serial.println(SENSOR_VALUE);
  delay(100);
}
