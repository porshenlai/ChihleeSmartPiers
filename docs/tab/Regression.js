document.currentScript.value=async (root,args)=>{
	console.log("Page A: ",root,args);
	let data = [
		[0, 300000],
		[1, 650000],
		[2, 800000],
		[2, 830000],
		[3, 1200000],
		[3, 1100000],
		[4, 2200000],
		[4, 2250000]
	];

	regression = await Piers.import(Piers.Env.PierPath+"Regression.js");
	//let rst = regression('linear', data);
	let rst = regression('polynomial', data, 4);
	root.querySelector('[UIE="Eqs"]').textContent = rst.string;
	console.log(rst);
};
