"""Regenerate the authored Flux presentation inventory; no network or test assertions.

Usage: python3 docs/flux-fidelity/inventory.py /path/to/flux /path/to/design-kit [archive-head]
Inventory is lexical (not computed CSS or a reachability claim). Includes dormant
components, theme editor palettes and vendored UI; excludes tests/generated code.
"""
from pathlib import Path
import sys, re, json, hashlib, subprocess
from collections import defaultdict

flux, kit = map(Path, sys.argv[1:3])
out = Path(__file__).parent
contract = set(re.findall(r"'([a-z][a-z0-9-]*)'", (kit/'packages/design-tokens/src/tokens.ts').read_text().split('] as const')[0]))
aliases = dict(background='bg', foreground='fg', card='bg-elevated', popover='bg-elevated', muted='surface', secondary='surface', destructive='danger', input='border-subtle', accent='brand', **{'primary-foreground':'primary-fg','card-foreground':'fg','popover-foreground':'fg','muted-foreground':'fg-muted','secondary-foreground':'fg','destructive-foreground':'danger-fg','accent-hover':'brand-hover','accent-active':'brand-active','accent-muted':'brand-muted','accent-fg':'brand-fg','toggle-on':'primary','status-ok':'success','status-warn':'warning','status-danger':'danger'})
aliases.update({'fg-primary':'fg','bg-surface':'surface','elevated':'bg-elevated','subtle':'border-subtle','status-info':'info'})
composer = {'composer':'bg-elevated','composer-bar':'bg','composer-border':'border','composer-border-focus':'ring','composer-fg':'fg','composer-fg-secondary':'fg-secondary','composer-fg-muted':'fg-muted','composer-hover':'surface-hover','composer-active':'surface-active'}
modes = {'mode-default':'fg-secondary','mode-architect':'fg-muted','mode-planner':'info','mode-writer':'warning'}
texts = {9:'micro',10:'caption',11:'label',12:'xs',13:'control',14:'sm',16:'base',18:'lg',20:'xl',24:'2xl',30:'3xl',36:'4xl',48:'5xl',60:'6xl',72:'7xl',96:'8xl',128:'9xl'}
radii = {0:'none',2:'xs',4:'sm',6:'control',8:'lg',10:'panel',12:'xl',16:'2xl',24:'3xl'}
tracking = {-.05:'tighter',-.025:'tight',0:'normal',.025:'wide',.05:'wider',.1:'widest',.18:'label',.28:'eyebrow'}
theme_source=(kit/'packages/design-tokens/src/themes/nanite.ts').read_text().split('export const DIRECTION_A')[0]

def rgb(value):
    value=value.strip()
    if re.fullmatch(r'#[0-9a-fA-F]{3,8}',value):
        h=value[1:]
        if len(h) in (3,4):h=''.join(c*2 for c in h)
        if len(h) in (6,8):return tuple(int(h[i:i+2],16) for i in (0,2,4))
    m=re.match(r'rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)',value)
    return tuple(float(x) for x in m.groups()) if m else None

reference_colors=[(key,value,rgb(value)) for key,value in re.findall(r"'([\w-]+)':\s*'([^']+)'",theme_source) if key in contract and rgb(value)]

def nearest_color(value):
    if value.strip() in ('currentColor','none','inherit','transparent'):return value.strip(),'structural paint keyword; preserve'
    color=rgb(value)
    if color:
        key,ref,_=min(reference_colors,key=lambda x:sum((a-b)**2 for a,b in zip(color,x[2])))
        return key,f'F3/F7: nearest authored Concrete & Signal reference RGB ({ref}); role overrides numeric proximity; alpha stays theme-owned'
    ref=re.search(r'var\(--c-([\w-]+)\)',value)
    if ref:return semantic(ref[1])
    return 'fg-secondary','F3/F7: dynamic/unparsed paint; nearest neutral role, resolve via reviewed theme adapter; never fixed component color'

def head(p):
    return subprocess.check_output(['git','-C',str(p),'rev-parse','HEAD'],text=True).strip()

