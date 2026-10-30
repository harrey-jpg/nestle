"""Original Nestle v1 assets. Run with Blender --background --python this_file.

All geometry, weights, expression targets and animation keys are authored here;
no Quaternius geometry or motion data is reused. Blender 4.5 LTS.
"""
import bpy
import math
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/original'
SOURCE = ROOT / 'output/models'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for data in list(bpy.data.actions):
    bpy.data.actions.remove(data)

def material(name, color, roughness=.8):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    return mat

def srgb(hex_color):
    vals = [int(hex_color[i:i+2], 16)/255 for i in (1, 3, 5)]
    return tuple(v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in vals)

M = {name: material(name, srgb(color)) for name, color in {
    'Skin':'#dfac80', 'Hair':'#68412e', 'HairRidge':'#805138',
    'Outfit':'#cf839b', 'Trim':'#ecd5bd', 'Trousers':'#e5d5bd',
    'Shoes':'#71513e', 'Sole':'#513d33', 'FaceDark':'#38282a',
    'EyeGlint':'#fff8e9', 'Blush':'#d88f80', 'Nose':'#d8a17a',
}.items()}

# Shared skeleton; rest pose is a relaxed A pose with overlapping round joints.
arm_data = bpy.data.armatures.new('NestleSharedSkeleton')
rig = bpy.data.objects.new('NestleRig', arm_data)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
bones = [
    ('Root',(0,0,0),(0,0,.12),None),
    ('Hips',(0,0,.53),(0,0,.69),'Root'),
    ('Chest',(0,0,.69),(0,0,.96),'Hips'),
    ('Head',(0,0,.96),(0,0,1.5),'Chest'),
]
for side, sign in [('L',-1),('R',1)]:
    bones += [
        (f'UpperArm_{side}',(sign*.265,0,.91),(sign*.36,0,.73),'Chest'),
        (f'Forearm_{side}',(sign*.36,0,.73),(sign*.405,-.015,.59),f'UpperArm_{side}'),
        (f'Hand_{side}',(sign*.405,-.015,.59),(sign*.41,-.02,.50),f'Forearm_{side}'),
        (f'Thigh_{side}',(sign*.13,0,.56),(sign*.13,0,.34),'Hips'),
        (f'Shin_{side}',(sign*.13,0,.34),(sign*.13,0,.13),f'Thigh_{side}'),
        (f'Foot_{side}',(sign*.13,0,.13),(sign*.13,-.15,.1),f'Shin_{side}'),
    ]
for name, head, tail, parent in bones:
    b = arm_data.edit_bones.new(name); b.head = head; b.tail = tail
    if parent: b.parent = arm_data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
rig.select_set(False)
meshes = []

def finish(obj, name, mat, bone):
    obj.name = name
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat: obj.data.materials.append(M[mat])
    for p in obj.data.polygons: p.use_smooth = True
    if bone:
        obj.vertex_groups.new(name=bone).add(list(range(len(obj.data.vertices))), 1, 'REPLACE')
    meshes.append(obj)
    return obj

