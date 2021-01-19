
function afficherMenuCarte(){
	console.log(">>fn afficherMenuCarte()");
}
$(document).ready(function(){
	console.log(">>jQuery OK");
	console.log(">>jQuery Génération paquet ADV");
	
	/* ETAT D'UNE CARTE:
    0: CREATION=> PAQUET
	1: EN JEU
	2: en ATT
	-1: MORTE => cimetière /
	*/
	/** 1ere version carte ADV
	var paquetAdv='{"Cartes":['+
		'{"nom":"M1","id_div":"carte01","id_li":"monster01","carFont":"&#85;","top":66 , "left":368, "cout":1,"ATT":2,"DEF":3,"etat": 0},'+
		'{"nom":"M2","id_div":"carte02","id_li":"monster01","carFont":"&#89;","top":66 , "left":472, "cout":1,"ATT":3,"DEF":2,"etat": 0},'+
		'{"nom":"M3","id_div":"carte03","id_li":"monster01","carFont":"&#69;","top":66 , "left":576, "cout":2,"ATT":4,"DEF":2,"etat": 0},'+
		'{"nom":"M4","id_div":"carte04","id_li":"monster01","carFont":"&#81;","top":66 , "left":680, "cout":3,"ATT":4,"DEF":4,"etat": 0}'+
		
	']}'; 
	*/
		/*
		*/
	var paquetAdv='{"Cartes":['+
		'{"nom":"M1","id_div":"carte01","id_li":"monster01","top":66 , "left":368, "cout":1,"ATT":2,"DEF":3,"etat": 0},'+
		'{"nom":"M2","id_div":"carte02","id_li":"monster01","top":66 , "left":472, "cout":1,"ATT":3,"DEF":2,"etat": 0},'+
		'{"nom":"M3","id_div":"carte03","id_li":"monster01","top":66 , "left":576, "cout":2,"ATT":4,"DEF":2,"etat": 0},'+
		'{"nom":"M4","id_div":"carte04","id_li":"monster01","top":66 , "left":680, "cout":3,"ATT":4,"DEF":4,"etat": 0}'+
		
	']}';
	

    var adv = JSON.parse(paquetAdv);

	//placer les cartes sur le jeu
	for(i=0;i<adv.Cartes.length;i++){
		ca = adv.Cartes[i];
		//----------
	    strhtml=buildDivCarte(ca,false);
		
		$(strhtml).appendTo("body");
		
		placerCarte(ca)
	}

    function buildDivCarte(ca, joueur){
		strhtml="<div id='"+ca.id_div+"' class='carteAdv' >";
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
	}
	// -----------------------------------------------
	// fonction qui génère un monstre suivant la font 
	// ------------------------------------------------
	function genereMonstreAdverse(){
		nb=0;
		ok=false;
		while(!ok){
			nb= Math.trunc(Math.random()*122);
			ok= (nb>=65) && (nb<=122) &&(nb!=80) &&(nb!=91) &&(nb!=92) &&(nb!=93) &&(nb!=94) &&(nb!=95)&&(nb!=96)&&(nb!=112);
		}
		nb = "&#"+nb+";";
		console.log("fn genereMonstreAdverse()="+nb);
		return nb;
	}
	function genereMonstreJoueur(){
		return "&#78;";
	}
	
});