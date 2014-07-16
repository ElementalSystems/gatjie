  

  var MoveType = { 
    STILL : { cssclass: "move_still"} ,
	UP : { cssclass: "move_up"} ,
	DOWN : { cssclass: "move_down"} ,
	LEFT : { cssclass: "move_left"} ,
	RIGHT : { cssclass: "move_right"} ,
	DIE : { cssclass: "move_die"} ,
	WIN : { cssclass: "move_win"} ,	
  }
  
  function setupAvatar()
  {
      avatar=document.getElementsByClassName("avatar")[0];
	  avatar.command=0;	  
	  avatar.move=MoveType.STILL;
	  avatar.movestarttime=0;
	  avatar.moveendtime=0;
	  avatar.posx=200;
	  avatar.lanetime=Number(avatar.getAttribute("data-lanetime"));
	  avatar.sidletime=Number(avatar.getAttribute("data-sidletime"));
	  avatar.sidledistance=Number(avatar.getAttribute("data-sidledistance"))*board.offsetWidth/100;	  
  }
  
  function resetAvatar()
  {
     avatar.lane=lanes.length-1;
	 avatar.posx=board.offsetWidth/2;
	 avatar.style.top=getAvatarLaneLine(avatar.lane).toString()+"px";	      
	 avatar.style.left=avatar.posx+"px";	      		   
	 setAvatarMove(MoveType.STILL);
	
  }
  
  function getAvatarLaneLine(lane)
  {
     return (lanes[lane].bottomedge-avatar.offsetHeight);	      
  }
  
  function setAvatarMove(newDir)
  {
     avatar.classList.remove(avatar.move.cssclass);
	 avatar.move=newDir;
	 avatar.classList.add(avatar.move.cssclass);
	 
  }
  
  function moveAvatar(timeStamp) 
  {
     if (avatar.move==MoveType.STILL) { //not currently moving
		 switch (avatar.command) {
		 case 1:		 
		 if (avatar.lane<=0) break;
		 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+avatar.lanetime;
		 avatar.movestartpos=getAvatarLaneLine(avatar.lane); 
		 avatar.moveendpos=getAvatarLaneLine(avatar.lane-1);
		 avatar.moveendlane=avatar.lane-1;
		 setAvatarMove(MoveType.UP);
         break;
		 case 3:
		 if (avatar.lane>=lanes.length-1) break;
		 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+avatar.lanetime;
		 avatar.movestartpos=getAvatarLaneLine(avatar.lane); 
		 avatar.moveendpos=getAvatarLaneLine(avatar.lane+1);
		 avatar.moveendlane=avatar.lane+1;
         setAvatarMove(MoveType.DOWN);
         break;
		 case 2:
		 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+avatar.sidletime;
		 avatar.movestartpos=avatar.posx; 
		 avatar.moveendpos=avatar.posx+avatar.sidledistance;
         setAvatarMove(MoveType.LEFT);
         break;
		 case 4:
		 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+avatar.sidletime;
		 avatar.movestartpos=avatar.posx; 
		 avatar.moveendpos=avatar.posx-avatar.sidledistance;
         setAvatarMove(MoveType.RIGHT);
		 break;
		 }
		 avatar.command=0;
     } else {
	     if (timeStamp<avatar.moveendtime) {
		   var pos=avatar.movestartpos+(timeStamp-avatar.movestarttime)*(avatar.moveendpos-avatar.movestartpos)/(avatar.moveendtime-avatar.movestarttime);
		   if ((avatar.move==MoveType.UP)||(avatar.move==MoveType.DOWN))  //y-axis
		     avatar.style.top=pos.toString()+"px";	      
		   else if ((avatar.move==MoveType.LEFT)||(avatar.move==MoveType.RIGHT))  //x-axis
		     avatar.style.left=pos.toString()+"px";	      		   
		 } else {
		   if ((avatar.move==MoveType.UP)||(avatar.move==MoveType.DOWN)) {  //y-axis
		     avatar.style.top=avatar.moveendpos.toString()+"px";	      
			 avatar.lane=avatar.moveendlane;
		   } else if ((avatar.move==MoveType.LEFT)||(avatar.move==MoveType.RIGHT)) { //x-axis
		     avatar.style.left=avatar.moveendpos.toString()+"px";	      		   
			 avatar.posx=avatar.moveendpos;
		   } else if (avatar.move==MoveType.DIE) { //death
		     notifyBoardDeath();
		   } else if (avatar.move==MoveType.WIN) { //target
		     notifyBoardWin();
		   }
		   setAvatarMove(MoveType.STILL);         
		   avatar.command=0;		   
		 }
	 }
	 if (avatar.move==MoveType.STILL) {
	   var ht=resolveLaneHitTest(avatar.lane,avatar.posx,avatar.posx+avatar.offsetWidth);
	   if (ht=="k") {
	 	 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+500;
		 setAvatarMove(MoveType.DIE);
	   }
	   if (ht=="t") {
	 	 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+500;
		 setAvatarMove(MoveType.WIN);
	   }
	   status.innerHTML="   hittest:"+ht;
	 }
	 
	 
  }
  
	
