import urllib.request
import json

username = 'reqant'

def fetch_stats(old_stats=None, persist=False):
  if persist and old_stats is None:
    raise Exception('Cannot persist without previous stats for comparison')
  stats = {}
  with urllib.request.urlopen('https://oldschool.tools/ajax/hiscore-stats/' + username) as response:
    res = json.loads(response.read())
    res_stats = res['stats']
    stats = {k: res_stats[k]['experience'] for k in res_stats if k != 'overall'}
  if old_stats is not None:
    stats = {k: max(stats[k], old_stats[k]) for k in stats if k in old_stats}
  if persist:
    with open('./data/stats.csv','rw') as f:
      data = 'skill,exp\n' + '\n'.join([','.join(k, stats[k]) for k in stats])
  return stats

if __name__ == '__main__':
  stats = fetch_stats()
  for k in stats:
    print(k + ':', stats[k])
