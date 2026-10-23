"""Rebuild Superintelligent_Homepage.html from original.html with generated imagery.

    python3 homepage-base/rebundle.py

Reads the original single-file bundle, applies exact, asserted edits to its
template and component, adds the generated images as bundle assets, and
writes a new single-file bundle with the same unpacker.
"""
import base64, html, json, os, re, sys, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'original.html')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'Superintelligent_Homepage.html')

page = open(SRC, encoding='utf-8').read()

def script_block(kind):
    m = re.search(r'(<script type="__bundler/' + kind + r'"[^>]*>)(.*?)(</script>)', page, re.S)
    assert m, kind
    return m

manifest = json.loads(script_block('manifest').group(2))
template = json.loads(script_block('template').group(2))

# ---------------------------------------------------------------- assets
NAMES = ['hero-diagram', 'hero-photo', 'teams',
         *[f'build-{i}' for i in range(1, 7)], *[f'level-{i}' for i in range(1, 4)],
         *[f'free-{i}' for i in range(1, 7)], *[f'how-{i}' for i in range(1, 5)]]
ID = {}
for n in NAMES:
    u = str(uuid.uuid5(uuid.NAMESPACE_URL, f'superintelligent/homepage/{n}'))
    ID[n] = u
    manifest[u] = {'mime': 'image/webp', 'compressed': False,
                   'data': base64.b64encode(open(os.path.join(HERE, 'images', f'{n}.webp'), 'rb').read()).decode()}

def mask(u, pos='center'):
    return (f"-webkit-mask:url('{u}') {pos}/contain no-repeat;"
            f"mask:url('{u}') {pos}/contain no-repeat")

edits = 0
def sub(old, new, count=1):
    global template, edits
    n = template.count(old)
    assert n == count, f'expected {count}x, found {n}: {old[:90]!r}'
    template = template.replace(old, new)
    edits += 1

# ---------------------------------------------------------------- props
m = re.search(r'data-props="([^"]*)"', template)
props = json.loads(html.unescape(m.group(1)))
props['imagery'] = {'editor': 'enum', 'default': 'Generated',
                    'options': ['Generated', 'Type plates', 'Photo slots'], 'tsType': 'string'}
props['heroVisual'] = {'editor': 'enum', 'default': 'Diagram + type',
                       'options': ['Diagram + type', 'Photo'], 'tsType': 'string'}
props['review'] = {'editor': 'enum', 'default': 'Show', 'options': ['Show', 'Hide'], 'tsType': 'string'}
template = template[:m.start(1)] + html.escape(json.dumps(props, separators=(',', ':')), quote=True) + template[m.end(1):]

# ---------------------------------------------------------------- component
sub("const DEFAULTS = { who: 'me', use: 'chat', goal: 'agents' };",
    "const DEFAULTS = { who: 'me', use: 'chat', goal: 'agents' };\n"
    "// Generated imagery (GPT Image 2.5): black-ink masks painted with CSS, so they follow the accent picker\n"
    "const IMG = {\n"
    f"  builds: [{', '.join(repr(ID[f'build-{i}']) for i in range(1, 7))}],\n"
    f"  levels: [{', '.join(repr(ID[f'level-{i}']) for i in range(1, 4))}],\n"
    f"  free: [{', '.join(repr(ID[f'free-{i}']) for i in range(1, 7))}],\n"
    "};\n"
    "const IMAGERY = ['Generated', 'Type plates'];\n"
    "const HERO = ['Diagram + type', 'Photo'];")
sub("state = { answers: { ...DEFAULTS }, faqOpen: 0, hoverRoute: null, freeIdx: 2 };",
    "state = { answers: { ...DEFAULTS }, faqOpen: 0, hoverRoute: null, freeIdx: 2, buildIdx: 0 };")
sub("""    const headline = this.props.headline ?? 'Learn AI by building with it.';
    return {""",
    """    const headline = this.props.headline ?? 'Learn AI by building with it.';
    const imagery = this.state.imagery ?? this.props.imagery ?? 'Generated';
    const heroVisual = this.state.heroVisual ?? this.props.heroVisual ?? 'Diagram + type';
    const gen = imagery === 'Generated';
    const bi = this.state.buildIdx;
    const opt = (key, cur) => v => ({ label: v, bg: v === cur ? '#F6F6F1' : 'transparent', fg: v === cur ? '#161616' : '#F6F6F1', pick: () => this.setState({ [key]: v }) });
    return {
      generated: gen, heroDiagram: gen && heroVisual === 'Diagram + type', heroPhoto: gen && heroVisual === 'Photo',
      buildActive: { n: `0${bi + 1}`, title: BUILDS[bi][0], line: BUILDS[bi][1], tag: BUILDS[bi][2], img: IMG.builds[bi] },
      review: { show: (this.props.review ?? 'Show') === 'Show' && !this.state.reviewHidden, hide: () => this.setState({ reviewHidden: true }), imagery: IMAGERY.map(opt('imagery', imagery)), hero: HERO.map(opt('heroVisual', heroVisual)) },""")
