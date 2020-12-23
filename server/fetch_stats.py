import urllib.request
import json

username = 'reqant'

def fetch_stats(old_stats=None):
  stats = {}
  with urllib.request.urlopen('https://oldschool.tools/ajax/hiscore-stats/' + username) as response:
    res = json.loads(response.read())
    res_stats = res['stats']
    stats = {k: res_stats[k]['experience'] for k in res_stats if k != 'overall'}
  if old_stats is not None:
    stats = {k: max(stats[k], old_stats[k]) for k in stats if k in old_stats}
  return stats

if __name__ == '__main__':
  stats = fetch_stats()
  for k in stats:
    print(k + ',' + str(stats[k]))
