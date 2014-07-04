 	(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
	|| window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame)
	window.requestAnimationFrame = function(callback, element) {
	var currTime = new Date().getTime();
	var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	var id = window.setTimeout(function() { callback(currTime + timeToCall); },
	timeToCall);
	lastTime = currTime + timeToCall;
	return id;
	};
	if (!window.cancelAnimationFrame)
	window.cancelAnimationFrame = function(id) {
	clearTimeout(id);
	};
	}());

  
  var lanes=[];
  var avatar;
  var board;
  var status=document.getElementById("status");
  
  function GameLoop(timeStamp) 
  {        
		for (var i=0; i<lanes.length;i++)
		  positionLane(lanes[i],timeStamp)
		moveAvatar(timeStamp)
		window.requestAnimationFrame(GameLoop);  		
  }
  
  function resolveLaneHitTest(lane,xleft,xright)
  {
     //select my lane
     var l=lanes[lane];
	 //map into the repeat coordinate system corrected by the lane offset
	 xleft=(xleft-l.laneoffset)%l.repeat;	 
	 xright=(xright-l.laneoffset)%l.repeat;	 
	 
     //correct for current leftness of lane
     for (var i=0;i<l.members.length;i+=1) {
	   if (xleft<xright) { //the normal order of things
	     if (xleft>l.members[i].right) continue; //our left edge is right of its right edge
	     if (xright<l.members[i].left) continue; //our right edge is left of its left edge
	   } else { //actually the mapping has split the points because we are overlapping the repeat
         if ((xleft>l.members[i].right)&&(xright<l.members[i].left)) continue;
         if ((xright<l.members[i].left)&&(xleft>l.members[i].right)) continue;	     
	   }
	   //we ain't clear at all we got a hit!
	   return l.members[i].type;
	 }
	 return "-";
  }
  
  function setAvatarLane()
  {
     avatar.style.top=(lanes[avatar.lane].bottomedge-avatar.offsetHeight).toString()+"px";	      
  }
  
  function moveAvatar(timeStamp) 
  {
     
     switch (avatar.command) {
	 case 1:
	 avatar.lane-=1;
	 if (avatar.lane<0) avatar.lane=0;
	 setAvatarLane();
	 break;
	 case 3:
	 avatar.lane+=1;
	 if (avatar.lane>=lanes.length) avatar.lane=lanes.length-1;
	 setAvatarLane();	 
	 break;
	 case 2:
	 avatar.posx+=5;
	 avatar.style.left=avatar.posx.toString()+"px";	 
	 break;
	 case 4:
	 avatar.posx-=5;
	 avatar.style.left=avatar.posx.toString()+"px";	 
	 break;	 
	 }
	 avatar.command=0;
	 var ht=resolveLaneHitTest(avatar.lane,avatar.posx,avatar.posx+avatar.offsetWidth);
	 status.innerHTML="   hittest:"+ht;
  }
  
	
  function positionLane(l,timeStamp)
  {
      l.laneoffset=(timeStamp*l.speed/1000)%l.repeat-l.repeat;
	  l.lanecontent.style.left=l.laneoffset.toString()+"px";
	  
  }
  
  
  var lastMouseX,lastMouseY;
  function touchEvent(x,y,down)
  {
    if (down) {
	  lastMouseX=x;
	  lastMouseY=y;	 
      avatar.command=0;	  
	}else {
	  //seems we are moving...
	  var xdif=lastMouseX-x;
	  var ydif=lastMouseY-y;
	  if (Math.abs(xdif)>Math.abs(ydif)) { //move sideways
	     if (xdif>0) avatar.command=4;
		 else avatar.command=2;		 
	  } else {  //move across
	    if (ydif>0) avatar.command=1;
		else avatar.command=3;		 
	  }	  
	}
  }
  
  function keyEvent(code,down)
  {
     if (down==1) {
	   if (code==87) avatar.command=1;
	   if (code==68) avatar.command=2;
	   if (code==83) avatar.command=3;
	   if (code==65) avatar.command=4;	   
	 }
  }
	
  function play() {
      board=document.getElementsByClassName("gameframe")[0];
	  board.onkeydown=function(evt) { keyEvent(evt.keyCode,1);  };
      board.onkeyup=function(evt) { keyEvent(evt.keyCode,0);  };
	  board.addEventListener('touchstart',
	     function(evt)
	     {
           var t=evt.changedTouches[0];
           touchEvent(t.pageX,t.pageY,1);
		   evt.preventDefault();
		 },false
	     );
	  board.addEventListener('touchend',
	     function(evt)
	     {
           var t=evt.changedTouches[0];
           touchEvent(t.pageX,t.pageY,0);
		   evt.preventDefault();
		 },false
	     );
		 
	  board.focus();
	
	  avatar=document.getElementsByClassName("avatar")[0];
	  avatar.command=0;	  
	  avatar.posx=100;
	  
      var bits=document.getElementsByClassName("lane");
      for(var i = 0; i < bits.length; i++) {
	    var l=bits[i];
		l.speed=l.getAttribute("data-speed");
		l.lanecontent=l.getElementsByClassName("lanecontent")[0];
		l.repeat=0;
		//add up your childrens width
		var children=l.lanecontent.getElementsByTagName("span");
		l.members=[];
		for(var j = 0; j < children.length; j++)  {		   
		   var ch=children[j];
		   l.repeat+=ch.offsetWidth;
		   if (ch.classList.contains("refuse")) {
		      var ob={left: ch.offsetLeft, right: ch.offsetLeft+ch.offsetWidth, type: "r"};
			  l.members.push(ob);
		   }
		   if (ch.classList.contains("kill")) {
		      var ob={left: ch.offsetLeft, right: ch.offsetLeft+ch.offsetWidth, type: "k"};
			  l.members.push(ob);
		   }		   
		}
		if (l.repeat==0) l.repeat=3000;
		//now double up on the content
        var content=l.lanecontent.innerHTML;		
		var start=content+content;
		for (var e=0;e < 2000/l.repeat;e+=1)
		  start+=content;
		l.lanecontent.innerHTML=start;
		l.bottomedge=l.offsetTop+l.offsetHeight;
		lanes.push(l);
	  }
	  avatar.lane=lanes.length-1;
	  setAvatarLane();
      window.requestAnimationFrame(GameLoop);     
  }
  
  play();
  
  