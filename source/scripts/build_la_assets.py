"""Publish full 15-page Rev B guides and source hydraulic symbols.
No paragraphs are abridged. The checked source layout is replayed, with vector
concept illustrations and native manufacturer drawing clips. Build-time only.
"""
import base64, collections, hashlib, html, json, math, os, pathlib, re, tempfile, urllib.request, zlib
import fitz
ROOT=pathlib.Path(__file__).resolve().parent.parent
ASSETS=ROOT/'public/assets/la'
URL='https://www.hydropart.ru/upload/files/7889c25889a3e1418b1fa701e1950d39.pdf'
SHA='64c81b20468857eaa949bae3243c800e160aced7034e674b7d69a110a60098a3'
BOXES={'lad':(12,(312,427,555,699)),'ladg':(13,(24,119,272,391)),'lads':(13,(304,120,548,387)),'las':(13,(24,422,272,695)),'curves':(12,(36,403,240,741)),'variants':(13,(23,104,559,701)),'source-table':(12,(34,65,570,373))}
HASHES={'tr':'47a7c29c81ba03ddb1f1aa0237159d4576bf2cbcdac4ecabbff0cadbf351bc99','en':'2a88eec5ef57939f311de4ea0a72acb8407294db1e06b9e8739e7750e00e3fe3'}
INK=(.063,.133,.196);TEAL=(.03,.5,.55);GREY=(.35,.42,.46);ORANGE=(.75,.25,.09)
def source_pdf():
    path=pathlib.Path(os.environ.get('LA_DATASHEET_PATH',str(pathlib.Path(tempfile.gettempdir())/'algo-re92705-2019.pdf')))
    if not path.exists():
        req=urllib.request.Request(URL,headers={'User-Agent':'ALGO-TEAM-Documentation/1.0'})
        with urllib.request.urlopen(req,timeout=90) as response:path.write_bytes(response.read(15000000))
    if hashlib.sha256(path.read_bytes()).hexdigest()!=SHA:raise RuntimeError('Datasheet checksum mismatch')
    return fitz.open(path)
def num(v):return format(round(v,2),'g')
def pt(p):return num(p.x)+' '+num(p.y)
def rgb(c):return 'none' if c is None else '#'+''.join(format(round(v*255),'02x') for v in c[:3])
def diagram_svg(page,box):
    clip=fitz.Rect(box);groups=collections.defaultdict(list)
    for d in page.get_drawings():
        if not d['rect'].intersects(clip):continue
        attrs=(rgb(d.get('color')),rgb(d.get('fill')),num(d.get('width',0) or 0),d.get('dashes',''),d.get('even_odd',False));commands=[];last=None
        for item in d['items']:
            op=item[0]
            if op=='re':
                r=item[1];commands.append(f'M{num(r.x0)} {num(r.y0)}H{num(r.x1)}V{num(r.y1)}H{num(r.x0)}Z');last=None
            elif op in ['l','c']:
                if last!=item[1]:commands.append('M'+pt(item[1]))
                commands.append('L'+pt(item[2]) if op=='l' else 'C'+pt(item[2])+' '+pt(item[3])+' '+pt(item[4]));last=item[-1]
            elif op=='qu':
                q=item[1];commands.append('M'+pt(q.ul)+'L'+pt(q.ur)+'L'+pt(q.lr)+'L'+pt(q.ll)+'Z');last=None
        if d.get('closePath'):commands.append('Z')
        groups[attrs].append(''.join(commands))
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{num(clip.x0)} {num(clip.y0)} {num(clip.width)} {num(clip.height)}"><title>Bosch Rexroth RE 92705, 2019-03-25, p. {page.number+1}</title>',f'<rect x="{num(clip.x0)}" y="{num(clip.y0)}" width="{num(clip.width)}" height="{num(clip.height)}" fill="white"/>']
    for (stroke,fill,width,dashes,even),paths in groups.items():
        m=re.search(r'\[([^\]]+)\]',dashes or '');dash=m.group(1).strip() if m else ''
        out.append(f'<path d="{"".join(paths)}" stroke="{stroke}" fill="{fill}" stroke-width="{width}" stroke-linejoin="round"'+(f' stroke-dasharray="{dash}"' if dash else '')+(' fill-rule="evenodd"' if even else '')+'/>')
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines',[]):
            for sp in line['spans']:
                if not clip.contains(fitz.Rect(sp['bbox'])) or not sp['text'].strip():continue
                x,y=sp['origin'];angle=math.degrees(math.atan2(line['dir'][1],line['dir'][0]))
                out.append(f'<text x="{num(x)}" y="{num(y)}" font-size="{num(sp["size"])}" font-family="Arial,sans-serif" transform="rotate({num(angle)} {num(x)} {num(y)})"'+(' font-weight="bold"' if 'Bold' in sp['font'] else '')+'>'+html.escape(sp['text'])+'</text>')
    return ''.join(out)+'</svg>'
