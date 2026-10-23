"""Flatten the self-unpacking page into one plain HTML page for hosts that
block blob: scripts (a claude.ai artifact, for example).

    python3 homepage-v3/flatten.py [OUT]

Takes Superintelligent_Homepage.html (the bundle), inlines its scripts,
turns its fonts and images into data: URIs, and drops the unpacker. React
loads from unpkg, as the page's runtime does when no local copy is mapped.
"""
import base64, gzip, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'Superintelligent_Homepage.html')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'Superintelligent_Homepage.flat.html')

page = open(SRC, encoding='utf-8').read()
block = lambda kind: re.search(r'<script type="__bundler/' + kind + r'"[^>]*>(.*?)</script>', page, re.S).group(1)
manifest = json.loads(block('manifest'))
template = json.loads(block('template'))
ext = {e['uuid'] for e in json.loads(block('ext_resources'))}

def raw(entry):
    data = base64.b64decode(entry['data'])
    return gzip.decompress(data) if entry.get('compressed') else data

deferred = []
for uid, entry in manifest.items():
    if uid in ext:
        continue  # React / ReactDOM: loaded from unpkg by the runtime
    if entry['mime'] == 'text/javascript':
        code = raw(entry).decode('utf-8').replace('</script', '<\\/script')
        tag = f'<script src="{uid}"></script>'
        assert template.count(tag) == 1, uid
        inline = f'<script>{code}</script>'
        if template.find(tag) > template.find('<helmet>') > -1:
            # The runtime re-reads <helmet> children as template text, which
            # would mangle inline code. This one only defines <image-slot>, so
            # it can run once at the end of the page instead.
            template = template.replace(tag, '')
            deferred.append(inline)
        else:
            template = template.replace(tag, inline)
    else:
        uri = f"data:{entry['mime']};base64,{base64.b64encode(raw(entry)).decode()}"
        assert uid in template, uid
        template = template.replace(uid, uri)

template = template.replace('</body>', '\n'.join(deferred) + '\n</body>', 1)

# The runtime splits style attributes on ';', which would cut a data URI
# short at ';base64'. Write the semicolon as a CSS escape instead: the
# browser decodes it, the runtime never sees it. Inside the component's
# JavaScript strings the backslash itself needs escaping.
WEBP = 'data:image/webp;base64,'
i = template.find('<script type="text/x-dc"')
j = template.find('</script>', i)
assert i > 0 and j > i
template = (template[:i].replace(WEBP, 'data:image/webp\\3b base64,')
            + template[i:j].replace(WEBP, 'data:image/webp\\\\3b base64,')
            + template[j:].replace(WEBP, 'data:image/webp\\3b base64,'))

# An empty resource map tells the runtime it is already unpacked, so it
# loads React from the CDN instead of refetching this page.
template = template.replace('<head>', '<head>\n<script>window.__resources = {};</script>', 1)

# The host wraps the page in its own document skeleton.
for tag in ['<!DOCTYPE html>', '<html>', '<head>', '</head>', '<body>', '</body>', '</html>']:
    template = template.replace(tag, '', 1)
template = template.replace('<meta charset="utf-8">', '<title>Superintelligent Homepage</title>', 1)

open(OUT, 'w', encoding='utf-8').write(template.strip() + '\n')
print(f'{len(template) // 1024} KB -> {os.path.relpath(OUT)}')
