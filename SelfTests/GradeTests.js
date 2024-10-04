function getAnswers(){
    document.getElementById("gradeButton").disabled=true;
    let userAnswers = [];
    for(let i =0;i<questionCount;i++){
        let answerElement= [];
        if(questionFormats[i]=="Multiple Choice"){
            let qName = i+1;//numbers on the test dont start at 0 lol
            let answered = document.querySelector("input[name='"+qName+"']:checked");
            if(answered){
                answerElement[i] = document.querySelector("input[name='"+qName+"']:checked").value; 
            }else{
                answerElement[i]=null;
            }
        }else if(questionFormats[i]=="Drop Down"){
            let ansArr = [];
            for(let j =0; j<numAnswersArr[i];j++){
                let eyePlusOne = i+1;
                let qId = "q"+eyePlusOne+"ans"+j;
                ansArr[j] = document.getElementById(qId).value;
            }
            answerElement[i]=ansArr;
        }else if(questionFormats[i]=="Fill in the Blank"){
            answerElement[i] = document.getElementById(i+1).value;
        }else if(questionFormats[i]=="Multiple Select"){
            let ansArr = [];
            for(let j =0;j<numAnswersArr[i];j++){
                let eyePlusOne = i+1;
                let qId = "q"+eyePlusOne+"ans"+j;
                ansArr[j] = document.getElementById(qId).checked;
            }
            answerElement[i]=ansArr;
        }
        userAnswers[i]= answerElement[i];
    }
    let resp;
    let req = [currentTestDisplayed,"getAnswers"];
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            gradeTest(JSON.parse(resp),userAnswers);
        }
    }
    xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/getSelfTest.pl',true);
    xmlHttp.send(req);
    document.getElementById("gradeButton").disabled=false;
}

function gradeTest(corrAns,userAns){
    clearWrong();
    dropDownWrong=[];
    multSelectWrong=[];
    the_grade_div.innerHTML="";
    wrong_list_div.innerHTML = "";
    wrong_list = [];
    wrong_list_count = 0;

    graded_que = [];
    for(let i =0;i<corrAns.length;i++){
        if(corrAns[i].format=="Multiple Choice"){
            if(corrAns[i].answer0==userAns[i]){
                graded_que[i]="correct";
            }else{
                graded_que[i]="wrong";
            }
        }else if(corrAns[i].format=="Drop Down"){
            let mult_ans = [];
            let obj = {num_in_test:corrAns[i].num_in_test}
            let wrongArr = [];
            let foundWrong = false;
            for(let j =0;j<userAns[i].length;j++){//20 possible options
                let id = "answer"+j;
                let ansNum = 'ans'+j;
                if(corrAns[i][id]==userAns[i][j]){
                    mult_ans[j]="correct";
                }else{
                    foundWrong=true;
                    mult_ans[j]="wrong";
                    wrongArr.push(ansNum);
                }
            }
            if(foundWrong){
                obj['wrong']=wrongArr;
                dropDownWrong.push(obj)
            };
            graded_que[i]=mult_ans;
        }else if(corrAns[i].format=="Fill in the Blank"){
            let userInp = document.getElementById(corrAns[i].num_in_test).value;
            let LCuInp = userInp.toLowerCase();
            let correct = corrAns[i].opt0.toLowerCase();
            if(correct==LCuInp){
                graded_que[i]="correct";
            }else{
                graded_que[i]="wrong";
            }
        } else if(corrAns[i].format=="Multiple Select"){
            let mult_ans = [];
            let obj = {num_in_test:corrAns[i].num_in_test}
            let wrongArr = [];
            let foundWrong = false;
            for(let j =0;j<userAns[i].length;j++){
                let tmpAns;
                if(userAns[i][j]==true){//DB spits it out as "1" or "0" not T/F or 1/0
                    tmpAns="1";
                }else{tmpAns="0"}

                let id = "answer"+j;
                let ansNum="ans"+j;
                if(corrAns[i][id]==tmpAns){
                    mult_ans[j]="correct";
                }else{
                    foundWrong=true;
                    mult_ans[j]="wrong";
                    wrongArr.push(ansNum)
;                }
            }
            if(foundWrong){
                obj['wrong']=wrongArr;
                multSelectWrong.push(obj)
            };
            graded_que[i]=mult_ans;
        }
    }

    let correct_count = 0;
    for(let i = 0;i<graded_que.length;i++){
        if(!(Array.isArray(graded_que[i]))){
            if(graded_que[i]=='wrong'){
                wrong_list[wrong_list_count]=i+1;
                wrong_list_count++;
            }else{
                correct_count=correct_count+1;
            }
        }else{
            if(graded_que[i].includes('wrong')){
                wrong_list[wrong_list_count]=i+1;
                wrong_list_count++;
            }
            let partialCount=0;
            let totalCount=graded_que[i].length;
            for(let j =0;j<totalCount;j++){
                if(graded_que[i][j]=='correct'){
                    partialCount++;
                }
            }
            correct_count=correct_count+(partialCount/totalCount);
        }
    }
    let the_grade = (correct_count/questionCount)*100;
    the_grade_div.innerHTML = "You got a " + the_grade + "% on this test. Thats "+correct_count+"/"+questionCount+".";
    document.getElementById("display-wrong").setAttribute("onclick","displayWrong()");
    document.getElementById("test").appendChild(the_grade_div);

    let tmpDiv = document.getElementById('displayGrade');
    tmpDiv.style.display='inline';
    let nTmpDiv = document.getElementById('displayWrongNums');
    if(nTmpDiv){
        nTmpDiv.style.display='inline';
    }
}