def font_for(name):
    bold='Bold' in name;italic='Italic' in name
    return fitz.Font('cobo' if 'Mono' in name and bold else 'cour' if 'Mono' in name else 'hebi' if bold and italic else 'hebo' if bold else 'heit' if italic else 'helv')
def text(page,xy,value,size=12,color=INK,bold=False):
    w=fitz.TextWriter(page.rect);w.append(xy,value,font=fitz.Font('hebo' if bold else 'helv'),fontsize=size);w.write_text(page,color=color)
def lines(page,xy,values,size=12,color=INK,bold=False):
    for i,s in enumerate(values):text(page,(xy[0],xy[1]+i*size*1.35),s,size,color,bold)
def concept(kind,lang):
    d=fitz.open();p=d.new_page(width=1100,height=510);tr=lang=='tr'
    if kind=='mechanism':
        p.draw_rect((177,55,590,420),color=INK,width=2);p.draw_rect((8,160,138,310),color=GREY,fill=(.965,.964,.942))
        lines(p,(25,220),['Dizel /','tahrik motoru'] if tr else ['Diesel /','prime mover'],15,bold=True)
        p.draw_line((135,236),(200,236),color=INK,width=4);p.draw_circle((287,236),67,color=INK,width=2)
        for a in range(0,360,60):p.draw_circle((287+42*math.cos(math.radians(a)),236+42*math.sin(math.radians(a))),7,fill=INK,color=INK)
        for y,end in [(200,418),(236,419),(277,407)]:p.draw_line((320,y),(end,y),color=INK,width=2)
        p.draw_line((399,338),(460,125),color=TEAL,width=7);p.draw_rect((470,275,565,382),color=INK,width=1.5);p.draw_line((473,330),(560,330),color=INK)
        p.draw_line((590,185),(667,185),color=ORANGE,width=4);p.draw_rect((670,103,912,365),color=TEAL,width=2);p.draw_rect((941,136,1090,333),color=GREY)
        lines(p,(960,226),['YÜK / VALF /','AKTÜATÖR'] if tr else ['LOAD / VALVE /','ACTUATOR'],13,bold=True);p.draw_line((912,232),(940,232),color=ORANGE,width=2)
        text(p,(200,92),'A10VO / DEĞİŞKEN DEPLASMANLI POMPA' if tr else 'A10VO / VARIABLE DISPLACEMENT PUMP',11,GREY,True)
        text(p,(420,108),'eğik plaka' if tr else 'swashplate',13,TEAL,True);text(p,(251,350),'dönen grup' if tr else 'rotating group',11,GREY);text(p,(476,402),'servo pistonu' if tr else 'servo piston',11,GREY)
        text(p,(608,175),'B / pB',14,ORANGE,True);text(p,(698,157),'LA GÜÇ REGÜLATÖRÜ' if tr else 'LA POWER CONTROLLER',14,TEAL,True)
        lines(p,(698,203),['fabrika tork karakteristiği','(güç, referans devirde belirtilir)'] if tr else ['factory torque characteristic','(power stated at reference speed)'],12)
        lines(p,(698,280),['hidrolik basınç geri beslemesi','+ deplasman / açı durumu'] if tr else ['hydraulic pressure feedback','+ displacement / angle state'],11,GREY)
        p.draw_polyline([(668,336),(611,336),(611,331),(554,331)],color=(.17,.41,.61),width=2);text(p,(576,385),'servo kontrol basıncı' if tr else 'servo control pressure',10,(.17,.41,.61))
        p.draw_polyline([(643,185),(643,50),(734,50),(734,102)],color=(.68,.53,.04),dashes='[7 4]',width=2)
        text(p,(642,33),'basınç geri beslemesi' if tr else 'pressure feedback',10,(.68,.53,.04))
        text(p,(90,473),'pB artar > regülatör destroke eder > plaka açısı azalır > Vg azalır > Q azalır > mil torku sınırlanır' if tr else 'pB rises > controller destrokes > swashplate angle decreases > Vg decreases > Q decreases > shaft torque is limited',13,ORANGE,True)
    elif kind=='timeline':
        text(p,(180,80),'BASINÇ YÜKÜ ARTTIĞINDA POMPADA NE OLUR?' if tr else 'WHAT HAPPENS WHEN THE PRESSURE LOAD RISES?',19,INK,True)
        names=['Yük artar','pB yükselir','LA müdahale eder','Servo destroke eder','Vg ve Q azalır','Yeni denge'] if tr else ['Load rises','pB rises','LA intervenes','Servo destrokes','Vg and Q fall','New balance']
        subs=[['Akış daha fazla','direnç görür'],['Mil torku','yükselme eğiliminde'],['Tork karakteristiği','aşılır'],['Eğik plaka açısı','küçültülür'],['Daha az yağ','üretilir'],['Tork sınırda','dengelenir']] if tr else [['Flow meets','greater resistance'],['Shaft torque','tends to rise'],['Torque characteristic','is exceeded'],['Swashplate angle','is reduced'],['Less oil','is produced'],['Torque balances','at the limit']]
        for i,name in enumerate(names):
            x=80+i*182;p.draw_circle((x,210),36,color=TEAL,fill=TEAL);text(p,(x-6,216),str(i+1),18,(1,1,1),True)
            if i<5:p.draw_line((x+44,210),(x+130,210),color=GREY,width=2)
            text(p,(x-58,282),name,13,INK,True);lines(p,(x-58,325),subs[i],11,GREY)
    else:
        text(p,(95,31),'NG71 / 20 kW @ 1500 rpm',18,INK,True)
        X=lambda v:90+v/300*950;Y=lambda v:410-v/120*350
        for v in range(0,301,50):p.draw_line((X(v),60),(X(v),410),color=(.85,.88,.88));text(p,(X(v)-8,437),str(v),12,GREY)
        for q in range(0,121,20):p.draw_line((90,Y(q)),(1040,Y(q)),color=(.85,.88,.88));text(p,(53,Y(q)+4),str(q),12,GREY)
        p.draw_polyline([(X(v),Y(min(71.1,7360/v)*1500*.95/1000 if v<280 else 0)) for v in range(1,301)],color=TEAL,width=3)
        text(p,(430,475),'Basınç pB [bar]' if tr else 'Pressure pB [bar]',13,GREY);text(p,(92,52),'Q [L/min]',12,GREY)
        text(p,(130,89),'1 / Vg max',14,TEAL,True);text(p,(510,89),'2 / LA',14,TEAL,True);text(p,(980,89),'3 / DR',11,ORANGE,True)
    return d
