// Seated activity art, using the approved heads without redrawing their pixels.
include('home-body.px.js');
const momentPoses=['sitting','reading','studying','gaming','cuddling'];
const momentMoods=['neutral','happy','affectionate','sad','surprised','sleepy','laughing','angry',
  'worried','shy','confused','annoyed','crying','excited','winking','kissing'];

function seatedBody(c,longHair,pose,studyStep=0) {
  const floor=pose==='studying';
  const hairOffset=pose==='cuddling'?2:0;
  const hairPoly=(points,color)=>c.poly(points.map((value,index)=>index%2?value:value+hairOffset),color);
  // Seat and leg contact, authored specifically for the floor or sofa.
  if(floor) {
    // Two bent legs, each with a rounded outer knee and a foot tucked inward.
    // The far shin passes behind the near shin rather than forming one filled cone.
    c.poly([75,130,87,133,98,143,106,157,106,165,101,172,88,177,67,184,50,195,39,196,33,190,39,181,59,171,80,159,73,146],'a');
    c.poly([78,136,86,138,95,147,101,158,101,164,97,168,85,172,64,180,47,190,40,191,39,188,62,175,86,161,79,147],'c');
    c.ellipse(99,160,4,5,'s');
    // The rear shoe peeks out beside the opposite ankle, not outside the knee.
    c.poly([38,183,47,185,54,192,52,200,33,201,29,197,31,190],'h');
    c.poly([36,190,43,189,49,194,48,197,34,197],'j');c.hline(33,199,18,'q');
    c.poly([45,130,55,140,50,153,45,159,58,166,78,175,91,183,98,190,95,198,85,201,76,197,60,186,38,178,26,172,20,164,21,155,32,140],'a');
    c.poly([44,137,49,142,44,152,37,159,43,165,57,171,75,179,87,186,92,191,90,196,84,196,77,191,62,182,40,173,30,168,26,162,27,156,36,144],'s');
    c.ellipse(27,159,4,5,'l');
    c.line(43,168,63,177,'c',2);c.line(65,178,80,188,'c',2);
    c.poly([83,185,91,187,99,194,99,201,94,204,77,203,73,199,76,193],'h');
    c.poly([82,191,88,190,94,195,94,199,79,198],'j');c.hline(78,201,18,'q');
  } else {
    // Knees and feet tuck closer together during a cuddle, keeping four feet visible.
    const legX=value=>Math.round(64+(value-64)*.67)+(longHair?-4:4);
    const legs=pose==='cuddling'?{
      poly:(points,color)=>c.poly(points.map((value,index)=>index%2?value:legX(value)),color),
      ellipse:(x,y,rx,ry,color)=>c.ellipse(legX(x),y,Math.max(1,Math.round(rx*.67)),ry,color),
      hline:(x,y,length,color)=>c.hline(legX(x),y,Math.max(1,legX(x+length)-legX(x)),color)
    }:c;
    // Thighs project forward from the cushion into two distinct rounded knees.
    legs.poly([42,107,85,107,95,115,101,126,99,135,91,141,77,140,65,132,54,140,39,141,30,136,27,127,32,116],'a');
    legs.poly([42,114,54,116,60,124,55,133,48,137,38,136,33,131,34,124],'s');
    legs.poly([76,116,86,114,94,122,96,130,92,136,81,137,73,131,70,124],'s');
    // Short shins drop below the bent knees; both shoes rest on the floor.
    legs.poly([35,134,54,135,55,145,52,160,53,169,46,173,37,169,36,157,34,145],'a');
    legs.poly([39,139,50,140,50,146,47,160,49,167,45,169,41,166,41,156,38,146],'s');
    legs.poly([77,135,95,134,96,145,93,158,95,168,88,173,78,170,76,159,75,145],'a');
    legs.poly([81,140,91,139,91,146,88,158,91,167,87,169,82,166,81,157,79,146],'s');
    legs.ellipse(43,136,7,4,'l');legs.ellipse(86,136,7,4,'l');
    legs.hline(39,141,10,'c');legs.hline(81,141,10,'c');
    legs.poly([38,166,51,166,58,171,57,178,29,178,28,175,32,170],'h');
    legs.poly([79,166,92,166,102,172,103,178,76,178,73,175],'h');
    legs.hline(31,176,24,'q');legs.hline(77,176,24,'q');
    legs.hline(37,171,13,'j');legs.hline(81,171,12,'j');
  }
  // A soft torso and recognizable photo outfits keep the approved body language.
  if(longHair) {
    // Connect to the portrait's x=10..50 silhouette at head offset 32.
    // Taper the lengths behind the shoulders rather than adding square side blocks.
    hairPoly([42,40,53,43,52,56,49,75,47,91,43,105,39,108,38,101,39,84,40,65],'h');
    hairPoly([75,41,82,44,85,57,86,76,84,98,79,111,73,108,76,88,77,65],'h');
  }
  c.poly([56,40,71,40,72,51,80,57,73,67,55,67,49,57,57,51],'a');
  c.poly([59,44,68,44,69,53,74,57,68,62,60,62,55,57,60,52],'s');
  c.poly([44,56,51,51,57,53,64,61,71,54,77,52,85,57,91,69,86,89,88,111,81,119,48,119,40,112,44,89,37,71],'t');
  c.poly([47,60,52,57,63,67,67,67,75,57,80,59,86,69,81,90,83,109,77,115,51,115,45,109,49,89,42,71],longHair?'u':'M');
  if(longHair) {
    c.line(54,54,63,66,'T');c.line(75,54,67,67,'t');
    for(let y=64;y<111;y+=7)for(let x=44+y%3;x<85;x+=8) {
      if(!c.is(x,y,'u'))continue;
      for(const [dx,dy]of [[0,0],[1,-1],[2,0],[0,2],[2,2]])if(c.is(x+dx,y+dy,'u'))c.px(x+dx,y+dy,'H');
    }
    if(floor) {
      c.poly([42,109,85,109,94,121,101,145,94,153,80,157,65,151,49,157,33,152,27,145,34,122],'h');
      c.poly([43,115,56,115,53,139,47,151,34,148,33,142],'H');
      c.poly([73,115,83,115,89,129,96,144,90,149,79,152,74,139],'H');
      c.line(62,126,60,144,'j');c.line(68,130,72,146,'j');
    } else {
      c.poly([42,109,85,109,94,115,99,125,94,131,76,131,65,126,54,131,34,131,29,125,34,115],'h');
      c.poly([44,114,57,114,54,125,35,126,38,119],'H');
      c.poly([72,114,82,114,91,122,92,126,77,126],'H');
    }
    c.hline(44,111,38,'j');
  } else {
    // Cover the shared outline with the burgundy jersey.
    c.poly([44,56,51,51,57,53,64,61,71,54,77,52,85,57,91,69,86,89,88,111,81,119,48,119,40,112,44,89,37,71],'m');
    c.poly([47,60,52,57,63,67,67,67,75,57,80,59,86,69,81,90,83,109,77,115,51,115,45,109,49,89,42,71],'M');
    c.line(43,59,41,69,'w',2);c.line(85,60,87,69,'w',2);
    c.line(54,55,63,63,'p');c.line(63,63,75,55,'p');
    c.line(70,75,81,108,'w',2);c.line(73,76,83,103,'P');c.rect(51,80,6,5,'n');
    if(floor) {
      c.poly([42,111,86,111,95,123,102,144,94,154,78,151,65,139,53,151,34,155,24,145,32,124],'h');
      c.poly([44,116,60,117,60,135,50,146,35,150,30,143,38,124],'N');
      c.poly([69,117,82,115,90,126,97,143,91,149,79,146,69,135],'n');
      c.line(63,119,65,138,'j');
    } else {
      c.poly([42,111,86,111,96,119,99,128,93,136,75,134,65,128,56,135,34,134,29,126,33,117],'h');
      c.poly([44,116,62,117,59,126,53,131,37,130,35,124],'N');
      c.poly([68,117,82,115,92,123,92,130,78,130,69,125],'n');
    }
  }
  // Each activity gets real arm placement, not props attached to a standing sprite.
  if(pose==='cuddling') {
    if(longHair) {
      c.line(43,64,39,87,'t',9);c.line(39,87,68,113,'t',8);
      c.line(43,65,42,85,'u',5);c.line(42,85,69,111,'u',5);
      c.ellipse(72,114,5,4,'a');c.ellipse(72,113,4,3,'s');
      c.line(86,66,90,88,'t',8);c.line(90,88,80,116,'t',7);
      c.ellipse(79,117,4,5,'s');
    } else {
      // The arm wraps behind her upper back, below the neck, rather than across it.
      c.line(43,65,25,66,'a',10);c.line(25,66,9,70,'a',8);
      c.line(43,65,25,66,'s',6);c.line(25,66,9,70,'s',4);
      c.line(87,66,96,90,'a',9);c.line(96,90,78,116,'a',8);
      c.line(87,67,92,89,'s',5);c.line(92,89,77,114,'s',5);c.ellipse(76,117,5,4,'s');
    }
  } else if(pose==='sitting') {
    const handX=studyStep?2:0,handY=studyStep===2?-2:0;
    c.line(42,65,34,91,'a',9);c.line(34,91,48+handX,123+handY,'a',8);
    c.line(87,65,96,92,'a',9);c.line(96,92,84,123,'a',8);
    c.line(42,66,38,91,longHair?'u':'s',6);c.line(38,91,49+handX,121+handY,longHair?'u':'s',5);
    c.line(87,66,92,91,longHair?'u':'s',6);c.line(92,91,83,121,longHair?'u':'s',5);
    c.ellipse(50+handX,125+handY,5,4,'s');c.ellipse(82,125,5,4,'s');
  } else {
    c.line(43,65,35,90,'a',10);c.line(35,90,50,110,'a',9);
    c.line(86,65,95,90,'a',10);c.line(95,90,79,110,'a',9);
    c.line(43,66,39,89,longHair?'u':'s',6);c.line(39,89,52,108,longHair?'u':'s',6);
    c.line(86,66,91,89,longHair?'u':'s',6);c.line(91,89,77,108,longHair?'u':'s',6);
  }
  if(longHair) {
    // A continuous front lock follows the chest with a soft, narrow tip.
    hairPoly([74,43,81,45,83,59,82,76,80,94,77,106,73,109,69,105,71,89,73,70],'h');
    hairPoly([77,49,80,51,80,68,78,85,76,99,73,104,74,89,76,70],'H');
    c.line(78+hairOffset,55,78+hairOffset,70,'j');
    c.line(76+hairOffset,84,74+hairOffset,98,'j');
    if(pose==='cuddling') {
      // His hand rests on her outside shoulder, above her sleeve in the paired pose.
      c.ellipse(42,68,5,5,'a');c.ellipse(42,67,4,4,'s');
      c.line(39,68,43,70,'c');c.px(44,67,'l');
    }
  }
  // Open books, a laptop/notebook and handheld consoles read clearly at room scale.
  if(pose==='reading') {
    c.poly([37,100,60,98,65,102,71,98,94,101,91,126,69,124,64,127,59,124,39,126],'t');
    c.poly([40,102,58,101,63,104,63,123,58,121,42,123],'Q');
    c.poly([66,104,72,101,91,103,88,123,72,121,66,123],'q');
    c.line(64,104,64,125,'v');
    for(const y of [107,111,115]){c.hline(44,y,12,'v');c.hline(72,y,13,'v');}
    c.ellipse(40,115,4,5,'s');c.ellipse(91,115,4,5,'s');
  } else if(pose==='gaming') {
    c.rect(37,101,56,24,'h');c.rect(40,103,50,20,'N');
    c.rect(48,103,34,20,'k');c.rect(50,105,30,16,'n');
    c.rect(52,107,26,10,'d');c.rect(52,117,26,2,'o');
    c.rect(53,115,5,3,'u');c.rect(64,110,4,8,'p');c.rect(73,113,3,5,'g');
    c.line(42,108,42,116,'q');c.line(39,112,45,112,'q');c.px(86,109,'P');c.px(85,115,'q');
    c.ellipse(38,115,4,6,'s');c.ellipse(92,115,4,6,'s');
  } else if(pose==='studying') {
    if(longHair) {
      c.poly([35,111,84,111,91,136,42,137],'t');
      c.poly([38,114,81,114,87,133,44,134],'Q');
      for(const y of [119,123,127])c.hline(46,y,25,'v');
      const dx=[0,-3,1,4][studyStep],dy=[0,2,3,1][studyStep];
      c.line(73+dx,116+dy,81+dx,104+dy,'g',2);c.px(73+dx,117+dy,'k');
      c.ellipse(78+dx,109+dy,5,4,'s');c.ellipse(41,126,5,4,'s');
    } else {
      c.poly([33,102,95,102,92,132,36,132],'h');
      c.poly([36,105,92,105,89,128,39,128],'N');
      c.rect(42,109,43,14,'n');c.hline(46,112,19,'d');c.hline(46,116,28,'d');
      c.poly([36,132,92,132,99,139,29,139],'q');c.hline(52,136,24,'N');
      if(studyStep) {
        // Fingers tap the keyboard below the laptop screen.
        c.ellipse(46,134+(studyStep%2),5,2,'a');c.hline(44,134+(studyStep%2),5,'s');
        c.ellipse(82,135-(studyStep%2),5,2,'a');c.hline(80,135-(studyStep%2),5,'s');
        c.hline(46,120,studyStep===2?24:13,'d');
      }
    }
  }
}

