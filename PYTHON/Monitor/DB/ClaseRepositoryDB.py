from ClaseConexionDB import ClaseConexionDB
import json

conexion = ClaseConexionDB()
class ClaseRepositoryDB:
    def __init__(self, conexion):
        self.connection = conexion

    def insertarConexion(self, vendor, mac, hostname, os, ip):
        try:
            query = """INSERT INTO conexiones
            (vendor_name, mac, hostname, sistema_operativo, ipv4_host, fecha_conexion, hora_conexion)
            VALUES(%s, %s, %s, %s, %s, CURDATE(), CURTIME())"""
            params = (vendor, mac, hostname, os, ip)
            self.connection.execute_query(query, params)
        except Exception as e:
            print(f"insertarConexion->Ocurrio un error. Detalle: {e}")
            mensaje = "Ocurrio el error: " + e
            json = {"message": mensaje}
            return json

    def obtenerConexiones(self, fecha):
        try:
            query = """SELECT * FROM conexiones WHERE fecha_conexion = %s"""
            params = (fecha,)
            resultado = self.connection.execute_get_query(query, params)
            return resultado
        except Exception as e:
            print(f"obtenerConexiones->Ocurrio un error. Detalle: {e}")
            mensaje = str(e)
            json = {"message": mensaje}
            return json