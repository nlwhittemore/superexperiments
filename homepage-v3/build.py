"""Build Superintelligent_Homepage.html: the homepage base with simple
illustrations across every section.

    python3 homepage-v3/build.py

Starts from ../homepage-base/original.html (untouched), applies exact,
asserted edits to its template and component, embeds images/ as bundle
assets, and writes a new single-file page with the same unpacker.

Every illustration is a black alpha mask painted with CSS: ink (#161616) on
light and accent backgrounds, the accent on dark ones, the route color on
the route map. So they all follow the accent picker.
"""
import base64, html, json, os, re, sys, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'homepage-base', 'original.html')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'Superintelligent_Homepage.html')
INK, ACC = '#161616', 'var(--acc,#B9A7FF)'

page = open(SRC, encoding='utf-8').read()

def script_block(kind):
    m = re.search(r'(<script type="__bundler/' + kind + r'"[^>]*>)(.*?)(</script>)', page, re.S)
    assert m, kind
    return m

manifest = json.loads(script_block('manifest').group(2))
template = json.loads(script_block('template').group(2))

# ---------------------------------------------------------------- assets
ID, SIZE = {}, {}
for f in sorted(os.listdir(os.path.join(HERE, 'images'))):
    name = f[:-5]
    path = os.path.join(HERE, 'images', f)
    ID[name] = str(uuid.uuid5(uuid.NAMESPACE_URL, f'superintelligent/homepage-v3/{name}'))
    data = open(path, 'rb').read()
    manifest[ID[name]] = {'mime': 'image/webp', 'compressed': False, 'data': base64.b64encode(data).decode()}
    # webp VP8L header: 14-bit width-1 and height-1 after the 0x2f signature
    b = data[21:25]
    SIZE[name] = (1 + (b[0] | (b[1] & 0x3F) << 8), 1 + ((b[1] >> 6) | b[2] << 2 | (b[3] & 0x0F) << 10))

def ill(style, url, pos='center'):
    """An illustration painted by CSS mask. url is a uuid or a {{ binding }}."""
    return (f"{style};-webkit-mask:url('{url}') {pos}/contain no-repeat;"
            f"mask:url('{url}') {pos}/contain no-repeat")

def icon(name_or_binding, size, color=INK, extra='', pos='center'):
    url = ID.get(name_or_binding, name_or_binding)
    return f'<span aria-hidden="true" style="{ill(f"display:block;flex-shrink:0;width:{size};height:{size};background:{color}{extra}", url, pos)}"></span>'

def scene(name, color, style, label):
    w, h = SIZE[name]
    return (f'<div role="img" aria-label="{label}" style="{ill(f"width:100%;aspect-ratio:{w}/{h};background:{color};{style}", ID[name], "left center")}"></div>')

def when(markup):
    return f'<sc-if value="{{{{ ill }}}}" hint-placeholder-val="{{{{ true }}}}">{markup}</sc-if>'

edits = 0
def sub(old, new, count=1):
    global template, edits
    n = template.count(old)
    assert n == count, f'expected {count}x, found {n}: {old[:100]!r}'
    template = template.replace(old, new)
    edits += 1

def sub_each(old, news):
    """Replace successive occurrences of old with each item of news."""
    global template, edits
    parts = template.split(old)
    assert len(parts) == len(news) + 1, f'{len(parts) - 1} != {len(news)}: {old[:80]!r}'
    template = parts[0] + ''.join(new + rest for new, rest in zip(news, parts[1:]))
    edits += 1

# ---------------------------------------------------------------- props
m = re.search(r'data-props="([^"]*)"', template)
props = json.loads(html.unescape(m.group(1)))
props['illustrations'] = {'editor': 'enum', 'default': 'On', 'options': ['On', 'Off'], 'tsType': 'string'}
template = template[:m.start(1)] + html.escape(json.dumps(props, separators=(',', ':')), quote=True) + template[m.end(1):]

# ---------------------------------------------------------------- component
ic = ',\n'.join(f"  '{k}': '{v}'" for k, v in ID.items())
sub("\nconst Q = [",
    "\n// Illustrations (GPT Image 2.5): black masks painted with CSS, so they follow the accent picker\n"
    f"const IC = {{\n{ic},\n}};\nconst Q = [")
sub("function route({ who, use, goal }) {",
    "P.F.icon = IC['p-foundations']; P.P.icon = IC['p-professional']; P.A.icon = IC['p-advanced']; P.C.icon = IC['p-champions'];\n"
    "const Q_ICONS = [IC['q-who'], IC['q-usage'], IC['q-goal']];\n"
    "const BUILD_ICONS = [IC['b-briefing'], IC['b-team'], IC['b-map'], IC['b-ops'], IC['b-shared'], IC['b-fix']];\n"
    "const PATH_ICONS = [IC['p-foundations'], IC['p-professional'], IC['p-advanced']];\n"
    "const FREE_ICONS = [IC['f-newyear'], IC['f-summer'], IC['f-claw'], IC['f-agentos'], IC['f-multiplayer'], IC['f-lab']];\n"
    "const ROUTE_ICONS = [IC['r-everyday'], IC['r-build'], IC['r-team'], IC['r-lead'], IC['r-keepup']];\n"
    "function route({ who, use, goal }) {")
