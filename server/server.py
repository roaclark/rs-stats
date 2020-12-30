from sys import argv
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import csv
from fetch_stats import fetch_stats

def get_csv(filename, parser):
  with open('./data/' + filename + '.csv', 'r', newline='') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    return [parser(line) for line in reader]

def get_rewards(name):
  return get_csv(
    'rewards/' + name,
    lambda line: {'name': line[0], "level": int(line[1]), "members": bool(line[2])}
  ) + [{'name': 'Max', "level": 99, "members": False}]

def get_actions(name):
  return get_csv(
    'actions/' + name,
    lambda line: {'name': line[0], "exp": float(line[1]), "members": bool(line[2]), "cost": int(line[3] or 0)}
  )

def get_experience():
  return [0] + get_csv('experience', lambda x: int(x[1]))

def get_stats():
  return {skill: exp for skill, exp in get_csv('stats', lambda x: (x[0], int(x[1])))}

def write_stats(stats):
  with open('./data/stats.csv','w') as f:
    f.write('skill,exp\n' + '\n'.join([','.join([k, str(stats[k])]) for k in stats]))

def update_level(stats, exp, stat, level):
  new_exp = exp[level]
  if new_exp > stats[stat]:
    print('Updating experience for {} ({} => {})'.format(stat, stats[stat], new_exp))
    stats[stat] = new_exp
    write_stats(stats)
  return stats

def get_skills():
  return get_csv('skills', lambda line: {'name': line[0], "members": bool(line[1])})

quest_headers = ['name','skill','agility','attack','construction','crafting','cooking','defense','firemaking','fishing','fletching','gardening','herblore','hitpoints','hunter','magic','mining','prayer','ranged','runecrafting','slayer','smithing','strength','thieving','woodcutting','combat','quest_points','pre_reqs']
def parse_quest(line):
  skill_reqs = {skill: int(req) for skill, req in zip(quest_headers[2:-2], line[2:-2]) if req}
  return {
    'name': line[0],
    'difficulty': line[1],
    'skillReqs': skill_reqs,
    'questReqs': line[-1].split('|') if line[-1] else [],
  }

def get_quests():
  return get_csv('quests', parse_quest)

def get_completed_quests():
  return get_csv('completed_quests', lambda x: x[0])

class StatsServer(BaseHTTPRequestHandler):
  def _set_headers(self):
    self.send_response(200)
    self.send_header('Content-type', 'application/json')
    self.end_headers()

  def do_POST(self):
    content_len = int(self.headers.get('Content-Length') or 0)
    post_body = None
    if content_len:
      post_body = json.loads(self.rfile.read(content_len))
    data = None
    path_parts = self.path[1:].split('/')
    if path_parts[0] == 'refresh_stats':
      old_stats = get_stats()
      try:
        data = fetch_stats(old_stats=old_stats)
        write_stats(data)
      except Exception as e:
        print('Failed to fetch stats (Error:', e, ')')
        data = old_stats
    if path_parts[0] == 'update_level':
      exp = get_experience()
      old_stats = get_stats()
      data = update_level(old_stats, exp, post_body['stat'], post_body['level'])
    self._set_headers()
    self.wfile.write(bytes(json.dumps(data), "utf-8"))

  def do_GET(self):
    data = None
    path_parts = self.path[1:].split('/')
    if path_parts[0] == 'rewards':
      data = get_rewards(path_parts[1])
    if path_parts[0] == 'actions':
      data = get_actions(path_parts[1])
    if path_parts[0] == 'experience':
      data = get_experience()
    if path_parts[0] == 'stats':
      data = get_stats()
    if path_parts[0] == 'skills':
      data = get_skills()
    if path_parts[0] == 'quests':
      data = get_quests()
    if path_parts[0] == 'completed':
      data = get_completed_quests()
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