sub("""      typePlates: (this.props.imagery ?? 'Type plates') === 'Type plates',
      photoSlots: (this.props.imagery ?? 'Type plates') === 'Photo slots',""",
    """      typePlates: imagery === 'Type plates',
      photoSlots: imagery === 'Photo slots',""")
sub("builds: BUILDS.map(([title, line, tag], i) => ({ n: `0${i + 1}`, title, line, tag })),",
    "builds: BUILDS.map(([title, line, tag], i) => ({ n: `0${i + 1}`, title, line, tag, num: gen && i === bi ? '#161616' : '#8A8A83', mark: gen && i === bi ? 'var(--acc,#B9A7FF)' : 'transparent', pick: () => this.setState({ buildIdx: i }) })),")
sub("path: PATH,", "path: PATH.map((p, i) => ({ ...p, emblem: IMG.levels[i] })),")
sub("""freeActive: { whoLabel: "Who it's for", ...FREE[this.state.freeIdx] },""",
    """freeActive: { whoLabel: "Who it's for", ...FREE[this.state.freeIdx], cover: IMG.free[this.state.freeIdx] },""")

# ---------------------------------------------------------------- hero
HERO_GEN = f"""    <sc-if value="{{{{ heroDiagram }}}}" hint-placeholder-val="{{{{ true }}}}">
      <figure style="margin:0;aspect-ratio:4/5;max-height:680px;background:var(--acc,#B9A7FF);color:#161616;padding:clamp(28px,4vw,48px);display:flex;flex-direction:column;gap:20px">
        <div style="display:flex;justify-content:space-between;gap:16px;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><span>AI &amp; Agents Professional</span><span>Week 3</span></div>
        <div role="img" aria-label="Your calendar, inbox and priorities flow into one agent" style="flex:1 1 auto;min-height:clamp(170px,16vw,230px);background:#161616;{mask(ID['hero-diagram'], 'center bottom')}"></div>
        <div style="display:flex;flex-direction:column;gap:clamp(12px,1.8vw,20px);padding-top:16px;border-top:2px solid #161616;margin-top:-20px">
          <span style="font-size:clamp(16px,1.4vw,19px);font-weight:600">Morning briefing · Tue</span>
          <span style="font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(32px,3.4vw,52px);line-height:0.94;letter-spacing:-0.05em">3 meetings need prep</span>
          <span style="font-family:'Inter Tight',sans-serif;font-weight:800;font-size:clamp(32px,3.4vw,52px);line-height:0.94;letter-spacing:-0.05em;opacity:0.55">2 decisions waiting on you</span>
        </div>
        <figcaption style="font-size:15px;font-weight:500;padding-top:16px;border-top:1px solid rgba(22,22,22,0.35)">A morning briefing that writes itself. Pulls your calendar, inbox and priorities into one summary before you start.</figcaption>
      </figure>
    </sc-if>
    <sc-if value="{{{{ heroPhoto }}}}" hint-placeholder-val="{{{{ false }}}}">
      <figure style="margin:0;display:flex;flex-direction:column;gap:14px">
        <div style="aspect-ratio:4/5;max-height:640px;background:var(--acc,#B9A7FF);overflow:hidden"><img src="{ID['hero-photo']}" alt="Example build: a printed morning briefing. 3 meetings need prep, 2 decisions waiting on you." style="width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;display:block"></div>
        <figcaption style="font-size:15px;color:#55554F">A morning briefing that writes itself. Example build from AI &amp; Agents Professional, week 3.</figcaption>
      </figure>
    </sc-if>
"""
sub("""    <sc-if value="{{ photoSlots }}" hint-placeholder-val="{{ false }}">
      <div style="aspect-ratio:4/5;max-height:640px;position:relative"><image-slot id="hero-photo\"""",
    HERO_GEN + """    <sc-if value="{{ photoSlots }}" hint-placeholder-val="{{ false }}">
      <div style="aspect-ratio:4/5;max-height:640px;position:relative"><image-slot id="hero-photo\"""")