sub("""    const headline = this.props.headline ?? 'Learn AI by building with it.';
    return {""",
    """    const headline = this.props.headline ?? 'Learn AI by building with it.';
    const ill = (this.props.illustrations ?? 'On') === 'On';
    return {
      ill, plus: !ill,""")
sub("n: `0${i + 1}`, title: q.title,", "n: `0${i + 1}`, title: q.title, icon: Q_ICONS[i],")
sub("builds: BUILDS.map(([title, line, tag], i) => ({ n: `0${i + 1}`, title, line, tag })),",
    "builds: BUILDS.map(([title, line, tag], i) => ({ n: `0${i + 1}`, title, line, tag, icon: BUILD_ICONS[i] })),")
sub("path: PATH,", "path: PATH.map((p, i) => ({ ...p, icon: PATH_ICONS[i] })),")
sub("free: FREE.map((f, i) => ({ ...f, ", "free: FREE.map((f, i) => ({ ...f, icon: FREE_ICONS[i], ")
sub("""freeActive: { whoLabel: "Who it's for", ...FREE[this.state.freeIdx] },""",
    """freeActive: { whoLabel: "Who it's for", ...FREE[this.state.freeIdx], icon: FREE_ICONS[this.state.freeIdx] },""")
sub("goal: r.goal, color: r.color, tint: r.tint,", "goal: r.goal, color: r.color, tint: r.tint, icon: ROUTE_ICONS[i],")

# ---------------------------------------------------------------- hero: program icons in the start list
for prog, when_, name in [('AI &amp; Agents Professional', 'starts Mon, Nov 2', 'p-professional'),
                          ('AI &amp; Agents Advanced', 'starts Mon, Nov 9', 'p-advanced'),
                          ('AI Champions Bootcamp', 'starts Mon, Nov 16', 'p-champions')]:
    line = f'<span><strong style="font-weight:600;color:#161616">{prog}</strong> · {when_}</span>'
    sub(f'        {line}\n',
        f'        <span style="display:flex;align-items:center;gap:10px">{when(icon(name, "20px"))}{line}</span>\n')

# ---------------------------------------------------------------- finder
sub("""<h3 style="margin:0;font-family:'Inter Tight',sans-serif;font-weight:700;font-size:28px;letter-spacing:-0.03em">{{ q.title }}</h3></div>""",
    """<h3 style="margin:0;font-family:'Inter Tight',sans-serif;font-weight:700;font-size:28px;letter-spacing:-0.03em">{{ q.title }}</h3>"""
    + when(icon('{{ q.icon }}', '40px', ACC, ';margin-left:auto;align-self:center')) + "</div>")
sub("""        <h3 style="margin:0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(36px,3.6vw,52px);line-height:0.95;letter-spacing:-0.05em">{{ result.name }}</h3>""",
    "        " + when(icon('{{ result.icon }}', '60px')) + """
        <h3 style="margin:0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(36px,3.6vw,52px);line-height:0.95;letter-spacing:-0.05em">{{ result.name }}</h3>""")

# ---------------------------------------------------------------- what people build: an icon per build
sub("""          <span style="font-size:15px;color:#8A8A83;padding-top:6px">{{ b.n }}</span>""",
    """          <span style="font-size:15px;color:#8A8A83;padding-top:6px"><sc-if value="{{ plus }}" hint-placeholder-val="{{ false }}">{{ b.n }}</sc-if>"""
    + when(icon('{{ b.icon }}', '38px', INK, ';margin-top:-8px')) + """</span>""")

# ---------------------------------------------------------------- programs
sub("""<span style="font-size:13px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase">{{ p.level }}</span>""",
    """<span style="font-size:13px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase">{{ p.level }}</span>"""
    + when(icon('{{ p.icon }}', '56px', INK, ';margin-left:auto')))
sub("""        <h4 style="margin:0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(34px,3.4vw,48px);line-height:1;letter-spacing:-0.045em">AI Champions Bootcamp</h4>""",
    "        " + when(icon('p-champions', '56px')) + """
        <h4 style="margin:0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(34px,3.4vw,48px);line-height:1;letter-spacing:-0.045em">AI Champions Bootcamp</h4>""")
sub("""<p style="margin:32px 0 0;font-size:17px;font-weight:600">Full refund""",
    f"""<p style="margin:32px 0 0;font-size:17px;font-weight:600;display:flex;align-items:center;gap:12px">{when(icon('refund', '28px'))}Full refund""")

# ---------------------------------------------------------------- start free
sub("""<span style="width:12px;height:12px;border-radius:50%;flex-shrink:0;background:{{ f.dot }};transition:background 200ms"></span>""",
    """<sc-if value="{{ plus }}" hint-placeholder-val="{{ false }}"><span style="width:12px;height:12px;border-radius:50%;flex-shrink:0;background:{{ f.dot }};transition:background 200ms"></span></sc-if>"""
    + when(icon('{{ f.icon }}', 'clamp(26px,2.4vw,34px)', '{{ f.color }}', ';transition:background 200ms')))
