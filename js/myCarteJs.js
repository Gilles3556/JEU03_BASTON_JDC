
function afficherMenuCarte(){
	my_logger(">>fn afficherMenuCarte()");
}
/* ---------------------------------------------------------------------
 HEARSTONE like: MES REGLES DE JEU
 -----------------------------------------------------------------------
  Jeu de carte  de combat entre Me et un Adversaire.
 Le paquet contient toutes les cartes; vous acceptez le % de carte.
 Un seul cimétière pour les eux j oueurs.
 
 Actions possibles:
 -----------------------
sur paquet:
 -PIOCHER une carte (/!\ si ADV ira dans le camp ADV)
 -FIN de tour( c'est l'autre qui joue)
 
 sur carte:
 - SACRIFIER=> la carte est placée dans le cimetière
 - PLACER  en attaque ATT1 ou ATT2 
    SSI le nombre de carte ds le cimetière>= cout invocation une carte
	
 - en ATT(le tour d'après): CIBLER ADVERSAIRE
		   CIBLER ADV.ATT1 ou ADV.ATT2
		   CIBLER une des cartes de l'ADV
 sur cimetière:
  -PIOCHER une carte (/!\ si ADV ira dans le camp ADV)
  -VOIR les cartes placées ds cimetière
		   
1 tour de jeu:
--------------
a-1 Pioche / 1 SACRIFICE  / 1ATT1 ou ATT2
b-1 ATT / carte

 */
