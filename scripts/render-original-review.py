"""Render an asset contact sheet from the open .blend; run with Blender -b file -P this_file."""
import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector, Matrix

ROOT=Path(__file__).resolve().parents[1]
output=Path(sys.argv[sys.argv.index('--')+1]) if '--' in sys.argv else ROOT/'.impeccable/review/original/refined-sheet.png'
if not output.is_absolute():output=ROOT/output
output.parent.mkdir(parents=True,exist_ok=True)
scene=bpy.context.scene
rig=bpy.data.objects['NestleRig']
for track in rig.animation_data.nla_tracks:track.mute=True
rig.animation_data.action=None
for bone in rig.pose.bones:bone.location=(0,0,0);bone.rotation_euler=(0,0,0)
scene.frame_set(1)
sources=[o for o in scene.objects if o.type=='MESH']
for obj in sources:obj.hide_set(False);obj.hide_render=False
bpy.context.view_layer.update()
cases=[('Soft crop','SoftCrop','Hoodie','Neutral'),('Side swept','SideSwept','Sweater','Neutral'),
       ('Bob','Bob','Hoodie','Neutral'),('Long fringe','LongFringe','Dress','Neutral'),
       ('Curly puff','CurlyPuff','TShirt','Neutral'),('Low ponytail','LowPonytail','Sweater','Neutral'),
       ('Hoodie','SideSwept','Hoodie','Neutral'),('T-shirt','SoftCrop','TShirt','Neutral'),
       ('Sweater','Bob','Sweater','Neutral'),('Dress','LowPonytail','Dress','Neutral'),
       *[(e,'SideSwept','Hoodie',e) for e in ['Neutral','Happy','Sad','Sleepy','Surprised','Affectionate']]]
turnaround='--turnaround' in sys.argv
if turnaround:
    cases=[(hair+' '+view,hair,outfit,'Neutral')
           for hair,outfit in [('SideSwept','Hoodie'),('Bob','Sweater'),('LongFringe','Dress'),('LowPonytail','TShirt')]
           for view in ['Front','3/4','Side','Back']]
depsgraph=bpy.context.evaluated_depsgraph_get()
for index,(label,hair,outfit,expression) in enumerate(cases):
    x=(index%4-1.5)*1.45;z=(3-index//4)*2.15
    for obj in sources:
        if obj.name.startswith('Hair_') and obj.name!='Hair_'+hair:continue
        if obj.name.startswith('Outfit_') and obj.name!='Outfit_'+outfit:continue
        if obj.data.shape_keys:
            for key in obj.data.shape_keys.key_blocks:key.value=1 if key.name==expression else 0
    bpy.context.view_layer.update()
    for obj in sources:
        if obj.name.startswith('Hair_') and obj.name!='Hair_'+hair:continue
        if obj.name.startswith('Outfit_') and obj.name!='Outfit_'+outfit:continue
        mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph),depsgraph=depsgraph)
        copy=bpy.data.objects.new(label+'_'+obj.name,mesh);scene.collection.objects.link(copy)
        angle=[0,math.pi/4,math.pi/2,math.pi][index%4] if turnaround else 0
        copy.matrix_world=Matrix.Rotation(angle,4,'Z')@obj.matrix_world
        copy.location+=Vector((x,0,z))
    text=bpy.data.curves.new(label,'FONT');text.body=label;text.align_x='CENTER';text.size=.115
    text.extrude=0
    title=bpy.data.objects.new('Label',text);scene.collection.objects.link(title)
    title.location=(x,-.2,z-.17);title.rotation_euler=(math.pi/2,0,0)
    text.materials.append(bpy.data.materials['FaceDark'])
for obj in sources:obj.hide_render=True
world=bpy.data.worlds.new('ReviewWorld');world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.66,.60,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.8;scene.world=world
def area(name,loc,power,size):
    light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size
    obj=bpy.data.objects.new(name,light);scene.collection.objects.link(obj);obj.location=loc
    obj.rotation_euler=(Vector((0,0,4))-obj.location).to_track_quat('-Z','Y').to_euler()
area('Softbox',(-3,-6,10),1100,6)
area('Fill',(5,-4,5),600,5)
area('Rim',(0,3,9),900,5)
camera=bpy.data.cameras.new('ReviewCamera');cam=bpy.data.objects.new('ReviewCamera',camera);scene.collection.objects.link(cam)
cam.location=(0,-18,4.05);cam.rotation_euler=(math.pi/2,0,0);camera.type='ORTHO';camera.ortho_scale=8.9;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1800;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(output)
bpy.ops.render.render(write_still=True)
print('NESTLE_REVIEW_RENDER',output)
