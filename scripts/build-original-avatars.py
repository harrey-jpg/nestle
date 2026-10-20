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
base=[ell('HeadBase',(0,0,1.355),(.465,.355,.435),'Skin',segments=32,rings=22),
      ell('Neck',(0,0,.965),(.105,.095,.12),'Skin','Chest')]
for side,sign in [('L',-1),('R',1)]:
    base += [ell('Ear',(sign*.453,0,1.34),(.075,.065,.105),'Skin'),
             ell('UpperArm',(sign*.3,0,.83),(.081,.085,.145),'Skin',f'UpperArm_{side}',rotation=(0,sign*-.35,0)),
             ell('Forearm',(sign*.382,-.009,.66),(.066,.075,.11),'Skin',f'Forearm_{side}'),
             ell('Mitten',(sign*.41,-.018,.555),(.075,.07,.09),'Skin',f'Hand_{side}'),
             ell('Thumb',(sign*.365,-.07,.575),(.036,.036,.048),'Skin',f'Hand_{side}'),
             ell('Shoe',(sign*.13,-.055,.105),(.115,.18,.09),'Shoes',f'Foot_{side}'),
             ell('Sole',(sign*.13,-.055,.065),(.118,.18,.035),'Sole',f'Foot_{side}')]
join(base,'BaseSkinAndShoes')

# Face primitives are individually editable and use shape keys for expressions.
expressions=['Happy','Sad','Sleepy','Surprised','Affectionate']
for sign in [-1,1]:
    eye=ell('Eye_L' if sign<0 else 'Eye_R',(sign*.145,-.328,1.4),(.039,.028,.059),'FaceDark')
    eye.shape_key_add(name='Basis')
    for expr in expressions:
        key=eye.shape_key_add(name=expr)
        for i,v in enumerate(eye.data.vertices):
            q=v.co.copy()
            if expr in ['Sleepy','Affectionate']: q.z*=.18
            elif expr=='Surprised': q.x*=1.12;q.z*=1.15
            elif expr=='Happy': q.z*=.83
            elif expr=='Sad': q.z*=.88
            key.data[i].co=q
    glint=ell('EyeGlint',(sign*.145-.009,-.351,1.42),(.008,.006,.012),'EyeGlint')
    glint.shape_key_add(name='Basis')
    for expr in ['Sleepy','Affectionate']:
        k=glint.shape_key_add(name=expr)
        for i,v in enumerate(glint.data.vertices):k.data[i].co=v.co*.01
    ell('Cheek',(sign*.252,-.289,1.292),(.065,.013,.032),'Blush')
    pts=[(sign*.145+(t/10-.5)*.095,-.324,1.49+.016*math.sin(t*math.pi/10)) for t in range(11)]
    brow=tube('Brow',pts,.009,'Hair')
    brow.shape_key_add(name='Basis')
    for expr in ['Sad','Surprised']:
        k=brow.shape_key_add(name=expr)
        for i,v in enumerate(brow.data.vertices):
            q=v.co.copy();q.z+=((.145-abs(q.x))*.28 if expr=='Sad' else .03);k.data[i].co=q
ell('Nose',(0,-.355,1.31),(.035,.034,.032),'Nose')
mouth_points=[((t/20-.5)*.112,-.343,1.229+.027*((t/10-1)**2)) for t in range(21)]
mouth=tube('Mouth',mouth_points,.007,'FaceDark',sides=8)
mouth.shape_key_add(name='Basis')
for expr in expressions:
    k=mouth.shape_key_add(name=expr)
    for i,v in enumerate(mouth.data.vertices):
        t=i//8;u=t/20;offset=v.co-Vector(mouth_points[t]);x=(u-.5)*.112
        if expr=='Happy':x=.053*math.cos(u*2*math.pi);z=1.232+.035*math.sin(u*2*math.pi)
        elif expr=='Surprised':x=.028*math.cos(u*2*math.pi);z=1.235+.038*math.sin(u*2*math.pi)
        elif expr=='Sad':z=1.255-.025*((u*2-1)**2)
        elif expr=='Sleepy':x*=.65;z=1.235+.004*((u*2-1)**2)
        else:z=1.23+.035*((u*2-1)**2)
        k.data[i].co=Vector((x,-.343,z))+offset

def cap(name, back_length=0):
    verts=[];faces=[];segments=32;rows=12
    for j in range(rows+1):
        for i in range(segments):
            theta=2*math.pi*i/segments
            front=max(0,-math.sin(theta))
            limit=2.04-front*.92+back_length*(1-front)
            phi=.025+(limit-.025)*j/rows
            verts.append((.478*math.sin(phi)*math.cos(theta),.369*math.sin(phi)*math.sin(theta),1.38+.452*math.cos(phi)))
    for j in range(rows):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments
            faces.append((a,b,b+segments,a+segments))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return finish(obj,name,'Hair','Head')