// Additional display colors for the handheld screen.
pal({o:'#8aa17c'});
for(const pose of momentPoses)for(const [id,longHair]of [['long_hair',true],['short_hair',false]]) {
  const lean=pose==='cuddling'?(longHair?8:-8):0;
  const headX=32+(pose==='cuddling'?(longHair?10:-10):0);
  for(const mood of momentMoods)
    sprite(`${pose}_homebody_${id}_${mood}`,{w:128,h:208},
      layer('body',{x:lean},c=>seatedBody(c,longHair,pose)),
      clip([headX,0,64,47],stamp(`portrait_${id}_${mood}`,headX,0)));
  anim(`${pose}_idle_${id}`,{base:`${pose}_homebody_${id}_neutral`},
    frame({ms:1600}),
    frame({ms:120},c=>{
      c.rect(headX+21,27,8,6,'l');c.rect(headX+34,27,8,6,'l');
      c.poly([headX+38,27,headX+42,27,headX+42,33,headX+39,33],'s');
      c.line(headX+22,29,headX+25,30,'H');c.hline(headX+25,30,3,'H');
      c.hline(headX+35,30,3,'H');c.line(headX+38,30,headX+40,29,'H');
    }),frame({ms:1300}));
}
scene('activity_pose_preview',{w:672,h:264,bg:'f'},c=>{
  c.rect(0,0,672,23,'z');c.text(12,8,'LITTLE EVERYDAY MOMENTS','Q',{scale:2});
  for(const [i,pose]of momentPoses.entries()) {
    const x=8+i*132;c.text(x+64,30,pose.toUpperCase(),'z',{align:'c'});
    c.rect(x,40,128,213,'F');c.stamp(`${pose}_homebody_${i%2?'short_hair':'long_hair'}_neutral`,x,42);
  }
});
scene('cuddle_pair_review',{w:196,h:224,bg:'f'},c=>{
  c.stamp('cuddling_homebody_short_hair_neutral',58,16);
  c.stamp('cuddling_homebody_long_hair_neutral',0,16);
});

