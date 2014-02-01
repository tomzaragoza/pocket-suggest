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
	redirect_uri = 'http://goesbackto.biz/dashboard'

	headers = {'X-Accept': 'application/json'}
	params = {'consumer_key': consumer_key, 'redirect_uri': redirect_uri}
	r = requests.post('https://getpocket.com/v3/oauth/request', data=params, headers=headers)
	request_token = json.loads(r.content)['code']

	# get_request_token doesn't work for some reason
	# request_token = Pocket.get_request_token(consumer_key=consumer_key, redirect_uri=redirect_uri)
	redirect_uri += '?request_token={0}'.format(request_token)
	auth_url = pocket.Pocket.get_auth_url(code=request_token, redirect_uri=redirect_uri)

	return redirect(auth_url)


@app.route('/dashboard')
def dashboard():
	consumer_key = '23288-42e6b34a0926a23e7bb4ba98'
	request_token = request.args.get('request_token')

	headers = {'X-Accept': 'application/json'}
	params = {'consumer_key': consumer_key, 'code': request_token}
	r = json.loads(requests.post('https://getpocket.com/v3/oauth/authorize', data=params, headers=headers).content)
	# username = pocket.Pocket.get_credentials(consumer_key=consumer_key, code=request_token)
	access_token = r['access_token']#pocket.Pocket.get_access_token(consumer_key=consumer_key, code=request_token)
	username = r['username']
	pocket_instance = pocket.Pocket(consumer_key, access_token)

	queue = []
	archived = []
	
	readlist = pocket_instance.get()#[0]['list']
	if readlist is not None:
		readlist = readlist[0]
	if readlist is not None:
		readlist = readlist['list']


	for l in readlist.iterkeys():
		link_item = readlist[l]
		if 'given_title' in link_item:
			title = link_item['given_title']
		elif 'resolved_title' in link_item:
			title = link_item['resolved_title']
		else:
			title = ''
		readtime = round(int(link_item['word_count'])/ 200.0) if 'word_count' in link_item else 0.0
		resolved_id = link_item['resolved_id'] if 'resolved_id' in link_item else link_item['item_id']
		url = 'https://getpocket.com/a/read/{0}'.format(resolved_id)

		doc = {'title': title, 'readtime': readtime, 'url': url}
		queue.append(doc)

		if not collection.find_one({'title': title}):
			collection.insert(doc)
		else:
			collection.update({'title': title}, doc, upsert=True)

	return render_template('dashboard.html', username=username, queue=queue, archived=archived, request_token=request_token)

@app.route('/suggest')
def suggest():
	minutes = request.args.get('minutes')

	suggest_list = list(collection.find({'readtime': {'$lte': round(float(minutes))} }).sort('readtime', -1).limit(6) )
	return render_template('suggest.html', suggested=suggest_list)

if __name__ == '__main__':
	app.run(debug=True)
