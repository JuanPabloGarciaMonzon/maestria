from flask import Flask, jsonify, request
from flask_cors import CORS
from ClaseRepositoryDB import ClaseRepositoryDB
from ClaseConexionDB import ClaseConexionDB
import pandas as pd
import json
from ConfiguracionConexion import ConfiguracionConexion
import mysql.connector

app = Flask(__name__)
CORS(app)


@app.route('/insertarConexion', methods=['POST'])
def insertarConexion():
    connection = None
    vendor = request.args.get('vendor')
    mac = request.args.get('mac')
    hostname = request.args.get('hostname')
    os_type = request.args.get('os_type')
    ip = request.args.get('ip')
    print("V" + vendor)
    print("M" +mac)
    print("H" +hostname)
    print("O" +os_type)
    print("I" +ip)
    query = """INSERT INTO conexiones
    (vendor_name, mac, hostname, sistema_operativo, ipv4_host, fecha_conexion, hora_conexion)
    VALUES(%s, %s, %s, %s, %s, CURDATE(), CURTIME())"""
    params = (vendor, mac, hostname, os_type, ip)
    if not connection or not connection.is_connected():
            try:
                connection = mysql.connector.connect(
                    host=ConfiguracionConexion.DB_HOST,
                    user=ConfiguracionConexion.DB_USER,
                    password=ConfiguracionConexion.DB_PASSWORD,
                    database=ConfiguracionConexion.DB_NAME,
                    ssl_disabled=True
                )
                print("Conexión exitosa")
            except mysql.connector.Error as err:
                print(f"Error de conexion: {err}")
                connection = None
    if connection:
        print(query)
        print(params)
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        connection.commit()
        results = cursor.fetchall()
    response = {
        "devices": results
    }
    return jsonify(response)

@app.route('/obtenerConexionesPorDia', methods=['GET'])
def obtenerConexionesPorDia():
    connection = None
    fecha = request.args.get('fecha')
    query = """SELECT * FROM conexiones WHERE fecha_conexion = %s"""
    params = (fecha,)
    if not connection or not connection.is_connected():
            try:
                connection = mysql.connector.connect(
                    host=ConfiguracionConexion.DB_HOST,
                    user=ConfiguracionConexion.DB_USER,
                    password=ConfiguracionConexion.DB_PASSWORD,
                    database=ConfiguracionConexion.DB_NAME,
                    ssl_disabled=True
                )
                print("Conexión exitosa")
            except mysql.connector.Error as err:
                print(f"Error de conexion: {err}")
                connection = None
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        response = cursor.fetchall()
    if not (not response):
        df = pd.DataFrame(response)
        
        df_filtrado = df[df['fecha_conexion'] == pd.to_datetime(fecha).date()]
        
        # Contar la cantidad de conexiones por proveedor
        counts = df_filtrado['vendor_name'].value_counts()
        
        # Convertir los datos a una lista de diccionarios
        data_dict = counts.reset_index().rename(columns={'index': 'vendor_name', 'vendor_name': 'cantidad_conexiones'}).to_dict(orient='records')
        
        # Convertir los datos a JSON
        data_json = pd.DataFrame(data_dict).to_json(orient='records')

        print(data_json)
        return jsonify(data_json)
    json_null = json.dumps(None)
    return json_null

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)
    