$(document).ready(function(){
	my_logger(">>jQuery OK");
	my_logger(">>jQuery Génération paquet ADV");
	var MAX_CARTE=50;
	var MAX_JEU=4;
	var MAX_CARTE_DEBUT = 3;
	
	/* ETATS D'UNE CARTE */
	var ETAT_CR=-1;
	var ETAT_JEU=0;
	var ETAT_INV_ATT1=1;
	var ETAT_INV_ATT2=2;
	
	var ETAT_CIM=3;
	
	var ETAT_ATT1=10;
	var ETAT_ATT2=20;
	
	var PROMPT_IA=">>IA.adv:";
	var PROMPT_ME=">>me:";

	
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
	my_logger("JEU_0: création du paquet OK");
	var jeu_me  = [4];
	var jeu_adv = [4];

	var cim=[];
	
    cc_jeuMe=0;
	cc_jeuAdv=0;
	/* ----------------------------
	   initialisation du jeu 
	-------------------------------*/
	fini=false;
	// -1)-- tirer4 cartes
	while(!fini){
		strhtml="";
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
				
		//MAJ HTML
		html_ajouterCarte(strhtml);
		
		fini=(cc_jeuMe==MAX_CARTE_DEBUT) && (cc_jeuAdv==MAX_CARTE_DEBUT);
	}
	my_logger("JEU_1: MEP des cartes en jeu adv+me OK");
	
	majCompteursPaquet();
	$("#tour2jeu").html("<h1>"+noTour+"</h1>");
	
	my_logger("JEU_2: Init des cartes en ATT adv+me OK");
	var att_me = [0,0];
	var att_adv = [0,0];
	//LOG
	//afficherJeux();
	// -------------------------------
	//MEP des menus sur EVT:CLICK
	// -------------------------------
	//MEP menu sur cartes en jeu
	$(document).on('click', '#mcarte01', function(e) { 	menu1_carte("#mcarte01",0); });
	$(document).on('click', '#mcarte02', function(e) { 	menu1_carte("#mcarte02",1); });
	$(document).on('click', '#mcarte03', function(e) { 	menu1_carte("#mcarte03",2); });
	$(document).on('click', '#mcarte04', function(e) { 	menu1_carte("#mcarte04",3); });
	
	//MEP menu sur cartes en ATTAQUUE
	$(document).on('click', '#meAtt1', function(e) { menu2_carte("#meAtt1"); });
	$(document).on('click', '#meAtt2', function(e) { menu2_carte("#meAtt2"); });
	
	//MEP menu sur cimtière
	$(document).on('click', '#mCimetiere', function(e) {menu_cimetiere(); });
	//MEP menu sur paquet
	$(document).on('click', '#mpaquet', function(e) {menu_paquet(); });
    
	/* --------------------------------------
		Une partie
	  --------------------------------------- */
 	/* BCLE DE JEU//////////////////////////////////
	-0)QUI COMMENCE => J_IA / J_ME
	
	-1)chaque JOUEUR:
    S..  1 SACRIFICE 
	P..  1 pioche 
	A..  1 Mise en ATT1 ou ATT2 (MAL invocation= ne peut attaquer de suite)
	 ou
	CA. 1 attaque par créature en ATT1 ou ATT2: CA, C1/C2, CC1,2,3,4
	C1./C2.
	CC1,CC2,CC3,CC4
		
	-2)fin de partie:
		SI PV=0 
	////////////////////////////////////////////// */
	var finJeu=false;
	var IA_stategie_basic=true;
	IA_jouer(IA_stategie_basic);
	
	/* --------------------------
	   IA joue
	   ------------------------- */
	 function IA_jouer(basic){
		noTour++;
			
		IA_sacrifier();
		// TSJ pioche dans paquet??
		nb=Math.trunc(Math.random()*6);
		my_logger(PROMPT_IA+" nb="+nb);
		if (nb==3 || nb== 5){
			jeu_piocherDsCimetiere(false);
		}else{
			jeu_piocherDsPaquet(false);		
		}
		IA_placerEnAttaque();
		IA_attaquer(basic);
	 }
	
	 /* -----fonctions IA------------------------------------------ */
	 /*
	 function majPhase(me, msg){
		 $("#phase").html(noTour+"_"+(me?PROMPT_ME:PROMPT_IA)+": joue");
		 my_logger("\n"+noTour+"_"+(me?PROMPT_ME:PROMPT_IA)+": joue");

	 }*/
	 /* --function IA : attaquer CA,c1/C2 ou CC1,2,3,4 */
	 function IA_attaquer(basic){
		my_logger(PROMPT_IA+" décide d'attaquer:"+att_adv[0].nom+" | "+att_adv[1].nom);
		//Si carte en ADV.ATT1 ou ADV.ATT2
		//choisir ADV.ATT1 ou ADV.ATT2s
		attaquant=null;
		if (att_adv[0]!="undefined" ){
			attaquant= att_adv[0];
		}else{
			if (att_adv[1]!="undefined" ){
				attaquant= att_adv[1];
			}
		}
		//ATTAQUE POSSIBLE ?
		if(attaquant==null && attaquant==="undefined"){
			my_logger(PROMPT_IA+" Pas de créature en attaque, impossible d'attaquer");
			return;
		}
		if (attaquant.etat == ETAT_CIM ){
				my_logger(PROMPT_IA+" PBM, la créature attaquante est au cimetière");
				return;
		}
		if(attaquant!=null && (attaquant.etat == ETAT_ATT1 || attaquant.etat == ETAT_ATT2)){
			IA_stategie(basic,attaquant); //@TODO: Prévoir un choix de l'IA à affronter (Basic ou Évoluée)!!!
		}else{
			if (attaquant==null){
				my_logger(PROMPT_IA+" Aucune créature en attaque, impossible d'attaquer");				
			}else{
				my_logger(PROMPT_IA+" Créature en attaque juste invoquée, impossible d'attaquer");
			}
		}
	 }
	 /* -------------------------------------------------------
		Fonction qui met en place la statégie de l'IA:
		a)BASIC:                0-10 11      12
		 -choisir type attaque: CA, C1/C2 ou c1,2,3,4
		b)EVOLUEE:
		-cibler ??? toujours CA en premier
		à defaut C1,C2
		à défaut CC1,2,3,4,5
	----------------------------------------------------------- */
	 function IA_stategie(basic,c_advatt){
	 	if (basic){
			type_att= Math.trunc(Math.random()*12)+1;
			switch(type_att){
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
			case 10:
			
				jeu_attaquerCA(false,c_advatt);
				jeu_isFinJeu();
				break;
			case 11:
				noCible=-1;
				//si CR ATT1
				if (att_me[0]!="undefined"){
					noCible = 1;
				}else{
					if (att_me[1]!="undefined"){
						noCible=2;
					}	
				}
				if (noCible>-1){
					jeu_attaquerC(false,noCible,c_advatt);
				}else{
					my_logger(PROMPT_IA+" ATT1+ATT2 adverses sont vides, attaque annulée");
				}
				break;
			case 12:
				noCible=-1;
				if(jeu_me[0]!="undefined"){
					noCible=1;
				}else{
					if(jeu_me[1]!="undefined"){
						noCible=2;
					}else{
						if(jeu_me[2]!="undefined"){
							noCible=3;
						}else{
							if(jeu_me[3]!="undefined"){
								noCible=4;
							}	
						}	
					}
				}
				if(noCible>-1){
					jeu_attaquerCC(false, noCible,c_advatt);
				}else{
					my_logger(PROMPT_IA+" CC1+CC2+CC3+CC4 adverses sont vides, attaque annulée");
				}
				break;
			}
		}
	 }
	 /* --function IA : placer une carte en ATT1 ou 2 --*/
	 function IA_placerEnAttaque(){
		 // Chercher si une carte peut être invoquée (cout<= cim.length)
		 idx = rechercherCarteInvocable();
		 if (idx>-1){
			// si oui , placer an ATT_ADV1 ou ATT_ADV2
		 	cartePlacable = jeu_adv[idx];
						
			//choisir ATT_ADV1 ou ATT_ADV2
			noAtt=-1;
			if (att_adv[0]==0){
				noAtt=1;
			}
			if (noAtt==-1 && att_adv[1]==0){
				noAtt=2;
			}
			if (noAtt!=-1){
				my_logger(PROMPT_IA+" id:"+cartePlacable.id+"/"+cartePlacable.nom+" en attaque NO:"+noAtt);
				jeu_placerEnAttaque(false, idx,cartePlacable,noAtt);
				
				//afficherJeux();
			}else{
				my_logger(PROMPT_IA+" attaque en "+noAtt+" IMPOSSIBLE ");
			}
		 }
	 }
	 function rechercherCarteInvocable(){
		idx=-1;
		max= cim.length;
		for(c=0;c<jeu_adv.length;c++){
			 uneC=jeu_adv[c];
			 if (uneC.cout>=max){
				 idx=c;
				 c=99;
			 }
		}
	    return idx;
	 }
	 /* --function IA : sacrifier une carte --*/
	 function IA_sacrifier(){
		 // IA sacrifie la carte de plus haut cout d'invocation
		 //SSI aucune carte vide
		 
		 no=rechercherIdxCarteAdvCoutMax()
		 if (no>=0){
			laCarte = jeu_adv[no];
		 	sacrifierUneCarte(no,laCarte,false,true);
		}
	 }
	 
	 function rechercherIdxCarteAdvCoutMax(){
		max=0;
		idxCarte=-1;
		for(c=0;c<jeu_adv.length;c++){
		 uneC=jeu_adv[c];
		 if (uneC.cout>=max){
			 idxCarte=c;
			 max =uneC.cout; 
		 }
		}
		return idxCarte;
	 }

	/* ---------------------------------------
	  MENU1 (carte): A1,A2 ou S
	 --------------------------------------- */
	function menu1_carte(id,no){
		c = jeu_me[no];
		if (c.etat == ETAT_JEU){
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
							my_logger("Je place carte:"+ c.nom+ " en " +action);
							//récupére no ATT
							noAtt= action.substring(1);
							//placer la carte en ATT
							my_logger("contenu:"+att_me[noAtt-1]);
							if (att_me[noAtt-1]== 0){
								jeu_effacerCarte(c);
								jeu_placerEnAttaque(true, no,c,noAtt);
							}else{
								alert(">>Attaque déjà occupée !");
							}
						}
						break;
					case "S":
						my_logger("Je sacrifie la carte=>"+c.nom);
						sacrifierUneCarte(no,c,true,true);
						
						break;
				}
			}
		}
	}
	/* -------------------------------------------
	  MENU2 (carte): cibler Carte ou Adversaire ?
	  --------------------------------------- */
	function  menu2_carte(id){
		attaquante=rechercherCarteDsAtt(id.substring(1));
		if(attaquante.etat != ETAT_ATT1 && attaquante.etat != ETAT_ATT2){
			alert("Vous venez d'invoquer la carte, elle ne peut PAS attaquer déjà !");
		}else {		
			saisie= prompt("CA cibler adversaire | C1 cibler ADV.att1 |C2 cibler ADV.att2 | CC: cibler autres cartes ?");
			if (saisie!=null){
				saisie = saisie.toUpperCase();
				switch (saisie){
					case "CA":	
					    my_logger("J'attaque "+saisie);
						jeu_attaquerCA(true,attaquante);
						jeu_isFinJeu();
					break;
					case "C1":
					case "C2":
					    my_logger("J'attaque "+saisie);
					
						noCible=parseInt(saisie.substring(1));
						jeu_attaquerC(true,noCible,attaquante);
					break;
					case "CC":
						//Faire saisir le no carte ciblée
						noc= parseInt(prompt("Carte no: 1 |2 |3 | 4 ||0 pour sortir ?"));
						if (noc>0){		
							my_logger("J'attaque "+saisie+noc);
							cible= jeu_adv[noc-1];
							
							jeu_attaquerCC(true,noc,cible,attaquante);
						}
					break;
				}
			}
		}
	}
	/* ------------------------------------------------
	  MENU3 (cimetière): pour Voir contenu/ ou Piocher 1ere carte
	  ------------------------------------------------ */
	function menu_cimetiere(){
		choix=prompt("V voir contenu | Pioche 1ere carte");
		if(choix!=null){
			choix= choix.toUpperCase();
			switch(choix){
			case "V":
				str="Nb carte ds cimetière:"+cim.length;
				for(c=0;c<cim.length;c++){
					cim[c].DEF=cim[c].sauvdef;
					aCard = cim[c];
					str+="\n - "+aCard.nom+ " ("+aCard.cout+") [ "+aCard.ATT+"/"+aCard.DEF+" ] en état="+aCard.etat;
				}
				alert(str);
			break;
			case "P":
				jeu_piocherDsCimetiere(true);
			}
		}
	}
	/* ------------------------------------
	  MENU2: pour Piocher ou Fin de tour
	  ---------------------------------- */
	function menu_paquet(){
		action=prompt("F fin de tour | P piocher une carte");
		action=action.toUpperCase();
		if (action != null){
			switch(action){
				case "F":
					if (att_me.length>0){
						//MAJ des cartes en INV_ATT1,2
						majCartesEnAttaque();
					}
					if (pv_adv==0 || pv_me==0){
						if (pv_adv==0){
							alert("Vous avez gagné !!!");
						}else{
							alert("Vous avez perdu !!!");
						}
						/////////////////////////////////Gérer la fin de partie ICI
					} else {
						IA_jouer(IA_stategie_basic);
					}
				break;
				case "P":
					jeu_piocherDsPaquet(true);							
				break;
			}
		}
	}
    /* ------------------------------------------------------------
	   Fonction chargée de changer le statut des cartes en attaque:
	   de ETAT_INV_ATT(invoquée)  elles passent en ETAT_ATT1
    ---------------------------------------------------------------*/	   
	function majCartesEnAttaque(){
		my_logger("fn majCartesEnAttque()");
		for(idx=0;idx<2;idx++){
			 if (att_me[idx]!=='undefined'){
				if (att_me[idx].etat == ETAT_INV_ATT1){
					att_me[idx].etat = ETAT_ATT1;
				}else{
					if (att_me[idx].etat = ETAT_INV_ATT2){
						att_me[idx].etat = ETAT_ATT2;		
					}	
				}
				afficherAttaque(true);
			}
			if (att_adv[idx]!=='undefined'){
				if (att_adv[idx].etat == ETAT_INV_ATT1){
					att_adv[idx].etat = ETAT_ATT1;
				}else{
					if (att_adv[idx].etat = ETAT_INV_ATT2){
						att_adv[idx].etat = ETAT_ATT2;		
					}	
				}
				afficherAttaque(false);
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
		carte.etat= ETAT_CIM;
		cim.unshift(carte);
		$("#ctrCimetiere").html("( "+cim.length+" )");
		jeu_effacerCarte(carte);
				
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
		strhtml="";
		carte.etat=ETAT_JEU;
		strhtml=buildDivCarte(carte,me,ctr);
		html_ajouterCarte(strhtml);
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
	function isCarteExiste(me,no){
		//my_logger("carte0"+no)
		c =document.getElementById("carte0"+no);
		my_logger((c==null?"NULL":c.id));
		if (me){
		//	my_logger(" nom="+jeu_me[no-1].nom);
			my_logger(" INDEFINED: "+(jeu_me[no-1] === 'undefined'));
		}else{
		//	my_logger(" nom="+jeu_adv[no-1].nom);
			my_logger(" INDEFINED: "+(jeu_adv[no-1] === 'undefined'));
		}
	}
	function trouverIndiceDispoAdv(){
	    //isCarteExiste(false,1);
		if (document.getElementById("carte01")==null || jeu_adv[0] === 'undefined'){  //la carte n'existe pas 
			return 0;
		}
		
		//isCarteExiste(false,2);
		if (document.getElementById("carte02")==null|| jeu_adv[1] === 'undefined'){  //la carte n'existe pas 
			return 1;
		}
		
		//isCarteExiste(false,3);
		if (document.getElementById("carte03")==null || jeu_adv[2] === 'undefined'){ //la carte n'existe pas 
			return 2;
		}
		
		//isCarteExiste(false,4);
		if (document.getElementById("carte04")==null || jeu_adv[3] === 'undefined'){  //la carte n'existe pas 
			return 3;
		}
		return -1;		
	}
	function trouverIndiceDispoMe(){
		//isCarteExiste(true,1);
		if (document.getElementById("mcarte01")==null || jeu_me[0] === 'undefined'){  //la carte n'existe pas 
			return 0;
		}
		
		//isCarteExiste(true,2);
		if (document.getElementById("mcarte02")==null || jeu_me[1] === 'undefined'){  //la carte n'existe pas 
			return 1;
		}
		
		//isCarteExiste(true,3);
		if (document.getElementById("mcarte03")==null || jeu_me[2] === 'undefined'){  //la carte n'existe pas 
			return 2;
		}
		//isCarteExiste(true,4);
		if (document.getElementById("mcarte04")==null || jeu_me[3] === 'undefined'){  //la carte n'existe pas 
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
    //------------------FONCTIONS HTML ---------------------
	
	/* --ajouter dans la page HTML --*/
	function html_ajouterCarte(strhtml){
		//console.log("strhtml="+strhtml);
		$(strhtml).appendTo("body");
		strhtml="";
	}
	/* OK------------------------------------------------
	   fonction chargée de placer une carte en attaque:
	   en A1 ou A2
	--------------------------------------------------- */
	function placerCarteEnAttaque(me,carte,noatt){
		strhtml="";
		my_logger("placerCarteenAttque()=>"+carte.id+" en ATT:"+noatt);
		strhtml=buildDivAttCarte(carte, me,noAtt);
		
		html_ajouterCarte(strhtml);
		
		if(me){
			l= (noatt==1?"368px":"580px");
			
			$("#"+carte.id).css("top","370px");
			$("#"+carte.id).css("left",l);
			$("#"+carte.id).addClass("attaque");
		}else {
			l= (noatt==1?"368px":"580px");
			
			$("#"+carte.id).css("top","207px");
			$("#"+carte.id).css("left",l);
			$("#"+carte.id).addClass("attaque");
		}
		
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
    /* ----------------------------------
	 Créer une DIV en ATT pour Me ou ADV
	-----------------------------------*/		
	function buildDivAttCarte(ca, me,noAtt){
		//no = idx+1;
		strhtml="<div id='";
		if (me){
			// creer DIV meATT1 ou meATT2
			ca.id = "meAtt"+noAtt;
			strhtml+=ca.id+"' ";
			strhtml+=" class='carteMe' >";
		}else{
			// creer DIV advATT1 ou advATT2
			ca.id = "advAtt"+noAtt;
			strhtml+=ca.id+"' ";
			strhtml+=" class='carteAdv'>";			
		}
		strhtml+="<ul>"+ca.nom+"<span>( "+ca.cout+" )</span>";

		strhtml+="<li id='"+(me?"mymonster":"monster")+"' >"+ca.carFont+"</li>";

		strhtml+="<li><span>"+ca.ATT+"</span>|<span id='def'>"+ca.DEF+"</span></li>";
		strhtml+="</ul>";
		strhtml+="</div>";
		return strhtml;
	}

	
	//------------------FONCTIONS DU JEU----------------------
	
	/* -----------------------------------------------------------
	    Attaquer une cible (carte) qqsoit( CA ou CC ou C1,2,3,4)
	    ----------------------------------------------------------*/	
	function jeu_attaquerCible(me,cc,nocible,cible,cattaquante){
		if (cible!=null && cible!=="undefined"){
			my_logger((me?PROMPT_ME:PROMPT_IA)+"attaque cible carte "+cible.nom);
		
			cible.DEF = cible.DEF-cattaquante.ATT;
		    my_logger((me?PROMPT_ME:PROMPT_IA)+" idCible = "+cible.id+"/"+cible.nom);
		
			//SI def<0 => cimetiere
			if (cible.DEF<=0){
				my_logger((me?PROMPT_ME:PROMPT_IA)+" cible="+cible.nom+" détruite, sovdef="+cible.sauvdef);
				//Placer la carte au cimetière
				//cible.etat= ETAT_CIM;
				cible.def=cible.sauvdef;
				poserCarteDansCimetiere(cible);
				
				//suppimer cicble du tableau
				if (cc){
					supprimerCarteFromJeu(me,nocible);
				}else{					
					supprimerCarteFromAtt(me,nocible);
				}
			}else{
				// cibler l'ID des points de DEF
				seldef="#"+cible.id+ " #def";
				$(seldef).html(cible.DEF);
			}
		} 
	 }
	 function supprimerCarteFromAtt(me,no){
		 if (me){
			att_me[no-1]="undefined";
		} else{
			att_adv[no-1]="undefined";
		}
	 }
	 function supprimerCarteFromJeu(me, no){
		if(me){
			jeu_me[no-1]="undefined";
		}else{
			jeu_adv[no-1]="undefined";
		}
	 }
	 /* --------------------------------------------
	    Attaquer une carte qui en en ATT1 ou ATT2
	    -------------------------------------------*/
	 function jeu_attaquerC(me,nocible,cattaquante){
		cible =null;
		if(me){
			cible = att_adv[nocible-1];
		}else{
			cible = att_me[nocible-1];
		}
		jeu_attaquerCible(me,false, nocible, cible,cattaquante)
	 }
	 /* --------------------------------------------
	    Attaquer une carte du jeu(arrière)
	    -------------------------------------------*/
     function jeu_attaquerCC(me,nocible,cattaquante){
		cible=null;
		if(me){
			cible= jeu_adv[nocible-1];
		}else{
			cible= jeu_me[nocible-1];
		}				
		jeu_attaquerCible(me,true,nocible, cible,cattaquante)			 
	 }
	 
	/* -----------------------------
	 Placer une carte en att
	 -------------------------------- */
	function jeu_placerEnAttaque(me, no,carte,noAtt){
		afficherDetailsCarte(carte);
		
		jeu_effacerCarte(carte);
		
		carte.etat = (noAtt==1?ETAT_INV_ATT1:ETAT_INV_ATT2);
		if (me){
			carte.id="meAtt"+noAtt;
			att_me[noAtt-1] = carte;
			jeu_me[no]='undefined';			
		} else {
			carte.id="advAtt"+noAtt;
			att_adv[noAtt-1] = carte;
			jeu_adv[no]='undefined';			
		}
		placerCarteEnAttaque(me,carte,noAtt);	
	 }
	 
	/* ------------------------------------
		Piocher une carte ds le cimetière 
		----------------------------------*/
	function jeu_piocherDsCimetiere(me){
		// reprendre la 1er carte du CIMETIERE ds son jeu: ou jeu adv
		if( compterCarteEnjeu(true)== MAX_JEU || compterCarteEnjeu(false)== MAX_JEU){
			alert("Pioche ds cim impossible, , nb max de carte en jeu atteint");
			my_logger((me?PROMPT_ME:PROMPT_IA)+" Pioche ds cim impossible, nb max de carte en jeu atteint")
		}else{
			if (me){
				idxDispo = trouverIndiceDispo(true);
			} else{
				idxDispo = trouverIndiceDispo(false);
			}
			carte_piochee=cim.shift();
			my_logger((me?PROMPT_ME:PROMPT_IA)+" pioche ds CIM, la carte:"+carte_piochee.nom+", mise en jeu");
			
			carte_piochee.DEF= carte_piochee.sauvdef;
			poserCarteEnJeu(carte_piochee,me,idxDispo);
			if (me){
				cc_jeuMe++;
				jeu_me[idxDispo]=carte_piochee;
			}else{
				cc_jeuAdv++;
				jeu_adv[idxDispo]=carte_piochee;
			}
			$("#ctrCimetiere").html("( "+cim.length+" )");	
		}
	}
	/* -----------------------------
	 Piocher une carte dans le paquet
	 -------------------------------- */
	function jeu_piocherDsPaquet(me){
		my_logger((me?PROMPT_ME:PROMPT_IA)+" Piocher une carte");
		//piocher la première carte du paquet
		pioche = paquet2.cartes.shift();
		carte_piochee=JSON.parse(pioche);
		
		//Si carte adv => en jeu pour ADV
		//		SSI nb carteADV en jeu <4
		me = !(etreCarteAdv(carte_piochee));
		cimetiere = (compterCarteEnjeu(me)>=4);
		
		idxDispo = trouverIndiceDispo(me);
		
		if (!cimetiere && idxDispo!=-1){						
			ctrCarte=(me?cc_jeuMe:cc_jeuAdv);
			my_logger((me?PROMPT_ME:PROMPT_IA)+" "+carte_piochee.nom+" mise en jeu pour "+(me?"me":"adv")+ " en "+idxDispo);
			
			//créer une carte pour ADV et afficher
			poserCarteEnJeu(carte_piochee,me,idxDispo);
			
			if (me){
				jeu_me[idxDispo]=carte_piochee;
				cc_jeuMe++;
			}else{
				jeu_adv[idxDispo]=carte_piochee;
				cc_jeuAdv++;
			}						
		}else{
			sacrifierUneCarte(-1,carte_piochee,me,true);

			alert((me?PROMPT_ME:PROMPT_IA)+" "+carte_piochee.nom+" placée ds cimetière !");
		}
		if (me){
			nbc_paquet_me--;
		}else{
			nbc_paquet_adv--;
		}
	 }
     /* ------------------------------------------------
	    Fonction qui permet d'attaquer l'adversaire(PV)
		-----------------------------------------------*/
	 function jeu_attaquerCA(me,cattaquante){
		my_logger((me?PROMPT_ME:PROMPT_IA)+cattaquante.nom+ " inflige dégat CA");
		if (me){
			//infliger les dégats à l'adversaire			
			pv_adv = pv_adv-cattaquante.ATT;
			$("#vieadv").html(pv_adv);		
		}else{
			//infliger les dégats à ME			
			pv_me = pv_me-cattaquante.ATT;
			$("#vieme").html(pv_me);				
		}
	 }
	 function jeu_isFinJeu(){
		 if (pv_adv<=0){
			 alert("BRAVO, vous avez gagné !!!");
		     return;
		 }
		 if (pv_me<=0){
			 alert("DÉSOLÉ, mais vous avez perdu !!!");
		     return;
		 }
		 //@TOTO: bloquer le jeu!!!
	 }
	/* -----------------------------
	 Sacrifier une carte dans le jeu
	 -------------------------------- */
	function sacrifierUneCarte(no,laCarte, me, effacer){
		laCarte.etat= ETAT_CIM;										
		poserCarteDansCimetiere(laCarte);	
		//effacement carte			
		if (effacer && laCarte.id != ""){
			jeu_effacerCarte(laCarte);
		}
		//suppimer du tableau	
		if(no>-1){
			if(me){
				jeu_me[no]="undefined";
				cc_jeuMe--;
			}else{
				jeu_adv[no]="undefined";
				cc_jeuAdv--;				
			}	
		}
		my_logger((me?PROMPT_ME:PROMPT_IA)+" ID=:"+laCarte.id+"/"+laCarte.nom+" est sacrifiée");
		majCompteursPaquet();
		//afficherJeux();						 
	}
	
	function jeu_effacerCarte(laCarte){
		my_logger("carte à effacer: id="+laCarte.id+ " / "+laCarte.nom);
		//$("#"+laCarte.id).hide(2000);
		//$("#"+laCarte.id).css("display","none");
		$("#"+laCarte.id).remove();
	}
	/* ------------------------------
	affichage des jeux de cartes-
	-------------------------------- */
	function afficherJeux(msg){
		if (msg!=null){
			my_logger("---------------------"+msg);	
		}
		my_logger("---------------------JEU en place ");
		afficherJeu(false,jeu_adv);
		afficherJeu(true,jeu_me);
		my_logger("----------------------------------");
	}
	function afficherJeu(me,tabloJeu){
		str ="--jeu "+(me?"Me ":"Adv ");
		for(i=0;i<tabloJeu.length;i++){
			c=tabloJeu[i];
			if (typeof c !== 'undefined'){
				str+= "| N="+c.nom+"("+c.etat+")";
			}
		}
		my_logger(str);
		afficherAttaque(me);
		
	}
	function afficherAttaque(me){
		if (me){
			my_logger("ATTAQUE:"+att_me[0].nom+" | "+att_me[1].nom);
			my_logger("ETAT   :"+att_me[0].etat+" | "+att_me[1].etat);
		}else{
			my_logger("ATTAQUE:"+att_adv[0].nom+" | "+att_adv[1].nom);
			my_logger("ETAT   :"+att_adv[0].etat+" | "+att_adv[1].etat);
		}
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
		if (uneCarte==null){
				strcarte="Carte est NULL";
		}else{
			strcarte="CARTE:"+uneCarte.nom+" | ID="+uneCarte.id+ "| (cout="+uneCarte.cout+")";
			strcarte+="\n ATT="+uneCarte.ATT+ "/ DEF="+uneCarte.DEF;
			strcarte+="\n sauvDef="+uneCarte.sauvdef;
			strcarte+="\n ETAT="+uneCarte.etat;
		}
		my_logger(strcarte);
		
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
		my_logger("nbc_paquet_me="+nbc_paquet_me+" | nbc_paquet_adv:"+nbc_paquet_adv);		
	    
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
    function my_logger(txt){
		console.log(txt);
		$("#journal").append("\n"+txt);
		//faire défiler le SCROLL vers bas pour TEXTAREA
		var message = document.getElementById('journal');
		message.scrollTop = message.scrollHeight;
	}
});