function displayWrong(){
    let txt = "";
    txt= " Wrong answers: ";
    for(let i =0;i<wrong_list.length;i++){
        txt+=wrong_list[i]+". ";
        let id = 'q'+wrong_list[i]+'text';
        document.getElementById(id).classList.add('wrong');
    }
    for(let i = 0; i<dropDownWrong.length;i++){
        for(let j =0;j<dropDownWrong[i].wrong.length;j++){
            let id = 'q'+dropDownWrong[i].num_in_test+dropDownWrong[i].wrong[j];
            document.getElementById(id).classList.add('wrong');
        }
    }
    for(let i = 0; i<multSelectWrong.length;i++){
        for(let j =0;j<multSelectWrong[i].wrong.length;j++){
            let id = 'q'+multSelectWrong[i].num_in_test+multSelectWrong[i].wrong[j];
            let childEl = document.getElementById(id);
            let parent_node = childEl.parentNode;
            parent_node.classList.add('wrong');
        }
    }
    if(wrong_list.length==0){
        txt+=' None, great going!!';
    }
    wrong_list_div.innerText = txt;
    let wrongButton = document.getElementById('hideWrongButton');
    wrongButton.style.display='inline';
    document.getElementById("test").appendChild(wrong_list_div);
}

function clearWrong(){
    for(let i =0;i<questionCount;i++){
        let id = 'q'+ (i+1) + 'text';
        document.getElementById(id).classList.remove('wrong');
    }
    for(let i =0;i<dropDownWrong.length;i++){
        for(let j =0;j<dropDownWrong[i].wrong.length;j++){
            let id = 'q'+dropDownWrong[i].num_in_test+dropDownWrong[i].wrong[j];
            document.getElementById(id).classList.remove('wrong');
        }
    }
    for(let i =0;i<multSelectWrong.length;i++){
        for(let j =0;j<multSelectWrong[i].wrong.length;j++){
            let id = 'q'+multSelectWrong[i].num_in_test+multSelectWrong[i].wrong[j];
            let childEl = document.getElementById(id);
            let parent_node = childEl.parentNode;
            parent_node.classList.remove('wrong');
        }
    }
    console.log("clear wrong");
    let tmpDiv = document.getElementById('displayGrade');
    console.log(tmpDiv);
    if(tmpDiv){
        console.log('tmpdiv');
        tmpDiv.style.display='none';
    }    

    let nTmpDiv = document.getElementById('displayWrongNums');
    if(nTmpDiv){
        nTmpDiv.style.display='none';
    }

    let wrongButton = document.getElementById('hideWrongButton');
    wrongButton.style.display='none';
}