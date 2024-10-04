let testCats = ["Safety","Linac","Booster","MI/RR","External Beams","Controls","Muon","Intro"];
let levels=["Level 1","Level 2","Level 3","Level 4"];
let introLevels = ["Concepts","Locations","Operator","ACNET","Safety"];
let levelsToUse;
let catagoriesHTML;
let levelsHTML;
let addedLevels = false;
let clickedOnTest = false;
let currentTestDisplayed = '';
let alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
let LCalphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

let questionCount = 0;
let selMachine = '';

let questionFormats = [];
let numOptions = [];
let numAnswersArr = [];
let globalArrCount = 0;

let graded_que = [];
let the_grade_div = document.createElement("div");
the_grade_div.id='displayGrade';

let wrong_list_div = document.createElement("div");
wrong_list_div.id='displayWrongNums';

let wrong_list = [];
let wrong_list_count = 0;

let dropDownWrong = [];
let multSelectWrong = [];

window.addEventListener('load', function () {
    catagoriesHTML = document.getElementById("catagories");
     generatePage();
  });

function generatePage(){
    let getNames = new XMLHttpRequest();
    let doggies = [];
    let prevRNG;
    let rng;

    getNames.open("GET", "https://www-bd.fnal.gov/cgi-mcr/pdowdle/getDogImages.pl");
    getNames.overrideMimeType("application/json");
    getNames.onload = () => {
        let imageNames = JSON.parse(getNames.response);
        imageNames.forEach((el) => {
            if(el[0] !== '.'){
                doggies.push(el);
            }
        });
        rng = Math.floor(Math.random() * (doggies.length));
        document.getElementById('cutedog').src='https://www-bd.fnal.gov/ops/pdowdle/SelfTests/dogs/'+doggies[rng];
        setInterval( ()=> {
            rng = Math.floor(Math.random() * (doggies.length));
            if(rng===prevRNG){
                while(rng===prevRNG){
                    rng = Math.floor(Math.random() * (doggies.length));
                }
            }
            prevRNG = rng;
            document.getElementById('cutedog').src='https://www-bd.fnal.gov/ops/pdowdle/SelfTests/dogs/'+doggies[rng];
        },10000);
    }
    getNames.send();

    for(let i=0;i<testCats.length;i++){
        let buttonEl = document.createElement("button");
        buttonEl.id=testCats[i];
        buttonEl.innerText=testCats[i];
        buttonEl.classList.add("button");
        buttonEl.setAttribute("onclick","displayLevels('"+testCats[i]+"')");
        catagoriesHTML.appendChild(buttonEl);
    }
}

function displayLevels(machine){
    selMachine = machine;//for global
    levelsHTML = document.querySelector("#test-levels");
    for(let i=0;i<testCats.length;i++){
        document.getElementById(testCats[i]).style.backgroundColor="";
    }
    document.getElementById(machine).style.backgroundColor="green";

    levelsHTML.innerHTML = "";
    let levelsToUse = levels;
    if(machine=='Intro'){
        levelsToUse  =introLevels;
        machToUse='';
    }else{
        machToUse=machine+ " ";
    }
    for(let i=0;i<levelsToUse.length;i++){
        let buttonEl = document.createElement("button");
        if(levelsToUse[i]=='Safety'){//differentiate between safety test and safety category
            buttonEl.id=machToUse+levelsToUse[i]+'test';
        }else{buttonEl.id=machToUse+levelsToUse[i];}
        buttonEl.innerText=machToUse+levelsToUse[i];
        buttonEl.classList.add("levelButton");
        buttonEl.classList.add("button");
        buttonEl.setAttribute("onclick","generateTest('"+machToUse+levelsToUse[i]+"')");
        levelsHTML.appendChild(buttonEl);
    }
    addedLevels=true;
}

