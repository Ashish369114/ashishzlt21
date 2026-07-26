import urllib.request
import re
try:
    html = urllib.request.urlopen('https://dev.zltsos.com').read().decode('utf-8')
    js_files = re.findall(r'src="(/static/js/main\.[a-z0-9]+\.js)"', html)
    if js_files:
        js = urllib.request.urlopen('https://dev.zltsos.com' + js_files[0]).read().decode('utf-8')
        matches = re.findall(r'http[s]?://[a-zA-Z0-9.-]+/api', js)
        print('Found API URLs in JS:', set(matches))
    else:
        print('No main.js found')
except Exception as e:
    print('Error:', e)