def ell(name, loc, scale, mat, bone='Head', rotation=(0,0,0), segments=20, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    obj=bpy.context.object;obj.scale=scale;obj.rotation_euler=rotation
    return finish(obj,name,mat,bone)

def tube(name, points, radius, mat, bone='Head', sides=6):
    verts=[];faces=[]
    for point in points:
        for j in range(sides):
            a=2*math.pi*j/sides
            verts.append((point[0],point[1]+radius*math.sin(a),point[2]+radius*math.cos(a)))
    for i in range(len(points)-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides
            faces.append((a,b,b+sides,a+sides))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat,bone)


def sweep(name, rings, mat, weights, sides=24):
    """Closed elliptical sections with continuous weights at garment joints."""
    verts=[];faces=[]
    centers=[Vector(r[:3]) for r in rings]
    for i,(_,_,_,width,depth) in enumerate(rings):
        tangent=(centers[min(i+1,len(rings)-1)]-centers[max(i-1,0)]).normalized()
        across=Vector((0,-1,0)).cross(tangent).normalized()
        normal=tangent.cross(across).normalized()
        for j in range(sides):
            a=j*2*math.pi/sides
            verts.append(centers[i]+across*(width*math.cos(a))+normal*(depth*math.sin(a)))
    for i in range(len(rings)-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides
            faces.append((a,b,b+sides,a+sides))
    faces += [tuple(reversed(range(sides))),tuple((len(rings)-1)*sides+j for j in range(sides))]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    finish(obj,name,mat,None)
    for i,center in enumerate(centers):
        for bone,weight in weights(center,i).items():
            if weight>0:
                group=obj.vertex_groups.get(bone) or obj.vertex_groups.new(name=bone)
                group.add(list(range(i*sides,(i+1)*sides)),weight,'REPLACE')
    return obj


def blend(z, lo, hi):
    t=max(0,min(1,(z-lo)/(hi-lo)))
    return t*t*(3-2*t)


def face_y(x,z,offset=.012):
    return -.345*math.sqrt(max(.08,1-(x/.455)**2-((z-1.36)/.43)**2))-offset


def join(parts, name):
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts: p.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join();obj=bpy.context.object;obj.name=name
    # Preserve existing per-part bone groups; origin on rig for interchangeability.
    bpy.context.scene.cursor.location=(0,0,0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    return obj

# Base skin and shoes.
base=[ell('HeadBase',(0,0,1.36),(.455,.345,.43),'Skin',segments=40,rings=28),
      ell('Neck',(0,0,.965),(.105,.095,.12),'Skin','Chest')]
for side,sign in [('L',-1),('R',1)]:
    base += [ell('Ear',(sign*.446,-.005,1.32),(.068,.061,.085),'Skin'),
             ell('InnerEar',(sign*.475,-.047,1.32),(.025,.012,.043),'Nose'),
             ell('Mitten',(sign*.41,-.018,.555),(.068,.064,.084),'Skin',f'Hand_{side}'),
             ell('Thumb',(sign*.365,-.057,.575),(.03,.032,.042),'Skin',f'Hand_{side}'),
             ell('Shoe',(sign*.13,-.055,.105),(.115,.18,.09),'Shoes',f'Foot_{side}'),
             ell('Sole',(sign*.13,-.055,.065),(.118,.18,.035),'Sole',f'Foot_{side}')]
    base.append(sweep('BareArm',[(sign*x,y,z,w,d) for x,y,z,w,d in [
        (.25,0,.91,.057,.064),(.29,0,.86,.075,.078),(.325,0,.79,.073,.076),
        (.36,0,.73,.067,.072),(.38,-.009,.66,.062,.069),(.405,-.017,.583,.055,.058)
    ]],'Skin',lambda c,i:{f'UpperArm_{side}':blend(c.z,.69,.79),f'Forearm_{side}':1-blend(c.z,.69,.79)}))
join(base,'BaseSkinAndShoes')

# Face primitives are individually editable and use shape keys for expressions.
expressions=['Happy','Sad','Sleepy','Surprised','Affectionate']
for sign in [-1,1]:
    eye=ell('Eye_L' if sign<0 else 'Eye_R',(sign*.145,face_y(sign*.145,1.385),1.385),(.033,.022,.052),'FaceDark')
    eye.shape_key_add(name='Basis')
    for expr in expressions:
        key=eye.shape_key_add(name=expr)
        for i,v in enumerate(eye.data.vertices):
            q=v.co.copy()
            if expr in ['Happy','Affectionate']:
                q.z=q.z*.13+.025*(1-(q.x/.033)**2)
            elif expr=='Sleepy':q.z=q.z*.12-.015*(1-(q.x/.033)**2)
            elif expr=='Surprised': q.x*=1.12;q.z*=1.15
            elif expr=='Sad': q.z*=.88
            key.data[i].co=q
    glint=ell('EyeGlint',(sign*.145-.008,face_y(sign*.145,1.385)-.021,1.404),(.007,.005,.009),'EyeGlint')
    glint.shape_key_add(name='Basis')
    for expr in ['Happy','Sleepy','Affectionate']:
        k=glint.shape_key_add(name=expr)
        for i,v in enumerate(glint.data.vertices):k.data[i].co=v.co*.01
    cheek=ell('Cheek',(sign*.245,face_y(sign*.245,1.285,.006),1.285),(.058,.009,.024),'Blush',rotation=(0,0,-sign*.55))
    pts=[(sign*.145+(t/10-.5)*.085,face_y(sign*.145+(t/10-.5)*.085,1.48),1.48+.012*math.sin(t*math.pi/10)) for t in range(11)]
    brow=tube('Brow',pts,.009,'Hair')
    brow.shape_key_add(name='Basis')
    for expr in ['Sad','Surprised']:
        k=brow.shape_key_add(name=expr)
        for i,v in enumerate(brow.data.vertices):
            q=v.co.copy();q.z+=((.145-abs(q.x))*.28 if expr=='Sad' else .03);k.data[i].co=q
ell('Nose',(0,face_y(0,1.303,.018),1.303),(.028,.026,.025),'Nose')
mouth_points=[((t/20-.5)*.112,face_y((t/20-.5)*.112,1.229+.022*((t/10-1)**2)),1.229+.022*((t/10-1)**2)) for t in range(21)]
mouth=tube('Mouth',mouth_points,.007,'FaceDark',sides=8)
mouth.shape_key_add(name='Basis')
for expr in expressions:
    k=mouth.shape_key_add(name=expr)
    for i,v in enumerate(mouth.data.vertices):
        t=i//8;u=t/20;offset=v.co-Vector(mouth_points[t]);x=(u-.5)*.112
        if expr=='Happy':x*=1.18;z=1.218+.044*((u*2-1)**2)
        elif expr=='Surprised':x=.028*math.cos(u*2*math.pi);z=1.235+.038*math.sin(u*2*math.pi)
        elif expr=='Sad':z=1.255-.025*((u*2-1)**2)
        elif expr=='Sleepy':x=.018*math.cos(u*2*math.pi);z=1.232+.024*math.sin(u*2*math.pi)
        else:z=1.23+.035*((u*2-1)**2)
        k.data[i].co=Vector((x,face_y(x,z),z))+offset

def cap(name, back_length=0):
    verts=[];faces=[];segments=32;rows=12
    for j in range(rows+1):
        for i in range(segments):
            theta=2*math.pi*i/segments
            front=max(0,-math.sin(theta))
            limit=2.13-front*1.02+back_length*(1-front)
            phi=.025+(limit-.025)*j/rows
            verts.append((.47*math.sin(phi)*math.cos(theta),.36*math.sin(phi)*math.sin(theta),1.375+.445*math.cos(phi)))
    for j in range(rows):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments
            faces.append((a,a+segments,b+segments,b))
    faces.append(tuple(reversed(range(segments))))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return finish(obj,name,'Hair','Head')


def hair_lock(name, controls, width, depth):
    """Tapered curved locks: broad at the crown, tucked tips at the temple."""
    rings=[];p=[Vector(v) for v in controls]
    for i in range(21):
        t=i/20
        center=(1-t)**3*p[0]+3*(1-t)**2*t*p[1]+3*(1-t)*t*t*p[2]+t**3*p[3]
        taper=max(.035,math.sin(math.pi*(.10+.89*t))**.65)
        rings.append((*center,width*taper,depth*taper))
    return sweep(name,rings,'Hair',lambda c,i:{'Head':1},sides=12)

hair_ids=['SoftCrop','SideSwept','Bob','LongFringe','CurlyPuff','LowPonytail']
for style in hair_ids:
    parts=[cap('Cap', .2 if style in ['Bob','LongFringe','LowPonytail'] else 0)]
    if style=='CurlyPuff':
        for ring,phi in enumerate([.24,.58,.92,1.26]):
            for j in range(9):
                theta=j*2*math.pi/9+ring*.41
                if phi>1.1 and math.sin(theta)<-.6:continue
                parts.append(ell('Curl',(.445*math.sin(phi)*math.cos(theta),.35*math.sin(phi)*math.sin(theta),1.4+.44*math.cos(phi)),(.105,.10,.115),'Hair',rotation=(.2,theta,.3),segments=16,rings=10))
        for sign in [-1,1]:
            parts.append(hair_lock('TempleCurl',[(sign*.30,-.27,1.69),(sign*.48,-.26,1.56),(sign*.34,-.32,1.44),(sign*.40,-.14,1.37)],.065,.047))
    else:
        part=-.13 if style=='SideSwept' else .015
        for sign in [-1,1]:
            for i in range(3):
                # Offset layers follow a common part instead of floating fringe balls.
                start=(part+sign*.035,-.055+i*.045,1.80+i*.006)
                lift=(part+sign*(.19+i*.028),-.32+i*.018,1.90-i*.01)
                low=1.54 if style=='SoftCrop' else 1.43
                if style=='LongFringe':low=1.40
                bend=(sign*(.25+i*.055),-.42+i*.045,1.63-i*.03)
                tip=(sign*(.30+i*.055),-.29+i*.065,low+i*.012)
                parts.append(hair_lock('SweptLock',[start,lift,bend,tip],.077 if style=='SoftCrop' else .091,.043))
        if style=='LongFringe':
            for x in [-.14,0,.14]:
                parts.append(hair_lock('LongBang',[(x*.5,-.09,1.79),(x,-.36,1.79),(x-.035,-.40,1.64),(x-.045,-.346,1.49)],.074,.037))
        if style in ['Bob','LongFringe']:
            for sign in [-1,1]:
                for i in range(3):
                    end=1.14 if style=='Bob' else 1.02
                    y=-.10+i*.15
                    parts.append(hair_lock('SideLock',[(sign*.32,y*.7,1.70),(sign*.49,y,1.55),(sign*.49,y,1.27),(sign*.37,y+.045,end+i*.018)],.094,.078))
        if style=='LongFringe':parts.append(ell('BackHair',(0,.215,1.26),(.38,.155,.32),'Hair',segments=28,rings=18))
        if style=='LowPonytail':
            parts.append(ell('Tie',(.17,.325,1.20),(.075,.055,.065),'Trim'))
            for i in range(3):
                parts.append(hair_lock('Ponytail',[(.16+i*.025,.33,1.23),(.39+i*.025,.43,1.27),(.41+i*.02,.45,1.00),(.25+i*.02,.36,.99)],.085,.068))
    join(parts,'Hair_'+style)

outfit_ids=['Hoodie','TShirt','Sweater','Dress']
for outfit in outfit_ids:
    parts=[]
    def body_weights(c,i):
        chest=blend(c.z,.58,.79)
        return {'Chest':chest,'Hips':1-chest}
    parts.append(sweep('Torso',[(0,0,z,w,d) for z,w,d in [
        (.565,.224,.149),(.58,.249,.163),(.63,.258,.176),(.73,.259,.178),
        (.83,.25,.164),(.89,.236,.146),(.932,.166,.113),(.947,.112,.089)
    ]],'Outfit',body_weights))
    if outfit!='Dress':
        parts.append(sweep('Hem',[(0,0,z,w,d) for z,w,d in [(.565,.225,.151),(.572,.25,.165),(.601,.253,.169),(.611,.249,.167)]],'Outfit',body_weights))
    # Inset neckline with a real opening; no floating collar bead.
    parts.append(sweep('Neckline',[(0,0,z,w,d) for z,w,d in [(.931,.126,.099),(.945,.127,.101),(.957,.112,.09)]],
                       'Trim' if outfit in ['Sweater','Dress'] else 'Outfit',lambda c,i:{'Chest':1}))
    if outfit=='Dress':
        # Rounded hem and gentle fluting, with a blended waist.
        skirt=sweep('DressSkirt',[(0,0,z,w,d) for z,w,d in [
            (.426,.325,.209),(.435,.341,.22),(.47,.342,.221),(.54,.31,.202),
            (.62,.27,.181),(.70,.241,.169),(.74,.244,.17)
        ]],'Outfit',body_weights,sides=40)
        for v in skirt.data.vertices:
            a=math.atan2(v.co.y/.66,v.co.x)
            strength=(1-blend(v.co.z,.44,.72))*.014*math.cos(a*10)
            v.co.x+=strength*math.cos(a);v.co.y+=strength*.66*math.sin(a)
        parts.append(skirt)
        parts.append(sweep('WaistRibbon',[(0,0,.702,.246,.174),(0,0,.723,.247,.175)],'Trim',body_weights))
        for sign in [-1,1]:parts.append(ell('BowLoop',(sign*.039,-.181,.717),(.042,.014,.024),'Trim','Chest',rotation=(0,sign*.3,0)))
    if outfit=='Hoodie':
        parts.append(ell('Hood',(0,.107,.948),(.185,.121,.092),'Outfit','Chest'))
        parts.append(ell('Pocket',(0,-.165,.678),(.132,.023,.047),'Outfit','Chest'))
        parts.append(tube('PocketSeam',[(-.105,-.184,.674),(0,-.191,.649),(.105,-.184,.674)],.0035,'Trim','Chest'))
        for x in [-.068,.068]:
            parts.append(tube('Drawstring',[(x,-.115,.931),(x*.96,-.164,.869),(x*.86,-.184,.798)],.006,'Trim','Chest',sides=8))
            parts.append(ell('CordTip',(x*.86,-.184,.796),(.009,.009,.016),'Trim','Chest',segments=12,rings=8))
    for side,sign in [('L',-1),('R',1)]:
        short=outfit in ['TShirt','Dress']
        def arm_weights(c,i):
            upper=blend(c.z,.69,.79)
            return {f'UpperArm_{side}':upper,f'Forearm_{side}':1-upper}
        rings=[(sign*x,y,z,w,d) for x,y,z,w,d in [
            (.18,0,.879,.068,.082),(.234,0,.881,.102,.107),
            (.288,0,.852,.106,.108),(.323,0,.802,.096,.098)
        ]]
        if not short:
            rings += [(sign*x,y,z,w,d) for x,y,z,w,d in [
                (.35,0,.746,.088,.093),(.371,-.006,.696,.085,.088),
                (.389,-.013,.643,.079,.081),(.399,-.016,.611,.074,.075)
            ]]
        parts.append(sweep('Sleeve',rings,'Outfit',arm_weights))
        cuff=rings[-1];prev=rings[-2]
        parts.append(sweep('Cuff',[(prev[0]*.15+cuff[0]*.85,cuff[1],cuff[2]+.015,cuff[3]*1.03,cuff[4]*1.03),
                                   (cuff[0],cuff[1],cuff[2]-.006,cuff[3]*1.025,cuff[4]*1.025)],
                           'Trim' if outfit=='Sweater' else 'Outfit',arm_weights))
        if outfit!='Dress':
            def leg_weights(c,i):
                thigh=blend(c.z,.28,.40)
                return {f'Thigh_{side}':thigh,f'Shin_{side}':1-thigh}
            parts.append(sweep('Trouser',[(sign*.13,0,z,w,d) for z,w,d in [
                (.135,.097,.108),(.153,.112,.122),(.22,.116,.13),(.30,.114,.132),
                (.36,.119,.135),(.43,.125,.141),(.52,.13,.146),(.598,.124,.134)
            ]],'Trousers',leg_weights))
        else:
            parts.append(sweep('Leg',[(sign*.13,0,z,w,w) for z,w in [(.12,.071),(.22,.075),(.34,.079),(.45,.084),(.54,.085)]],
                               'Skin',lambda c,i:{f'Thigh_{side}':blend(c.z,.28,.40),f'Shin_{side}':1-blend(c.z,.28,.40)}))
            parts.append(ell('Sock',(sign*.13,0,.18),(.087,.095,.07),'Trim',f'Shin_{side}'))
    join(parts,'Outfit_'+outfit)

# Bind every independently selectable module to the same skeleton.
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH':continue
    mod=obj.modifiers.new('Shared character rig','ARMATURE');mod.object=rig
    obj.parent=rig
    obj['nestle_original']=True
rig['design_reference']='Approved original Nestle concept v1'
rig['unit']='meters'
rig['model_revision']=2

# Starter loops and pose transitions. Each action keys all joints to avoid leakage.
scene=bpy.context.scene;scene.render.fps=24;scene.frame_start=1;scene.frame_end=49
for bone in rig.pose.bones:bone.rotation_mode='XYZ'
for clip in ['Idle','Walk','Wave','Sit','Dance','Hug']:
    rig.animation_data_create();action=bpy.data.actions.new(clip);rig.animation_data.action=action
    for f in list(range(1,50,4))+[49]:
        t=(f-1)/48;phase=t*2*math.pi
        for b in rig.pose.bones:b.location=(0,0,0);b.rotation_euler=(0,0,0)
        rig.pose.bones['Chest'].rotation_euler.x=.018*math.sin(phase)
        rig.pose.bones['Head'].rotation_euler.y=.025*math.sin(phase)
        rig.pose.bones['Root'].location.y=.007*(1-math.cos(phase))
        if clip=='Walk':
            for side,sign in [('L',-1),('R',1)]:
                rig.pose.bones[f'Thigh_{side}'].rotation_euler.x=sign*.48*math.sin(phase)
                rig.pose.bones[f'Shin_{side}'].rotation_euler.x=-max(0,sign*math.sin(phase))*.4
                rig.pose.bones[f'UpperArm_{side}'].rotation_euler.x=-sign*.38*math.sin(phase)
        elif clip=='Wave':
            rig.pose.bones['UpperArm_R'].rotation_euler.z=-1.75
            rig.pose.bones['Forearm_R'].rotation_euler.z=-.55+.25*math.sin(phase*2)
            rig.pose.bones['Hand_R'].rotation_euler.x=.16*math.sin(phase*2)
        elif clip=='Sit':
            ease=min(1,t*4)
            for side in ['L','R']:
                rig.pose.bones[f'Thigh_{side}'].rotation_euler.x=-1.45*ease
                rig.pose.bones[f'Shin_{side}'].rotation_euler.x=1.45*ease
            rig.pose.bones['Root'].location.y=-.21*ease
        elif clip=='Dance':
            rig.pose.bones['Hips'].rotation_euler.z=.13*math.sin(phase)
            rig.pose.bones['Chest'].rotation_euler.z=-.18*math.sin(phase)
            rig.pose.bones['Root'].location.y=.04*(1-math.cos(phase*2))
            for side,sign in [('L',-1),('R',1)]:
                rig.pose.bones[f'UpperArm_{side}'].rotation_euler.z=-sign*(.75+.28*math.sin(phase))
                rig.pose.bones[f'Thigh_{side}'].rotation_euler.x=max(0,sign*math.sin(phase))*.55
        elif clip=='Hug':
            for side,sign in [('L',-1),('R',1)]:
                rig.pose.bones[f'UpperArm_{side}'].rotation_euler.x=-1.25
                rig.pose.bones[f'UpperArm_{side}'].rotation_euler.z=sign*.15
                rig.pose.bones[f'Forearm_{side}'].rotation_euler.z=-sign*.8
            rig.pose.bones['Chest'].rotation_euler.x=.06
        for b in rig.pose.bones:
            b.keyframe_insert('location',frame=f,group=b.name)
            b.keyframe_insert('rotation_euler',frame=f,group=b.name)
    track=rig.animation_data.nla_tracks.new();track.name=clip
    strip=track.strips.new(clip,1,action);strip.action_frame_start=1;strip.action_frame_end=49
    track.mute=True
    rig.animation_data.action=None

# Export every variant; visibility is chosen by the viewer, not baked geometry.
for track in rig.animation_data.nla_tracks:track.mute=False
for obj in bpy.context.scene.objects:obj.hide_render=False;obj.hide_set(False)
scene.frame_set(1)
for b in rig.pose.bones:b.location=(0,0,0);b.rotation_euler=(0,0,0)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(OUT/'nestle-original-v1.glb'),export_format='GLB',
    use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',
    export_force_sampling=True,export_frame_range=False,export_morph=True,
    export_skins=True,export_yup=True,export_extras=True)

# Editable source opens with a single clean default outfit and hairstyle.
for track in rig.animation_data.nla_tracks:track.mute=True
for b in rig.pose.bones:b.location=(0,0,0);b.rotation_euler=(0,0,0)
for obj in bpy.context.scene.objects:
    if obj.name.startswith('Hair_') and obj.name!='Hair_SideSwept':obj.hide_set(True);obj.hide_render=True
    if obj.name.startswith('Outfit_') and obj.name!='Outfit_Hoodie':obj.hide_set(True);obj.hide_render=True
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'nestle-original-v1.blend'))
manifest={
    'version':1,'revision':2,'asset':'nestle-original-v1.glb','original':True,
    'hair':hair_ids,'outfits':outfit_ids,'expressions':['Neutral']+expressions,
    'animations':['Idle','Walk','Wave','Sit','Dance','Hug'],
    'skeleton':[b[0] for b in bones],
    'source':'output/models/nestle-original-v1.blend',
    'notes':['Refined original base: swept hair, continuous garments, blended joints and surface-fitted expressions.',
             'Hug is an arm pose; viewer must position and synchronize both partners.',
             'Sit transitions into a held pose and requires a seat in the viewer.',
             'Hidden hair/outfit variants remain in GLB; choose one of each in the viewer.']
}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('NESTLE_BUILD_COMPLETE',json.dumps(manifest))
