import urllib.request,re
u='https://www.fram.com/'
h=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode('utf-8','ignore')
m=re.search(r'<form class="form apasearchform"[\s\S]{0,12000}?</form>',h,re.I)
print(m.group(0) if m else 'NOFORM')