function generateTest(test){
    if(currentTestDisplayed==test){return;}
    if(clickedOnTest&&warnings){
        let result = confirm("If you switch now you will lose any prgress on the current test.");
        if(result==false){
            return;
        }
    }
    let machToUse;
    dropDownWrong=[];
    multSelectWrong=[];
    if(introLevels.includes(test)){
        levelsToUse = introLevels;
        selMachine='';
        machToUse='';
    }else{
        levelsToUse=levels;
        machToUse=selMachine + " ";
    }
    for(let i=0;i<levelsToUse.length;i++){
        let id =machToUse + levelsToUse[i];
        document.getElementById(id).style.backgroundColor="";
    }
    let thisId = test;
    if(test=='Safety'){//differentiate between safety test and safety category
        thisId=test+'test';
    }

    document.getElementById(thisId).style.backgroundColor="green";

    document.querySelectorAll('button.levelButton').forEach(elem => {//disable buttons to prevent spamming of requests
        elem.disabled = true;
    });

    let testDiv = document.querySelector("#test");
    testDiv.innerHTML="";
    questionFormats = [];
    graded_que = [];
    wrong_list = [];
    globalArrCount = 0;
    answer_count=0;
    wrong_list_count = 0;
    questionCount = 0;
    currentTestDisplayed = test;
    clickedOnTest=true;

    let resp;
    let req = [test,"getQuestions"];
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            returnTest(JSON.parse(resp),test);
        }
    }
    xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/getSelfTest.pl',true);
    xmlHttp.send(req);
}

function returnTest(test,title){
    
    document.querySelector("#test-title").innerHTML=title;
    let thisTestDiv=document.querySelector("#test");
    questionCount = test.length;

    for(let i = 0;i<test.length;i++){//20 possible answrs
        let options = [];
        let images = [];
        for(let j = 0;j<20;j++){//20 possible options
            let curr = "opt"+j;
            if(test[i][curr]!== null){
                options[j]=test[i][curr];
            }
        }
        for(let j =0;j<10;j++){//10 possible images
            let curr = "img"+j;
            if(test[i][curr]!==null){
				images[j]=test[i][curr];
            }
        }
        questionFormats[globalArrCount] = test[i].format;
        numOptions[globalArrCount] = options.length;
        numAnswersArr[globalArrCount]=test[i].num_answers;
        globalArrCount++;

        thisTestDiv.appendChild(buildQuestion(test[i].format,test[i].num_in_test,test[i].question,test[i].num_answers,options,images));
        thisTestDiv.appendChild(document.createElement("br"));
    }
    let gradeButton = document.createElement("button");
    gradeButton.classList.add("button");
    gradeButton.innerText = "Grade Test";
    gradeButton.id="gradeButton";
    gradeButton.setAttribute("onclick","getAnswers()");

    let hideWrongButton = document.createElement("button");
    hideWrongButton.classList.add("button");
    hideWrongButton.innerText = "Clear Grading";
    hideWrongButton.id="hideWrongButton";
    hideWrongButton.style.display='none';
    hideWrongButton.setAttribute("onclick","clearWrong()");

    let which_are_wrong = document.createElement("button");
    which_are_wrong.id="display-wrong";
    which_are_wrong.setAttribute("onclick","alert('Grade the test first')");
    which_are_wrong.innerText = "What did I get wrong?";
    which_are_wrong.classList.add("button");

    thisTestDiv.appendChild(gradeButton);
    thisTestDiv.appendChild(which_are_wrong);
    thisTestDiv.appendChild(hideWrongButton);

	let br0 = document.createElement("br");
	thisTestDiv.appendChild(br0);
	
	let scrollUpButton = document.createElement("button");
    scrollUpButton.classList.add("button");
    scrollUpButton.setAttribute("onclick","scrollPage('top')");
    scrollUpButton.innerText="Go to the Top";
	
	thisTestDiv.appendChild(scrollUpButton)
	
    document.querySelectorAll('button.levelButton').forEach(elem => {//re-enable buttons once the test is done being built
        elem.disabled = false;
    });
}

