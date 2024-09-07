from scapy.all import *
import socket
import netifaces
from netaddr import IPNetwork
import requests
import json

class ClaseDispositivos:
    def get_network(self):
        interface = netifaces.gateways()['default'][netifaces.AF_INET][1]
        ip_info = netifaces.ifaddresses(interface)[netifaces.AF_INET][0]
        ip_addr = ip_info['addr']
        netmask = ip_info['netmask']
        ip_network = IPNetwork(f"{ip_addr}/{netmask}")
        cidr_prefix = ip_network.prefixlen
        network_cidr = f"{ip_network.network}/{cidr_prefix}"
        return network_cidr

    def detect_os(self, ip):
        try:
            result = subprocess.check_output(['nmap', '-O', '-sS', ip], stderr=subprocess.STDOUT, universal_newlines=True)
            os_type = re.search(r"OS details: (.+)", result)
            os_type = os_type.group(1) if os_type else "Desconocido"
            return os_type
        except subprocess.CalledProcessError as e:
            print("Error ejecutando Nmap:")
            print(e.output)
            return "Error", "Error"

    def detect_hostname(self, ip):
        try:
            hostname = socket.gethostbyaddr(ip)[0]
        except socket.herror:
            hostname = "Desconocido"
        return hostname

    def detect_macs(self, ip):
        arp_request = ARP(pdst=ip)
        broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
        arp_request_broadcast = broadcast/arp_request
        answered_list = srp(arp_request_broadcast, timeout=1, verbose=False)[0]
        for send, received in answered_list:
            return received.hwsrc
        return None

    def detect_vendor(self, mac_address):
        mac_address = mac_address.upper().replace(":", "").replace("-", "")
        url = f"https://api.macvendors.com/{mac_address}"
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return response.text
            else:
                return "Desconocido"
        except requests.RequestException as e:
            print(f"Error al solicitar el fabricante: {e}")
            return "Error en la solicitud."

    def scan_network(self,ip_range):
        result = subprocess.check_output(['nmap', '-sn', ip_range], stderr=subprocess.STDOUT, universal_newlines=True)
        ip_pattern = r'Nmap scan report for (\d+\.\d+\.\d+\.\d+)'
        ips = re.findall(ip_pattern, result)
        devices = []
        for ip in ips:
            hostname = self.detect_hostname(ip)
            os_type = self.detect_os(ip)
            mac = self.detect_macs(ip)
            vendor = self.detect_vendor(mac)
            devices.append({'ip':ip, 'mac':mac, 'hostname':hostname, 'os_type':os_type, 'vendor':vendor})
        
        jsonReponse = json.dumps(devices, indent=4)
        print(jsonReponse)
        return devices