from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
from ConfiguracionConexion import ConfiguracionConexion
from ClaseConexionDB import ClaseConexionDB
import mysql.connector
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

parametrosConexion = ClaseConexionDB.crearConexion()

@app.route('/insertarConexion', methods=['POST'])
def insertarConexion():
    connection = None
    vendor = request.args.get('vendor')
    mac = request.args.get('mac')
    hostname = request.args.get('hostname')
    os_type = request.args.get('os_type')
    ip = request.args.get('ip')
    query = """INSERT INTO conexiones
    (vendor_name, mac, hostname, sistema_operativo, ipv4_host, fecha_conexion, hora_conexion)
    VALUES(%s, %s, %s, %s, %s, CURDATE(), CURTIME())"""
    params = (vendor, mac, hostname, os_type, ip)
    if not connection or not connection.is_connected():
            try:
                connection = parametrosConexion
                print("Conexión exitosa")
            except mysql.connector.Error as err:
                print(f"Error de conexion: {err}")
                connection = None
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        connection.commit()
        results = cursor.fetchall()
    if results:    
        response = {
            "devices": results
        }
        return jsonify(response)
    json_null = json.dumps(None)
    return json_null

@app.route('/obtenerConexionesPorDia', methods=['GET'])
def obtenerConexionesPorDia():
    connection = None
    fecha = request.args.get('fecha')
    query = """SELECT * FROM conexiones WHERE fecha_conexion = %s"""
    params = (fecha,)
    if not connection or not connection.is_connected():
            try:
                connection = parametrosConexion
                print("Conexión exitosa")
            except mysql.connector.Error as err:
                print(f"Error de conexion: {err}")
                connection = None
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        response = cursor.fetchall()
    if response:
        df = pd.DataFrame(response)
        df_filtrado = df[df['fecha_conexion'] == pd.to_datetime(fecha).date()]
        counts = df_filtrado.groupby(['ipv4_host', 'vendor_name']).size().reset_index(name='count')
        data_dict = counts.to_dict(orient='records')
        data_json = pd.DataFrame(data_dict).to_json(orient='records')
        return jsonify(data_json)
    json_null = json.dumps(None)
    return json_null

@app.route('/obtenerConexionesPorDiayHora', methods=['GET'])
def obtenerConexionesPorDiayHora():
    connection = None
    fecha = request.args.get('fecha')
    hora = request.args.get('hora')
    print(fecha)
    print(hora)
    query = """SELECT * FROM conexiones WHERE fecha_conexion = %s and hora_conexion >= %s"""
    params = (fecha, hora,)
    if not connection or not connection.is_connected():
            try:
                connection = parametrosConexion
                print("Conexión exitosa")
            except mysql.connector.Error as err:
                print(f"Error de conexion: {err}")
                connection = None
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        response = cursor.fetchall()
        print(response)
    if response:
        df = pd.DataFrame(response)
        print(df['hora_conexion'].dtype)
        df['fecha_conexion'] = pd.to_datetime(df['fecha_conexion']).dt.date
        df['hora_conexion'] = df['hora_conexion'].apply(lambda x: (datetime(1, 1, 1) + x).time())
        hora_proporcionada = pd.to_datetime(hora, format='%H:%M').time()
        df_filtrado = df[
            (df['fecha_conexion'] == pd.to_datetime(fecha).date()) &
            (df['hora_conexion'] >= hora_proporcionada)
        ]
        counts = df_filtrado.groupby(['ipv4_host', 'vendor_name']).size().reset_index(name='count')
        data_dict = counts.to_dict(orient='records')
        data_json = pd.DataFrame(data_dict).to_json(orient='records')
        return jsonify(data_json)
    json_null = json.dumps(None)
    return json_null

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)
    