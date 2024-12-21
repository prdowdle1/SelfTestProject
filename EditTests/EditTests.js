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
let testNames;
let madeChange = false;
let madeActiveChange=false;
let testInfo;

let ansPerQ = [];
let optionsPerQ = [];

let feedback;

let testLength = 0;

let questionTypes = ["Multiple Choice","Drop Down","Fill in the Blank","Multiple Select"];

window.addEventListener('load', function () {
    feedback=document.getElementById("feedback");
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
    
    let getTestDiv = document.createElement("div");
    
    let testSelect=document.createElement("select");
    testSelect.id="test-select";
    let optEl = document.createElement("option");
    optEl.innerText='--select--'
    optEl.value='--select--';
    optEl.disabled=true;
    testSelect.appendChild(optEl);
    testSelect.selectedIndex=0;

    let viewing = document.createElement("div");
    viewing.id='visible-test';
    viewing.classList.add('visible-test-name')

    let lastUpdate = document.createElement("span");
    lastUpdate.id='lastUpdated';
    lastUpdate.classList.add('last-updated');

    let getTestButton = document.createElement("button");
    getTestButton.classList.add("button");
    getTestButton.setAttribute("onclick","retrieveTest()");
    getTestButton.innerText="Get Test";
    getTestButton.id="getTestButton";

    getTestDiv.appendChild(testSelect);
    getTestDiv.appendChild(getTestButton);

    let headButtonDiv = document.createElement("div");
    headButtonDiv.id="headButtons";

    let undoDelButon = document.createElement("button");
    undoDelButon.classList.add("button");
    undoDelButon.setAttribute("onclick","undoDelete()");
    undoDelButon.innerText="Undo Delete";

    let saveChangesButton= document.createElement("button");
    saveChangesButton.classList.add("button");
    saveChangesButton.setAttribute("onclick","saveChanges()");
    saveChangesButton.innerText="Save Questions";
    saveChangesButton.id="saveChangesButton";
    
    
    let uploadImageButton = document.createElement("button");
    uploadImageButton.classList.add("button");
    uploadImageButton.setAttribute("onclick","displayUpload()");
    uploadImageButton.innerText="Upload Image";

    let editActiveButton = document.createElement("button");
    editActiveButton.classList.add("button");
    editActiveButton.setAttribute("onclick","editActive()");
    editActiveButton.innerText="Edit Active Tests";
    editActiveButton.id="editActiveButton";
	
	let scrollDownButton = document.createElement("button");
    scrollDownButton.classList.add("button");
    scrollDownButton.setAttribute("onclick","scrollPage('bottom')");
    scrollDownButton.innerText="Go to the Bottom";
    
    headButtonDiv.appendChild(saveChangesButton);
    headButtonDiv.appendChild(undoDelButon);
	headButtonDiv.appendChild(scrollDownButton);
    headButtonDiv.appendChild(uploadImageButton);
    headButtonDiv.appendChild(editActiveButton);

    let resp;
    let req = ["nothing yet","getTestNames"];
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            testNames = JSON.parse(resp);
            for(let i=0;i<testNames.length;i++){
                let optEl = document.createElement("option");
                optEl.innerText=testNames[i].test_name;
                optEl.value=testNames[i].test_name;
                testSelect.appendChild(optEl);
            }
            submitSelectionDiv.appendChild(getTestDiv);
            submitSelectionDiv.appendChild(headButtonDiv);
            startDiv.appendChild(submitSelectionDiv);
            startDiv.appendChild(viewing);
            startDiv.appendChild(lastUpdate)
        }
    }
    xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/editSelfTest.pl',true);
    xmlHttp.send(req);
}

//############################################################################################\\
                                //RETRIEVE TEST\\
//############################################################################################\\

