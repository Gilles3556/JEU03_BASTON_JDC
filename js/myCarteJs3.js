
function afficherMenuCarte(){
	console.log(">>fn afficherMenuCarte()");
}
$(document).ready(function(){
	console.log(">>jQuery OK");
	console.log(">>jQuery Génération paquet ADV");
	var MAX_CARTE=50;
	
	/* ETAT D'UNE CARTE:
    -1: CREATION=> PAQUET
	0: EN JEU
	1,2: en ATT
	-1: MORTE => cimetière /
	*/
	var noTour=0;
	var fin2tour=false;
	var nbc_me = 0;
	var nbc_adv = 0;
		
	paquetCR = creerPaquet();
	console.log(paquetCR);
	paquet2={"cartes":[]};
	
	//recharger PAQUET2 ???
	for(c=0;c<paquetCR.length;c++){
		paquet2.cartes.push(paquetCR[c]);
	}
		
	var jeu_me  = [4];
	var jeu_adv = [4];
	
    var carte='{"nom":"???"  ,"id_div":"???" ,"id_li":"??"  ,"t":0  ,"l":0, "cout":0 ,"ATT":0 ,"DEF":0 ,"etat": 0}';

	ccMe=0;
	ccAdv=0;
	while(!fin2tour){
		noTour++;
        fini=false;
		// -1)-- tirer4 cartes
		while(!fini){
			c1 = paquet2.cartes.shift();// retirer 1er élément d'un tableau
			afficherCarte(c1);
			carte1=JSON.parse(c1);
			carte1.etat=1;
			
			if (carte1.nom.charAt(0)=="M"){
				if (ccAdv<4){ // n'avoir que 4 cartes au MAX
					jeu_adv[ccAdv]=carte1;
					strhtml=buildDivCarte(carte1,false,ccAdv);
					ccAdv++;
				}
			}else{
                if (ccMe<4){ // n'avoir que 4 cartes au MAX
					jeu_me[ccMe]=carte1;
					strhtml=buildDivCarte(carte1,true,ccMe);
					ccMe++;
					console.log("CTR ME:"+ccMe);
				}
			}
			carte1.etat=0;
					
			//MAJ HTML
			$(strhtml).appendTo("body");
			strhtml="";
			
			fini=(ccMe==4) && (ccAdv==4);
		}
		
		majCompteursPaquet(ccMe,ccAdv);
		alert("TOUR NO:"+noTour);
		$("#tour2jeu").html("<h1>"+noTour+"</h1>");
		
		// -2)-- placer carte en attaque ou cimetière ou passer son tour
	
		// ---	
		console.log(noTour);
		fin2tour= (noTour==4);
	}
	
	$("#mcarte01").click(function(){
		appelerMenu1("#"+this.id,1);
	});
	$("#mcarte02").click(function(){
		appelerMenu1("#"+this.id,2);
	});
	$("#mcarte03").click(function(){
		appelerMenu1("#"+this.id,3);
	});
	$("#mcarte04").click(function(){
		appelerMenu1("#"+this.id,4);
	});
	
	function appelerMenu1(id,no){
		action=prompt("A1,A2 pour attaquer | S pour sacrifier");
		//ATTAQUE
		if (action=="A1" || action=="A2"){
			//récupére no ATT
			noAtt= action.substring(1);
			
			//placer la carte en ATT
			if (compterAttaque(noAtt)==0){
				jeu_me[no-1].etat=noAtt; // récupération de la carte		
				placerCarteEnAttaque(id,noAtt);
			}else{
				alert(">>Attaque déjà occupée !");
			}
		}
		//SACRIFIER
		if (action="S"){
			
		}	
	}
	function compterAttaque(no){
		ctr=0;
		for(i=0;i<jeu_me.length;i++){
			if (jeu_me[i].etat == no){
				ctr++;
			}
		}
		return ctr;
	}
	function placerCarteEnAttaque(idcarte,noatt){
		$(idcarte).css("top","400px");
		l= (noatt==1?"368px":"580px");
		
		$(idcarte).css("top","400px");
		$(idcarte).css("left",l);
		$(idcarte).addClass("attaque");
		
	}
	/* function buildDivCarteAtt(ca, me,idx){
		no = idx+1;
		strhtml="<div id='att1' ";
		if (me){
			strhtml+=" class='carteMe' >";
		}else{
			strhtml+=" class='carteAdv' >";			
		}
		strhtml+="<ul>"+ca.nom+"<span>( "+ca.cout+" )</span>";
		//strhtml+="<li id='"+ca.id_li+"' >"+((me)?genereMonstreJoueur():genereMonstreAdverse())+"</li>";
		strhtml+="<li id='"+ca.id_li+"' >"+ca.carFont+"</li>";
		strhtml+="<li><span>"+ca.ATT+"</span>|<span>"+ca.DEF+"</span></li>";
		strhtml+="</ul>";
		strhtml+="</div>";
		return strhtml;
	}
	*/
	function afficherCarte(c){
		console.log(c);
	}
	/* ----------------------------------------------
	 Fonction chargée de créer une DIV pour la carte 
	 ----------------------------------------------- */
    function buildDivCarte(ca, me,idx){
		no = idx+1;
		strhtml="<div id='";
		if (me){
			strhtml+="mcarte"+(no<10?"0":"")+no+"' ";
			strhtml+=" class='carteMe' >";
		    console.log("fn BuildDivCarte()"+strhtml);
		}else{
			strhtml+="carte"+(no<10?"0":"")+no+"' ";
			strhtml+=" class='carteAdv' >";			
		}
		strhtml+="<ul>"+ca.nom+"<span>( "+ca.cout+" )</span>";
		//strhtml+="<li id='"+ca.id_li+"' >"+((me)?genereMonstreJoueur():genereMonstreAdverse())+"</li>";
		strhtml+="<li id='"+ca.id_li+"' >"+ca.carFont+"</li>";
		strhtml+="<li><span>"+ca.ATT+"</span>|<span>"+ca.DEF+"</span></li>";
		strhtml+="</ul>";
		strhtml+="</div>";
		return strhtml;
	}
	/* -----------------------------------------
	 Fonction chargée de placer une carte en top,left
	 ------------------------------------------*/
	function placerCarte(ca){
		$(ca.id).css("top", ca.t+"px");
		$(ca.id).css("left", ca.l+"px");
		console.log(ca.id_div+" en [t:"+ca.t+"| l:"+ca.l);
	}
	// -----------------------------------------------
	// fonction qui génère un monstre dans WEBFONT: 
    // font-family:'pixelfarm_pets_unitedregular'	
	// ------------------------------------------------
	function genereMonstreAdverse(){
		nb=0;
		ok=false;
		while(!ok){
			nb= Math.trunc(Math.random()*122);
			ok= (nb>=65) && (nb<=122) &&(nb!=80) &&(nb!=91) &&(nb!=92) &&(nb!=93) &&(nb!=94) &&(nb!=95)&&(nb!=96)&&(nb!=112);
		}
		nb = "&#"+nb+";";
		return nb;
	}
	// -----------------------------------------------
	// fonction qui génère un monstre dans WEBFONT: 
    // font-family: 'pokemon_pixels_1regular'
	// ------------------------------------------------
	function genereMonstreJoueur(){
		nb=0;
		ok=false;
		while(!ok){
			nb= Math.trunc(Math.random()*122);
			ok= (nb>=48) && (nb<=122);
			ok= ok &&(nb!=91) &&(nb!=92) &&(nb!=93) &&(nb!=94) &&(nb!=95)&&(nb!=96);
			ok= ok &&(nb !=58) &&(nb !=59) &&(nb !=60) &&(nb !=61) &&(nb !=62) &&(nb !=63) &&(nb !=64)
		}
		nb = "&#"+nb+";";
		return nb;
	}
	/* ------------------------------------------------
	 fonction qui génére le paquet de départ
	 ------------------------------------------------ */
	function creerPaquet(){
		paquetNew={"cartes":[]};
		// choix répartition des cartes ds paquet
		
		/*accord= false;
		poucent=0;
	    while(!accord){
			pourcent= Math.trunc(Math.random()*56)+1; // 1 à 56
			rep = prompt("vous avez "+pourcent+"% de carte. Acceptez vous la partie? (oui/non)")
			rep = rep.toUpperCase();
			accord = (rep=="OUI");
		}
		nbc_me= Math.trunc((MAX_CARTE*pourcent)/100);
		nbc_adv= MAX_CARTE-nbc_me;
		console.log("nbc_me="+nbc_me+" | nbc_adv:"+nbc_adv);		
		*/
		
		//création des cartes 50%, 25 chacun
		for(n=0;n<50;n++){
			uneCarte="";
			if (n<25){
				//Création d'une carte
				uneCarte=creerUnecarte(true,n);   
			}else{
				uneCarte=creerUnecarte(false,n);
			}	
			//Ajout dans paquet
			paquetNew.cartes.push(uneCarte);
		}

		// mélanger
		paquetNew = melanger(paquetNew.cartes);
		majCompteursPaquet(nbc_me,nbc_adv);
	
		return paquetNew;
	}
	/* fontion de mélange d'un tableau
		sce:https://www.hakharien.fr/article-array-shuffle-js
	*/
	function melanger(unPaquet){
		//unPaquet.cartes = unPaquet.cartes.sort(function() { return Math.random() - .5 });
		return unPaquet.sort(function() { return Math.random() - .5 });
	}
	/* -----------------------------------------
	 Fonction chargée de maj les compteurs sur PAQUET
	 ------------------------------------------*/
	function majCompteursPaquet(nbcme,nbcadv){
		$("#ctrPaquet").html("["+nbcme+" / "+nbcadv+"]");
	}
	/* -----------------------------------------
	 Fonction chargée de créer un objet CARTE
	 ------------------------------------------*/
	function creerUnecarte(me,nb){
		modele_carte='{"nom":"???"  ,"id_div":"???" ,"id_li":"??"  ,"t":0  ,"l":0, "cout":0 ,"ATT":0 ,"DEF":0 ,"etat": 0,"carFont":""}';
	    
		uneCarte = JSON.parse(modele_carte);
		//MEP du NOM
		uneCarte.nom="M";
		if (me){
			uneCarte.nom ="my"+uneCarte.nom;
		}
		uneCarte.nom+=nb;
		//MEP IDDIV et LI ???
		uneCarte.id_div="carte";
		if (me){
			uneCarte.id_div="m"+uneCarte.id_div;
		}
		uneCarte.id_div+=(nb<10)?"0"+(nb+1):(nb+1);
		
		uneCarte.id_li="monster";
		if (me){
			uneCarte.id_li="my"+uneCarte.id_li;
		}
		uneCarte.id_li+=(nb<10)?"0"+(nb+1):(nb+1);
				
		uneCarte.t=0;
		uneCarte.l=0;
		
		uneCarte.cout=Math.trunc(Math.random()*6)+1; 
		if (uneCarte.cout==0){
			uneCarte.cout=1;
		}
		uneCarte.ATT=Math.trunc((uneCarte.cout*2) /3);
		if (uneCarte.ATT==0){
			uneCarte.ATT=1;
		}
		uneCarte.DEF =Math.trunc(uneCarte.cout/3);
		if (uneCarte.DEF==0){
			uneCarte.DEF=1;
		}
		uneCarte.etat =-1;
		//MEP caractere
		uneCarte.carFont = (me?genereMonstreJoueur():genereMonstreAdverse());
		
		
        //transforme l'objet Carte en texte JSON
		//strCarte = {"nom":uneCarte.nom  ,"id_div": uneCarte.iddiv ,"id_li":uneCarte.idli  ,"t":0  ,"l":0, "cout": uneCarte.cout ,"ATT":uneCarte.ATT ,"DEF":uneCarte.DEF ,"etat": 0,"carFont":uneCarte.carFont};
	    strCarte=JSON.stringify(uneCarte);
	    
		return strCarte;
	}
});