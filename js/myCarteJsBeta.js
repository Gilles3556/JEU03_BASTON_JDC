
function afficherMenuCarte(){
	console.log(">>fn afficherMenuCarte()");
}
$(document).ready(function(){
	console.log(">>jQuery OK");
	console.log(">>jQuery Génération paquet ADV");
	var MAX_CARTE=50;
	var MAX_JEU=4;
	var MAX_CARTE_DEBUT = 3;
	
	/* ETATS D'UNE CARTE */
	var ETAT_CR=-1;
	var ETAT_JEU=0;
	var ETAT_ATT1=1;
	var ETAT_ATT2=2;
	var ETAT_CIM=3;
	
	var noTour=0;
	var fin2tour=false;
	var nbc_paquet_me = 0;
	var nbc_paquet_adv = 0;
	var pv_adv=20;
	var pv_me=20;
	var jeu="debut";
	
		
	paquetCR = creerPaquet();
	paquet2={"cartes":[]};
	
	//recharger PAQUET2 : wgy???
	for(c=0;c<paquetCR.length;c++){
		paquet2.cartes.push(paquetCR[c]);
	}
	console.log("JEU_0: création du paquet OK");
	var jeu_me  = [4];
	var att_me = new Array(0,0);

	
	var jeu_adv = [4];
	var att_adv=new Array(0,0);
	var cim=[];
	
    cc_jeuMe=0;
	cc_jeuAdv=0;
	
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
				if (cc_jeuAdv<MAX_CARTE_DEBUT){ // n'avoir que 4 cartes au MAX
					jeu_adv[cc_jeuAdv]=carte1;
					strhtml=buildDivCarte(carte1,false,cc_jeuAdv);
					cc_jeuAdv++;
					nbc_paquet_adv--;
				}
			}else{
                if (cc_jeuMe<MAX_CARTE_DEBUT){ // n'avoir que 4 cartes au MAX
					jeu_me[cc_jeuMe]=carte1;
					strhtml=buildDivCarte(carte1,true,cc_jeuMe);
					cc_jeuMe++;
					nbc_paquet_me--;
				}
			}
			
			carte1.etat=0;
					
			//MAJ HTML
			$(strhtml).appendTo("body");
			strhtml="";
			
			fini=(cc_jeuMe==MAX_CARTE_DEBUT) && (cc_jeuAdv==MAX_CARTE_DEBUT);
			
		}
		console.log("JEU_1: MEP des cartes en jeu adv+me OK");
		
		majCompteursPaquet();
		$("#tour2jeu").html("<h1>"+noTour+"</h1>");
		
		// fin2tour = choix ME
		fin2tour= (noTour==MAX_CARTE_DEBUT);
	}
	//LOG
	afficherJeux();
	// -------------------------------
	//MEP des menus sur EVT:CLICK
	// -------------------------------
	//MEP menu sur cartes
	$(document).on('click', '#mcarte01', function(e) { 	appelerMenu_carte("#mcarte01",0); });
	$(document).on('click', '#mcarte02', function(e) { 	appelerMenu_carte("#mcarte02",1); });
	$(document).on('click', '#mcarte03', function(e) { 	appelerMenu_carte("#mcarte03",2); });
	$(document).on('click', '#mcarte04', function(e) { 	appelerMenu_carte("#mcarte04",3); });
	//MEP menu sur cimtière
	$(document).on('click', '#mCimetiere', function(e) {appelerMenu_cimetiere(); });
	//MEP menu sur paquet
	$(document).on('click', '#mpaquet', function(e) {appelerMenu_paquet(); });

 	/* ---------------------------------------
	  Les menus des cartes
	 --------------------------------------- */
	function appelerMenu_carte(id,no){
		c = jeu_me[no];
		if (c.etat == ETAT_JEU){
			menu1_carte(id,no);
		}else{
			menu2_carte(id);
		}
	}
	/* ---------------------------------------
	  MENU1 (carte): A1,A2 ou S
	 --------------------------------------- */
	function menu1_carte(id,no){
		
		action=prompt("A1,A2 pour attaquer | S pour sacrifier");
		if (action!=null){
			c = jeu_me[no];
			noAtt= action.substring(1);
					
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
							console.log("JEU_MENU1: créature en attaque"+noAtt+" =>"+c.nom);
							c.etat = (noAtt==1?ETAT_ATT1:ETAT_ATT2);
							att_me[noAtt-1] = c;
							placerCarteEnAttaque(id,noAtt);
							//retirer des cartes en jeu
							jeu_me[no]='undefined';
						}else{
							alert(">>Attaque déjà occupée !");
						}
					}
					break;
				case "S":
				    console.log("JEU_MENU1: créature sacrifiée =>"+c.nom);
					c.etat= ETAT_CIM;
					poserCarteDansCimetiere(c);
					//effacement carte
					$(id).hide(2000);
					
					//suppimer du tableau
					jeu_me[no]="undefined";
					
					//afficherJeux();
					break;
			}
		}
	}
	/* -------------------------------------------
	  MENU2 (carte): cibler Carte ou Adversaire ?
	  --------------------------------------- */
	function  menu2_carte(id){
		attaquante=rechercherCarteDsAtt(id.substring(1));
				
		saisie= prompt("CA cibler adversaire | C1 cibler ADV.att1 |C2 cibler ADV.att2 | CC: cibler autres cartes ?");
		if (saisie!=null){
			saisie = saisie.toUpperCase();
			switch (saisie){
				case "CA":
					console.log("JEU_MENU2_carte: attaque de l'ADV ok");
									
					//infliger les dégats à l'adversaire			
					pv_adv = pv_adv-attaquante.ATT;
					
					$("#vieadv").html(pv_adv);	//chnager couleur en fonction état J,orange,rouge ???
					if(pv_adv==0){
						alert("BRAVO, vous avez gagné !!!");
					}
				break;
				case "C1":
				case "C2":
					// @totest ----------------------------------------------------
					noCible=parseInt(saisie.substring(1));
					cible = att_adv[noCible-1];
					if (cible!=="undefined"){
						console.log("JEU_MENU2_carte: attaque de l'ATT ADV ok");
					
						cible.DEF = cible.DEF-attaquante.ATT;
						//SI def<0 => cimetiere
						if (cible.DEF<=0){
							//Placer la crétaure au cimetière
							cible.etat= ETAT_CIM;
							cible.def= cible.sauvdef;
							poserCarteDansCimetiere(cible);
							
							//effacement carte
							$("#"+cible.id).hide(2000);
							
							//suppimer du tableau
							att_adv[nocible-1]="undefined";
						}else{
							seldef="#"+cible.id+" #def";
							$(seldef).html(cible.DEF);
						}
					}
				break;
				case "CC":
					//Faire saisir le no carte ciblée
					noc= parseInt(prompt("Carte no: 1 |2 |3 | 4 ||0 pour sortir ?"));
					if (noc>0){
						
						cible= jeu_adv[noc-1];
						
						//afficherDetailsCarte(cible);
						
						if (cible!=="undefined"){
							console.log("JEU_MENU2_carte: attaque carte["+noc+"] =>"+cible.nom);
											
							cible.DEF-=attaquante.ATT;
							
							if (cible.DEF<=0){  //ATTENTION: du coup DEF=0 ds cimetière ???
								console.log("JEU_MENU2_carte: carte attaquée "+cible.nom+" placée au CIM ");
					
								//Placer la créature au cimetière
								cible.etat= ETAT_CIM;
								
								cible.DEF=cible.sauvdef;
								
								poserCarteDansCimetiere(cible);
								
								//effacement carte
								$("#"+cible.id).hide(2000);
								
								//suppimer du tableau
								jeu_adv[noc-1]="undefined";
							}else{
								console.log("JEU_MENU2_carte: carte attaquée, maj des dégâts ok");
					
								//MAJ des cartes en jeu(DEF affichée)
								seldef="#"+cible.id+" #def";
								$(seldef).html(cible.DEF);
							}
						}
					}
				break;
			}
		}
	}
	/* ------------------------------------------------
	  MENU3 (cimetière): pour Voir contenu/ ou Piocher 1ere carte
	  ------------------------------------------------ */
	function appelerMenu_cimetiere(){
	//$("#mCimetiere").click(function(){
		choix=prompt("V voir contenu | Pioche 1ere carte");
		if(choix!=null){
			choix= choix.toUpperCase();
			switch(choix){
			case "V":
				str="Nb carte ds cimetière:"+cim.length;
				for(c=0;c<cim.length;c++){
					aCard = cim[c];
					str+="\n - "+aCard.nom+ " ("+aCard.cout+") [ "+aCard.ATT+"/"+aCard.DEF+" ]";
				}
				alert(str);
			break;
			case "P":
				// reprendre la 1er carte du CIMETIERE ds son jeu
				if( compterCarteEnjeu(true)== MAX_JEU){
					alert("vous ne pouvez pas piocher, votre jeu est complet !!!");
				}else{
					
					cart=cim.shift();
					console.log("JEU_MENU_cimetiere: carte piochée "+cart.nom+" placée en jeu ME");
					
					idxDispo = trouverIndiceDispo(true);
					
					poserCarteEnJeu(cart,true,idxDispo);
					cc_jeuMe++;
					
					jeu_me[idxDispo]=cart;
					
				}
			}
		}
	}
	/* ------------------------------------
	  MENU2: pour Piocher ou Fin de tour
	  ---------------------------------- */
	function appelerMenu_paquet(){
		action=prompt("F fin de tour | P piocher une carte");
		action=action.toUpperCase();
		if (action != null){
			switch(action){
				case "F":
					fin2tour= true;
					alert("---au suivant !!!");
				break;
				case "P":
										
					//piocher une carte la première
					pioche = paquet2.cartes.shift();
					carte_piochee=JSON.parse(pioche);
				    
					//Si carte adv => en jeu pour ADV
					//		SSI nb carteADV en jeu <4
					me = !(etreCarteAdv(carte_piochee));
					
					if (!me){
						alert("Pioche = carte de votre adversaire !!!");
					}
					cimetiere = (compterCarteEnjeu(me)>=4);
					
					idxDispo = trouverIndiceDispo(me);
					
					
					if (!cimetiere && idxDispo!=-1){						
						ctrCarte=(me?cc_jeuMe:cc_jeuAdv);
						console.log("JEU_MENU_paquet: carte piochée "+carte_piochee.nom+" mise en jeu pour "+(me?"me":"adv")+ "en "+idxDispo);
						
						//créer une carte pour ADV et afficher
						poserCarteEnJeu(carte_piochee,me,idxDispo);
						
						if (!me){
							jeu_adv[idxDispo]=carte_piochee;
						}else{
							jeu_me[idxDispo]=carte_piochee;
						}						
					}else{
						console.log("JEU_MENU_paquet: carte piochée au CIM");
						
						if (me){
							nbc_paquet_me--;
						}else{
							nbc_paquet_adv--;
						}
						//changer etat carte
						carte_piochee.etat=ETAT_CIM;
						//ajouter carte au cimetière
						poserCarteDansCimetiere(carte_piochee);	
						
						majCompteursPaquet();
						alert(carte_piochee.nom+" placée ds cimetière !");
					}
					break;
			}
		}
	}

    function rechercherCarteDsAtt(id){
		if (att_me[0].id == id){
			carte = att_me[0];
		}else{
			carte = att_me[1];
		}
		return carte;
	}
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
	function poserCarteDansCimetiere(carte){
		cim.unshift(carte);
		$("#ctrCimetiere").html("( "+cim.length+" )");
	}
	function buildIDfromIdx(me,idx){
		strDiv="#"+(me?"mymonster":"monster");
		strDiv+=(idx<10?"0":"")+idx;
		return strDiv;
	}
	/* ---------------------------------------
	  Poser une carte en jeu pour ME ou ADV
	 --------------------------------------- */
	function poserCarteEnJeu(carte, me,ctr){
		carte.etat=ETAT_JEU;
		strhtml=buildDivCarte(carte,me,ctr);
		$(strhtml).appendTo("body");
		strhtml="";
		majCompteursPaquet();
		
	}
	/* --------------------------------------------
	Fonction chargée de trouver l'indice dispo
	dans le tableau des cartes en jeu (Me ou ADV)
	---------------------------------------------- */
	function trouverIndiceDispo(me){
		idx=-1;
		if(me){
			idx=trouverIndiceDispoMe();
		}else{
			idx=trouverIndiceDispoAdv();
		}
		return idx;
	}
	
	function trouverIndiceDispoAdv(){
		if (document.getElementById("carte01")==null){  //la carte n'existe pas 
			return 0;
		}
		if (document.getElementById("carte02")==null){  //la carte n'existe pas 
			return 1;
		}
		if (document.getElementById("carte03")==null){  //la carte n'existe pas 
			return 2;
		}
		if (document.getElementById("carte04")==null){  //la carte n'existe pas 
			return 3;
		}
		return -1;		
	}
	function trouverIndiceDispoMe(){
		if (document.getElementById("mcarte01")==null){  //la carte n'existe pas 
			return 0;
		}
		if (document.getElementById("mcarte02")==null){  //la carte n'existe pas 
			return 1;
		}
		if (document.getElementById("mcarte03")==null){  //la carte n'existe pas 
			return 2;
		}
		if (document.getElementById("mcarte04")==null){  //la carte n'existe pas 
			return 3;
		}
		return -1;
	}
    /* OK--------------------------------------------------
	Fonction chargée de compter le nombre de carte en jeu
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

	/* OK------------------------------------------------
	   fonction chargée de placer une carte en attaque:
	   en A1 ou A2
	--------------------------------------------------- */
	function placerCarteEnAttaque(idcarte,noatt){
		l= (noatt==1?"368px":"580px");
		
		$(idcarte).css("top","370px");
		$(idcarte).css("left",l);
		$(idcarte).addClass("attaque");
	}
	
	/* OK------------------------------------------------
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
		nbc_paquet_me= Math.trunc((MAX_CARTE*pourcent)/100);
		nbc_paquet_adv= MAX_CARTE-nbc_paquet_me;
		console.log("nbc_paquet_me="+nbc_paquet_me+" | nbc_paquet_adv:"+nbc_paquet_adv);		
	    
		for(n=0;n<50;n++){
			uneCarte="";
			if (n<nbc_paquet_me){
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
		majCompteursPaquet();
	
		return paquetNew;
	}
	/*OK fonction de mélange d'un tableau
		sce:https://www.hakharien.fr/article-array-shuffle-js
	*/
	function melanger(unPaquet){
		return unPaquet.sort(function() { return Math.random() - .5 });
	}
	/* -----------------------------------------
	 OK Fonction chargée de maj les compteurs sur PAQUET
	 ------------------------------------------*/
	function majCompteursPaquet(){
		$("#ctrPaquet").html("["+nbc_paquet_me+" / "+nbc_paquet_adv+"]");
	}
	/* ----------------------------------------------
	 Fonction chargée de créer une DIV pour la carte 
	 ----------------------------------------------- */
    function buildDivCarte(ca, me,idx){
		if (idx==98 || idx==99){
			ca.id = (idx==99?"pioche":"cim")+idx;
			strhtml="<div id='"+ca.id+"'";
		    strhtml+=" class='carte"+(me?"Me":"Adv")+(idx==99?" pioche' >":" precim' >");	
		}else{
			no = idx+1;
			strhtml="<div id='";
			if (me){
				ca.id = "mcarte"+(no<10?"0":"")+no;
				strhtml+=ca.id+"' ";
				strhtml+=" class='carteMe' >";
			}else{
				ca.id = "carte"+(no<10?"0":"")+no;
				strhtml+=ca.id+"' ";
				strhtml+=" class='carteAdv'>";			
			}
		}
		strhtml+="<ul>"+ca.nom+"<span>( "+ca.cout+" )</span>";

		strhtml+="<li id='"+(me?"mymonster":"monster")+"' >"+ca.carFont+"</li>";

		strhtml+="<li><span>"+ca.ATT+"</span>|<span id='def'>"+ca.DEF+"</span></li>";
		strhtml+="</ul>";
		strhtml+="</div>";
		return strhtml;
	}

	/* -----------------------------------------
	OK Fonction chargée de créer un objet CARTE
	 ------------------------------------------*/
	function creerUnecarte(me,nb){
		modele_carte='{"nom":"???" ,"id":"", "cout":0 ,"ATT":0 ,"DEF":0 ,"sauvdef":0, "etat": 0,"carFont":""}';
	    
		uneCarte = JSON.parse(modele_carte);
		//MEP
		uneCarte.nom="M";
		if (me){
			uneCarte.nom ="my"+uneCarte.nom;
		}
		uneCarte.nom+=nb;
		
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
		uneCarte.sauvdef=uneCarte.DEF; //MEP sauvegarde de la DEF
		uneCarte.etat =ETAT_CR;

		//MEP caractere
		uneCarte.carFont = (me?genereMonstreJoueur():genereMonstreAdverse());
		
        //transforme l'objet Carte en texte JSON
		strCarte=JSON.stringify(uneCarte);
	    
		return strCarte;
	}
	function afficherDetailsCarte(uneCarte){
		strcarte="CARTE:"+uneCarte.nom+" | ID="+uneCarte.id+ "| (cout="+uneCarte.cout+")";
		strcarte+="\n ATT="+uneCarte.ATT+ "/ DEF="+uneCarte.DEF;
		strcarte+="\n sauvDef="+uneCarte.sauvdef;
		strcarte+="\n ETAT="+uneCarte.etat;
		
		console.log(strcarte);
		
	}
	// OK-----------------------------------------------
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
	// OK-----------------------------------------------
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
			str+= "| N="+c.nom+"("+c.etat+")";
		}
		console.log(str);
		
	}
	/* @TOTEST ---------------------------------
	 Récupérer les messages de la console
	 ---------------------------------------- */
		
	/*var logBak = console.log;
	var logMessages = [];
	 
	console.log = function(value) {
		logMessages.push(value);
		logBak.call(console, value);
	};
	
	console.log(logMessages.length);*/

});