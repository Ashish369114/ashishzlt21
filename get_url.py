import urllib.request
import re

html = urllib.request.urlopen('https://dev.zltsos.com').read().decode('utf-8')
js_files = re.findall(r'src="(/static/js/main\.[a-z0-9]+\.js)"', html)
if js_files:
    js = urllib.request.urlopen('https://dev.zltsos.com' + js_files[0]).read().decode('utf-8')
    api_urls = re.findall(r'https?://[a-zA-Z0-9.-]+/?', js)
    filtered = [u for u in api_urls if 'api' in u or 'zltsos' in u]
    print('Potential API URLs:', set(filtered))
else:
    print('No JS files found')