def load_source(lang):
    files=sorted((ROOT/'guide-source').glob('revb-'+lang+'.part*.b64'))
    if files:encoded=''.join(p.read_text().strip() for p in files)
    else:encoded=(ROOT/'guide-source'/('revb-'+lang+'.json.zlib.b64')).read_text()
    raw=zlib.decompress(base64.b64decode(encoded));assert hashlib.sha256(raw).hexdigest()==HASHES[lang],'Full guide source mismatch'
    return json.loads(raw)
def build_guide(lang,manufacturer):
    src=load_source(lang);assert len(src['pages'])==15;dst=fitz.open();figs={name:concept(name,lang) for name in ['mechanism','timeline','regions']};fonts={}
    for name in ['lad','curves','variants','source-table']:
        index,box=BOXES[name];rect=fitz.Rect(box);doc=fitz.open();p=doc.new_page(width=rect.width,height=rect.height);p.show_pdf_page(p.rect,manufacturer,index,clip=rect);figs[name]=doc
    for data in src['pages']:
        p=dst.new_page(width=data['size'][0],height=data['size'][1])
        for items,color,fill,width,close in data['draw']:
            sh=p.new_shape()
            for it in items:
                if it[0]=='re':sh.draw_rect(fitz.Rect(it[1]))
                elif it[0]=='l':sh.draw_line(it[1],it[2])
                elif it[0]=='c':sh.draw_bezier(*it[1:])
            sh.finish(color=color,fill=fill,width=width or 0,closePath=close);sh.commit()
        for name,x0,y0,x1,y1 in data['images']:p.show_pdf_page(fitz.Rect(x0,y0,x1,y1),figs[name],0)
        for x,y,size,name,color,width,value in data['text']:
            if not value:continue
            value=value.replace('\uf0b7','\u2022');ft=fonts.setdefault(name,font_for(name));tw=fitz.TextWriter(p.rect);tw.append((x,y),value,font=ft,fontsize=size)
            actual=ft.text_length(value,fontsize=size);scale=width/actual if actual else 1;co=tuple(((color>>shift)&255)/255 for shift in [16,8,0])
            tw.write_text(p,color=co,morph=(fitz.Point(x,y),fitz.Matrix(scale,1)))
    dst.set_metadata({'title':'A10VO LA Detailed Guide - Rev B - '+lang.upper(),'author':'ALGO TEAM','subject':'Complete 15-page Rev B text; vector web edition. RE 92705 / 2019-03-25'})
    dst.subset_fonts();out=ROOT/'public/docs'/src['source_file'];out.parent.mkdir(parents=True,exist_ok=True);dst.save(out,garbage=4,deflate=True)
    check=fitz.open(out);assert len(check)==15
    norm=lambda s:re.sub(r'\s+','',s.replace('\uf0b7','\u2022'))
    for i,data in enumerate(src['pages']):
        page_text=norm(check[i].get_text())
        for span in data['text']:
            value=norm(span[-1])
            if value and value not in page_text:raise RuntimeError(f'Missing source text: {lang}, page {i+1}, {value[:60]}')
    print('Verified full guide:',out.name,'15 pages',out.stat().st_size,'bytes')
def main():
    manufacturer=source_pdf();ASSETS.mkdir(parents=True,exist_ok=True)
    for name in ['lad','ladg','las','lads']:
        index,box=BOXES[name];(ASSETS/(name+'.svg')).write_text(diagram_svg(manufacturer[index],box),encoding='utf-8')
    build_guide('tr',manufacturer);build_guide('en',manufacturer)
if __name__=='__main__':main()