function retrieveTest(fromSaved,savedTest){
    document.getElementById('editActiveButton').setAttribute("disabled","disabled");
    if(loadedTest&&(madeChange||madeActiveChange)){
        let result = confirm("Loading a test will wipe any progress you haven't submitted.")
        if(result==false){
            document.getElementById('editActiveButton').removeAttribute("disabled");
            return;
        }
    }
    loadedTestName = document.getElementById("test-select").value;
    if(fromSaved=='saved'){
        feedback.className='';
        feedback.classList.add("success-class");
        feedback.innerText=("Saved!!");
        loadedTestName=savedTest;
        setTimeout( ()=> {
            feedback.innerText='';
        },5000);
    }else{feedback.innerText='';}
    document.getElementById('new-question').innerHTML = '';
    if(loadedTestName=='--select--'){
        feedback.className='';
        feedback.classList.add('error-class');
        feedback.innerText='Select a test please...';
        document.getElementById('editActiveButton').removeAttribute("disabled");
        return;
    }
    optionsPerQ = [];
    ansPerQ= [];
    madeChange=false;
    madeActiveChange=false;
    document.getElementById('visible-test').innerHTML = loadedTestName;

    let savebutton = document.getElementById('saveChangesButton');

    savebutton.setAttribute("onclick","saveChanges()");
    savebutton.innerHTML="Save Questions";

    deletedIds = [];
    deletedIdsCount = 0;
    document.getElementById("edit-test").innerHTML="";
    let resp;
    let req = [loadedTestName,"loadTest"];
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            let info = JSON.parse(resp);
            let updatedFormat = info[0].last_updated.split('.')[0];
            let test = info.slice(1,info.length);
            loadedTest=true;
            document.getElementById('lastUpdated').innerHTML = " (Updated: " +updatedFormat+")";
            displayTest(test);
        }else{

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
    corr_ans_radio.classList.add("radio-opt");

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

    let opt_text = document.createElement("textarea")
    // opt_text.setAttribute("type","text");
    opt_text.id=numInTest+"opt"+optionCount+"text";
    opt_text.value= textValue;
    opt_text.classList.add('opt-text-box');
    opt_text.onchange=function(){madeChange=true;};


    
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

    let optTextBox = document.createElement("textarea");
    // optTextBox.setAttribute("type","text");
    optTextBox.id=numInTest+"opt"+optionCount+"text";
    optTextBox.value=textValue;
    optTextBox.classList.add('opt-text-box')
    optTextBox.onchange=function(){madeChange=true;};


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

function createImageDiv(numInTest,imgNum,image){
    
    let delButton = document.createElement("input");
    delButton.setAttribute("type","button");
    delButton.value="Delete Image";
    delButton.classList.add("flex-button");
    delButton.setAttribute("onclick","delOption('"+numInTest+"img"+imgNum+",0')");//pass the id of the parent div, 0 cus not a drop down    

    let imgDiv = document.createElement("div");
    imgDiv.classList.add("image");
    imgDiv.id=numInTest+"img"+imgNum;

    let imageWrapper = document.createElement('div');
    imageWrapper.classList.add("image-wrapper");

    let thisImg = document.createElement("img");
    thisImg.src=image;
    thisImg.setAttribute("alt",image);
	thisImg.id=numInTest+"img"+imgNum+"image";

    const urlParams = new URLSearchParams(thisImg.src.split('?')[1]);
    if(urlParams.get('width')){
        imageWrapper.style.width = urlParams.get('width') + "px";
    }

    imageWrapper.appendChild(thisImg);
	
	let imgInfo = document.createElement("div");
	imgInfo.id=numInTest+"img"+imgNum+"info";

    let thisImgName = document.createElement("select");
    thisImgName.classList.add("image-select");
    thisImgName.numInTest = numInTest;
    thisImgName.imgNum = imgNum;
    thisImgName.imgDiv = imgDiv;
    thisImgName.onchange=function(){madeChange=true;};
    
	let imgName = image.replace('https://www-bd.fnal.gov/ops/pdowdle/SelfTests/images/','');
    imgName = imgName.split("?")[0];
    thisImgName.id=numInTest+"img"+imgNum+"name";
    thisImgName.imgName = imgName;

    populateNames(thisImgName)
	
	imgInfo.appendChild(thisImgName);

    let imgLabel=document.createElement("label");
    let howManyIs = 'i';
    for(let j = 0;j<imgNum;j++){
        howManyIs+='i';
    }
    imgLabel.innerText=numInTest+howManyIs+")";

    imgDiv.appendChild(delButton);
    imgDiv.appendChild(imgLabel);
	imgDiv.appendChild(imageWrapper);

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

function populateNames(thisImgName){
    let numInTest = thisImgName.numInTest;
    let imgNum = thisImgName.imgNum;
    let imgDiv = thisImgName.imgDiv;
    let imgName = thisImgName.imgName;
    
    thisImgName.innerHTML = '';

    let getNames = new XMLHttpRequest();

    getNames.open("GET", "https://www-bd.fnal.gov/cgi-mcr/pdowdle/getImageNames.pl");
    getNames.overrideMimeType("application/json");
    getNames.onload = () => {
        let imageNames = JSON.parse(getNames.response).sort();
        
        imageNames.forEach((el) => {
            if(el[0] !== '.'){
                let option = document.createElement('option');
                option.value = el;
                option.innerText = el;
                thisImgName.appendChild(option);
            }
        });

        thisImgName.addEventListener("change", () => {

            let positioner = imgDiv.previousElementSibling;
            let pos = 'before';

            if(!positioner){
                positioner = imgDiv.nextElementSibling;
                pos = "after";
            }

            if(!positioner){
                positioner = imgDiv.parentNode;
                pos = "child";
            }

            let img_el = document.getElementById((numInTest)+"img"+imgNum+"image");
            let queryParams = `?width=${img_el.clientWidth}`
            let img_name = thisImgName.value;
            let img_src = 'https://www-bd.fnal.gov/ops/pdowdle/SelfTests/images/'+ img_name + queryParams;

            imgDiv.remove();
            let newImg = createImageDiv(numInTest,imgNum, img_src);

            switch(pos){
                case "before":
                    positioner.after(newImg);
                    break;
                case "after":
                    positioner.before(newImg);
                    break;
                default:
                    positioner.appendChild(newImg);
            }
        })

        thisImgName.value=imgName;
    }
    getNames.send();
}

function displayUpload(){

    let dialog = document.createElement("dialog");
    dialog.classList.add("upload-file-modal");

    dialog.innerText = "Upload Image";

    let uploadForm = document.createElement("form");
    uploadForm.method="post"; 
    uploadForm.enctype="multipart/form-data";
    uploadForm.addEventListener("submit", (event) => {
        submitImage(event);
        dialog.close();
        dialog.remove();
    });

    let filenameInput = document.createElement("input");
    filenameInput.type = "text";
    filenameInput.name = "filename";

    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.name = "questionImage";

    fileInput.addEventListener("change", (event) => {
        filenameInput.value = fileInput.value.split("\\").pop();
    });


    let submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.classList.add("button");

    uploadForm.appendChild(filenameInput);
    uploadForm.appendChild(fileInput);
    uploadForm.appendChild(submitButton);

    dialog.appendChild(uploadForm);

    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.classList.add("button");
    closeButton.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
    })

    dialog.appendChild(closeButton);

    document.querySelector("body").appendChild(dialog);
    dialog.showModal();

}

