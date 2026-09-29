import urllib.request,re
urls=['https://fram_ymm.apacatapult.com/assets/jquery/js/apa_autocomplete.min.js?v=202637','https://fram_ymm.apacatapult.com/assets/jquery/js/apa_angular.min.js','https://fram_ymm.apacatapult.com/assets/jquery/js/apa_ymmwidget.min.js?v=202637']
for u in urls:
 t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.fram.com/'}),timeout=30).read().decode('utf-8','ignore')
 print('\nURL',u,'LEN',len(t))
 found=sorted(set(re.findall(r'https?://[^"\' )]+|/[A-Za-z0-9_./?-]{3,}',t)))
 for x in found:
  if any(k in x.lower() for k in ['api','search','year','make','model','part','ajax','ymm','lookup','filter']): print(x)
 for k in ['$.ajax','ajax(','url:','endpoint','baseurl','api/','partnumber','year','make','model']:
  p=t.lower().find(k.lower())
  if p>=0: print('\n',k, re.sub(r'\s+',' ',t[max(0,p-500):p+1800])[:2300])
