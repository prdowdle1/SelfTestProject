let darkMode = true;
let warnings = true;

function toggleDarkMode(){
    darkMode = !darkMode;
    if(!darkMode){
        document.documentElement.classList.add("light");
        document.getElementById("themeButton").innerHTML = "&#127771";
    }else{
        document.documentElement.classList.remove("light");
        document.getElementById("themeButton").innerHTML="&#127774";
    }
}

function toggleWarnings(){
    warnings = !warnings;
    let onOff;
    if(warnings){
        onOff="On";
    }else{
        onOff="Off";
    }
    document.querySelector("#warningButton").innerHTML = "Warnings " + onOff;
}

function scrollPage(direction){
	if(direction=='bottom'){
		window.scrollTo(0,document.body.scrollHeight);
	}else{window.scrollTo(0,0)}
}