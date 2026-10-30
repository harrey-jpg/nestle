include('activities.px.js');
for(const [id,longHair]of [['long_hair',true],['short_hair',false]])
  anim(`sitting_hand_shift_${id}`,{w:128,h:208},
    ...[0,1,2,1].map((step,index)=>frame({ms:index?500:8500},
      clip([28,88,38,46],c=>seatedBody(c,longHair,'sitting',step)))));
scene('sitting_motion_review',{w:512,h:240,bg:'f'},c=>{
  for(let step=0;step<4;step++) {
    c.stamp('sitting_homebody_long_hair_neutral',step*128,24);
    c.stamp('sitting_hand_shift_long_hair',step*128,24,{frame:step});
  }
});
