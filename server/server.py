from sys import argv
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import csv
from fetch_stats import fetch_stats

def line_parser(f):
  def func(line):
    try:
      return f(line)
    except Exception as err:
      print(err)
      print('Failed to parse line:', line)
  return func

def get_csv(filename, parser):
  with open('./data/' + filename + '.csv', 'r', newline='') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    parsed_lines = [parser(line) for line in reader]
    return [l for l in parsed_lines if l is not None]

def get_rewards(name):
  rewards = get_csv(
    'rewards/' + name,
    line_parser(lambda line: {'name': line[0], "level": int(line[1]), "members": bool(line[2])})
  )
  max_level = [{'name': 'Max', "level": 99, "members": False}]
  quest_rewards = [({
    'name': q['name'],
    "level": q['skillReqs'][name],
    "members": True
  }) for q in get_quests() if name in q['skillReqs']]
  level_reqs = next(l for l in get_level_reqs() if l['skill'] == name)
  diaries = ["easy", "medium", "hard", "elite"]
  diary_reqs = [({
    "name": d.capitalize() + ' diary',
    "level": level_reqs[d],
    "members": True
  }) for d in diaries if level_reqs[d]]
  return sorted(rewards + max_level + quest_rewards + diary_reqs, key=lambda x: x['level'])

def get_actions(name):
  return get_csv(
    'actions/' + name,
    line_parser(lambda line: {'name': line[0], "exp": float(line[1]), "level": int(line[2]), "members": bool(line[3]), "cost": int(line[4] or 0)})
  )

def get_experience():
  return [0] + get_csv('experience', line_parser(lambda x: int(x[1])))

def get_stats():
  return {skill: exp for skill, exp in get_csv('stats', line_parser(lambda x: (x[0], int(x[1]))))}

def get_level_reqs():
  quests = get_quests()
  data = get_csv(
    'levels',
    line_parser(lambda line: {'skill': line[0], "easy": int(line[1] or 0), "medium": int(line[2] or 0), "hard": int(line[3] or 0), "elite": int(line[4] or 0)})
  )
  for line in data:
    skill = line['skill']
    line['quest'] = max(q['skillReqs'].get(skill, 0) for q in quests)
  return data

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

quest_headers = ['name','skill','agility','attack','construction','crafting','cooking','defence','firemaking','fishing','fletching','farming','herblore','hitpoints','hunter','magic','mining','prayer','ranged','runecrafting','slayer','smithing','strength','thieving','woodcutting','combat','enemy_lvl','quest_points','pre_reqs']
def parse_quest(line):
  skill_reqs = {skill: int(req) for skill, req in zip(quest_headers[2:-3], line[2:-3]) if req}
  return {
    'name': line[0],
    'difficulty': line[1],
    'skillReqs': skill_reqs,
    'questReqs': line[-1].split('|') if line[-1] else [],
    'enemyLvl': int(line[-3] or 0),
  }

def get_quests():
  return get_csv('quests', line_parser(parse_quest))

def write_completed_quest(quest):
  with open('./data/completed_quests.csv','a') as f:
    f.write('\n' + quest)

def parse_achievement(line):
  difficulty, name, quests, skills, complete = line
  skill_reqs = dict((sk.split(':')[0], int(sk.split(':')[1])) for sk in skills.split('|')) if skills else {}
  return {
    'name': name,
    'difficulty': difficulty,
    'skillReqs': skill_reqs,
    'questReqs': quests.split('|') if quests else [],
    'complete': bool(complete),
  }

def get_achievements(area):
  return get_csv('achievements/' + area, line_parser(parse_achievement))

def write_completed_achievement(area, name):
  lines = []
  with open('./data/achievements/' + area + '.csv','r') as f:
    lines = f.readlines()
  with open('./data/achievements/' + area + '.csv','w') as f:
    for line in lines:
      if line.split(',')[1] == name:
        f.write(line.strip() + 'true\n')
      else:
        f.write(line)

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
    if path_parts[0] == 'complete_quest':
      write_completed_quest(post_body['quest'])
      data = get_completed_quests()
    if path_parts[0] == 'complete_achievement':
      write_completed_achievement(post_body['area'], post_body['name'])
      data = get_achievements(post_body['area'])
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
    if path_parts[0] == 'achievements':
      data = get_achievements(path_parts[1])
    if path_parts[0] == 'level_reqs':
      data = get_level_reqs()
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