sub("""    <sc-if value="{{ typePlates }}" hint-placeholder-val="{{ true }}">
      <figure style="margin:0;aspect-ratio:4/5;""",
    """    <sc-if value="{{ typePlates }}" hint-placeholder-val="{{ false }}">
      <figure style="margin:0;aspect-ratio:4/5;""")

# ---------------------------------------------------------------- what people build
sub("""      <sc-if value="{{ photoSlots }}" hint-placeholder-val="{{ false }}">
        <div style="aspect-ratio:3/4;max-height:680px;position:relative"><image-slot id="builds-photo\"""",
    """      <sc-if value="{{ generated }}" hint-placeholder-val="{{ true }}">
        <figure style="margin:0;aspect-ratio:3/4;max-height:680px;background:#161616;color:#F6F6F1;padding:clamp(28px,4vw,48px);display:flex;flex-direction:column;gap:28px">
          <div style="display:flex;justify-content:space-between;gap:16px;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><span>{{ buildActive.tag }}</span><span style="flex-shrink:0">{{ buildActive.n }} / 06</span></div>
          <div role="img" aria-label="{{ buildActive.title }}" style="flex:1 1 auto;min-height:200px;background:var(--acc,#B9A7FF);-webkit-mask:url('{{ buildActive.img }}') center/contain no-repeat;mask:url('{{ buildActive.img }}') center/contain no-repeat"></div>
          <figcaption style="display:flex;flex-direction:column;gap:8px;padding-top:20px;border-top:1px solid #44443F"><strong style="font-family:'Inter Tight',sans-serif;font-weight:700;font-size:24px;line-height:1.15;letter-spacing:-0.03em">{{ buildActive.title }}</strong><span style="font-size:15px;font-weight:500;color:#B9B9B2">{{ buildActive.line }}</span></figcaption>
        </figure>
      </sc-if>
      <sc-if value="{{ photoSlots }}" hint-placeholder-val="{{ false }}">
        <div style="aspect-ratio:3/4;max-height:680px;position:relative"><image-slot id="builds-photo\"""")
sub("""      <sc-if value="{{ typePlates }}" hint-placeholder-val="{{ true }}">
        <figure style="margin:0;aspect-ratio:3/4;""",
    """      <sc-if value="{{ typePlates }}" hint-placeholder-val="{{ false }}">
        <figure style="margin:0;aspect-ratio:3/4;""")
sub("""        <a href="#programs" style="display:grid;grid-template-columns:56px minmax(0,1fr);gap:4px 16px;padding:30px 0;border-top:1px solid #DCDCD4" style-hover="opacity:0.75">
          <span style="font-size:15px;color:#8A8A83;padding-top:6px">{{ b.n }}</span>""",
    """        <a href="#programs" sc-camel-on-mouse-enter="{{ b.pick }}" sc-camel-on-focus="{{ b.pick }}" style="display:grid;grid-template-columns:56px minmax(0,1fr);gap:4px 16px;padding:30px 0;border-top:1px solid #DCDCD4" style-hover="opacity:0.75">
          <span style="font-size:15px;color:{{ b.num }};padding-top:6px;display:flex;align-items:center;gap:8px;transition:color 200ms"><span style="width:8px;height:8px;border-radius:50%;background:{{ b.mark }};transition:background 200ms"></span>{{ b.n }}</span>""")

# ---------------------------------------------------------------- programs
sub("""        <article style="background:{{ p.bg }};padding:36px 32px 40px;display:flex;flex-direction:column;gap:20px">""",
    """        <article style="background:{{ p.bg }};padding:36px 32px 40px;display:flex;flex-direction:column;gap:20px">
          <sc-if value="{{ generated }}" hint-placeholder-val="{{ true }}">
            <div style="height:clamp(116px,10vw,148px);background:{{ p.dot }};border-radius:8px;position:relative"><div style="position:absolute;inset:18px;background:{{ p.dotFg }};-webkit-mask:url('{{ p.emblem }}') center/contain no-repeat;mask:url('{{ p.emblem }}') center/contain no-repeat"></div></div>
          </sc-if>""")

