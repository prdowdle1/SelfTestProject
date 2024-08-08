function addOption(props){// FOR DROPDOWNS passes the number of question to add the option to + 'dropdown',find id=optionsx where x is the num in test
    //for MC passes number of question + 'multiple choice' id=optionsx where x is the num in test
    let propsArr = props.split(',');
    let parentDivId = "options"+propsArr[0];
    let parentDiv = document.getElementById(parentDivId);
    let currChildCount = parentDiv.children.length;
    if(currChildCount>19){
        alert("you cannot have more than 20 options, sorry. IF this is inconvenient email someone.")
        return;
    }

    if(propsArr[1]=='Multiple Choice'){
        parentDiv.appendChild(makeMCel(propsArr[0],currChildCount,'add','noneed','edit'));
    }else if(propsArr[1]=='Drop Down'){
        parentDiv.appendChild(makeDropEl(propsArr[0],currChildCount,"edit"));
        //if they are adding an option, automatically update the dropdown menus for the answer options
    }
}

//############################################################################################\\
//############################################################################################\\

function addImage(numInTest){
    let imgGridId = numInTest+"imgGrid";
    let imgGrid = document.getElementById(imgGridId);
    let imgCount = imgGrid.children.length;
    if(imgCount>9){
        alert("you cannot have more than 10 images, sorry. IF this is inconvenient email someone.")
        return;
    }
    document.getElementById(imgGridId).appendChild(createImageDiv(numInTest,imgCount,"https://www-bd.fnal.gov/ops/pdowdle/SelfTests/images/placeholder.png"));
}

//############################################################################################\\
//############################################################################################\\

function delOption(props){
    let propsArr = props.split(',');
    let id = propsArr[0];
    let dropDown = propsArr[1];
    document.getElementById("feedback").innerText="";
    let delDiv = document.getElementById(id);
    delDiv.style.display="none";
    deletedIds[deletedIdsCount] = id;
    deletedIdsCount++;
    if(dropDown=="true"){//then update the dropdown for the QNUM!!
        let qNum=id[0];
        updateDropDowns(qNum);
    }
}

//############################################################################################\\
//############################################################################################\\

function undoDelete(){
    if(deletedIdsCount==0){
        let feedback = document.getElementById("feedback");
        feedback.className='';
        feedback.classList.add('error-class');
        feedback.innerText="Nothing to undo!";
        return;
    }
    document.getElementById("feedback").innerText="";
    let undoDiv = document.getElementById(deletedIds[deletedIds.length-1]);
    undoDiv.removeAttribute("style");
    deletedIds.pop();
    deletedIdsCount--;
}

//############################################################################################\\
//############################################################################################\\

function addAnswer(num){//FOR DROPDOWNS find id=dropGridx where x is the number inthe test to add an answer to
    let id = "dropGrid"+num;
    let parentDiv = document.getElementById(id);
    let currChildCount = parentDiv.children.length;
    if(currChildCount>19){
        alert("you cannot have more than 20 answers, sorry. IF this is inconvenient email someone.")
        return;
    }
    let numInTest = num;
    let numAns = ansPerQ[num-1].length;
    ansPerQ[num-1].push("opt0");
    parentDiv.appendChild(createAnswerSlot(numInTest,numAns,optionsPerQ[num-1],"new"));//-1 optionsPerQ since Qnum starts at 1
}

//############################################################################################\\
//############################################################################################\\

//need to update when undeleting drop down options??
function updateDropDowns(qNum){
    let parentId = "options"+qNum;
    let parentDiv = document.getElementById(parentId);
    let optionCount = parentDiv.children.length;
    let values = [];
    let valuesCount = 0;
    let originalValues = [];

    for(let i = 0;i<optionCount;i++){
        let divID = qNum+"opt"+i;
        let id = qNum+"opt"+i+"text";
        if(!deletedIds.includes(divID)){
            values[valuesCount]=document.getElementById(id).value;
            valuesCount++;
        }
        originalValues[i]=document.getElementById(id).value;
    }
    optionsPerQ[qNum-1] = values;
    let thisGridId = "dropGrid"+qNum;
    let dropDownCount = document.getElementById(thisGridId).children.length;
    let currValue = []

    for(let i=0;i<dropDownCount;i++){//save current selections
        let id = qNum+"ans"+i;
        currValue[i]=document.getElementById(id).value;
    }
    
    document.getElementById(thisGridId).innerHTML='';//clear dropgrid

    for(let i = 0;i<dropDownCount;i++){//rebuoild drop grid from scratch
        let answerDiv = document.createElement("div");
        answerDiv.id=qNum+"ans"+i+"div";
        let letter = document.createElement("label");
        letter.innerText=alphabet[i]+") ";

        let delButton = document.createElement("input");
        delButton.setAttribute("type","button");
        delButton.value="Delete Answer";
        delButton.setAttribute("onclick","delOption('"+qNum+"ans"+i+"div',true)");//pass the id of the parent div

        if(deletedIds.includes(qNum+"ans"+i+"div")){
            answerDiv.style.display="none";
        }
        
        answerDiv.appendChild(delButton);
        answerDiv.appendChild(letter);
        answerDiv.appendChild(createDropDownSelect(qNum,i,currValue[i],originalValues,values));  
        answerDiv.appendChild(delButton);
        document.getElementById(thisGridId).appendChild(answerDiv);
    }
    
}

