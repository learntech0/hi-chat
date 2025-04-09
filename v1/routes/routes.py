from flask import Blueprint, render_template, send_file

index_view = Blueprint('index_view', __name__)


@index_view.route('/')
def index():
    return render_template('index.html')


@index_view.route('/manifest.json')
def serve_manifest():
    return send_file('static/pwa/manifest.json', mimetype='application/manifest+json')

@index_view.route('/sw.js')
def serve_sw():
    return send_file('static/pwa/sw.js', mimetype='application/javascript')



