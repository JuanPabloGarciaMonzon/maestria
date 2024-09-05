from scapy.all import *
import socket
import netifaces
from netaddr import IPNetwork

def get_network():
    # Obtener la interfaz de red principal (puede variar según tu sistema)
    interface = netifaces.gateways()['default'][netifaces.AF_INET][1]

    # Obtener la dirección IP y la máscara de subred
    ip_info = netifaces.ifaddresses(interface)[netifaces.AF_INET][0]
    ip_addr = ip_info['addr']
    netmask = ip_info['netmask']

    # Calcular la red
    ip_network = IPNetwork(f"{ip_addr}/{netmask}")

    # Mostrar la red y la máscara de subred
    print(f"Red: {ip_network.network}")
    print(f"Máscara de subred: {netmask}")

    ip_network = IPNetwork(f"{ip_addr}/{netmask}")

    # Convertir la máscara de subred a formato CIDR
    cidr_prefix = ip_network.prefixlen

    # Crear el valor en formato CIDR
    network_cidr = f"{ip_network.network}/{cidr_prefix}"

    # Mostrar el resultado
    print(f"Red en formato CIDR: {network_cidr}")

    return network_cidr

def detect_os_and_device(ip):
    try:
        # Usa -sS para el escaneo SYN, que es adecuado para la detección de OS
        result = subprocess.check_output(['nmap', '-O', '-sS', ip], stderr=subprocess.STDOUT, universal_newlines=True)
        
        os_type = re.search(r"OS details: (.+)", result)
        os_type = os_type.group(1) if os_type else "Desconocido"
        mac_address_info = re.search(r"MAC Address: [\w:]+ \(([\w\s]+)\)", result)
        
        if mac_address_info:
            device_type = mac_address_info.group(1)
        else:
            print("No se encontró información de dirección MAC.")
            device_type = "Desconocido"
        return os_type, device_type

    except subprocess.CalledProcessError as e:
        print("Error ejecutando Nmap:")
        print(e.output)  # Imprime la salida del error
        return "Error", "Error"

def scan_network(ip_range):
    print(f"Escaneando dispositivos en la red {ip_range}")

    ans,_ = srp(Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst=ip_range), timeout=2, verbose=False)
    active_hosts = []

    for res in ans:
        ip = res[1].psrc
        mac = res[1].hwsrc
        try:
            # Intentar obtener el nombre del dispositivo
            hostname = socket.gethostbyaddr(ip)[0]
        except socket.herror:
            # Si no se puede resolver el hostname, dejarlo como "Desconocido"
            hostname = "Desconocido"
        
        os_type, device_type = detect_os_and_device(ip)
        print(os_type)
        print(device_type)
        active_hosts.append((ip, mac, hostname, os_type, device_type))

    print("Dispositivos activos:")
    for host in active_hosts:
        print(f"- IP: {host[0]}, MAC: {host[1]}, Hostname: {host[2]}, OS: {host[3]}, Device Type: {host[4]}")

if __name__ == "__main__":
    #detect_os_and_device('192.168.10.146')
    scan_network(get_network())