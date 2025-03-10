document.currentScript.value=async (root,args)=>{
	console.log("Timeline: ",root,args);

	/*let rst = await APP.Head.request("home/file",{"F":"w","N":"test2","D":{"A":1,"B":2,"C":3}});
	console.log("Write Test Result is ",rst);
	rst = await APP.Head.request("home/file",{"F":"r","N":"test2"});
	console.log("Data is ",rst.R,rst.D);
	*/

	class YM {
		constructor (yms) {
			yms = yms.split("-").map((v)=>parseInt(v));
			this.ms = (yms[0]-2000)*12+yms[1]-1;
		}
		toString () {
			return (2000+parseInt(this.ms/12)).toString()+"-"+((this.ms%12)+101).toString().substring(1);
		}
		diff (b) {
			return this.ms - b.ms;
		}
	}

	class _Base_
	{	// {{{
		constructor (E) {
			this.Root = E;
		}
		query (qs) {
			return this.Root.matches(qs) ? this.Root : this.Root.querySelector(qs);
		}
		bind (cb, fkey="func") {
			if (!this.Root.ClickHandler)
				this.Root.ClickHandler = function(evt) {
					try {
						let f = Piers.DOM(evt.target).find('['+fkey+']');
						if (cb(evt, f.getAttribute(fkey))) {
							evt.preventDefault();
							evt.stopPropagation();
						}
					} catch(x) { }
				};
			this.Root.addEventListener("click",this.Root.ClickHandler);
		}
	}	// }}}

	class PlanList extends _Base_
	{	// {{{
		constructor (E) {
			super(E);
			this.Form = new Piers.Widget.List(this.Root);
			this.List = [];
			this.bind((evt,func)=>this.dispatch(evt,func));
		}
		add (v) {
			this.List.push(v);
			console.log(this.List);
			this.Form.clear().set(this.List);
		}
		dispatch (evt,func) {
			switch(func){
			case "Remove":
				((row)=>{
					this.List.splice(row.getAttribute("__idx__"),1);
					this.Form.clear().set(this.List);
				})(Piers.DOM(evt.target).find("tr"));
				break;
			}
			return true;
		}
	}	// }}}
	let pl = new PlanList (root.querySelector('[WidgetTag="Ps"]'));

	class TaskEditor extends _Base_
	{	// {{{
		constructor (E) {
			super(E);
			this.Tag = E.getAttribute("WidgetTag");
			this.set("JOB");
			let lock = false;
			if(!E.OnSelectChange) E.OnSelectChange=(evt)=>{
				if(lock) return;
				lock = true;
				if("SELECT"===evt.target.tagName){
					let filter = evt.target.getAttribute(this.Tag),
						value = evt.target.value;
					this.set(filter.split("-").concat(value.split("-")).filter((x)=>x).join("-"));
					evt.preventDefault();
					evt.stopPropagation();
				}
				lock = false;
			};
			E.addEventListener("change",E.OnSelectChange);
			this.bind((evt,func)=>this.dispatch(evt,func));
		}
		set (s) {
			Piers.DOM(this.Root).forEach((e)=>{
				let filter = e.getAttribute(this.Tag);
				if (s.startsWith(filter)) {
					let nv = s.substring(filter.length).replace(/^-/,'').replace(/-.*$/,'');
					e.value = nv ;
					if (!e.value) e.value = e.getAttribute("defaultValue");
					e.setAttribute("SWITCH","ON");
				} else e.setAttribute("SWITCH","OFF");
			},'['+this.Tag+']');
		}
		get () {
			return Piers.DOM(this.Root).reduce((r,e)=>{
				if (e.getAttribute("SWITCH") === "OFF") return;
				let key = e.getAttribute(this.Tag)+"-"+(e.value||"");
				return r.length > key.length ? r : key;
			}, 'select['+this.Tag+']', "");
		}
		dispatch (evt, func) {
			switch(func){
			case "Add":
				((root)=>{
					let rv = Piers.DOM(root).reduce((r,v)=>{
						let n = v.getAttribute("tk").split(":");
						n.reduce((r,k,i)=>{
							if(i<n.length-1){
								if(!r[k]) r[k] = {};
								return r[k];
							}else r[k] = v.value;
							return r;
						},r)
						return r;
					},"[tk]",{});
					pl.add(rv);
					this.set("JOB");
				})(this.query('div[filter="'+this.get()+'"]'));
				break;
			}
			return true;
		}
	}	// }}}
	let te = new TaskEditor (root.querySelector('[WidgetTag="filter"]'));

	class FrameList extends _Base_
	{	// {{{
		constructor (E) {
			super(E);
			this.Frames = [];
			this.Form = new Piers.Widget.List(this.Root);
		}
		add (frame) {
			this.Frames.unshift(Object.assign({},frame));
			this.Form.set(this.Frames);
		}
		remove () {
			let rv = fl.Frames.shift();
			this.Form.set(this.Frames);
			return rv;
		}
	}	// }}}
	let fl = new FrameList (root.querySelector('[WidgetTag="Frame"]'));

	class MediaControl extends _Base_
	{	// {{{
		constructor (E) {
			super(E);
			this.Form = new Piers.Widget.Form(this.Root);
			this.Doc = {
				T:((d)=>d.getFullYear()+"-"+(101+d.getMonth()).toString().substring(1))(new Date()),
				S:30000,
				I:0,
				D:0,
				P:""
			};
			this.Form.set(this.Doc);
			this.bind((evt,func)=>this.dispatch(evt,func));
			fl.add(this.Doc);
			this.State = "Paused";
			this.Timer = setInterval(()=>{
				if (this.State==="Paused") return;
				this.next();
			}, 1000);
		}

		next () {
			function nextMonth (ov) {
				ov=parseInt(ov.replace(/-/,''))
				ov=[Math.floor(ov/100),ov%100];
				ov[1]+=1;
				if(ov[1]==13){ ov[0]+=1; ov[1]=1; }
				return ov[0]+"-"+(ov[1]<10?"0":"")+ov[1];
			}
			this.Doc.T=nextMonth(this.Doc.T);
			pl.List.reduce((r,v)=>{
				for (let k in v) {
					if ("object" !== typeof(v[k])) continue;
					let c=[0,1,0,0,0]
					for (let kk in v[k]) switch(kk) {
						case "+":
							c[3]=parseInt(v[k][kk]);
							break;
						case "-":
							c[3]=-parseInt(v[k][kk]);
							break;
					}
					r.S+=c[4];
				}
				return r;
			},this.Doc);
			console.log("3",this.Doc);
			this.Form.set(this.Doc);
			fl.add(this.Doc);
		}

		dispatch (evt, func) {
			switch(func){
			case "Play":
				this.Root.setAttribute("State",this.State="Playing");
				break;
			case "Stop":
				this.Root.setAttribute("State",this.State="Paused");
				break;
			case "Prev":
				fl.remove();
				this.Doc = fl.Frames[0];
				this.Form.set(this.Doc);
				break;
			case "Next":
				this.next();
				break;
			}
			return true;
		}
	}	// }}}
	let mc = new MediaControl (root.querySelector('[WidgetTag="MC"]'));
};
