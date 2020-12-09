from sys import argv
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import csv

rewards = {}
actions = {}
experience = None

def get_csv(filename, parser):
  with open('./data/' + filename + '.csv', 'r', newline='') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    return [parser(line) for line in reader]

def get_rewards(name):
  global rewards
  if name not in rewards:
    rewards[name] = get_csv(
      'rewards/' + name,
      lambda line: {'name': line[0], "level": int(line[1]), "members": bool(line[2])}
    )
  return rewards[name]

def get_actions(name):
  global actions
  if name not in actions:
    actions[name] = get_csv(
      'actions/' + name,
      lambda line: {'name': line[0], "exp": int(line[1]), "members": bool(line[2])}
    )
  return actions[name]

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
    path_parts = '/'.split(self.path)
    if path_parts[0] == '/rewards/':
      data = get_rewards(path_parts[1])
    if path_parts[0] == '/actions/':
      data = get_actions(path_parts[1])
    if path_parts[0] == '/experience':
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