def stripped(s):
    # Preserve strings and source positions; blank comments only.
    pattern = r'("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`)|(/\*[\s\S]*?\*/|//[^\n]*)'
    return re.sub(pattern, lambda m: m[1] if m[1] else re.sub(r'[^\n]',' ',m[2]), s)

def semantic(name):
    if name in contract: return name,'exact semantic role'
    if name in aliases: return aliases[name],'Flux alias resolves by source role; accent means brand here'
    if name in composer: return composer[name],'F1: scoped theme on composer; nearest role, retain dark composer only if confirmed'
    if name in modes: return modes[name],'F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom'
    if name in ('transparent','current','inherit'): return name,'structural paint keyword; preserve'
    if name in ('white','black'): return ('fg' if name=='white' else 'bg'),'F3: theme-relative role; no fixed black/white component paint'
    if re.match(r'(red|rose)-',name): return 'danger','F3: feedback palette becomes danger; brand requires explicit identity context'
    if re.match(r'(amber|yellow|orange)-',name): return 'warning','F3: caution palette becomes warning; identity hue needs F2'
    if re.match(r'(green|emerald|lime)-',name): return 'success','F3: completion palette becomes success'
    if re.match(r'(blue|sky|cyan|indigo|violet|purple|pink|teal)-',name): return 'info','F2/F3: nearest information role; categorical identity needs labelled marker and owner review'
    if re.match(r'(zinc|slate|gray|neutral|stone)-',name):
        n=int(name.rsplit('-',1)[1]); return ('fg' if n<=200 else 'fg-secondary' if n<=400 else 'fg-muted' if n<=600 else 'surface' if n<=800 else 'bg'),'F3: nearest neutral ladder role; choose by foreground/surface context'
    return 'fg-secondary','F3: nearest neutral fallback; source-specific role review required'

def nearest(v,scale,prefix):
    k=min(scale,key=lambda k:abs(k-v)); return prefix+scale[k],('exact scale' if k==v else f'F4: nearest scale ({k}); proposed snap, fidelity difference explicit')

def utility(raw):
    base=raw.split(':')[-1]
    # Arbitrary values may contain colons; recover full final utility.
    m=re.search(r'(-?(?:text|rounded(?:-[trblse]{1,2})?|tracking|leading|font|(?:min-|max-)?[wh]|size|[mp][xytrblse]?|gap(?:-[xy])?|space-[xy]|(?:top|right|bottom|left|inset)(?:-[xy])?|bg|border|ring|fill|stroke|decoration|outline|shadow)-\[[^\]]+\])',raw)
    if m: base=m[1]
    if '[' in base:
        p,v=base.split('[',1);p=p.rstrip('-');v=v.rstrip(']')
        n=re.fullmatch(r'(-?[\d.]+)(px|rem|em)?',v)
        if n:
            value=float(n[1]);unit=n[2] or 'px';px=value*16 if unit=='rem' else value
            if p=='text': return nearest(px,texts,'text-')
            if p.startswith('rounded'): return nearest(px,radii,p+'-')
            if p=='tracking': return nearest(value if unit=='em' else px/16,tracking,'tracking-')
            if p=='leading': return 'leading-normal','F4: readable line-height role; explicit density tradeoff'
            return f'{"-" if px<0 else ""}{p.lstrip("-")}-{abs(px)/4:g}','Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling'
        if p in ('bg','text','border','ring','fill','stroke','outline','decoration','shadow'):
            return p+'-fg-secondary','F3: literal paint becomes semantic role; theme-only fidelity value'
        if '%' in v or 'vw' in v or 'vh' in v or 'calc(' in v:
            return 'w-full / max-w-3xl / viewport-bounded slot','F5: proportional/bounded layout; keep data geometry separate from design scale'
        return 'controlled layout slot / named scale','F5: dynamic expression is host geometry, never component design constant'
    if base.startswith('text-') and base[5:] in list(texts.values())+['left','right','center','justify','ellipsis','clip','nowrap','wrap','balance','pretty']:
        return base,'named inherited/contract type or structural text utility'
    if base.startswith('text-') and base[5:].split('/')[0] in texts.values():
        return base,'named inherited/contract type with inherited line-height modifier'
    if base.startswith('font-'): return base,'sans/mono font token or inherited weight'
    if base.startswith(('rounded','tracking','leading','shadow')): return base,'named inherited/contract scale'
    if re.fullmatch(r'(?:border-[trblxyse]|divide-[xy])(?:-(?:0|1|2|4|8))?',base) or base=='ring-inset':
        return base,'inherited directional border scale / structural ring utility'
    for prefix in ('bg-','text-','border-t-','border-b-','border-l-','border-r-','border-x-','border-y-','border-','ring-offset-','ring-','fill-','stroke-','decoration-','outline-','placeholder-','caret-','accent-','from-','via-','to-','divide-'):
        if base.startswith(prefix):
            name=base[len(prefix):];role,sep,alpha=name.partition('/')
            if role in ('0','1','2','4','8','none','solid','dashed','dotted','double','hidden','collapse','separate'): return base,'inherited border/stroke scale or structure'
            dest,why=semantic(role);return prefix+dest+(sep+alpha if sep else ''),why
    return base,'named Tailwind spacing/size or structural utility; preserve'

