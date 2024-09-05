import pyshark
import matplotlib.pyplot as plt

# Ruta del archivo pcap
pcap_file_path = "./trafico_monitor.pcap"

# Captura de paquetes desde el archivo
cap = pyshark.FileCapture(pcap_file_path)

# Variables para conteo
http_packets = 0
json_packets = 0
handshake_count = 0

# Recorre los paquetes capturados
for packet in cap:
    if "HTTP" in packet:
        http_packets += 1
        if "application/json" in packet.http.get_field_value('content_type'):
            json_packets += 1
    if "TCP" in packet and packet.tcp.flags_syn == "1" and packet.tcp.flags_ack == "1":
        handshake_count += 1

cap.close()

# Estadísticas descriptivas
http_percentage = (http_packets / cap.__len__()) * 100
json_percentage = (json_packets / http_packets) * 100 if http_packets else 0
handshake_percentage = (handshake_count / cap.__len__()) * 100

# Imprimir resultados
print("Paquetes HTTP: ", http_packets)
print("Paquetes HTTP con JSON: ", json_packets)
print("Handshakes TCP exitosos: ", handshake_count)

print("\nPorcentajes:")
print(f"Porcentaje de paquetes HTTP: {http_percentage:.2f}%")
print(f"Porcentaje de paquetes HTTP con JSON: {json_percentage:.2f}%")
print(f"Porcentaje de handshakes TCP exitosos: {handshake_percentage:.2f}%")

# Generar gráficas
# Gráfica de barras para el conteo
plt.figure(figsize=(10, 6))

labels = ['HTTP', 'JSON', 'Handshakes']
counts = [http_packets, json_packets, handshake_count]

plt.subplot(1, 2, 1)
plt.bar(labels, counts, color=['blue', 'green', 'red'])
plt.title('Conteo de Paquetes')
plt.ylabel('Número de Paquetes')

# Gráfica de pastel para los porcentajes
plt.subplot(1, 2, 2)
percentages = [http_percentage, json_percentage, handshake_percentage]
labels_percentages = ['HTTP (%)', 'JSON en HTTP (%)', 'Handshakes (%)']
plt.pie(percentages, labels=labels_percentages, autopct='%1.1f%%', colors=['blue', 'green', 'red'])
plt.title('Porcentajes')

plt.tight_layout()
plt.show()
