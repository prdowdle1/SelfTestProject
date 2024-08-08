let darkMode = true;
let alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
let LCalphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
let startDiv;
let user;
let loadedTest = false;
let deletedIds = [];
let deletedIdsCount = 0;
let loadedTestName;
let username;

let ansPerQ = [];
let optionsPerQ = [];

let testLength = 0;

let questionTypes = ["Multiple Choice","Drop Down","Fill in the Blank"];

window.addEventListener('load', function () {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            username = xmlHttp.responseText;
            let userDisplay = document.createElement("span");
            userDisplay.classList.add("text");
            userDisplay.innerText="Welcome " + username + "!!";
            document.getElementById("welcome-user").appendChild(userDisplay);
            startDiv = document.getElementById("start-div");
            getTestNames();
        }
    }
    xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/getUser.pl',true);
    xmlHttp.send();
    //startDiv = document.getElementById("start-div");
    //getTestNames();
  });

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

//############################################################################################\\
                                //GET TEST NAMES\\
//############################################################################################\\

function getTestNames(){
    let submitSelectionDiv = document.createElement("div");
    let testSelect=document.createElement("select");
    testSelect.id="test-select";
    let optEl = document.createElement("option");
    optEl.innerText='--select--'
    optEl.value='--select--';
    optEl.disabled=true;
    testSelect.appendChild(optEl);
    testSelect.selectedIndex=0;

    let headButtonDiv = document.createElement("div");
    headButtonDiv.id="headButtons";
    let getTestButton = document.createElement("button");
    getTestButton.classList.add("button");
    getTestButton.setAttribute("onclick","retrieveTest()");
    getTestButton.innerText="Get Test";
    headButtonDiv.appendChild(getTestButton);

    let undoDelButon = document.createElement("button");
    undoDelButon.classList.add("button");
    undoDelButon.setAttribute("onclick","undoDelete()");
    undoDelButon.innerText="Undo Delete";

    let saveChangesButton= document.createElement("button");
    saveChangesButton.classList.add("button");
    saveChangesButton.setAttribute("onclick","saveChanges()");
    saveChangesButton.innerText="Save Changes";
	
	let scrollDownButton = document.createElement("button");
    scrollDownButton.classList.add("button");
    scrollDownButton.setAttribute("onclick","scrollPage('bottom')");
    scrollDownButton.innerText="Go to the Bottom";
    
    headButtonDiv.appendChild(saveChangesButton);
    headButtonDiv.appendChild(undoDelButon);
	headButtonDiv.appendChild(scrollDownButton);

    let resp;
    let req = ["nothing yet","getTestNames"];
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            let testNames = JSON.parse(resp);
			
            for(let i=0;i<testNames.length;i++){
                let optEl = document.createElement("option");
                optEl.innerText=testNames[i].test_name;
                optEl.value=testNames[i].test_name;
                testSelect.appendChild(optEl);
            }
            submitSelectionDiv.appendChild(testSelect);
            submitSelectionDiv.appendChild(headButtonDiv);
            startDiv.appendChild(submitSelectionDiv);
        }
    }
    xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/editSelfTest.pl',true);
    xmlHttp.send(req);
}

//############################################################################################\\
                                //RETRIEVE TEST\\
//############################################################################################\\

function retrieveTest(fromSaved){
    document.getElementById('new-question').innerHTML = '';
    document.getElementById("feedback").innerText='';
    if(fromSaved=='saved'){
        feedback.className='';
        feedback.classList.add("success-class");
        feedback.innerText=("Saved!!");
        setTimeout( ()=> {
            document.getElementById("feedback").innerText='';
        },5000);
    }
    loadedTestName = document.getElementById("test-select").value;
    
    if(loadedTestName=='--select--'){
        let feedback = document.getElementById('feedback');
        feedback.className='';
        feedback.classList.add('error-class');
        feedback.innerText='Select a test please...';
        return;
    }

    if(loadedTest){
        let result = confirm("Loading a test will wipe any progress you haven't submitted.")
        if(result==false){
            return;
        }
    }
    deletedIds = [];
    deletedIdsCount = 0;
    document.getElementById("edit-test").innerHTML="";
    let resp;
    let req = [loadedTestName,"loadTest"];
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            let test = JSON.parse(resp);
            loadedTest=true;
            displayTest(test);
        }
    }
    xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/editSelfTest.pl',true);
    xmlHttp.send(req);
}

