
function afficherMenuCarte(){
	console.log(">>fn afficherMenuCarte()");
}
$(document).ready(function(){
	console.log(">>jQuery OK");
	console.log(">>jQuery Génération paquet ADV");
	var MAX_CARTE=50;
	
	/* ETAT D'UNE CARTE:
    0: CREATION=> PAQUET
	1: EN JEU
	2: en ATT
	-1: MORTE => cimetière /
	*/
	var paquet2= creerPaquet();
    var carte='{"nom":"???"  ,"id_div":"???" ,"id_li":"??"  ,"t":0  ,"l":0, "cout":0 ,"ATT":0 ,"DEF":0 ,"etat": 0}';
	
	var paquet='{"Cartes":['+
		'{"nom":"M1"  ,"id_div":"carte01" ,"id_li":"monster01"  ,"t":66  ,"l":368, "cout":1 ,"ATT":2 ,"DEF":3 ,"etat": 0},'+
		'{"nom":"M2"  ,"id_div":"carte02" ,"id_li":"monster01"  ,"t":66  ,"l":472, "cout":1 ,"ATT":3 ,"DEF":2 ,"etat": 0},'+
		'{"nom":"M3"  ,"id_div":"carte03" ,"id_li":"monster01"  ,"t":66  ,"l":576, "cout":2 ,"ATT":4 ,"DEF":2 ,"etat": 0},'+
		'{"nom":"M4"  ,"id_div":"carte04" ,"id_li":"monster01"  ,"t":66  ,"l":680, "cout":3 ,"ATT":4 ,"DEF":4 ,"etat": 0},'+	
		'{"nom":"myM1","id_div":"mcarte01","id_li":"mymonster01","t":550 ,"l":368, "cout":3 ,"ATT":3 ,"DEF":3 ,"etat": 0},'+
		'{"nom":"myM2","id_div":"mcarte02","id_li":"mymonster02","t":550 ,"l":476, "cout":1 ,"ATT":3 ,"DEF":1 ,"etat": 0},'+
		'{"nom":"myM3","id_div":"mcarte03","id_li":"mymonster03","t":550 ,"l":476, "cout":3 ,"ATT":4 ,"DEF":1 ,"etat": 0},'+
		'{"nom":"myM4","id_div":"mcarte04","id_li":"mymonster04","t":550 ,"l":684, "cout":2 ,"ATT":3 ,"DEF":2 ,"etat": 0}'+
				
	']}';


    var adv = JSON.parse(paquet);

	//Créer les DIV des cartes sur le jeu
	for(i=0;i<adv.Cartes.length;i++){
		ca = adv.Cartes[i];
		//----------
	    strhtml=buildDivCarte(ca,(i>=4));
		$(strhtml).appendTo("body");
	}
	//placer les DIV
	for(i=0;i<adv.Cartes.length;i++){
		ca = adv.Cartes[i];
		placerCarte(ca)
	}
    function buildDivCarte(ca, joueur){
		strhtml="<div id='"+ca.id_div+((joueur)?"' class='carteMe'":"' class='carteAdv'")+" >";
		strhtml+="<ul>"+ca.nom+"<span>( "+ca.cout+" )</span>";
		strhtml+="<li id='"+ca.id_li+"' >"+((joueur)?genereMonstreJoueur():genereMonstreAdverse())+"</li>";
		strhtml+="<li><span>"+ca.ATT+"</span>|<span>"+ca.DEF+"</span></li>";
		strhtml+="</ul>";
		strhtml+="</div>";
		return strhtml;
	}
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
	// ------------------------------------------------
	// fonction qui génére le paquet de départ
	// ------------------------------------------------
	function creerPaquet(){
	    paquetNew = [50];
		// choix répartition des cartes ds paquet
		accord= false;
		poucent=0;
	    while(!accord){
			pourcent= Math.trunc(Math.random()*56)+1; // 1 à 56
			rep = prompt("vous avez "+pourcent+"% de carte. Acceptez vous la partie? (oui/non)")
			rep = rep.toUpperCase();
			accord = (rep=="OUI");
		}
		nbc_me= (MAX_CARTE*pourcent)/100;
		nbc_adv= MAX_CARTE-nbc_me;
		
		console.log("nbc_me="+nbc_me+" | nbc_adv:"+nbc_adv);
		//création de mes cartes
		nb=0;
		for(nb;nb<nbc_me;nb++){
			//Création d'une carte
			uneCarte =creerUnecarte(true);
		    
			//Ajout dans paquet
			paquetNew[nb]=uneCarte;
		}
		//Création des cartes de l'adversaire
		for(nb2=0;nb2<nbc_adv;nb2++){
			uneCarte2 =creerUnecarte(false);
			paquetNew[nb2+nb+1]=uneCarte2;
			
		}
		console.log(paquetNew);
	}
	function creerUnecarte(me){
		modele_carte='{"nom":"???"  ,"id_div":"???" ,"id_li":"??"  ,"t":0  ,"l":0, "cout":0 ,"ATT":0 ,"DEF":0 ,"etat": 0}';
	    
		uneCarte = JSON.parse(modele_carte);
		uneCarte.nom="M";
		if (me){
			uneCarte.nom ="my"+uneCarte.nom;
		}
		uneCarte.nom+=nb;
		
		uneCarte.id_div="carte";
		if (me){
			uneCarte.id_div="m"+uneCarte.id_div;
		}
		uneCarte.id_div+=(nb<10)?"0"+nb:nb;
		
		uneCarte.id_li="monster";
		if (me){
			uneCarte.id_li="my"+uneCarte.id_li;
		}
		uneCarte.id_li+=(nb<10)?"0"+nb:nb;
		
		uneCarte.t=0;
		uneCarte.l=0;
		
		uneCarte.cout=Math.trunc(Math.random()*6)+1; 
		uneCarte.ATT=(uneCarte.cout*2) /3;
		uneCarte.DEF = uneCarte.cout/3;
		uneCarte.etat =0;
		
		console.log("CARTE="+uneCarte);

		return uneCarte;
	}
});