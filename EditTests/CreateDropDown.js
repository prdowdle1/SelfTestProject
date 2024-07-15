function createDropDown(question_div,num,options,answers,addOptButton,addImgButton,numAnswers){
    let br = document.createElement("br");
            question_div.appendChild(br);

            let setOptDiv = document.createElement("div");
            setOptDiv.innerText="Set/Delete options:"
            setOptDiv.id="options"+num;

            for(let j =0;j<options.length;j++){
                setOptDiv.appendChild(makeDropEl(num,j,options[j]));
            }

            addOptButton.setAttribute("onclick","addOption('"+[num,'Drop Down']+"')");

            let br0 = document.createElement("br");
            let br1 = document.createElement("br");

            question_div.appendChild(setOptDiv);
            question_div.appendChild(addOptButton);
            question_div.appendChild(addImgButton);
            question_div.appendChild(br0);
            question_div.appendChild(br1);

            let setAnsSpan = document.createElement("span");
            setAnsSpan.innerText="Set correct answers: ";

            let br2 = document.createElement("br");

            question_div.appendChild(setAnsSpan);
            question_div.appendChild(br2);


            let dropGridDiv = document.createElement("div");
            dropGridDiv.classList.add("edit-drop-down-grid");
            dropGridDiv.id="dropGrid"+num;
    
            for(let k =0;k<numAnswers;k++){
                dropGridDiv.appendChild(createAnswerSlot(num,k,options,answers));
            }

            let addAnsButton = document.createElement("input");
            addAnsButton.setAttribute("type","button");
            addAnsButton.setAttribute("onclick","addAnswer('"+num+"')");
            addAnsButton.value="Add answer slot";

            let updateDropButton = document.createElement("input");
            updateDropButton.setAttribute("type","button");
            updateDropButton.setAttribute("onclick","updateDropDowns('"+num+"')");
            updateDropButton.value="Match Drop-Downs to Options";

            question_div.appendChild(dropGridDiv);
            question_div.appendChild(addAnsButton);
            question_div.appendChild(updateDropButton);
}