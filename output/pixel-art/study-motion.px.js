// Only the notebook/laptop region moves; the approved faces stay untouched.
include('activities.px.js');
for(const [id,longHair]of [['long_hair',true],['short_hair',false]])
  anim(`study_motion_${id}`,{w:128,h:208},
    ...[0,1,2,3].map(step=>frame({ms:step?400:4800},
      clip([28,99,74,43],c=>seatedBody(c,longHair,'studying',step)))));

scene('study_motion_review',{w:512,h:448,bg:'f'},c=>{
  for(const [row,id]of ['long_hair','short_hair'].entries())for(let step=0;step<4;step++) {
    c.stamp(`studying_homebody_${id}_neutral`,step*128,row*224+16);
    c.stamp(`study_motion_${id}`,step*128,row*224+16,{frame:step});
  }
});
