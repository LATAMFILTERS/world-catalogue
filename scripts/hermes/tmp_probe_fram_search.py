import urllib.request,re,urllib.parse
u='https://www.fram.com/partFinder/page/index/?q='+urllib.parse.quote('CA10193')
req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.fram.com/'})
r=urllib.request.urlopen(req,timeout=30)
h=r.read().decode('utf-8','ignore')
print('STATUS',r.status,'LEN',len(h),'URL',r.geturl())
for pat in ['CA10193','showmetheparts','api','ajax','graphql']:
    print(pat, h.lower().find(pat.lower()))
print(re.sub(r'\s+',' ',h[h.lower().find('ca10193')-1000:h.lower().find('ca10193')+3000]) if 'ca10193' in h.lower() else h[:2000])
