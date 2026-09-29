import urllib.request,re
u='https://www.fram.com/'
h=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode('utf-8','ignore')
for term in ['id="part_finder"','data-mage-init','x-magento-init','apa_autoComplete','advanced-search']:
 p=h.lower().find(term.lower())
 print('\nTERM',term,'POS',p)
 if p>=0: print(re.sub(r'\s+',' ',h[max(0,p-4000):p+12000]))
