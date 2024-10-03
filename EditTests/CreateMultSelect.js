function makeMultSelEl(numInTest,optionCount,origin,corrAns,textValue){
    console.log(corrAns);
    console.log(optionCount);
    let option_div = document.createElement("div");
    option_div.id=numInTest+"opt"+optionCount;
	option_div.classList.add("option-div");

    let delButton = document.createElement("input");
    delButton.setAttribute("type","button");
    delButton.value="-";
    delButton.setAttribute("onclick","delOption('"+numInTest+"opt"+optionCount+",0')");//pass the id of the parent div, 0 cus not a dropdown

    option_div.appendChild(delButton);

    let corr_ans_check = document.createElement("input");
    corr_ans_check.setAttribute("type","checkbox");
    corr_ans_check.name=numInTest;
    corr_ans_check.classList.add("check-opt");
    corr_ans_check.id=numInTest+'check'+optionCount;

    if(origin=='onLoad'){
        if(corrAns[optionCount]=='1'){
            corr_ans_check.setAttribute("checked","true");
        }
    }else if(origin=='newQadd'){
        corr_ans_check.setAttribute("checked","true");
    }

    option_div.appendChild(corr_ans_check);

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