function buildQuestion(format,num,question,numAnswers,options,images){
    let question_div = document.createElement("div");
    question_div.classList.add("question-div");
    question_div.id='q'+num;

    let qTextDiv = document.createElement("div");
    qTextDiv.classList.add("question-text");
    qTextDiv.id='q'+num+'text';
    qTextDiv.innerHTML=num+". "+question;
    question_div.appendChild(qTextDiv);

    let imageGrid = document.createElement("div");
    imageGrid.classList.add("image-grid");
    //deal with images
    
    for(let i=0;i<images.length;i++){
        let imgDiv = document.createElement("div");
        imgDiv.classList.add("image");

        let thisImg = document.createElement("img");
        thisImg.src=images[i];
		let imgid = num+"img"+i;
        thisImg.id=imgid;

        const urlParams = new URLSearchParams(thisImg.src.split('?')[1]);

        if(urlParams.get('width')){
            thisImg.style.width = urlParams.get('width') + "px";
        }

        let imgLabel=document.createElement("label");
        let howManyIs = 'i';
        for(let j = 0;j<i;j++){
            howManyIs+='i';
        }
        imgLabel.innerText=num+howManyIs+")";
        imgLabel.setAttribute("for",imgid)

        imgDiv.appendChild(imgLabel);
        imgDiv.appendChild(thisImg);
        imageGrid.appendChild(imgDiv);
    }
//deal with muliple choice questions
    if(format=="Multiple Choice"){
        question_div.classList.add("multiple-choice");
        if(images.length>0){question_div.appendChild(imageGrid);}
        for(let i =0;i<options.length;i++){
            let optDiv = document.createElement("div");

            let inputDiv = document.createElement("input");
            inputDiv.type="radio";
            inputDiv.name=num;//num_in_test need to be name so that it groups the radio buttons together
            inputDiv.classList.add("option-input");
            inputDiv.value="opt"+i;//grab this for MC answrs

            optDiv.appendChild(inputDiv);

            let optText = document.createElement("span");
            optText.innerText = alphabet[i] + ") " +options[i];
            optDiv.appendChild(optText);
            question_div.appendChild(optDiv);
        }
    }else if(format=="Drop Down"){//deal with drop downs
        question_div.classList.add("drop-down");

        let dropQgrid = document.createElement("div");
        dropQgrid.classList.add("drop-Q-grid"); 

        let dropGridDiv = document.createElement("div");
        dropGridDiv.classList.add("drop-down-grid");

        imageGrid.classList.add('drop-down-image-grid');

        dropQgrid.appendChild(dropGridDiv);
        dropQgrid.appendChild(imageGrid);

        for(let i =0;i<numAnswers;i++){
            let letter = document.createElement("label");
            letter.innerText=alphabet[i]+") ";
            dropGridDiv.appendChild(letter);

            let dropDownEl=document.createElement("select");
            dropDownEl.classList.add("drop-down-select");
            dropDownEl.id="q"+num+"ans"+i;//needs to be num_in_test for grading

            let nullOpt = document.createElement("option");
            nullOpt.innerText = "--select--";
            nullOpt.value=null;
            nullOpt.selected=true;
            dropDownEl.appendChild(nullOpt);
    
            for(let j=0;j<options.length;j++){
                let optEl = document.createElement("option");
                optEl.id="num"+num+"ans"+i+"opt"+j;
                optEl.innerText=options[j];
                optEl.value= "opt"+j;//grab this for drop down answers
                dropDownEl.appendChild(optEl);
            }
            dropGridDiv.appendChild(dropDownEl);
        }
        question_div.appendChild(dropQgrid);
    }else if(format=="Fill in the Blank"){//deal with fitb
        question_div.classList.add("fill-blank");

        let inputDiv = document.createElement("input");
        inputDiv.type="text";
        inputDiv.id=num;
        inputDiv.classList.add("input-text-field");
        question_div.appendChild(inputDiv);
        if(images.length>0){question_div.appendChild(imageGrid);}
    }else if(format=="Multiple Select"){
        question_div.classList.add('multiple-selection');
        for(let i =0;i<options.length;i++){
            let checkDiv = document.createElement("div");
            checkDiv.classList.add('mult-select-q');

            let checkBox = document.createElement("input");
            checkBox.setAttribute("type","checkbox");
            checkBox.id= 'q'+num+'ans'+i;
            let optText = document.createElement("span");
            optText.innerText = alphabet[i] + ") " +options[i];

            checkDiv.appendChild(checkBox);
            checkDiv.appendChild(optText);
            question_div.appendChild(checkDiv);
        }
        if(images.length>0){question_div.appendChild(imageGrid);}
    }

    return question_div;
}