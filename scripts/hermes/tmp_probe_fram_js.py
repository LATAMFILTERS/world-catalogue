import urllib.request,re,urllib.parse
base='https://www.fram.com/'
h=urllib.request.urlopen(urllib.request.Request(base,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode('utf-8','ignore')
srcs=re.findall(r'<script[^>]+src=["\']([^"\']+)',h,re.I)
print('scripts',len(srcs))
for src in srcs:
    u=urllib.parse.urljoin(base,src)
    try:
        t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0','Referer':base}),timeout=20).read().decode('utf-8','ignore')
    except Exception as e:
        continue
    low=t.lower()
    if any(k in low for k in ['partfinder','showmetheparts','apasearch','search_query_adv','vehiclemake','modelyear']):
        print('\nJS',u,'LEN',len(t))
        for k in ['partfinder','showmetheparts','apasearch','search_query_adv','vehiclemake','modelyear']:
            p=low.find(k)
            if p>=0: print(k, re.sub(r'\s+',' ',t[max(0,p-600):p+1600])[:2200])
