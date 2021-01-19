
function afficherMenuCarte(){
	console.log(">>fn afficherMenuCarte()");
}
$(document).ready(function(){
	console.log(">>jQuery OK");
	console.log(">>jQuery Génération paquet ADV");
	var MAX_CARTE=50;
	var MAX_CARTE_DEBUT = 4;
	
	/* ETATS D'UNE CARTE */
	var ETAT_CR=-1;
	var ETAT_JEU=0;
	var ETAT_ATT1=1;
	var ETAT_ATT2=2;
	var ETAT_CIM=3;
	
	var noTour=0;
	var fin2tour=false;
	var nbc_me = 0;
	var nbc_adv = 0;
		
	paquetCR = creerPaquet();
	paquet2={"cartes":[]};
	
	//recharger PAQUET2 : wgy???
	for(c=0;c<paquetCR.length;c++){
		paquet2.cartes.push(paquetCR[c]);
	}
		
	var jeu_me  = [4];
	var att_me = new Array(0,0);

	
	var jeu_adv = [4];
	var att_adv=new Array(0,0);

	var cim=[];
	
    var carte='{"nom":"???"  ,"id_div":"???" ,"id_li":"??"  ,"t":0  ,"l":0, "cout":0 ,"ATT":0 ,"DEF":0 ,"etat": 0}';
	
	ccMe=0;
	ccAdv=0;
	
	//déterminer qui commence Me ou ADV
	
	//ME
	while(!fin2tour){
		noTour++;
        fini=false;
		// -1)-- tirer4 cartes
		while(!fini){
			c1 = paquet2.cartes.shift();// retirer 1er élément d'un tableau
			carte1=JSON.parse(c1);		
			carte1.etat=ETAT_JEU;
			
			if (etreCarteAdv(carte1)){
				if (ccAdv<MAX_CARTE_DEBUT){ // n'avoir que 4 cartes au MAX
					jeu_adv[ccAdv]=carte1;
					strhtml=buildDivCarte(carte1,false,ccAdv);
					ccAdv++;
					nbc_adv--;
				}
			}else{
                if (ccMe<MAX_CARTE_DEBUT){ // n'avoir que 4 cartes au MAX
					jeu_me[ccMe]=carte1;
					strhtml=buildDivCarte(carte1,true,ccMe);
					ccMe++;
					nbc_me--;
				}
			}
			
			carte1.etat=0;
					
			//MAJ HTML
			$(strhtml).appendTo("body");
			strhtml="";
			
			fini=(ccMe==4) && (ccAdv==4);
		}
		
		
		majCompteursPaquet(nbc_me,nbc_adv);
		$("#tour2jeu").html("<h1>"+noTour+"</h1>");
		
		// ---	
		console.log(noTour);
		// fin2tour = choix ME
		fin2tour= (noTour==MAX_CARTE_DEBUT);
	}
	//LOG
	afficherJeux();
	
	//ADV

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
	/* ------------------------------
	affichage des jeux de cartes-
	-------------------------------- */
	function afficherJeux(){
		afficherJeu(true,jeu_me);
		afficherJeu(false,jeu_adv);
	}
	function afficherJeu(me,tabloJeu){
		str ="--jeu "+(me?"Me ":"Adv ");
		for(i=0;i<tabloJeu.length;i++){
			c=tabloJeu[i];
			str+= "| N="+c.nom+" |id="+c.id_div +"("+c.etat+")";
		}
		console.log(str);
		
	}
	/* ------------------------------------
	  MENU2: pour Piocher ou Fin de tour
	  ---------------------------------- */
	$("#mpaquet").click(function(){
		action=prompt("F fin de tour | P piocher une carte");
		action=action.toUpperCase();
		switch(action){
			case "F":
				fin2tour= true;
				alert("---au suivant !!!");
			break;
			case "P":
				//piocher une carte
				pioche = paquet2.cartes.shift();
				carte_piochee=JSON.parse(pioche);
				
				//Si carte adv => en jeu pour ADV
				//		SSI nb carteADV en jeu <4
				me = !(etreCarteAdv(carte_piochee));
				
				cimetiere = (compterCarteEnjeu(me)>=4);
				if (!cimetiere){
					idxDispo = trouverIndiceDispo(me);
					
					if (idxDispo<0){
						alert("PBM application:indice vaut -1");
						return;
					}
					ctrCarte=(me?ccMe:ccAdv);
					
					//créer une carte pour ADV et afficher
					poserCarteEnJeu(carte_piochee,me,ctrCarte);
					
					if (!me){
						jeu_adv[idxDispo]=carte_piochee;
					}else{
						jeu_me[idxDispo]=carte_piochee;
					}
				}else{
					jeu_me[0]="undefined";
				
					//changer etat carte
					carte.etat=ETAT_CIM;
					//ajouter carte au cimetière
					poserCarteDansCimetiere(carte_piochee,me);									
				}
				console.log("APS PIOCHE------------");
				afficherJeux();
			break;
		}
	});
	/* ------------------------------------------------
	  Retourne True si la carte est à l'ADV, sinon FALSE
	  ----------------------------------------------- */
	function etreCarteAdv(c){
		nom= c.nom;
		return (nom.charAt(0)=="M");
	}
	/* ---------------------------------------
	  Poser une carte dans le cimetière 
	  --------------------------------------- */
	function poserCarteDansCimetiere(carte,me){
		cim.push(carte);
		
		//1 créer DIV id="pioche"			
		strhmtl = buildDivCarte(carte,me,99);
		$(strhtml).appendTo("body");
		strhtml="";
		
		$("#"+carte.id_div).addClass("go2cim");
		
		//effacer
		$("#"+carte.id_div).hide(2000);
		$("#ctrCimetiere").html("( "+cim.length+" )");	

		console.log("au CIM: "+carte.id_div);		
	}
	/* ---------------------------------------
	  Poser une carte en jeu pour ME ou ADV
	 --------------------------------------- */
	function poserCarteEnJeu(carte, me,ctr){
		carte_piochee.etat=ETAT_JEU;
		strhtml=buildDivCarte(carte,me,ctr);
		$(strhtml).appendTo("body");
		strhtml="";
		majCompteursPaquet(ccMe,ccAdv);
		
		console.log("en JEU: "+carte.id_div);
	}
	/* ---------------------------------------
	  MENU1: A1,A2 ou S
	 --------------------------------------- */
	function appelerMenu1(id,no){
		action=prompt("A1,A2 pour attaquer | S pour sacrifier");
		noAtt= action.substring(1);
		console.log("-----------------------MEN1");
		console.log("EN ATT:"+noAtt);
		console.log("Carte no: "+(no-1));
		c = jeu_me[no-1];
		console.log("CARTE: "+c.id_div);
		
		switch(action){
			case "A1":
			case "A2":
				if (cim.length<c.cout){
					alert(">>pas assez de créatures ds le cimetière !!!");
				}else{
					//récupére no ATT
					noAtt= action.substring(1);
	
					//placer la carte en ATT
					if (att_me[noAtt-1]== 0){
						c.etat = (noAtt==1?ETAT_ATT1:ETAT_ATT2);
						att_me[noAtt-1] = c;
						placerCarteEnAttaque(id,noAtt);
						//retirer des cartes en jeu
						jeu_me[no-1]='undefined';
					}else{
						alert(">>Attaque déjà occupée !");
					}
				}
				console.log("APS ATT1 ou ATT2------------");
				afficherJeux();
			
				break;
			case "S":
				c.etat= ETAT_CIM;
				poserCarteDansCimetiere(c);
				//effacement carte
				$(id).hide(2000);
				
				jeu_me[no-1]="undefined";
				
				console.log("APS SACRICFICE------------");
				
				afficherJeux();
			
				
				break;
		}
	}
	/* --------------------------------------------
	Fonction chargée de trouver l'indice dispo
	dans le tableau des cartes en jeu (Me ou ADV)
	---------------------------------------------- */
	function trouverIndiceDispo(me){
		idx=-1;
		if(me){
			idx= trouverIndiceDispoMe();
		}else{
			idx= trouverIndiceDispoAdv
		}
		return idx;
	}
	
	function trouverIndiceDispoAdv(){
	    i=0;
		trouve = false;
		
		while(!trouve&& i<jeu_adv.length){
			if (jeu_adv[i]=='undefined'){
				trouve =true;
			}else{					
				//-- suivant
				i++
			}
		}
		if (!trouve){
			i=-1; 
		}
		return i;
	}
	function trouverIndiceDispoMe(){
	    i=0;
		trouve = false;
		while(!trouve && i<jeu_me.length){
			if (jeu_me[i]=='undefined'){
				trouve =true;
			}else{					
				//-- suivnat
				i++
			}
		}
		if (!trouve){
			i=-1; 
		}		
		return i;
	}
    /* --------------------------------------------------
	FOnction chargée de compter le nombre de carte en jeu
	non UNDEFINED et pas en attaque 
	--------------------------------------------------  */
	function compterCarteEnjeu(me){
		ctr=0;
		if (me){
			ctr = compterCarteEnJeuMe();
		}else{
			ctr = compterCarteAdv();
		}
		return ctr;
	}
	function compterCarteEnJeuMe(){
		ctr=-1;
		for(i=0;i<jeu_me.length;i++){
			card = jeu_me[i];
			if ((typeof card  != 'undefined') && (card.etat == 0)){
				ctr++;
			}
		}
		return ctr;
	}
	function compterCarteAdv(){
		ctr=-1;
		for(i=0;i<jeu_adv.length;i++){
			card = jeu_adv[i];
			if (typeof card  != 'undefined' && card.etat == 0){
				ctr++;
			}
		}
		return ctr;
	}

	/* ------------------------------------------------
	   fonction chargée de placer une carte en attaque:
	   en A1 ou A2
	--------------------------------------------------- */
	function placerCarteEnAttaque(idcarte,noatt){
		console.log(idcarte+" en ATT"+noatt);
		l= (noatt==1?"368px":"580px");
		
		$(idcarte).css("top","370px");
		$(idcarte).css("left",l);
		$(idcarte).addClass("attaque");
		console.log("en ATT"+noatt+": "+idcarte);
	}
	
	function afficherCarte(c){
		console.log(c);
	}
	/* ----------------------------------------------
	 Fonction chargée de créer une DIV pour la carte 
	 ----------------------------------------------- */
    function buildDivCarte(ca, me,idx){
		if (idx==99){
			strhtml="<div id='" +ca.id_div+"' ";
			if (me){
				strhtml+=" class='carteMe";
			}else{
				strhtml+=" class='carteAdv";			
			}
			strhtml+=" pioche' >";
		}else{
			no = idx+1;
			strhtml="<div id='";
			if (me){
				strhtml+="mcarte"+(no<10?"0":"")+no+"' ";
				strhtml+=" class='carteMe' >";
			}else{
				strhtml+="carte"+(no<10?"0":"")+no+"' ";
				strhtml+=" class='carteAdv'>";			
			}
		}
		strhtml+="<ul>"+ca.nom+"<span>( "+ca.cout+" )</span>";
		strhtml+="<li id='"+ca.id_li+"' >"+ca.carFont+"</li>";
		strhtml+="<li><span>"+ca.ATT+"</span>|<span>"+ca.DEF+"</span></li>";
		strhtml+="</ul>";
		strhtml+="</div>";
		return strhtml;
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
		accord= false;
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
	    
		for(n=0;n<50;n++){
			uneCarte="";
			if (n<nbc_me){
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
		uneCarte.etat =ETAT_CR;
		//MEP caractere
		uneCarte.carFont = (me?genereMonstreJoueur():genereMonstreAdverse());
		
        //transforme l'objet Carte en texte JSON
		 strCarte=JSON.stringify(uneCarte);
	    
		return strCarte;
	}
});