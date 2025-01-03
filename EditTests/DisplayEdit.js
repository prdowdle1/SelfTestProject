let draggedDiv = null;
let dragDummy = document.createElement("div");
dragDummy.id = "drag-dummy"
dragDummy.style.backgroundColor = "grey";

dragDummy.addEventListener("drop", (evt) => evt.preventDefault());
dragDummy.addEventListener("dragover", (evt) => evt.preventDefault());

let hidDraggedDiv = false;

function startTheDrag(event){
    madeChange=true;
    if(!event.target.classList.contains("edit-question-div")){
        event.stopPropagation();
        return;
    }

    draggedDiv = event.target;
    dragDummy.style.width = draggedDiv.clientWidth + "px";
    dragDummy.style.height = draggedDiv.clientHeight + "px";

    event.stopPropagation();
}

function onDrag(event){
    if(event.target === draggedDiv && !hidDraggedDiv){
        hidDraggedDiv = true;
        draggedDiv.insertAdjacentElement("afterend", dragDummy);
        draggedDiv.style.display = "none";
    }else{
        return;
    }
}

function onDragEnd(event){

    if(!draggedDiv){
        return;
    }

    dragDummy.insertAdjacentElement("afterend", draggedDiv);
    draggedDiv.style.display = "";
    dragDummy.remove();

    draggedDiv = null;
    hidDraggedDiv = false;
    event.stopPropagation();

    // this does the renumbering:

    document.getElementById("edit-test").childNodes.forEach((node, i) => {
        node.querySelector(".number").innerText = `${i+1}.)`;
    });

    
}

function dragOver(event){

    if(!event.target.classList.contains("edit-question-div") || !draggedDiv){
        return
    }

    let clientRect = event.target.getBoundingClientRect();
    let clientY = clientRect.top;

    if(event.clientY > (clientY + event.target.clientHeight/2)){
        if(event.target.nextSibling !== dragDummy){
            event.target.insertAdjacentElement("afterend",dragDummy);
        }
    }else{
        if(event.target.previousSibling !== dragDummy){
            event.target.insertAdjacentElement("beforebegin",dragDummy);
        }
    }

    event.stopPropagation()
    event.preventDefault();
}

function onDrop(event){

    if(!draggedDiv){
        return;
    }

    event.preventDefault();
    event.stopPropagation()
}


