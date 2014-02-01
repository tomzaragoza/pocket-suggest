from flask import *
from pprint import pprint as pretty
from pymongo import MongoClient
import json
import pocket
import requests

app = Flask(__name__)

mongo = MongoClient()
db = mongo['pocket-suggest']
collection = db['suggest-read-data']

@app.route('/')
def hello_world():
	return render_template('index.html')

@app.route('/authenticate')
def authenticate():
	consumer_key = '23288-42e6b34a0926a23e7bb4ba98'
	redirect_uri = 'http://localhost:5000/dashboard'


	headers = {'X-Accept': 'application/json'}
	params = {'consumer_key': consumer_key, 'redirect_uri': redirect_uri}
	r = requests.post('https://getpocket.com/v3/oauth/request', data=params, headers=headers)
	request_token = json.loads(r.content)['code']
	print request_token

	# get_request_token doesn't work for some reason
	# request_token = Pocket.get_request_token(consumer_key=consumer_key, redirect_uri=redirect_uri)
	print "request token got", request_token
	redirect_uri += '?request_token={0}'.format(request_token)
	auth_url = pocket.Pocket.get_auth_url(code=request_token, redirect_uri=redirect_uri)
	print "auth url got", auth_url
	return redirect(auth_url)


@app.route('/dashboard')
def dashboard():
	consumer_key = '23288-42e6b34a0926a23e7bb4ba98'
	request_token = request.args.get('request_token')

	# username = pocket.Pocket.get_credentials(consumer_key=consumer_key, code=request_token)
	access_token = pocket.Pocket.get_access_token(consumer_key=consumer_key, code=request_token)
	pocket_instance = pocket.Pocket(consumer_key, access_token)

	queue = []
	archived = []
	
	readlist = pocket_instance.get()[0]['list']

	for l in readlist.iterkeys():
		link_item = readlist[l]
		title = link_item['resolved_title']
		readtime = round(int(link_item['word_count'])/ 200.0)
		resolved_id = link_item['resolved_id']
		url = 'https://getpocket.com/a/read/{0}'.format(resolved_id)

		doc = {'title': title, 'readtime': readtime, 'url': url}
		queue.append(doc)

		collection.insert(doc, upsert=True)


	print "This is the queue"
	print queue
	return render_template('dashboard.html', username="tom", queue=queue, archived=archived)

@app.route('/suggest')
def suggest():
	return "suggest"

if __name__ == '__main__':
	app.run(debug=True)
