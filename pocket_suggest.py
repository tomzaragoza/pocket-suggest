from gevent.wsgi import WSGIServer
from app import app

http_server = WSGIServer(('', 5000), app)
print "http_server setup done, serving forever now."
http_server.serve_forever()
