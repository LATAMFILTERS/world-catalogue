import re,urllib.parse,urllib.request
q='site:fram.com/fram-extra-guard-air-filter FRAM'
u='https://www.google.com/search?num=100&q='+urllib.parse.quote(q)
req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
with urllib.request.urlopen(req,timeout=20) as r:
    text=r.read().decode('utf-8','ignore')
print(len(text))
for m in re.finditer('fram.com',text,re.I):
    s=max(0,m.start()-150); e=min(len(text),m.end()+250)
    print(text[s:e].replace('&amp;','&')[:400])
