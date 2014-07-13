  
  
  function setupAvatar()
  {
      avatar=document.getElementsByClassName("avatar")[0];
	  avatar.command=0;	  
	  avatar.move=0;
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
	
  }
  
  function getAvatarLaneLine(lane)
  {
     return (lanes[lane].bottomedge-avatar.offsetHeight);	      
  }
  
  function moveAvatar(timeStamp) 
  {
     if (avatar.move==0) { //not currently moving
		 switch (avatar.command) {
		 case 1:		 
		 if (avatar.lane<=0) break;
		 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+avatar.lanetime;
		 avatar.movestartpos=getAvatarLaneLine(avatar.lane); 
		 avatar.moveendpos=getAvatarLaneLine(avatar.lane-1);
		 avatar.moveendlane=avatar.lane-1;
         avatar.move=1;		 		 
		 break;
		 case 3:
		 if (avatar.lane>=lanes.length-1) break;
		 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+avatar.lanetime;
		 avatar.movestartpos=getAvatarLaneLine(avatar.lane); 
		 avatar.moveendpos=getAvatarLaneLine(avatar.lane+1);
		 avatar.moveendlane=avatar.lane+1;
         avatar.move=3;		 		 
		 break;
		 case 2:
		 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+avatar.sidletime;
		 avatar.movestartpos=avatar.posx; 
		 avatar.moveendpos=avatar.posx+avatar.sidledistance;
         avatar.move=2;		 
		 break;
		 case 4:
		 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+avatar.sidletime;
		 avatar.movestartpos=avatar.posx; 
		 avatar.moveendpos=avatar.posx-avatar.sidledistance;
         avatar.move=4;		 
		 break;
		 }
		 avatar.command=0;
     } else {
	     if (timeStamp<avatar.moveendtime) {
		   var pos=avatar.movestartpos+(timeStamp-avatar.movestarttime)*(avatar.moveendpos-avatar.movestartpos)/(avatar.moveendtime-avatar.movestarttime);
		   if ((avatar.move==1)||(avatar.move==3))  //y-axis
		     avatar.style.top=pos.toString()+"px";	      
		   else if ((avatar.move==2)||(avatar.move==4))  //x-axis
		     avatar.style.left=pos.toString()+"px";	      		   
		 } else {
		   if ((avatar.move==1)||(avatar.move==3)) {  //y-axis
		     avatar.style.top=avatar.moveendpos.toString()+"px";	      
			 avatar.lane=avatar.moveendlane;
		   } else if ((avatar.move==2)||(avatar.move==4)) { //x-axis
		     avatar.style.left=avatar.moveendpos.toString()+"px";	      		   
			 avatar.posx=avatar.moveendpos;
		   } else if (avatar.move==5) { //death
		     notifyBoardDeath();
		   } else if (avatar.move==6) { //death
		     notifyBoardWin();
		   }
		   avatar.move=0;
		   avatar.command=0;		   
		 }
	 }
	 if (avatar.move==0) {
	   var ht=resolveLaneHitTest(avatar.lane,avatar.posx,avatar.posx+avatar.offsetWidth);
	   if (ht=="k") {
	 	 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+100;
		 avatar.move=5;		 	
	   }
	   if (ht=="t") {
	 	 avatar.movestarttime=timeStamp;
		 avatar.moveendtime=timeStamp+100;
		 avatar.move=6;		 	
	   }
	   status.innerHTML="   hittest:"+ht;
	 }
	 
  }
  
	