sub("""      <h3 style="margin:0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(34px,3.4vw,48px);line-height:0.98;letter-spacing:-0.05em">{{ freeActive.name }}</h3>""",
    "      " + when(icon('{{ freeActive.icon }}', '64px')) + """
      <h3 style="margin:0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(34px,3.4vw,48px);line-height:0.98;letter-spacing:-0.05em">{{ freeActive.name }}</h3>""")

# ---------------------------------------------------------------- subscription
sub("""Join the waitlist</a>
    </div>""",
    """Join the waitlist</a>
      """ + when(scene('sc-subscription', INK, 'max-width:340px;margin-top:auto', 'Monthly worksheets and a calendar')) + """
    </div>""")
for tier, name in [('Operator', 's-operator'), ('Leader', 's-leader')]:
    sub(f"""<div style="display:flex;justify-content:space-between;align-items:baseline"><strong style="font-family:'Inter Tight',sans-serif;font-weight:800;font-size:28px;letter-spacing:-0.04em">{tier}</strong>""",
        f"""{when(icon(name, '36px'))}<div style="display:flex;justify-content:space-between;align-items:baseline"><strong style="font-family:'Inter Tight',sans-serif;font-weight:800;font-size:28px;letter-spacing:-0.04em">{tier}</strong>""")

# ---------------------------------------------------------------- route map: an icon in each goal pill, in the route color
sub("grid-template-columns:240px repeat(3,minmax(0,1fr))", "grid-template-columns:272px repeat(3,minmax(0,1fr))", count=2)
sub("left:228px;right:0;top:37px", "left:260px;right:0;top:37px")
sub("""border-radius:0 20px 20px 0;font-size:15px;font-weight:600;white-space:nowrap">{{ r.goal }}</span>""",
    """border-radius:0 20px 20px 0;font-size:15px;font-weight:600;white-space:nowrap;gap:10px">"""
    + when(icon('{{ r.icon }}', '20px', '{{ r.color }}')) + """{{ r.goal }}</span>""")

# ---------------------------------------------------------------- teams: icons for the four features, and the seats scene
plus = '<span style="font-size:20px">+</span>'
sub_each(plus, [f'<sc-if value="{{{{ plus }}}}" hint-placeholder-val="{{{{ false }}}}">{plus}</sc-if>'
                + when(icon(n, '28px', INK, ';margin-top:-2px')) for n in ['t-cohort', 't-seats', 't-tools', 't-buy']])
sub("""See team features</a>""",
    """See team features</a>
        """ + when(scene('teams', INK, 'max-width:400px;margin-top:32px', 'Your own cohort: a grid of seats and a start date')))

# ---------------------------------------------------------------- champions
sub("""letter-spacing:-0.055em">Every team needs one person who makes AI work</h2>""",
    """letter-spacing:-0.055em">Every team needs one person who makes AI work</h2>
      """ + when(scene('sc-champions', INK, 'max-width:440px;margin-top:20px', 'One champion raised above a row of seats')))

# ---------------------------------------------------------------- how it works
for i in range(1, 5):
    sub(f"""padding-top:24px;border-top:1px solid #44443F"><span style="font-size:15px;color:#8A8A83">0{i}</span>""",
        f"""padding-top:24px;border-top:1px solid #44443F">{when(icon(f'how-{i}', '76px', ACC, ';margin-bottom:10px', 'left center'))}<span style="font-size:15px;color:#8A8A83">0{i}</span>""")

# ---------------------------------------------------------------- faq
sub("""letter-spacing:-0.055em">Questions</h2>""",
    """letter-spacing:-0.055em">Questions</h2>
      """ + when(scene('sc-faq', INK, 'max-width:280px;margin-top:16px', 'Two speech bubbles on a desk')))

# ---------------------------------------------------------------- closing
sub("""    <div style="display:flex;flex-direction:column;gap:28px">
      <p style="margin:0;font-size:20px;color:#B9B9B2">Three questions""",
    """    <div style="display:flex;flex-direction:column;gap:28px">
      """ + when(scene('sc-closing', ACC, 'max-width:260px', 'A block snapping into place')) + """
      <p style="margin:0;font-size:20px;color:#B9B9B2">Three questions""")

# ---------------------------------------------------------------- write
def put(kind, text):
    global page
    m = script_block(kind)
    page = page[:m.start(2)] + text + page[m.end(2):]

put('template', json.dumps(template).replace('</', '<\\u002F'))
put('manifest', json.dumps(manifest).replace('</', '<\\u002F'))
page = page.replace('<title>Bundled Page</title>', '<title>Superintelligent</title>', 1)
open(OUT, 'w', encoding='utf-8').write(page)
print(f'{edits} edits, {len(ID)} images, {len(page) // 1024} KB -> {os.path.relpath(OUT)}')