//############################################################################################\\
                                //CREATE MULTIPLE CHOICE CELL\\
//############################################################################################\\

function makeMCel(numInTest,optionCount,origin,corrAns,textValue){
    let option_div = document.createElement("div");
    option_div.id=numInTest+"opt"+optionCount;
	option_div.classList.add("option-div");

    let delButton = document.createElement("input");
    delButton.setAttribute("type","button");
    delButton.value="-";
    delButton.setAttribute("onclick","delOption('"+numInTest+"opt"+optionCount+",0')");//pass the id of the parent div, 0 cus not a dropdown

    option_div.appendChild(delButton);

    // let corr_text = document.createElement("span");
    // corr_text.innerText="Correct Answer? ";

    // option_div.appendChild(corr_text);

    let corr_ans_radio = document.createElement("input");
    corr_ans_radio.setAttribute("type","radio");
    corr_ans_radio.name=numInTest;

    if(origin=='onLoad'){
        let thisOpt = "opt"+optionCount;
        if(corrAns==thisOpt){
            corr_ans_radio.setAttribute("checked","true");
        }
    }else if(origin=='newQadd'){
        corr_ans_radio.setAttribute("checked","true");
    }

    option_div.appendChild(corr_ans_radio);

    let opt_text_label = document.createElement("span");
    opt_text_label.innerText =  alphabet[optionCount] + ") ";

    let opt_text = document.createElement("input")
    opt_text.setAttribute("type","text");
    opt_text.id=numInTest+"opt"+optionCount+"text";
    opt_text.value= textValue;
    opt_text.classList.add('opt-text-box');

    
    option_div.appendChild(opt_text_label);
    option_div.appendChild(opt_text);

    return option_div;
}

//############################################################################################\\
                                //MAKE DROP ELEMENT\\
//############################################################################################\\

function makeDropEl(numInTest,optionCount,textValue){
    let optDiv = document.createElement("div");
    optDiv.id= numInTest+"opt"+optionCount;
	optDiv.classList.add("option-div");

    let optSpan = document.createElement("span");
    optSpan.innerText = "Option "+optionCount+") ";

    let optTextBox = document.createElement("input");
    optTextBox.setAttribute("type","text");
    optTextBox.id=numInTest+"opt"+optionCount+"text";
    optTextBox.value=textValue;
    optTextBox.classList.add('opt-text-box')

    let delButton = document.createElement("input");
    delButton.setAttribute("type","button");
    delButton.value="-";
    delButton.setAttribute("onclick","delOption('"+numInTest+"opt"+optionCount+",true')");//pass the id of the parent div, true cus need to udate dropdowns

    optDiv.appendChild(delButton);
    optDiv.appendChild(optSpan);
    optDiv.appendChild(optTextBox);

    return optDiv;
}

//############################################################################################\\
                                //CREATE DROP DOWN SELECT\\
//############################################################################################\\

function createDropDownSelect(numInTest,answerNum,correctOption,allOptions,optMinusHidden){// allOpts/opt-hidden will be the same for the initial load

    let dropDownEl=document.createElement("select");
    dropDownEl.classList.add("drop-down-select");
    dropDownEl.id=numInTest+"ans"+answerNum;
    let firstOptNum = "x";//if the first option was delted, mark the second option as the first etc.
    for(let j=0;j<allOptions.length;j++){
        if(optMinusHidden.includes(allOptions[j])){
            if(firstOptNum =="x"){
                firstOptNum = j;
            }
            let optEl = document.createElement("option");
            optEl.id=numInTest+"ans"+answerNum+"opt"+j;
            optEl.innerText=allOptions[j];
            optEl.value= "opt"+j;//grab this for drop-down answers
            if(optEl.value==correctOption){
                optEl.selected=true;
                foundCorrectOpt = true;
            }
            dropDownEl.appendChild(optEl);
        }
    }
    return dropDownEl;
}

