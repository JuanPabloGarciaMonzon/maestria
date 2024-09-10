import mysql.connector
from ConfiguracionConexion import ConfiguracionConexion

class ClaseConexionDB:
    def __init__(self):
        self.connection = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=ConfiguracionConexion.DB_HOST,
                user=ConfiguracionConexion.DB_USER,
                password=ConfiguracionConexion.DB_PASSWORD,
                database=ConfiguracionConexion.DB_NAME,
                ssl_disabled=True
            )
            print("Conexión exitosa")
        except mysql.connector.Error as err:
            print(f"Error de conexion: {err}")
            self.connection = None

    def disconnect(self):
        if self.connection:
            self.connection.close()
            print("Conexión cerrada.")

    def execute_query(self, query, params=None):
        try:
            if not self.connection or not self.connection.is_connected():
                self.connect()
            if self.connection:
                print(query)
                print(params)
                cursor = self.connection.cursor(dictionary=True)
                cursor.execute(query, params)
                self.connection.commit()
                results = cursor.fetchall()
                return results
        except Exception as e:
            print(f"No se ha establecido conexión. Detalle: {e}")
            return None

    def execute_get_query(self, query, params=None):
        try:
            if not self.connection or not self.connection.is_connected():
                self.connect()
            if self.connection:
                cursor = self.connection.cursor(dictionary=True)
                cursor.execute(query, params)
                results = cursor.fetchall()
                return results
        except Exception as e:
            print(f"No se ha establecido conexión. Detalle: {e}")
            return None