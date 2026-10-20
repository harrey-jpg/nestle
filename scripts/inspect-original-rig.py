"""Read-only diagnostics: run after opening the generated .blend in Blender."""
import bpy, json
rig=bpy.data.objects['NestleRig']
result={}
for name in ['Idle','Wave','Sit','Hug']:
    for track in rig.animation_data.nla_tracks:track.mute=track.name!=name
    bpy.context.scene.frame_set(1)
    bpy.context.scene.frame_set(25)
    bpy.context.view_layer.update()
    result[name]={}
    for bone in ['Root','Head','UpperArm_R','Forearm_R','Hand_R','Thigh_R','Shin_R','Foot_R']:
        evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get())
        b=evaluated.pose.bones[bone]
        result[name][bone]={'head':[round(v,3) for v in rig.matrix_world@b.head], 'tail':[round(v,3) for v in rig.matrix_world@b.tail]}
print('NESTLE_RIG_INSPECTION',json.dumps(result))
