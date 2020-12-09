from sys import argv
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import csv

actions = {}
training = {}
experience = None

def get_csv(filename, parser):
  with open('./data/' + filename + '.csv', 'r', newline='') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    return [parser(line) for line in reader]

def get_actions(name):
  global actions
  if name not in actions:
    actions[name] = get_csv(
      'actions/' + name,
      lambda line: {'name': line[0], "level": int(line[1]), "members": bool(line[2])}
    )
  return actions[name]

def get_training(name):
  global training
  if name not in training:
    training[name] = get_csv(
      'training/' + name,
      lambda line: {'name': line[0], "exp": int(line[1]), "members": bool(line[2])}
    )
  return training[name]

def get_experience():
  global experience
  if experience is None:
    experience = get_csv('experience', lambda x: int(x[1]))
  return experience


class StatsServer(BaseHTTPRequestHandler):
  def _set_headers(self):
    self.send_response(200)
    self.send_header('Content-type', 'application/json')
    self.end_headers()

  def do_GET(self):
    data = None
    if self.path.startswith('/actions/'):
      data = get_actions(self.path[11:])
    if self.path.startswith('/training/'):
      data = get_training(self.path[10:])
    if self.path.startswith('/experience'):
      data = get_experience()
    self._set_headers()
    self.wfile.write(bytes(json.dumps(data), "utf-8"))

if __name__ == "__main__":
  server_port = argv[1] if len(argv) > 1 else 8000
  host_name = 'localhost'
  server = HTTPServer((host_name, server_port), StatsServer)
  print("Server started http://%s:%s" % (host_name, server_port))

  try:
      server.serve_forever()
  except KeyboardInterrupt:
      pass

  server.server_close()
  print("Server stopped.")