records=defaultdict(list); files=[]
class_pattern=r'(?<![\w-])(?:[a-z0-9_-]+:)*-?(?:(?:min-|max-)?[wh]|size|[mp][xytrblse]?|gap(?:-[xy])?|space-[xy]|text|font|rounded(?:-[trblse]{1,2})?|tracking|leading|bg|border|ring|fill|stroke|decoration|outline|shadow|placeholder|caret|accent|from|via|to|divide|(?:top|right|bottom|left|inset)(?:-[xy])?)-(?:\[[^\]\n]+\]|[a-zA-Z0-9_.%/-]+)'
for p in sorted((flux/'src').rglob('*')):
    if p.suffix not in ('.ts','.tsx','.css','.svg'): continue
    if '/generated/' in str(p) or '__tests__' in str(p) or '.test.' in p.name: continue
    raw=p.read_text();s=stripped(raw);rel=str(p.relative_to(flux));files.append({'path':rel,'sha256':hashlib.sha256(raw.encode()).hexdigest()})
    def add(kind,value,pos):records[(kind,value)].append(f'{rel}:{s.count(chr(10),0,pos)+1}')
    if p.suffix in ('.ts','.tsx'):
        for string in re.finditer(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`',s):
            for m in re.finditer(class_pattern,string[0]):add('utility',m[0],string.start()+m.start())
        for m in re.finditer(r'\b(fontSize|fontFamily|fontWeight|letterSpacing|lineHeight|borderRadius|width|height|minWidth|maxWidth|minHeight|maxHeight|padding|paddingTop|paddingBottom|paddingLeft|paddingRight|margin|marginBottom|marginTop|marginLeft|marginRight|gap|rowGap|columnGap|strokeWidth)\s*[:=]\s*("[^"\n]*"|\'[^\'\n]*\'|[\d.]+|`[^`]*`|[a-zA-Z]+(?:\.[a-zA-Z]+)*)',s):
            if m[2] not in ('number','string','none'):add('inline-'+m[1],m[2],m.start())
        for m in re.finditer(r'#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch)\([^\n)]+\)',s):add('literal-color',m[0],m.start())
    elif p.suffix=='.css':
        for m in re.finditer(r'([\w-]+)\s*:\s*([^;{}]+)[;}]',s):add('css-'+m[1],m[2].strip(),m.start())
    else:
        for m in re.finditer(r'(fill|stroke|width|height)="([^"]+)"',s):add('svg-'+m[1],m[2],m.start())

rows=[]
for (kind,value),locs in sorted(records.items()):
    if kind=='utility':dest,why=utility(value)
    elif kind.startswith('css---c-') or kind.startswith('css---color-'):
        name=kind.split('css---',1)[1].removeprefix('c-').removeprefix('color-');dest,why=semantic(name)
    elif 'fontFamily' in kind or kind=='css-font-family' or kind.startswith('css---font'):
        dest='font-mono' if any(x in value.lower() for x in ('mono','menlo','consolas')) else 'font-sans';why='F6: theme font stack override only; local font receipt or disclosed system fallback'
    elif kind=='literal-color' or kind in ('css-color','css-background','css-background-color','css-border-color','css-scrollbar-color','svg-fill','svg-stroke'):
        dest,why=nearest_color(value)
    elif kind in ('inline-fontSize','css-font-size') and re.fullmatch(r'[\d.]+(?:px|rem)?',value.strip("'\"")):
        v=value.strip("'\"");dest,why=nearest(float(re.sub('[a-z]','',v))*(16 if v.endswith('rem') else 1),texts,'text-')
    elif kind in ('inline-borderRadius','css-border-radius') and re.fullmatch(r'[\d.]+(?:px|rem)?',value.strip("'\"")):
        v=value.strip("'\"");dest,why=nearest(float(re.sub('[a-z]','',v))*(16 if v.endswith('rem') else 1),radii,'rounded-')
    elif kind in ('inline-letterSpacing','css-letter-spacing'):
        dest='tracking-wide / tracking-label';why='F4: nearest named tracking by context; explicit density tradeoff'
    elif kind in ('inline-lineHeight','css-line-height'):
        dest='leading-normal';why='F4: named readable line height; preserve data geometry separately'
    elif kind in ('inline-fontWeight','css-font-weight'):
        dest={100:'font-thin',200:'font-extralight',300:'font-light',400:'font-normal',500:'font-medium',600:'font-semibold',700:'font-bold',800:'font-extrabold',900:'font-black'}.get(int(value) if value.isdigit() else 600,'font-semibold');why='inherited weight scale; dynamic/keyword weights retain contextual role'
    elif kind=='inline-strokeWidth':dest='stroke-2';why='F4: nearest icon stroke scale, snap 1.9 to 2'
    elif kind.startswith(('inline-','svg-width','svg-height')) or re.search(r'(width|height|radius|padding|margin)$',kind):
        v=value.strip("'\"");m=re.fullmatch(r'([\d.]+)(px)?',v)
        prefix={'inline-width':'w','inline-height':'h','inline-padding':'p','inline-minHeight':'min-h','inline-maxWidth':'max-w','inline-minWidth':'min-w','inline-maxHeight':'max-h','inline-paddingTop':'pt','inline-paddingBottom':'pb','inline-paddingLeft':'pl','inline-paddingRight':'pr','inline-margin':'m','inline-marginLeft':'ml','inline-marginRight':'mr','inline-gap':'gap','inline-rowGap':'gap-y','inline-columnGap':'gap-x','inline-marginBottom':'mb','inline-marginTop':'mt'}.get(kind,'size')
        dest=f'{prefix}-{float(m[1])/4:g}' if m else 'controlled geometry / named inherited scale';why='F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry'
    else:dest='preserve structural CSS / named inherited scale';why='layout/reset/animation or theme metadata, no new color/scale token'
    rows.append({'kind':kind,'source_value':value,'proposed_token':dest,'rationale':why,'occurrences':sorted(set(locs))})
meta={'flux_head':head(flux),'design_kit_head':sys.argv[3] if len(sys.argv)>3 else head(kit),'scope':'all authored src TS/TSX/CSS/SVG including dormant UI/theme editor; tests and generated omitted; imports/external stylesheet separately listed in spec','files':files,'rows':rows}
(out/'source-token-inventory.json').write_text(json.dumps(meta,indent=2)+'\n')
def cell(x):return str(x).replace('|','\\|').replace('\n',' ').replace('`','\\`')
lines=['# Authored Flux token and scale mapping','', 'Generated source inventory; proposals, not accepted defaults. See [spec](../flux-fidelity-spec.md) for F1–F7 decisions and contextual exceptions. JSON retains every source occurrence and file hash. Lexical extraction includes dormant UI and editor swatches; it does not assert render reachability.','', '| Source kind | Authored value / utility | Nearest kit token or scale | Default and rationale | Source occurrence |','|---|---|---|---|---|']
for r in rows:lines.append('| '+' | '.join(map(cell,[r['kind'],r['source_value'],r['proposed_token'],r['rationale'],', '.join(r['occurrences'][:3])+(' (all in JSON)' if len(r['occurrences'])>3 else '')]))+' |')
(out/'token-mapping.md').write_text('\n'.join(lines)+'\n')
print(f'inventoried {len(files)} files; {len(rows)} distinct source entries')
