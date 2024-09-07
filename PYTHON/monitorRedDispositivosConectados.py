from scapy.all import *
import json
from ClaseDispositivos import ClaseDispositivos

dispositivos = ClaseDispositivos()

def scan_network(ip_range):
    result = subprocess.check_output(['nmap', '-sn', ip_range], stderr=subprocess.STDOUT, universal_newlines=True)
    ip_pattern = r'Nmap scan report for (\d+\.\d+\.\d+\.\d+)'
    ips = re.findall(ip_pattern, result)
    devices = []
    for ip in ips:
        hostname = dispositivos.detect_hostname(ip)
        os_type = dispositivos.detect_os(ip)
        mac = dispositivos.detect_macs(ip)
        vendor = dispositivos.detect_vendor(mac)
        devices.append({'ip':ip, 'mac':mac, 'hostname':hostname, 'os_type':os_type, 'vendor':vendor})
    
    jsonReponse = json.dumps(devices, indent=4)
    print(jsonReponse)
    return devices

if __name__ == "__main__":
    scan_network(dispositivos.get_network())