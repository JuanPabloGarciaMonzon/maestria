from flask import Flask, jsonify, request
from scapy.all import *
from flask_cors import CORS
import socket
import netifaces
from netaddr import IPNetwork
import re

app = Flask(__name__)
CORS(app)

def get_network():
    interface = netifaces.gateways()['default'][netifaces.AF_INET][1]

    ip_info = netifaces.ifaddresses(interface)[netifaces.AF_INET][0]
    ip_addr = ip_info['addr']
    netmask = ip_info['netmask']

    ip_network = IPNetwork(f"{ip_addr}/{netmask}")

    print(f"Red: {ip_network.network}")
    print(f"Máscara de subred: {netmask}")

    ip_network = IPNetwork(f"{ip_addr}/{netmask}")

    cidr_prefix = ip_network.prefixlen

    network_cidr = f"{ip_network.network}/{cidr_prefix}"

    print(f"Red en formato CIDR: {network_cidr}")

    return network_cidr

def detect_os_and_device(ip):
    try:
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
        print(e.output)
        return "Error", "Error"

def scan_network(ip_range):
    print(f"Escaneando dispositivos en la red {ip_range}")

    ans,_ = srp(Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst=ip_range), timeout=2, verbose=False)
    active_hosts = []

    for res in ans:
        ip = res[1].psrc
        mac = res[1].hwsrc
        try:
            hostname = socket.gethostbyaddr(ip)[0]
        except socket.herror:
            hostname = "Desconocido"
        
        os_type, device_type = detect_os_and_device(ip)
        active_hosts.append({'ip':ip, 'mac':mac, 'hostname':hostname, 'os_type':os_type, 'device_type':device_type})

    return active_hosts

@app.route('/scan', methods=['GET'])
def scan():
    network = request.args.get('network')
    result = scan_network(network)
    response = {
        "devices": result
    }
    return jsonify(response)

@app.route('/getNetwork', methods=['GET'])
def getNetwork():
    response = {
        "network": get_network()
    }
    return jsonify(response)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)