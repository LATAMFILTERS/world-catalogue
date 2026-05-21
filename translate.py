#!/usr/bin/env python3
"""
ELIMFILTERS — Auto-translation script via DeepL + Google Translate APIs
Usage: python3 translate.py --deepl-key YOUR_KEY

DeepL free key: https://www.deepl.com/pro-api  (no credit card needed)
"""

import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error

DEEPL_LANGS = {
    'fr': 'FR',   # French
    'it': 'IT',   # Italian
    'nl': 'NL',   # Dutch
    'ru': 'RU',   # Russian
    'zh': 'ZH',   # Chinese Simplified
    'ja': 'JA',   # Japanese
    'pt': 'PT',   # Portuguese (bonus)
}

# Arabic and Persian: use Google Translate free endpoint
GOOGLE_LANGS = {
    'ar': 'ar',   # Arabic
    'fa': 'fa',   # Persian/Farsi
}

BASE_DIR = os.path.join(os.path.dirname(__file__), 'frontend', 'public', 'locales')
EN_FILE  = os.path.join(BASE_DIR, 'en', 'translation.json')


def flatten(obj, prefix=''):
    """Flatten nested JSON to list of (key_path, value) for strings only."""
    items = []
    for k, v in obj.items():
        path = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.extend(flatten(v, path))
        elif isinstance(v, list):
            for i, s in enumerate(v):
                if isinstance(s, str):
                    items.append((f"{path}[{i}]", s))
        elif isinstance(v, str):
            items.append((path, v))
    return items


def unflatten(pairs):
    """Rebuild nested dict from (key_path, value) pairs."""
    result = {}
    for path, value in pairs:
        keys = []
        part = ''
        in_bracket = False
        for ch in path:
            if ch == '[':
                if part:
                    keys.append(('key', part))
                    part = ''
                in_bracket = True
            elif ch == ']':
                keys.append(('idx', int(part)))
                part = ''
                in_bracket = False
            elif ch == '.' and not in_bracket:
                if part:
                    keys.append(('key', part))
                    part = ''
            else:
                part += ch
        if part:
            keys.append(('key', part))

        node = result
        for i, (typ, k) in enumerate(keys[:-1]):
            nxt_typ, nxt_k = keys[i + 1]
            if typ == 'key':
                if k not in node:
                    node[k] = [] if nxt_typ == 'idx' else {}
                node = node[k]
            else:
                while len(node) <= k:
                    node.append(None)
                if node[k] is None:
                    node[k] = [] if nxt_typ == 'idx' else {}
                node = node[k]

        last_typ, last_k = keys[-1]
        if last_typ == 'key':
            node[last_k] = value
        else:
            while len(node) <= last_k:
                node.append(None)
            node[last_k] = value

    return result


def translate_deepl(texts, target_lang, api_key):
    """Translate list of strings via DeepL API."""
    url = 'https://api-free.deepl.com/v2/translate'
    results = []
    chunk = 50  # DeepL allows up to 50 texts per request

    for i in range(0, len(texts), chunk):
        batch = texts[i:i + chunk]
        params = {
            'auth_key': api_key,
            'target_lang': target_lang,
            'source_lang': 'EN',
            'tag_handling': 'xml',
        }
        for t in batch:
            params.setdefault('text', [])
            if isinstance(params['text'], list):
                params['text'].append(t)

        # Build request manually
        data = urllib.parse.urlencode(
            [('text', t) for t in batch] +
            [('auth_key', api_key), ('target_lang', target_lang), ('source_lang', 'EN')]
        ).encode()

        req = urllib.request.Request(url, data=data, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                body = json.loads(resp.read())
                results.extend([t['text'] for t in body['translations']])
        except urllib.error.HTTPError as e:
            print(f"  DeepL error {e.code}: {e.read().decode()}")
            results.extend(batch)  # fallback: keep English
        time.sleep(0.3)

    return results


def translate_google(texts, target_lang):
    """Simple Google Translate using unofficial endpoint (no key required)."""
    results = []
    for text in texts:
        encoded = urllib.parse.quote(text)
        url = (
            f"https://translate.googleapis.com/translate_a/single"
            f"?client=gtx&sl=en&tl={target_lang}&dt=t&q={encoded}"
        )
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read())
                translated = ''.join(part[0] for part in data[0] if part[0])
                results.append(translated)
        except Exception as e:
            print(f"  Google error: {e}")
            results.append(text)
        time.sleep(0.2)
    return results


def process_language(lang_code, target_api_code, api_type, api_key, en_pairs):
    out_dir  = os.path.join(BASE_DIR, lang_code)
    out_file = os.path.join(out_dir, 'translation.json')
    os.makedirs(out_dir, exist_ok=True)

    paths  = [p for p, _ in en_pairs]
    values = [v for _, v in en_pairs]

    print(f"\n[{lang_code.upper()}] Translating {len(values)} strings via {api_type}...")

    if api_type == 'deepl':
        translated = translate_deepl(values, target_api_code, api_key)
    else:
        translated = translate_google(values, target_api_code)

    pairs = list(zip(paths, translated))
    data  = unflatten(pairs)

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  Saved → {out_file}")


def main():
    # Parse --deepl-key argument
    deepl_key = None
    for i, arg in enumerate(sys.argv):
        if arg == '--deepl-key' and i + 1 < len(sys.argv):
            deepl_key = sys.argv[i + 1]

    if not deepl_key:
        print("Usage: python3 translate.py --deepl-key YOUR_DEEPL_FREE_KEY")
        print("\nGet your free key at: https://www.deepl.com/pro-api")
        print("(No credit card required for the free tier)\n")
        sys.exit(1)

    with open(EN_FILE, encoding='utf-8') as f:
        en_data = json.load(f)

    en_pairs = flatten(en_data)
    print(f"Loaded {len(en_pairs)} strings from English source.")

    # DeepL languages
    for lang_code, api_code in DEEPL_LANGS.items():
        if lang_code == 'es':
            print(f"\n[ES] Spanish already translated manually — skipping.")
            continue
        process_language(lang_code, api_code, 'deepl', deepl_key, en_pairs)

    # Google languages (Arabic + Persian)
    for lang_code, api_code in GOOGLE_LANGS.items():
        process_language(lang_code, api_code, 'google', deepl_key, en_pairs)

    print("\n✅ All languages translated successfully.")
    print("Now run: cd frontend && npm run build && git add -A && git commit")


if __name__ == '__main__':
    main()
