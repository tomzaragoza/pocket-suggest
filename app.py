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

consumer_key = '23364-ac9c861354d534ddf0c31dff'
redirect_uri = 'http://goesbackto.biz/dashboard'

@app.route('/')
def hello_world():
	return render_template('index.html')



def get_request_token(consumer_key, redirect_uri):
	headers = {'X-Accept': 'application/json'}
	params = {'consumer_key': consumer_key, 'redirect_uri': redirect_uri}
	r = requests.post('https://getpocket.com/v3/oauth/request', data=params, headers=headers)
	request_token = json.loads(r.content)['code']
	
	return request_token

@app.route('/authenticate')
def authenticate():

	request_token = get_request_token(consumer_key, redirect_uri)
	uri = redirect_uri + '?request_token={0}'.format(request_token)
	auth_url = pocket.Pocket.get_auth_url(code=request_token, redirect_uri=uri)

	return redirect(auth_url)

@app.route('/dashboard')
def dashboard():

	request_token = str(request.args.get('request_token'))

	try:
		user_credentials = pocket.Pocket.get_credentials(consumer_key=consumer_key, code=request_token)
	except:
		# RateLimitException
		return redirect(url_for('authenticate'))

	access_token = user_credentials['access_token']
	username = user_credentials['username']

	headers = {'X-Accept': 'application/json'}
	data = {'consumer_key': consumer_key, 'access_token': access_token, 'state': 'all'}
	r = json.loads(requests.post('https://getpocket.com/v3/get', data=data, headers=headers).content)

	queue = []

	readlist = r['list']

	for l in readlist.iterkeys():

		link_item = readlist[l]
		status = int(link_item['status'])

		if 'given_title' in link_item:
			title = link_item['given_title']
		elif 'resolved_title' in link_item:
			title = link_item['resolved_title']
		else:
			title = ''

		readtime = round(int(link_item['word_count'])/ 200.0) if 'word_count' in link_item else 0.0
		resolved_id = link_item['resolved_id'] if 'resolved_id' in link_item else link_item['item_id']
		url = 'https://getpocket.com/a/read/{0}'.format(resolved_id)

		doc = {'title': title, 'readtime': readtime, 'url': url, 'status': status}

		if status == 0: # unread
			queue.append(doc)

		# update it in mongoDB if it's read / unread 
		# so that it will be used appropriately in /suggest
		if not collection.find_one({'title': title}):
			collection.insert(doc)
		else:
			collection.update({'title': title}, doc, upsert=True)

	return render_template('dashboard.html', username=username, queue=queue, request_token=request_token)

@app.route('/suggest')
def suggest():
	minutes = round(float(request.args.get('minutes')))

	suggested_reads = []
	suggest_list = list(collection.find({'readtime': {'$lte': minutes}, 'status': 0 }).sort('readtime', -1))

	for suggestion in suggest_list:
		if minutes > 0.0:
			if minutes - suggestion['readtime'] >= 0:
				suggested_reads.append(suggestion)
				minutes -= suggestion['readtime']


	return render_template('suggest.html', suggested=suggested_reads)

if __name__ == '__main__':
	app.run(debug=True)
