import requests
import json
from flask import jsonify

def register(form):

    try:
        data = {
            "username": form.username.data,
            "email": form.email.data,
            "password": form.password.data
        }

        json_data = json.dumps(data)
        headers = {'Content-Type': 'application/json'}

        url = ''

        r = requests.post(url, data=json_data, headers=headers)
        
        print("Response::", r)

        if r.status_code == 200:
            data = r.json()
            print(data)
            return jsonify(data)
        else:
            data = r.json()
            print("Response::", data)  
            return jsonify({'error': 'Failed to register user'}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500


def login(form):
    
    try:
        data = {
            "username": form.username.data,
            "password": form.password.data
        }

        json_data = json.dumps(data)
        headers = {'Content-Type': 'application/json'}

        url = ''

        r = requests.post(url, data=json_data, headers=headers)
        
        print("Response::", r)

        if r.status_code == 200:
            data = r.json()
            return jsonify(data)
        else:
            data = r.json()
            print("Response::", data)
            return jsonify({'error': 'Failed to login user'}), 500
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500


def logout(token):

    url = ''
    headers = {'Authorization': "Bearer {}".format(token)}

    r = requests.get(url, headers=headers)

    if r.status_code == 200:
        return True
    else:
        data = r.json()
        print("Response::", data)
        return jsonify({'error': 'Failed to logout user'}), 500, False
    
# headers = flask.request.headers
# bearer = headers.get('Authorization')    # Bearer YourTokenHere
# token = bearer.split()[1]  # YourTokenHere