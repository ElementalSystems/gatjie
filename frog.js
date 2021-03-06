
  var lanes;
  var avatar;
  var board;
  
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

  function pulseOffset(l,timeStamp)
  {
     if (l.pulsesize<.01) return 0;
     var pulsePos=(timeStamp%l.pulsetime)*2.0/l.pulsetime-1;
	 return pulsePos*pulsePos*l.pulsesize;   	 
  }
  
  function pulseFactor(l,timeStamp)
  {
     if (l.pulsesize<1) return 0;
     var pulsePos=(timeStamp%l.pulsetime)*2.0/l.pulsetime;
	 if (pulsePos<1) {
	    return pulsePos*l.pulsesize;   
	 } else {
	    return (2-pulsePos)*l.pulsesize; 
	 }	 	 	 
  }
  
  function positionLane(l,timeStamp)
  {
      l.laneoffset=(timeStamp*l.speed/1000+pulseOffset(l,timeStamp))%l.repeat-l.repeat;
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
	     if (xdif>20) avatar.command=4;
		 else if (xdif<-20) avatar.command=2;
	  } else {  //move across
	    if (ydif>20) avatar.command=1;
		else if (ydif<-20) avatar.command=3;
	  }
	  if (avatar.command!=0) {
	    lastMouseX=x;
	    lastMouseY=y;
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
    if (code==38) avatar.command=1;
    if (code==39) avatar.command=2;
    if (code==40) avatar.command=3;
    if (code==37) avatar.command=4;
	 }
  }

  function setupBoard()
  {
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
  
      board.addEventListener('touchmove',
	     function(evt)
	     {
           var t=evt.changedTouches[0];
           touchEvent(t.pageX,t.pageY,0);
		   evt.preventDefault();
		 },false
	     );

		 
	  board.info=document.getElementsByClassName("infopanel")[0];
	  board.infostatus=document.getElementById("info_status");
	  board.infocommand=document.getElementById("info_command");
	  board.infocommand.onclick=clickBoardStatus;

	  board.infogoals=document.getElementById("info_goals");
	  board.infolives=document.getElementById("info_lives");
      board.infolevelname=document.getElementById("info_levelname");
      board.infonextlevelname=document.getElementById("info_nextlevelname");
  
      board.sound_start=document.getElementById("sound_start");
      board.sound_death=document.getElementById("sound_death");
      board.sound_win=document.getElementById("sound_win");

	  board.isplaying=false;
	  board.winState=0;
  }

  function resetGame()
  {
      board.lives=5;
	  board.currentLevel=0;
  }
  
  function resetBoard()
  {      
      var levid='level'+board.currentLevel;
	  var level=document.getElementById(levid);
	  board.innerHTML=level.innerHTML;
      board.winState=0;
      board.focus();
	  board.goals=5;	

	  lanes=[];
	  //set up lanes
      var bits=board.getElementsByClassName("lane");
      for(var i = 0; i < bits.length; i++) {
	    var l=bits[i];
		l.speed=l.getAttribute("data-speed")*board.offsetWidth/100;
		l.pulsetime=l.getAttribute("data-pulsetime");		
		if (!l.pulsetime) l.pulsetime=1000;
		l.pulsesize=l.getAttribute("data-pulsesize")*board.offsetWidth/100;
		if (!l.pulsesize) l.pulsesize=0;
				
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
           if (ch.classList.contains("target")) {
		      var ob={left: ch.offsetLeft, right: ch.offsetLeft+ch.offsetWidth, type: "t"};
			  l.members.push(ob);
		   }
		}
		if (l.repeat==0) l.repeat=3000;
		//now double up on the content (I need at least two)
        var content=l.lanecontent.innerHTML;
		var start=content+content;
		//- then keep adding on repeats until you have at least the width of the board plus one
		for (var e=2;e < ((board.offsetWidth+l.repeat)/l.repeat)+1;e+=1)
		  start+=content;
		l.lanecontent.innerHTML=start;
		l.bottomedge=l.offsetTop+l.offsetHeight;
		lanes.push(l);
	  }
	  setupAvatar();
	  resetAvatar();

      
  }

  function clickBoardStatus()
  {
      if (board.winState==0) {
        resetGame();
	    board.currentLevel=1;
	  }
      if (board.winState==2) {//you won keep going
	    board.currentLevel=board.currentLevel+1;
	  }
	  if (board.winState==3) { //you lost start from scratch
        resetGame();
	    board.currentLevel=1;
	  }

      resetBoard();
	  board.isplaying=true;
	  board.sound_start.play();
	  refreshBoardInfo();

  }

  function refreshBoardInfo()
  {
      if (board.info.classList.contains('infopanel-inplay')) {
	    if (!board.isplaying) board.info.classList.remove('infopanel-inplay');
	  } else {
	    if (board.isplaying) board.info.classList.add('infopanel-inplay');
	  }

      if (board.classList.contains('gameframe-inplay')) {
	    if (!board.isplaying) board.classList.remove('gameframe-inplay');
	  } else {
	    if (board.isplaying) board.classList.add('gameframe-inplay');
	  }

	  board.infolives.innerHTML=board.lives.toString();
	  board.infogoals.innerHTML=board.goals.toString();

	  switch (board.winState) {
	    case 0: board.infostatus.innerHTML="Welcome"; break;
		case 1: board.infostatus.innerHTML="Game Paused"; break;
		case 2: board.infostatus.innerHTML="You Won"; break;
		case 3: board.infostatus.innerHTML="You Died"; break;
	  }
	  //figure out level names
	  var levid='level'+board.currentLevel;
	  var level=document.getElementById(levid);
	  board.infolevelname.innerHTML=level.getAttribute("data-description");
	  var nextlev=board.currentLevel+1;
	  if (board.winState==3) //death
	    nextlev=1;
	  var levid='level'+nextlev;
	  var level=document.getElementById(levid);
	  if (level)
	    board.infonextlevelname.innerHTML=level.getAttribute("data-description");
	  
	  
  }

  function notifyBoardDeath()
  {
    board.lives-=1;
	if (board.lives==0) {
	   board.isplaying=false;
	   board.winState=3;
	}
	refreshBoardInfo();
	resetAvatar();
  }


  function notifyBoardWin()
  {
    board.goals-=1;
	if (board.goals==0) {
	   board.isplaying=false;
	   board.winState=2;
	}
	refreshBoardInfo();
	resetAvatar();
  }

  
  function play() {
      setupBoard();
	  resetGame();
	  resetBoard();
	  resetAvatar();
	  refreshBoardInfo();
	  window.requestAnimationFrame(GameLoop);
  }

  play();