hair_ids=['SoftCrop','SideSwept','Bob','LongFringe','CurlyPuff','LowPonytail']
for style in hair_ids:
    parts=[cap('Cap', .22 if style in ['Bob','LongFringe','LowPonytail'] else 0)]
    if style=='CurlyPuff':
        for ring,phi in enumerate([.25,.65,1.0,1.35]):
            for j in range(7):
                theta=j*2*math.pi/7+ring*.4
                if phi>1.1 and math.sin(theta)<-.5:continue
                parts.append(ell('Curl',(.44*math.sin(phi)*math.cos(theta),.34*math.sin(phi)*math.sin(theta),1.4+.43*math.cos(phi)),(.14,.12,.135),'Hair',segments=12,rings=8))
    else:
        for i in range(5):
            x=(i-2)*.125
            length=.135 if style=='SoftCrop' else .205
            z=1.665+.035*math.cos(i)
            if style=='LongFringe':length=.23;z=1.58
            lock=ell('Fringe',(x,-.28,z),(.108,.088,length),'Hair',rotation=(.14,(-.35 if style=='LongFringe' else .55)+i*.04,0))
            parts.append(lock)
            # Shallow raised ridge supplies a simple authored strand highlight.
            parts.append(ell('Strand',(x+.018,-.351,z+.025),(.013,.009,length*.7),'HairRidge',rotation=(.14,(-.35 if style=='LongFringe' else .55)+i*.04,0),segments=10,rings=8))
        if style in ['Bob','LongFringe']:
            for sign in [-1,1]:
                parts.append(ell('SideHair',(sign*.397,.025,1.34 if style=='Bob' else 1.23),(.12,.3,.25 if style=='Bob' else .37),'Hair'))
        if style=='LongFringe':parts.append(ell('BackHair',(0,.235,1.21),(.39,.16,.38),'Hair'))
        if style=='LowPonytail':
            parts.append(ell('Tie',(0,.37,1.26),(.10,.07,.10),'Trim'))
            for i in range(3):parts.append(ell('Ponytail',(.055*i,.44+.045*i,1.16-.065*i),(.15-.02*i,.13,.17),'Hair',rotation=(.2,-.2,0)))
    join(parts,'Hair_'+style)

outfit_ids=['Hoodie','TShirt','Sweater','Dress']
for outfit in outfit_ids:
    parts=[]
    torso=ell('Torso',(0,0,.775),(.255,.175,.24),'Outfit','Chest');parts.append(torso)
    if outfit=='Dress':
        # Smooth bell skirt, weighted across hips/chest rather than a rigid shell.
        verts=[];faces=[];segments=32;rows=8
        for j in range(rows+1):
            z=.43+j/rows*.39;r=.35-j/rows*.13
            for i in range(segments):
                a=i*2*math.pi/segments;verts.append((r*math.cos(a),r*.64*math.sin(a),z))
        for j in range(rows):
            for i in range(segments):
                a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
        mesh=bpy.data.meshes.new('DressSkirt');mesh.from_pydata(verts,[],faces);mesh.update()
        obj=bpy.data.objects.new('DressSkirt',mesh);bpy.context.collection.objects.link(obj);finish(obj,'DressSkirt','Outfit','Hips');parts.append(obj)
        parts.append(ell('Collar',(0,-.138,.936),(.165,.043,.05),'Trim','Chest'))
    if outfit=='Hoodie':
        parts.append(ell('Hood',(0,.10,.96),(.18,.12,.09),'Outfit','Chest'))
        parts.append(ell('Pocket',(0,-.168,.70),(.13,.025,.06),'Outfit','Chest'))
        for x in [-.075,.075]:parts.append(tube('Drawstring',[(x,-.173,.93),(x*.85,-.194,.81)],.009,'Trim','Chest'))
    if outfit=='Sweater':parts.append(ell('NeckRib',(0,0,.963),(.13,.105,.04),'Trim','Chest'))
    for side,sign in [('L',-1),('R',1)]:
        short=outfit in ['TShirt','Dress']
        parts.append(ell('Sleeve',(sign*.29,0,.853),(.097,.099,.12 if short else .16),'Outfit',f'UpperArm_{side}',rotation=(0,-sign*.35,0)))
        if not short:parts.append(ell('LowerSleeve',(sign*.38,-.008,.675),(.08,.085,.115),'Outfit',f'Forearm_{side}'))
        if outfit!='Dress':
            parts.append(ell('TrouserTop',(sign*.13,0,.46),(.12,.135,.165),'Trousers',f'Thigh_{side}'))
            parts.append(ell('TrouserBottom',(sign*.13,0,.24),(.105,.117,.14),'Trousers',f'Shin_{side}'))
        else:
            parts.append(ell('UpperLeg',(sign*.13,0,.44),(.085,.09,.13),'Skin',f'Thigh_{side}'))
            parts.append(ell('LowerLeg',(sign*.13,0,.24),(.08,.085,.13),'Skin',f'Shin_{side}'))
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
    'version':1,'asset':'nestle-original-v1.glb','original':True,
    'hair':hair_ids,'outfits':outfit_ids,'expressions':['Neutral']+expressions,
    'animations':['Idle','Walk','Wave','Sit','Dance','Hug'],
    'skeleton':[b[0] for b in bones],
    'source':'output/models/nestle-original-v1.blend',
    'notes':['Starter procedural model based on approved concept; visual refinement remains possible.',
             'Hug is an arm pose; viewer must position and synchronize both partners.',
             'Sit transitions into a held pose and requires a seat in the viewer.',
             'Hidden hair/outfit variants remain in GLB; choose one of each in the viewer.']
}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('NESTLE_BUILD_COMPLETE',json.dumps(manifest))
