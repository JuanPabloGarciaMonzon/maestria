from flask import Flask, jsonify, request
from flask_cors import CORS
from ClaseDispositivos import ClaseDispositivos

app = Flask(__name__)
CORS(app)

@app.route('/scan', methods=['GET'])
def scan():
    network = request.args.get('network')
    result = dispositivos.scan_network(network)
    response = {
        "devices": result
    }
    return jsonify(response)

@app.route('/getNetwork', methods=['GET'])
def getNetwork():
    response = {
        "network": dispositivos.get_network()
    }
    return jsonify(response)

if __name__ == "__main__":
    dispositivos = ClaseDispositivos()
    app.run(host='0.0.0.0', port=5000)