# ---------------------------------------------------------------- start free
sub("""      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:14px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><span>Free</span><span>{{ freeActive.status }}</span></div>""",
    """      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:14px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><span>Free</span><span>{{ freeActive.status }}</span></div>
      <sc-if value="{{ generated }}" hint-placeholder-val="{{ true }}">
        <div role="img" aria-label="{{ freeActive.name }}" style="height:clamp(160px,15vw,220px);background:#161616;-webkit-mask:url('{{ freeActive.cover }}') left center/contain no-repeat;mask:url('{{ freeActive.cover }}') left center/contain no-repeat"></div>
      </sc-if>""")

# ---------------------------------------------------------------- teams
sub("""        <a href="#" style="align-self:flex-start;font-size:15px;font-weight:600;border-bottom:1.5px solid #161616;padding-bottom:2px;margin-top:6px" style-hover="opacity:0.6">See team features</a>""",
    f"""        <a href="#" style="align-self:flex-start;font-size:15px;font-weight:600;border-bottom:1.5px solid #161616;padding-bottom:2px;margin-top:6px" style-hover="opacity:0.6">See team features</a>
        <sc-if value="{{{{ generated }}}}" hint-placeholder-val="{{{{ true }}}}">
          <div role="img" aria-label="Your own cohort: a grid of seats and a start date" style="margin-top:32px;width:100%;max-width:400px;aspect-ratio:1100/682;background:#161616;{mask(ID['teams'], 'left center')}"></div>
        </sc-if>""")

# ---------------------------------------------------------------- how it works
for i in range(1, 5):
    sub(f"""padding-top:24px;border-top:1px solid #44443F"><span style="font-size:15px;color:#8A8A83">0{i}</span>""",
        f"""padding-top:24px;border-top:1px solid #44443F"><sc-if value="{{{{ generated }}}}" hint-placeholder-val="{{{{ true }}}}"><div aria-hidden="true" style="width:76px;height:76px;margin-bottom:10px;background:var(--acc,#B9A7FF);{mask(ID[f'how-{i}'], 'left center')}"></div></sc-if><span style="font-size:15px;color:#8A8A83">0{i}</span>""")

# ---------------------------------------------------------------- review panel (not part of the design)
sub("""</footer>
</div>
</x-dc>""",
    """</footer>
<sc-if value="{{ review.show }}" hint-placeholder-val="{{ true }}">
  <div style="position:fixed;right:16px;bottom:16px;z-index:60;background:#161616;color:#F6F6F1;border-radius:10px;padding:12px 14px;font-size:12px;display:flex;flex-direction:column;gap:8px;box-shadow:0 10px 30px rgba(0,0,0,0.28)">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px"><span style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8A8A83">Review · not part of the design</span><button sc-camel-on-click="{{ review.hide }}" aria-label="Hide review controls" style="border:0;background:none;color:#8A8A83;cursor:pointer;font-size:14px;padding:0">×</button></div>
    <div style="display:flex;gap:6px;align-items:center"><span style="width:58px;color:#B9B9B2">Imagery</span><sc-for list="{{ review.imagery }}" as="o" hint-placeholder-count="2"><button sc-camel-on-click="{{ o.pick }}" style="border:1px solid #44443F;border-radius:5px;padding:5px 9px;font-size:12px;cursor:pointer;background:{{ o.bg }};color:{{ o.fg }}">{{ o.label }}</button></sc-for></div>
    <div style="display:flex;gap:6px;align-items:center"><span style="width:58px;color:#B9B9B2">Hero</span><sc-for list="{{ review.hero }}" as="o" hint-placeholder-count="2"><button sc-camel-on-click="{{ o.pick }}" style="border:1px solid #44443F;border-radius:5px;padding:5px 9px;font-size:12px;cursor:pointer;background:{{ o.bg }};color:{{ o.fg }}">{{ o.label }}</button></sc-for></div>
  </div>
</sc-if>
</div>
</x-dc>""")

# ---------------------------------------------------------------- write
def put(kind, text):
    global page
    m = script_block(kind)
    page = page[:m.start(2)] + text + page[m.end(2):]

put('template', json.dumps(template).replace('</', '<\\u002F'))
put('manifest', json.dumps(manifest).replace('</', '<\\u002F'))
page = page.replace('<title>Bundled Page</title>', '<title>Superintelligent — Homepage</title>', 1)
open(OUT, 'w', encoding='utf-8').write(page)
print(f'{edits} edits, {len(NAMES)} images, {len(page) // 1024} KB -> {OUT}')