//############################################################################################\\
                                //CREATE IMAGE DIV\\
//############################################################################################\\

function createImageDiv(numInTest,imgNum,image,size){
    if(size!='small'&&size!='large'){//new images wont have a size yet
        size='small';
    }
    
    let delButton = document.createElement("input");
    delButton.setAttribute("type","button");
    delButton.value="Delete Image";
    delButton.classList.add("flex-button");
    delButton.setAttribute("onclick","delOption('"+numInTest+"img"+imgNum+",0')");//pass the id of the parent div, 0 cus not a drop down    

    let imgDiv = document.createElement("div");
    imgDiv.classList.add("image");
    imgDiv.id=numInTest+"img"+imgNum;

    let thisImg = document.createElement("img");
    thisImg.src=image;
    thisImg.setAttribute("alt",image);
	thisImg.id=numInTest+"img"+imgNum+"image";
	let classToAdd = size+"-img";
	thisImg.classList.add(classToAdd);
	
	let imgInfo = document.createElement("div");
	imgInfo.id=numInTest+"img"+imgNum+"info";

    let thisImgName = document.createElement("input");
    thisImgName.setAttribute("type","text");
    thisImgName.classList.add("text-box");
    
	let imgName = image.replace('https://www-bd.fnal.gov/ops/pdowdle/SelfTests/images/','');
    thisImgName.value=imgName;
    thisImgName.id=numInTest+"img"+imgNum+"name";
	
	let imgSize = document.createElement("select");
	imgSize.id=numInTest+"img"+imgNum+"size";
	let smallOpt = document.createElement("option");
	smallOpt.value="small";
	smallOpt.innerText="Small";
	let largeOpt = document.createElement("option");
	largeOpt.value="large";
	largeOpt.innerText="Large";
	imgSize.appendChild(smallOpt);
	imgSize.appendChild(largeOpt);
 
	imgSize.value=size;
	imgSize.setAttribute("onChange","changeSize('"+[thisImg.id,imgSize.id]+"')");

	
	imgInfo.appendChild(thisImgName);
	imgInfo.appendChild(imgSize);

    let imgLabel=document.createElement("label");
    imgLabel.innerText=numInTest+LCalphabet[imgNum]+")";

    imgDiv.appendChild(delButton);
    imgDiv.appendChild(imgLabel);
	imgDiv.appendChild(thisImg);

    imgDiv.appendChild(imgInfo);
    imgDiv.appendChild(thisImgName);

    return imgDiv;
}
//############################################################################################\\
                                //CREATE ANSWER SLOT\\
//############################################################################################\\
function createAnswerSlot(num,k,options,answers){
    let answerDiv = document.createElement("div");
    answerDiv.id=num+"ans"+k+"div";

    let corrOpt;
    if(answers=="new"){//if addinng a new slot, it wont have an answer associated with it yet
        corrOpt="opt0";
    }else{
        let corrAnsNum = answers[k].split("opt")[1];
        for(let j = 0;j<options.length;j++){
            if(j==corrAnsNum){
                corrOpt = "opt"+j;
                break;
            }
        }
    }

    let letter = document.createElement("label");
    letter.innerText=alphabet[k]+") ";
    answerDiv.appendChild(letter);
    answerDiv.appendChild(createDropDownSelect(num,k,corrOpt,options,options));

    let delButton = document.createElement("input");
    delButton.setAttribute("type","button");
    delButton.value="Delete Answer";
    delButton.setAttribute("onclick","delOption('"+num+"ans"+k+"div',true)");//pass the id of the parent div, true cus need ot update dropdowns
    
    answerDiv.appendChild(delButton);
    return answerDiv;
}
