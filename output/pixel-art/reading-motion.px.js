// A transparent book overlay keeps every approved face/expression asset unchanged.
include('activities.px.js');
function turnPage(c,step) {
  if(!step)return;
  const leaves=[
    [65,103,85,96,90,98,87,120,65,125],
    [65,103,70,91,74,93,70,119,65,125],
    [64,103,53,94,49,97,52,120,64,125],
    [64,104,43,100,41,103,44,122,64,125]
  ];
  c.poly(leaves[step-1],'v');
  const paper=[
    [66,104,85,98,88,99,85,119,66,123],
    [66,104,71,94,72,95,68,119,66,123],
    [63,104,53,97,51,98,54,119,63,123],
    [63,105,45,102,43,104,46,120,63,123]
  ];
  c.poly(paper[step-1],step<3?'Q':'q');
  if(step===1){c.line(70,107,82,103,'v');c.line(70,111,81,107,'v');}
  if(step===3){c.line(55,105,61,109,'v');c.line(56,110,61,114,'v');}
  // Fingertips follow the paper while the other hand supports the book.
  if(step<4){const x=[0,85,71,53][step],y=[0,101,96,100][step];
    c.ellipse(x,y,3,2,'a');c.hline(x-1,y-1,3,'s');
  }
}
  anim('reading_page_turn',{w:128,h:208},
    frame({ms:10560}),
    ...[1,2,3,4].map(step=>frame({ms:360},c=>turnPage(c,step))));
scene('reading_motion_review',{w:640,h:240,bg:'f'},c=>{
  for(let i=0;i<5;i++) {
    c.stamp('reading_homebody_long_hair_neutral',i*128,24);
    c.stamp('reading_page_turn',i*128,24,{frame:i});
    c.text(i*128+64,8,['READ','LIFT','TURN','LOWER','SETTLE'][i],'z',{align:'c'});
  }
});