function displayTest(testInfo){
    let test = [];

    let archive_div=document.getElementById('archive_div_id');
    archive_div.innerHTML='';
    archive_div.innerText = "Archived Dates: ";

    let archived_sel =document.createElement("select");
    archived_sel.id="archive-select";

    let viewButton = document.createElement("button");
    viewButton.classList.add("button");
    viewButton.setAttribute("onclick","getArchive()");
    viewButton.innerText="View Archive";

    archive_div.appendChild(archived_sel);
    archive_div.appendChild(viewButton);

    let optEl = document.createElement("option");
    optEl.innerText='--select archived--'
    optEl.value='--select--';
    optEl.disabled=true;
    archived_sel.appendChild(optEl);
    archived_sel.selectedIndex=0;

    for(let i =0;i<testInfo.length;i++){
        if(testInfo[i].num_in_test){//if it doesnt have this it is not a question but rather a distinct archived date
            test.push(testInfo[i]);
        }else{
            let optEl = document.createElement("option");
            optEl.innerText=testInfo[i].archived_date.split('.')[0];
            optEl.value=testInfo[i].archived_date;
            archived_sel.appendChild(optEl);
        }
    }
    testLength=test.length;
    for(let i =0;i<test.length;i++){
        let num = test[i].num_in_test;
        let numAnswers=test[i].num_answers;

        let question_div = document.createElement("div");
        question_div.id="question"+num;
		question_div.setAttribute("data-type",test[i].format);
		question_div.classList.add('edit-question-div');
		let question_text_div = document.createElement("div");
		question_text_div.classList.add("edit-question-text-div");
        let qNum = document.createElement("span");
        qNum.innerText=num+".) ";
        qNum.classList.add("number");
        let qText = document.createElement("textarea");
        // qText.setAttribute("type","text");
        // qText.setAttribute("size","100px");
        qText.id=num+"text";
        qText.value=test[i].question;
		qText.classList.add("edit-question-text-box");
        qText.onchange=function(){madeChange=true;};


        let delButton = document.createElement("input");
        delButton.setAttribute("type","button");
        delButton.value="Delete Question";
        delButton.setAttribute("onclick","delOption('question"+num+",0')");//pass the id of the parent div, 0 cus not a dropdown

		question_text_div.appendChild(qNum);
		question_text_div.appendChild(qText);

        question_div.appendChild(question_text_div);

        let options = [];
        let images = [];
        let answers = [];

        for(let j = 0;j<20;j++){//20 possible options
            let curr = "opt"+j;
            if(test[i][curr]!== null){
                options[j]=test[i][curr];
            }
        }
        optionsPerQ[i]=options;
        for(let j = 0;j<20;j++){//20 possible answers
            let curr = "answer"+j;
            if(test[i][curr]!== null){
                answers[j]=test[i][curr];
            }
        }
        ansPerQ[i]=answers;
        for(let j =0;j<10;j++){//10 possible images
            let curr = "img"+j;
            if(test[i][curr]!==null){
                images[j]=test[i][curr];
            }
        }

        let addOptButton = document.createElement("input");
        addOptButton.setAttribute("type","button");
        addOptButton.value="Add Option";

        let addImgButton = document.createElement("input");
        addImgButton.setAttribute("type","button");
        addImgButton.value="Add Image";
        addImgButton.setAttribute("onclick","addImage('"+num+"')");

        let imageGrid = document.createElement("div");
        imageGrid.classList.add("image-grid");
        imageGrid.id=num+"imgGrid";
        
        for(let k=0;k<images.length;k++){
            imageGrid.appendChild(createImageDiv(num,k,images[k]));
        }
        
        question_div.appendChild(imageGrid);

        if(test[i].format=="Multiple Choice"){
            let MCoptDiv = document.createElement("div");
            MCoptDiv.id="options"+num;
			MCoptDiv.classList.add('MC-opt-div');
            for(let j = 0;j<options.length;j++){
                MCoptDiv.appendChild(makeMCel(num,j,'onLoad',test[i].answer0,options[j]));
            }
            question_div.appendChild(MCoptDiv);
            
            addOptButton.setAttribute("onclick","addOption('"+[num,'Multiple Choice']+"')");

            question_div.appendChild(addOptButton);
            question_div.appendChild(addImgButton);
        }else if(test[i].format=='Drop Down'){
            question_div.classList.add("drop-down");
            createDropDown(question_div,num,options,answers,addOptButton,addImgButton,numAnswers);
        }else if(test[i].format=="Fill in the Blank"){
            createFillIn(question_div,num,test[i].opt0,addImgButton);
        }else if(test[i].format=="Multiple Select"){
            let multSelDiv = document.createElement("div");
            multSelDiv.id="options"+num;
			multSelDiv.classList.add('MC-opt-div');
            for(let j = 0;j<options.length;j++){
                multSelDiv.appendChild(makeMultSelEl(num,j,'onLoad',answers,options[j]));
            }
            question_div.appendChild(multSelDiv);
            
            addOptButton.setAttribute("onclick","addOption('"+[num,'Multiple Select']+"')");

            question_div.appendChild(addOptButton);
            question_div.appendChild(addImgButton);
        }
        question_div.appendChild(delButton);
        question_div.draggable = true;
        question_div.addEventListener("dragstart", startTheDrag);
        question_div.addEventListener("dragend", onDragEnd);
        question_div.addEventListener("dragover", dragOver);
        question_div.addEventListener("drop", onDrop);
        question_div.addEventListener("drag", onDrag);

        let inputs = question_div.querySelectorAll("input");

        for(let input of inputs){
            input.draggable = true;
            input.addEventListener("dragstart", (e) => {
                e.stopPropagation();
                e.preventDefault();
            })
        }

        document.getElementById("edit-test").appendChild(question_div);
    }

    let dropDownEl=document.createElement("select");
    dropDownEl.classList.add("edit-drop-down-select");
    dropDownEl.id="newQtype";
    dropDownEl.onchange=function(){madeChange=true;};

    let newQspan = document.createElement("span");
    newQspan.innerText = "New Question Type: "

    for(let i=0;i<questionTypes.length;i++){
        let optEl = document.createElement("option");
        optEl.innerText=questionTypes[i];
        optEl.value=questionTypes[i];
        dropDownEl.appendChild(optEl);
    }

    let newQbutton = document.createElement("input");
    newQbutton.setAttribute("type","button");
    newQbutton.setAttribute("onclick","createQuestion()");
    newQbutton.value="Add New Question";
    
    document.getElementById("new-question").appendChild(newQspan);
    document.getElementById("new-question").appendChild(dropDownEl);
    document.getElementById("new-question").appendChild(newQbutton);
    
    document.getElementById('editActiveButton').removeAttribute("disabled");
    document.getElementById('editImages').removeAttribute("disabled");
}

function createFillIn(question_div,num,answer,addImgButton){
    let ansSpan = document.createElement("span");
    ansSpan.innerText="Answer: ";
    let ansEl = document.createElement("input");
    ansEl.id = num+"ans";
    ansEl.value = answer;
    
    let br = document.createElement("br");

    question_div.appendChild(ansSpan);
    question_div.appendChild(ansEl);
    question_div.appendChild(br);
    question_div.appendChild(addImgButton)
}