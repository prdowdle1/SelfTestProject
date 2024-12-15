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

let ansPerQ = [];
let optionsPerQ = [];

let testLength = 0;

let questionTypes = ["Multiple Choice","Drop Down","Fill in the Blank","Multiple Select"];

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

    let viewing = document.createElement("div");
    viewing.id='visible-test';
    viewing.classList.add('visible-test-name')

    let headButtonDiv = document.createElement("div");
    headButtonDiv.id="headButtons";
    let getTestButton = document.createElement("button");
    getTestButton.classList.add("button");
    getTestButton.setAttribute("onclick","retrieveTest()");
    getTestButton.innerText="Get Test";
    getTestButton.id="getTestButton";
    headButtonDiv.appendChild(getTestButton);

    let undoDelButon = document.createElement("button");
    undoDelButon.classList.add("button");
    undoDelButon.setAttribute("onclick","undoDelete()");
    undoDelButon.innerText="Undo Delete";

    let saveChangesButton= document.createElement("button");
    saveChangesButton.classList.add("button");
    saveChangesButton.setAttribute("onclick","saveChanges()");
    saveChangesButton.innerText="Save Changes";
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
            submitSelectionDiv.appendChild(testSelect);
            submitSelectionDiv.appendChild(headButtonDiv);
            startDiv.appendChild(submitSelectionDiv);
            startDiv.appendChild(viewing);
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
    if(loadedTest){
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
            document.getElementById("feedback").innerText='';
        },5000);
    }
    document.getElementById('new-question').innerHTML = '';
    document.getElementById("feedback").innerText='';
    optionsPerQ = [];
    ansPerQ= [];
    if(loadedTestName=='--select--'){
        let feedback = document.getElementById('feedback');
        feedback.className='';
        feedback.classList.add('error-class');
        feedback.innerText='Select a test please...';
        document.getElementById('editActiveButton').removeAttribute("disabled");
        return;
    }
    document.getElementById('visible-test').innerHTML = loadedTestName;
    document.getElementById('saveChangesButton').setAttribute("onclick","saveChanges()");
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
        }else{
            document.getElementById('editActiveButton').removeAttribute("disabled");
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
    if(loadedTest){
        let result = confirm("Switching to active editing will wipe any progress you haven't submitted.")
        if(result==false){
            document.getElementById("getTestButton").removeAttribute("disabled");
            return;
        }
    }
    deletedIds = [];
    deletedIdsCount = 0;
    document.getElementById('new-question').innerHTML = '';
    document.getElementById("feedback").innerText='';
    document.getElementById("edit-test").innerHTML="";
    document.getElementById('visible-test').innerHTML = "Activate/Deactivate Tests!!!";

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

    for(let i =0;i<testNames.length;i++){
        let checkDiv = document.createElement("div");
        let checkActive = document.createElement("input");
        checkActive.setAttribute("type","checkbox");
        checkActive.id="active"+i;
        if(testNames[i].active){
            checkActive.setAttribute("checked","true");
        }
        checkDiv.appendChild(checkActive);
        let textDiv = document.createElement("div");
        textDiv.innerText=testNames[i].test_name;
        activeGrid.appendChild(checkActive);
        activeGrid.appendChild(textDiv);
    }
    loadedTest = true;
    document.getElementById('edit-test').appendChild(activeGrid);

    document.getElementById('saveChangesButton').setAttribute("onclick","saveActive()");

    document.getElementById("getTestButton").removeAttribute("disabled");
    return;
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
