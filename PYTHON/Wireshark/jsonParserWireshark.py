import pyshark
import json
import matplotlib.pyplot as plt

# Ruta del archivo pcap
pcap_file_path = "./trafico_monitor.pcap"

# Captura de paquetes desde el archivo
cap = pyshark.FileCapture(pcap_file_path)

# Listas para almacenar los valores JSON
temperatures = []
humidities = []
lights = []
distances = []

# Recorre los paquetes capturados
for packet in cap:
    if "HTTP" in packet:
        if "application/json" in packet.http.get_field_value('content_type'):
            json_data = packet.http.file_data
            try:
                json_object = json.loads(json_data)
                # Extrae los valores y los agrega a las listas
                temperatures.append(float(json_object.get('temperature', 0)))
                humidities.append(float(json_object.get('humidity', 0)))
                lights.append(float(json_object.get('light', 0)))
                distances.append(float(json_object.get('distance', 0)))
            except json.JSONDecodeError as e:
                print("Error al decodificar JSON:", e)

cap.close()

# Genera la gráfica
plt.figure(figsize=(10, 6))

# Temperaturas
plt.subplot(2, 2, 1)
plt.plot(temperatures, marker='o', linestyle='-', color='r')
plt.title('Temperatura')
plt.xlabel('Paquete')
plt.ylabel('°C')

# Humedades
plt.subplot(2, 2, 2)
plt.plot(humidities, marker='o', linestyle='-', color='b')
plt.title('Humedad')
plt.xlabel('Paquete')
plt.ylabel('%')

# Luz
plt.subplot(2, 2, 3)
plt.plot(lights, marker='o', linestyle='-', color='g')
plt.title('Luz')
plt.xlabel('Paquete')
plt.ylabel('Lux')

# Distancia
plt.subplot(2, 2, 4)
plt.plot(distances, marker='o', linestyle='-', color='m')
plt.title('Distancia')
plt.xlabel('Paquete')
plt.ylabel('cm')

plt.tight_layout()
plt.show()