//############################################################################################\\
//############################################################################################\\

function createQuestion(){
    let newQformat = document.getElementById("newQtype").value;
    testLength++;
	
    let question_div = document.createElement("div");
    question_div.id="question"+testLength;
	question_div.setAttribute("data-type",newQformat);
	question_div.classList.add("edit-question-div");
	
	let question_text_div = document.createElement("div");
	question_text_div.classList.add("edit-question-text-div");
	
    let qNum = document.createElement("span");
    qNum.innerText=testLength+".) ";

    let qText = document.createElement("input");
    qText.setAttribute("type","text");
    qText.setAttribute("size","100px");
    qText.id=testLength+"text";
    qText.value="Edit";
	qText.classList.add("edit-question-text-box");

    let delButton = document.createElement("input");
    delButton.setAttribute("type","button");
    delButton.value="Delete Question";
    delButton.setAttribute("onclick","delOption('question"+testLength+",0')");//pass the id of the parent div, 0 cus not a dropdown

    let addOptButton = document.createElement("input");
    addOptButton.setAttribute("type","button");
    addOptButton.value="Add Option";

    let addImgButton = document.createElement("input");
    addImgButton.setAttribute("type","button");
    addImgButton.value="Add Image";
    addImgButton.setAttribute("onclick","addImage('"+testLength+"')");

    let imageGrid = document.createElement("div");
    imageGrid.classList.add("image-grid");
    imageGrid.id=testLength+"imgGrid";
	
	question_text_div.appendChild(qNum);
    question_text_div.appendChild(qText);
    question_text_div.appendChild(delButton);
	
    question_div.appendChild(question_text_div);

    if(newQformat=="Multiple Choice"){
        let MCoptDiv = document.createElement("div");
        MCoptDiv.id="options"+testLength;
        MCoptDiv.appendChild(makeMCel(testLength,0,'newQadd',"noneed","edit"));
		MCoptDiv.classList.add("MC-opt-div");

        let options = ['edit'];
        let answers = ['opt0'];
        ansPerQ.push(answers);
        optionsPerQ.push(options);

        question_div.appendChild(MCoptDiv);

        addOptButton.setAttribute("onclick","addOption('"+[testLength,'Multiple Choice']+"')");
        
        question_div.appendChild(addOptButton);
        question_div.appendChild(addImgButton);
    }else if(newQformat=="Drop Down"){
        question_div.classList.add("drop-down");
        let options = ['edit'];
        let answers = ['opt0'];
        ansPerQ.push(answers);
        optionsPerQ.push(options);
        createDropDown(question_div,testLength,options,answers,addOptButton,addImgButton,1);
    }else if(newQformat=="Fill in the Blank"){
        createFillIn(question_div,testLength,"edit",addImgButton);
    }

    question_div.appendChild(imageGrid);
    document.getElementById("edit-test").appendChild(question_div);

}
//############################################################################################\\
//############################################################################################\\

function changeSize(props){
	let propsArr = props.split(',');
	let img = document.getElementById(propsArr[0]);
	let sizeSelection = document.getElementById(propsArr[1]);
	if(sizeSelection.value=='large'){
		img.classList.remove("small-img");
		img.classList.add("large-img");
	}else{
		img.classList.remove("large-img");
		img.classList.add("small-img");
	}
}

//############################################################################################\\
//############################################################################################\\

function scrollPage(direction){
	if(direction=='bottom'){
		window.scrollTo(0,document.body.scrollHeight);
	}else{window.scrollTo(0,0)}
}