//Requires
var fs = require("fs")
var swal = require("sweetalert2")
var ipc = require('electron').ipcRenderer;

//Keeps check of active tab
var activeTab = 1;

//Keeps check of whether data is written
var isSaved = true;

//Define month of today
var today = new Date();
var m = today.getMonth()+1;
var yyyy = today.getFullYear();
var mm = (m < 10) ? '0'+ m : m.toString()
//today = yyyy + "-" + mm;
today = "2019-01"
var activeMonth = today

//Array to store all months in data
monthList = []

//Array sortList
/*
var csvArr = []
var firstList = document.querySelectorAll('input[id^="R"]')
var sortList = Array.prototype.slice.call(firstList);
elemList = sortList.sort(function(a, b) {
  	return a.id.localeCompare(b.id);
});
for (i=0;i<elemList.length;i++) {
	csvArr.push([elemList[i].id])
}*/

//Loads current month when opening window
function initialize_T1() {
	disable_Month_Btns()
	loadBackground()
	document.querySelector('.monthSelector').value = today
	fs.readFile("JSONdata.txt", function (err, data) {
    	jsonData = (JSON.parse(data.toString()));
   		insert_month_T1(true, false, today)
   		fill_Month_List(jsonData)
	});
}
//Fills list of possible months in data
function fill_Month_List(data) {
	for (var key in data) {
		monthList.push(key)
    }
}
//Loads new month when changing
function insert_month_T1(start, increase, month) {
	indent = (increase) ? ["130px", "-130px"] : ["-130px", "130px"]
	var jsonMonthData = jsonData[month]
	var all = document.querySelectorAll('input[placeholder=" "]')
	var labels = document.querySelectorAll('.inputLabel')
	var removeLabelArr = []
	for (i=0;i<labels.length;i++) {
		labels[i].style.transition = "none"
	}
	for (var key in jsonMonthData) {
		var element = document.querySelector("#" + key)
		if (jsonMonthData[key].length > 0 && element.value === "") {
			removeLabelArr.push(key)
		}
	}
	function proceedInsert() {
		for (var key in jsonMonthData) {
			var element = document.querySelector("#" + key)
			if (element !== null) {
				if (key.includes("c_kvv") || key.includes("e_kvv") || key.includes("_av")) {
					if (jsonMonthData[key] === "") {
						element.value = ""
					} else {
						element.value = toTsepInit(jsonMonthData[key] * 100);
					}
				}
				else {
					element.value = toTsepInit(jsonMonthData[key]);
				}
				if (start) {
					element.addEventListener('change', check_Data)
					element.addEventListener('focus', fromTsep)
					element.addEventListener('blur', toTsep)
				}
	    	}
	    }
	    if (start) {
	    	update_Month_Btns()
	    	show_Tab(1, true)
	    }
	    for (i=0;i<all.length;i++) {
			all[i].style.transition = null
			all[i].style.color = null
			labels[i].style.opacity = null
		}
		setTimeout(function(){
			for (i=0;i<labels.length;i++) {
				labels[i].style.transition = null
			}
		}, 10)
    }
    for (i=0;i<all.length;i++) {
    	if (removeLabelArr.includes(all[i].id)) {
    		labels[i].style.opacity = "0"
    	}
		all[i].style.transition = "color 0.1s ease-out";
		all[i].style.color = "white"
	}
	setTimeout(function(){proceedInsert()}, 120)
}
function check_Data() {
	if (this.value != "" ) {
		eval = toNum(this.value.replace(" ", "").replace(",","."))
		newVal = parseFloat(eval)
		if (this.id.includes("c_kvv") || this.id.includes("e_kvv") || this.id.includes("_av")) {
			var tempVal = jsonData[activeMonth][this.id] * 100
			if (isNaN(eval)) {
				this.value = tempVal
				alert("Ange ett heltal mellan 1 och 100")
			} else if ((Number.isInteger(parseFloat(eval)) && parseFloat(eval) >= 0 && parseFloat(eval) <= 100)) {
				update_Data(this.id, parseFloat(String(parseFloat(newVal) / 100)))
			} else {
				this.value = tempVal
				alert("Ange ett heltal mellan 1 och 100")
			}	
		}
		else {
			var tempVal = jsonData[activeMonth][this.id]
			if (isNaN(eval)) {
				this.value = tempVal
				alert("Ange endast siffror - använd punkt före decimaler")
			} else if (parseFloat(eval) < 0) {
				this.value = String(0 - parseFloat(eval))
				update_Data(this.id, newVal)
			} else {
				update_Data(this.id, newVal)
			}
		}
	} else {
		update_Data(this.id, "")
	}
}
function update_Data(key, value) {
	if (key.includes("sk_")) {
		for(monInt = 1; monInt <= 12; monInt++) {
			tempMonth = activeMonth.slice(0, 5) + "0".slice(0, 2 - String(monInt).length) + String(monInt)
			jsonData[tempMonth][key] = value
		}
	} else {
		jsonData[activeMonth][key] = value
	}
	if (isSaved) {
		isSaved = false;
		ableSave(true)
	}
}
function calculate_T2() {
	var emptyData = false
	var all = document.querySelectorAll('input[id^="R_"]')

	jMD = jsonData[activeMonth]
	for (var key in jMD) {
		if (jMD[key].length === 0) {
			emptyData = true
			break
		}
	}	
	if (emptyData) {
		swal({
		  title: 'Not Calculated',
		  text: 'Please first complete data entry for your month of choice.',
		  type: "info",
		});
		for (i=0;i<all.length;i++) {
			all[i].value = ""
		}
	}
	else {
		function proceedCalc() {
			//Generella variabler
			var elforb_KVVHVC = jMD["p_kvv_el"] + jMD["m_kopt"] - jMD["m_salt"]
			var elforb_TOT = (elforb_KVVHVC + ((jMD["a_atorp"] + jMD["a_brohus"] + jMD["a_brons"] + jMD["a_bult"] + jMD["a_esprz"] + jMD["a_hjarp"] + jMD["a_lverk"] + jMD["a_slagg"] + jMD["a_varv"] + jMD["a_vfala"]) / 1000))
			var andel_FjV_i_Tk = jMD["p_kvv_kds"] / (jMD["p_kvv_varme"] + jMD["p_hvc_fbransle"] + jMD["p_hvc_bgas"] + jMD["p_hvc_ngas"])
			var sbHjEl = elforb_KVVHVC - ((jMD["a_hvc"] + jMD["a_rgk"] + jMD["a_elp"] + jMD["a_ackt"]) / 1000) - (1 - andel_FjV_i_Tk) * (jMD["a_fjvp"] / 1000)
			var forb_TOT_Eo1 = jMD["f_kvv_eo1"] + jMD["f_hvc_eo1"] + jMD["f_hjarp_eo1"] + jMD["f_lsret_eo1"] + jMD["f_vfala_eo1"] + jMD["f_atorp_eo1"]
			var forb_TOT_Flis = jMD["f_kvv_aflis"] + jMD["f_kvv_sflis"] + jMD["f_hvc_aflis"] + jMD["f_hvc_sflis"] + jMD["f_hjarp_flis"] + jMD["f_atorp_flis"]
			var prod_KVV_Energi	= (jMD["p_kvv_el"] + jMD["p_kvv_varme"] > 0) ? jMD["p_kvv_el"] + jMD["p_kvv_varme"] : 1
			var forb_TOT_Ngas = jMD["f_hvc_ngas"] + jMD["f_brons_ngas"] + jMD["f_bult_ngas"]
			var skpliktig_Elforb = (elforb_TOT > sbHjEl) ? elforb_TOT - sbHjEl : 0
			var skpliktig_Elprod = (jMD["p_kvv_el"] > sbHjEl) ? jMD["p_kvv_el"] - sbHjEl : 0
			var sk_TOT_Svavel = forb_TOT_Eo1 * 2 * jMD["sk_s_svavel"]
			var sk_TOT_El = skpliktig_Elforb * jMD["sk_e_el"]

			//Blankett 701 - Elskatt
			document.querySelector("#R_701_2").value = Math.round(skpliktig_Elforb * 10) / 10
			document.querySelector("#R_701_3").value = Math.round(skpliktig_Elforb * jMD["sk_e_el"])
			document.querySelector("#R_701_21").value = Math.round(skpliktig_Elforb * jMD["sk_e_el"])

			//Blankett 712 - Olja
			document.querySelector("#R_712_31").value = Math.round(forb_TOT_Eo1 * 10) / 10
			document.querySelector("#R_712_40").value = Math.round(jMD["f_kvv_eo1"] * (skpliktig_Elprod / prod_KVV_Energi) * 1000) / 1000
			document.querySelector("#R_712_41").value = Math.round(jMD["f_kvv_eo1"] * (jMD["p_kvv_varme"] / prod_KVV_Energi) * 1000) / 1000
			document.querySelector("#R_712_43").value = Math.round((jMD["f_hvc_eo1"] + jMD["f_vfala_eo1"] + jMD["f_lsret_eo1"]) * 1000) / 1000
			document.querySelector("#R_712_97").value = Math.round(forb_TOT_Eo1 * jMD["sk_e_eo1"])
			document.querySelector("#R_712_98").value = Math.round(forb_TOT_Eo1 * jMD["sk_e_eo1"])
			document.querySelector("#R_712_108").value = Math.round(jMD["f_kvv_eo1"] * (skpliktig_Elprod / prod_KVV_Energi) * jMD["sk_e_eo1"])
			document.querySelector("#R_712_109").value = Math.round(jMD["f_kvv_eo1"] * (jMD["p_kvv_varme"] / prod_KVV_Energi) * jMD["sk_e_eo1"] * (1 - jMD["sk_e_kvv"]))
			document.querySelector("#R_712_112").value = document.querySelector("#R_712_97").value - document.querySelector("#R_712_108").value - document.querySelector("#R_712_109").value
			document.querySelector("#R_712_113").value = Math.round(forb_TOT_Eo1 * jMD["sk_c_eo1"])
			document.querySelector("#R_712_114").value = Math.round(forb_TOT_Eo1 * jMD["sk_c_eo1"])
			document.querySelector("#R_712_124").value = Math.round((jMD["f_kvv_eo1"] * (skpliktig_Elprod / prod_KVV_Energi)) * jMD["sk_c_eo1"])
			document.querySelector("#R_712_125").value = Math.round((jMD["f_kvv_eo1"] * (jMD["p_kvv_varme"] / prod_KVV_Energi)) * jMD["sk_c_eo1"] * (1 - jMD["sk_c_kvv"]))
			document.querySelector("#R_712_127").value = Math.round((jMD["f_hvc_eo1"] + jMD["f_vfala_eo1"] + jMD["f_lsret_eo1"]) * jMD["sk_c_eo1"] * (1 - jMD["sk_c_av"]))
			document.querySelector("#R_712_129").value = document.querySelector("#R_712_114").value - document.querySelector("#R_712_124").value - document.querySelector("#R_712_125").value - document.querySelector("#R_712_127").value
			document.querySelector("#R_712_130").value = parseInt(document.querySelector("#R_712_112").value) + parseInt(document.querySelector("#R_712_129").value)

			//Blankett 713 - Naturgas
			document.querySelector("#R_713_12").value = Math.round(forb_TOT_Ngas) / 1000
			document.querySelector("#R_713_22").value = Math.round(forb_TOT_Ngas) / 1000
			document.querySelector("#R_713_53").value = Math.round(forb_TOT_Ngas * jMD["sk_e_ngas"] / 1000)
			document.querySelector("#R_713_55").value = Math.round(forb_TOT_Ngas * jMD["sk_e_ngas"] / 1000)
			document.querySelector("#R_713_63").value = Math.round(forb_TOT_Ngas * jMD["sk_e_ngas"] / 1000 * (1 - jMD["sk_e_av"]))
			document.querySelector("#R_713_68").value = document.querySelector("#R_713_55").value - document.querySelector("#R_713_63").value
			document.querySelector("#R_713_70").value = Math.round(forb_TOT_Ngas * jMD["sk_c_ngas"] / 1000)
			document.querySelector("#R_713_72").value = Math.round(forb_TOT_Ngas * jMD["sk_c_ngas"] / 1000)
			document.querySelector("#R_713_82").value = Math.round(forb_TOT_Ngas * jMD["sk_c_ngas"] / 1000 * (1 - jMD["sk_c_av"]))
			document.querySelector("#R_713_86").value = document.querySelector("#R_713_72").value - document.querySelector("#R_713_82").value
			document.querySelector("#R_713_87").value  = parseInt(document.querySelector("#R_713_68").value) + parseInt(document.querySelector("#R_713_86").value)

			//Blankett 718 - Svavel
			document.querySelector("#R_718_1").value  = Math.round(forb_TOT_Eo1 * 2 * 10) / 10
			document.querySelector("#R_718_10").value = Math.round(forb_TOT_Eo1 * 2 * jMD["sk_s_svavel"])
			document.querySelector("#R_718_11").value = Math.round(forb_TOT_Eo1 * 2 * jMD["sk_s_svavel"])
			document.querySelector("#R_718_22").value = Math.round(forb_TOT_Eo1 * 2 * jMD["sk_s_svavel"])

			//Total
			document.querySelector("#R_tot_bransle").value = parseInt(document.querySelector("#R_712_130").value) + parseInt(document.querySelector("#R_713_87").value)
			document.querySelector("#R_tot_el").value = Math.round(sk_TOT_El)
			document.querySelector("#R_tot_svavel").value = Math.round(sk_TOT_Svavel)
			document.querySelector("#R_tot_total").value = Math.round(parseInt(document.querySelector("#R_tot_bransle").value) + sk_TOT_El + sk_TOT_Svavel)

			//toTsep
			var elems = document.querySelectorAll('input[id^="R"]')
			var signArr = ["  ", "+  ", "–  ", "=  "]
			var classArr = ["none", "plus", "minus", "sum"]
			for (i=0;i<elems.length;i++) {
				var pre = signArr[classArr.indexOf(elems[i].className)]
				elems[i].value = pre + toTsep(elems[i].value)
			}

			/*
			//To CSV
			for (i=0;i<elemList.length;i++) {
				csvArr[i].push(elemList[i].value)
			}
			*/

			for (i=0;i<all.length;i++) {
				all[i].style.transition = null
				all[i].style.color = null
			}
		}
		for (i=0;i<all.length;i++) {
			all[i].style.transition = "color 0.12s ease-out"
			all[i].style.color = "white"
		}
		setTimeout(function() {proceedCalc()}, 140)

	}
	document.querySelector(".blurredVisible").setAttribute("class", "blurredHidden")
}
function calculate_T3() {
	var year = activeMonth.slice(0,4)
	document.querySelector("#tabWrapper3").querySelector(".beneathHeader").innerHTML = year
	tdElems = document.querySelectorAll("td[id^='td']")
	for(i=1;i<tdElems.length;i++) {
		tdElems[i].innerHTML = ""
	}
	var totAnvEl = 0
	var totAvdrag = 0
	for(m=1;m<13;m++) {
		emptyData = false
		var mm = (m < 10) ? '0'+ m : m.toString()
		jMD = jsonData[year + "-" + mm]
		/*for (var key in jMD) {
			if (jMD[key].length === 0) {
				emptyData = true
				break
			}
		}*/
		if (emptyData == false) {
			var anvEgenEl = jMD["p_kvv_el"] - jMD["m_salt"]
			var andel_FjV_i_Tk = jMD["p_kvv_kds"] / (jMD["p_kvv_varme"] + jMD["p_hvc_fbransle"] + jMD["p_hvc_bgas"] + jMD["p_hvc_ngas"])
			var allokEl = Math.round(((jMD["p_kvv_el"] > 0) ? jMD["p_kvv_el"] / (jMD["p_kvv_el"] + jMD["p_kvv_varme"]) : 0) * 1000) / 1000
			var allokVarme = Math.round(((jMD["p_kvv_varme"] > 0) ? jMD["p_kvv_varme"] / (jMD["p_kvv_el"] + jMD["p_kvv_varme"]) : 0) * 1000) / 1000
			var elforb_KVVHVC = jMD["p_kvv_el"] + jMD["m_kopt"] - jMD["m_salt"]
			var sbHjEl = elforb_KVVHVC - ((jMD["a_hvc"] + jMD["a_rgk"] + jMD["a_elp"] + jMD["a_ackt"]) / 1000) - (1 - andel_FjV_i_Tk) * (jMD["a_fjvp"] / 1000)
			var avdrag = (elforb_KVVHVC > 0) ? anvEgenEl * allokEl / elforb_KVVHVC * sbHjEl : 0
			var toDeclare = anvEgenEl - avdrag
			totAvdrag = totAvdrag + avdrag
			totAnvEl = totAnvEl + anvEgenEl
			document.querySelector("#td_1_" + m.toString()).innerHTML = (Math.round(anvEgenEl * 10) / 10).toString().replace(".", ",")
			document.querySelector("#td_2_" + m.toString()).innerHTML = (allokEl * 100).toString().slice(0,4).replace(".", ",") + "%"
			document.querySelector("#td_3_" + m.toString()).innerHTML = (allokVarme * 100).toString().slice(0,4).replace(".", ",") + "%"
			document.querySelector("#td_4_" + m.toString()).innerHTML = (Math.round(avdrag * 10) / 10).toString().replace(".", ",")
			document.querySelector("#td_5_" + m.toString()).innerHTML = (Math.round(toDeclare * 10) / 10).toString().replace(".", ",")
		}
	}
	var totToDeclare = totAnvEl - totAvdrag
	totAvdrag = (totAvdrag > 0) ? (Math.round(totAvdrag * 10) / 10).toString().replace(".", ",") : ""
	totToDeclare = (totToDeclare > 0) ? (Math.round(totToDeclare * 10) / 10 ).toString().replace(".", ",") : ""
	totAnvEl = (totAnvEl > 0) ? (Math.round(totAnvEl * 10) / 10).toString().replace(".", ",") : ""
	document.querySelector("#td_1_13").innerHTML = totAnvEl
	document.querySelector("#td_4_13").innerHTML = totAvdrag
	document.querySelector("#td_5_13").innerHTML = totToDeclare
}
function ableSave(enable) {
	if (enable) {
		document.querySelector('.savePseudoIcon').setAttribute("class", "saveIcon")
	}
	else {
		document.querySelector('.saveIcon').setAttribute("class", "savePseudoIcon")
	}
}
function save() {
	if (isSaved === false) {
		fs.writeFile('JSONdata.txt', JSON.stringify(jsonData), function (err) {
		    if (err) {
		        return swal(err);
		    }
		});
		ableSave(false)
		swal({
			title: "Saved!",
			timer: 1250,
			type: "success",
			showConfirmButton: false
		});
		isSaved = true;
	}
}
function change_Month(increase) {
	indent = (increase) ? ["130px", "-130px"] : ["-130px", "130px"]
	var position = monthList.indexOf(activeMonth)
	element = document.querySelector('.monthSelector')
	position = (increase) ? position + 1 : position -1
	insert_month_T1(false, increase, monthList[position])
	element.style.transition = "text-indent 0.07s ease-in"
	element.style.textIndent = indent[0]
	setTimeout( function () {
		element.value = monthList[position]
		element.style.transition = "none"
		element.style.textIndent = indent[1]
		setTimeout( function () {
			element.style.transition = "text-indent 0.07s ease-out"
			element.style.textIndent = "0px"
			update_Month_Btns()
			if (activeTab == 2) {
				calculate_T2()
			} else if (activeTab == 3) {
				calculate_T3()
			}
		}, 20)
	}, 72)
} 
function disable_Month_Btns() {
	document.querySelector('div[class$="MonthBtn"]').style.display = "none"
	document.querySelector('div[class$="PseudoBtn"]').style.display = "inline-block"
}
function update_Month_Btns() {
	activeMonth = document.querySelector('.monthSelector').value
	document.querySelector('div[class$="MonthBtn"]').style.display = "inline-block"
	document.querySelector('div[class$="PseudoBtn"]').style.display = "none"
	if (monthList[0] === activeMonth) {
		document.querySelector('.lastMonthBtn').style.display = "none"
		document.querySelector('.lastMonthPseudoBtn').style.display = "inline-block"
	}
	if (monthList[monthList.length-1] === activeMonth) {
		document.querySelector('.nextMonthBtn').style.display = "none"
		document.querySelector('.nextMonthPseudoBtn').style.display = "inline-block"
	} 
}
function show_Tab(newTab, start) {
	if (activeTab !== newTab || start) {
		switch(newTab) {
			case 1:
				var tabOrder = [1, 2, 3, null]
				break;
			case 2:
				var tabOrder = [2, 1, 3, "2300px"]
				break;
			default:
				var tabOrder = [3, 1, 2, "2300px"]
		}
		document.querySelector(".appWrapper").style.minHeight = tabOrder[3]
		document.querySelector('#tabWrapper' + tabOrder[0]).style.display = "inline-block"
		document.querySelector('#tabWrapper' + tabOrder[1]).style.display = "none"
		document.querySelector('#tabWrapper' + tabOrder[2]).style.display = "none"
		if (start ) {
			document.querySelector('.activeBtn').style.display = "inline-block"
			document.querySelectorAll('.inactiveBtn')[0].style.display = "inline-block"
			document.querySelectorAll('.inactiveBtn')[1].style.display = "inline-block"
			document.querySelector('div[class$="MonthBtn"]').style.display = "inline-block"
			document.querySelector('div[class$="PseudoBtn"]').style.display = "none"

		} else {
			document.querySelector('#tabBtn' + tabOrder[0]).setAttribute("class", "activeBtn")
			document.querySelector('#tabBtn' + tabOrder[1]).setAttribute("class", "inactiveBtn")
			document.querySelector('#tabBtn' + tabOrder[2]).setAttribute("class", "inactiveBtn")
		}
		var tabElems = document.querySelectorAll("button[id^='tabBtn']")
		var margR = 3
		tabElems[1].style.width = null
		var	tabWidth = window.getComputedStyle(tabElems[1]).getPropertyValue("width").replace("px", "")
		tabWidth = parseInt(tabWidth)
		for(i=0;i<tabElems.length;i++) {
			tabElems[i].style.marginRight = null
		}
		activeTab = newTab
		if (newTab == 2) {
			calculate_T2()
			tabElems[1].style.width = (tabWidth + margR).toString() + "px"
		} else if (newTab == 3) {
			calculate_T3()
			tabElems[0].style.marginRight = margR.toString() + "px"
		} else {
			tabElems[1].style.marginRight = margR.toString() + "px"
		}
	}
}
function Hlight(elem, bool) {
	newID = (bool) ? ["ActiveLine", "p1active"] : ["", ""]
	elem.parentNode.parentNode.parentNode.setAttribute("id", newID[0])
	elem.parentNode.parentNode.parentNode.querySelector(".p1").setAttribute("id", newID[1])
}
function loadBackground () {
	var img = new Image();
	img.onload = function() { 
       document.querySelector(".sharp").style.backgroundImage = "url(images/background4.jpg)"
       document.querySelector(".blurredVisible").setAttribute("class", "blurredHidden")
    }
    img.src = "images/background4.jpg";
}
function toTsepInit(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".").replace(".", ",");
}
function toTsep(val) {
	if (this.toString().includes("HTML")) {
		Hlight(this, false)
		var parts = this.value.toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	    this.value = parts.join(",");
	} else {
		var parts = val.toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	    return parts.join(",");
	}
}
function fromTsep(val) {
	if (this.toString().includes("HTML")) {
		Hlight(this, true)
		this.value = this.value.replace(/\s/g, '')
	} else {
		return val.replace(/\s/g, '')
	}
}
function toNum(x) {
	return x.replace(/\s|,/g, '.');
}
function maximize() {
	ipc.send("maximize")
}
function checkIfMaximized() {
	ipc.send("checkIfMax")
	ipc.on('isMaximized', function (event, arg) {
	    var maxStr = arg ? ["#maximize", "unmaximize"] : ["#unmaximize", "maximize"]
	    document.querySelector(maxStr[0]).setAttribute("id", maxStr[1])
	})
}
function close() {
	/*
	var csvRows = [];
    for (var i = 0; i < csvArr.length; ++i) {
        csvRows.push(csvArr[i].join(';'));
    }
    var csvString = csvRows.join('\r\n');
    fs.writeFile('csvTest.csv', csvString, function (err) {
	    if (err) {
	        return swal(err);
	    }
	});
	*/
    if (isSaved) {
    	ipc.send('close')
    } else {
	    swal({
			title: "Warning!",
			text: "You have not saved your progress - do you wish to exit?",
			type: "warning",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Cancel",
			cancelButtonText: "Exit",
			cancelButtonColor: '#cc372c'
		}).then(function(result){
		   	if (result.value != true) {
		   		ipc.send('close')
		   	}
		});
	}
}
window.addEventListener('load', initialize_T1)
window.addEventListener('resize', checkIfMaximized)
ipc.on('isClosing', function (event, arg) {close()})
document.querySelector('#close').addEventListener('click', close)
document.querySelector('.savePseudoIcon').addEventListener('click', save)
document.querySelector('#tabBtn1').addEventListener('click', show_Tab.bind(this, 1, false))
document.querySelector('#tabBtn2').addEventListener('click', show_Tab.bind(this, 2, false))
document.querySelector('#tabBtn3').addEventListener('click', show_Tab.bind(this, 3, false))
document.querySelector('.nextMonthBtn').addEventListener('click', change_Month.bind(this, true))
document.querySelector('.lastMonthBtn').addEventListener('click', change_Month.bind(this, false))
document.querySelector('#maximize').addEventListener('click', function () {ipc.send('maximize')})
document.querySelector('#minimize').addEventListener('click', function () {ipc.send('minimize')})