function editActive(){
    document.getElementById("getTestButton").setAttribute("disabled","disabled");
    if(loadedTest&&madeChange){
        let result = confirm("Switching to active editing will wipe any progress you haven't submitted.")
        if(result==false){
            document.getElementById("getTestButton").removeAttribute("disabled");
            return;
        }
    }
    deletedIds = [];
    deletedIdsCount = 0;
    document.getElementById('new-question').innerHTML = '';
    feedback.innerText='';
    document.getElementById("edit-test").innerHTML="";
    document.getElementById('visible-test').innerHTML = "Activate/Deactivate Tests!!!";

    let resp;
    let req = ["nothing yet","getTestNames"];
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            let theNames = JSON.parse(resp);
            displayActive(theNames);
        }
    }
    xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/editSelfTest.pl',true);
    xmlHttp.send(req);
}

function displayActive(theNames){
    let activeGrid = document.createElement('div');
    activeGrid.classList.add("edit-active-grid");

    let column0Header = document.createElement('div');
    column0Header.innerHTML = "Active?";
    column0Header.classList.add("active-header");
    let column1Header = document.createElement('div');
    column1Header.innerHTML = "Test Name";
    column1Header.classList.add("active-header");
    
    activeGrid.appendChild(column0Header);
    activeGrid.appendChild(column1Header);

    for(let i =0;i<theNames.length;i++){
        let checkDiv = document.createElement("div");
        let checkActive = document.createElement("input");
        checkActive.setAttribute("type","checkbox");
        checkActive.id="active"+i;
        checkActive.onchange=function(){madeActiveChange=true;}
        if(theNames[i].active){
            checkActive.setAttribute("checked","true");
        }
        checkDiv.appendChild(checkActive);
        let textDiv = document.createElement("div");
        textDiv.innerText=theNames[i].test_name;
        activeGrid.appendChild(checkActive);
        activeGrid.appendChild(textDiv);
    }
    loadedTest = true;
    document.getElementById('edit-test').appendChild(activeGrid);

    let savebutton = document.getElementById('saveChangesButton')
    savebutton.setAttribute("onclick","saveActive()");
    savebutton.innerHTML='Save Active List';

    document.getElementById("getTestButton").removeAttribute("disabled");
}

function submitImage(event) {
    var url = 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/uploadImg.pl';
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
  
    request.send(new FormData(event.target)); // create FormData from form that triggered event
    event.preventDefault();

    setTimeout(() => {
        let dropDowns = document.querySelectorAll(".image-select");
        dropDowns.forEach((el) => {
            populateNames(el);
        });
    }, 500);

  }