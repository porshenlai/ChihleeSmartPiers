function speak( text, locale="zh-TW", pitch=1, rate=1 ){ // zh-TW, ja-JP, fr-FR, de-DE
	return new Promise(function( or, oe ){
		if( window.speechSynthesis.speaking ) return oe("speechSynthesis.speaking");
		var ut = new SpeechSynthesisUtterance( text )
		ut.onend = or;
		ut.onerror = oe;
		ut.pitch = pitch;
		ut.rate = rate;
		ut.voice = window.speechSynthesis.getVoices().find( function(v){ return v.name.startsWith("Microsoft") && v.lang === locale; } );
		window.speechSynthesis.speak(ut);
	});
}

document.currentScript.value=async (root,args)=>{
	console.log("Page A: ",root,args);

	let list=[
  		{"I":"12345678","N":"伊惡刪"},
  		{"I":"87654321","N":"霸氣流"}
	];
	let listCN=["I","N"];

	function listRedraw () {
		(root.querySelector('[WidgetTag="std"]'))._gw().set(list);
	}

	window.speechSynthesis.getVoices();
	(function (tb) {
		(new Piers.Widget.List(tb)).set(list);
		if(tb.ClickHandler){
			tb.removeEventListener(tb.ClickHandler);
			tb.ClickHandler.undefined;
		}
		tb.addEventListener("click", function (evt) {
			switch(evt.target.getAttribute("func")){
			case "call":
				(function(row){
					let doc = row._gw().get();
					speak(doc.I+" "+doc.N+" 到了嗎 ?");
				})(Piers.DOM(evt.target).find("tr"));
				break;
			}
		});
	}) (root.querySelector('[WidgetTag="std"]'));

	((panel)=>{
		if (panel.__ClickHandler__) panel.removeEventListener(panel.__ClickHandler__);
		panel.addEventListener("click",(evt)=>{
			try {
				let btn=Piers.DOM(evt.target).find("[func]");
				console.log(btn.getAttribute("func"));
				switch (btn.getAttribute("func")) {
				case "upload":
					(async (f)=>{
						f = (await f)[0];
						f = await f.decode();
						f = f.replaceAll(/\r/g,'').split("\n");
						f = f.map((s)=>s.split("\t"));
						listCN = f.shift();
						list = f.reduce((a,r)=>{
							a.push(r.reduce((r,v,i)=>{
								if (listCN[i]) r[listCN[i]]=v;
								return r;
							},{}));
							return a;
						},[]);
						listRedraw();
					})(Piers.DATA.upload("text/tab-separated-values"));
					break;
				case "download":
					((d)=>{
						Piers.DATA(d,"text/tab-separated-values").saveAs(((d)=>d.getFullYear()*10000+100*(1+d.getMonth())+d.getDate()+"-"+d.getHours())(new Date())+".tsv");
					})( (root.querySelector('[WidgetTag="std"]'))._gw().get()
						.reduce((a,d)=>a.push(listCN.reduce((r,v,i)=>r.push(d[v])&&r,[]).join("\t"))&&a,[listCN.join("\t")]).join("\n") );
					break;
				}
			} catch (x) { console.log(x); }
		});
	})(root.querySelector('[UIE="FunctionBar"]'));
};
