import pyshark

try:
    # Definir la interfaz de red Wi-Fi en Windows (como 'Wi-Fi')
    interface_name = 'Wi-Fi'
    
    # Sin filtro para capturar todo el tráfico de la red
    capture = pyshark.LiveCapture(interface=interface_name)
    
    # Analizar los paquetes capturados
    for packet in capture.sniff_continuously():
        if 'IP' in packet:
            ip_src = packet.ip.src
            ip_dst = packet.ip.dst
            
            # Filtrar direcciones IP en la subred 192.168.1.x
            if ip_src.startswith("192.168.1."):
                print(f"IP Origen: {ip_src} -> IP Destino: {ip_dst}")
except Exception as e:
    print(f"Error: {e}")
