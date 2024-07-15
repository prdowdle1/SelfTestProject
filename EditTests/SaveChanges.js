function saveChanges(){
    document.getElementById("error").innerText='';
    if(!loadedTest){
        document.getElementById('error').innerHTML = "Nothing to save!";
        return;
    }
    let result = confirm("This is not reversible, all changes will be committed and any 'undos' will be forgotten.")
    if(result==false){
        return;
    }else{
		document.getElementById("error").innerText = '';
		let db_inserts = [];
		let edit_test_div = document.getElementById("edit-test");
		let question_count = edit_test_div.childElementCount;
		let new_question_count=1;
		let test_name=loadedTestName;
		
		for(let i = 0;i<question_count;i++){
			let question_div=edit_test_div.children[i];
			let hidden = question_div.style.display;

			if(hidden!='none'){
				let question_format = question_div.getAttribute('data-type');
				let question_text_div = question_div.getElementsByClassName('edit-question-text-box');
				let question_text = question_text_div[0].value;
				let image_div = question_div.lastChild;
				let img_count = image_div.childElementCount;
				let new_opt_count = 0;				
				let new_img_count=0;
				
				if(question_text==''){
					document.getElementById("error").innerText = "Where is the question text for number " +(i+1)+"?!?!?!";
					return;
				}
				
				let thisQ_insert = {test_name: test_name, num_in_test: new_question_count, question: question_text, format: question_format};
				
				if(question_format!="Fill in the Blank"){//fill in has no options div
					let options_div_id = 'options'+(i+1);//plus one cus test nums start at 1
					let options_div = document.getElementById(options_div_id);
					let num_options = options_div.childElementCount;
						
						
					if(question_format=='Multiple Choice'){
						thisQ_insert.num_answers=1;
						let options_buttons=document.getElementsByName(i+1);
						let correct_answer_text;
						let correct_answer_option;
						
						for(k=0;k<options_buttons.length;k++){//get selected answer
							let tmp_id = (i+1)+'opt'+k;
							let vis_radio_div = document.getElementById(tmp_id).style.display;
							if(options_buttons[k].checked){
								if(vis_radio_div!='none'){
									correct_answer_option = "opt"+k;
								}
							}
						}
						if(!correct_answer_option){
							document.getElementById("error").innerText = "You are missing an answer selection for number " +(i+1)+"!!!";
							return;
						}
						thisQ_insert.answer0=correct_answer_option;
					}else if(question_format=='Drop Down'){
						//get answers here!!
					}
				
					console.log(question_div);
					for(let j = 0;j<num_options;j++){//get all non hidden options
						let this_option = options_div.children[j];
						let isHidden = this_option.style.display;
						if(isHidden!='none'){
							let tmp_id = (i+1)+'opt'+j+'text';
							let opt_text = document.getElementById(tmp_id).value;
							let this_opt = 'opt'+new_opt_count;
							new_opt_count++;
							thisQ_insert[this_opt]=opt_text;
						}
					}
				}
				if(img_count>0){//get images, this works for all three types of questions
					for(let m = 0;m<img_count;m++){
						let this_img = image_div.children[m];
						let isHidden = this_img.style.display;
						if(isHidden!='none'){
							let img_src_id = (i+1)+"img"+m+"image";
							let img_src = document.getElementById(img_src_id).src;
							let img_size_id = (i+1)+"img"+m+"size";
							let img_size=document.getElementById(img_size_id).value;
							img_src = img_src+img_size;
							let new_img = 'img'+new_img_count;
							new_img_count++;
							thisQ_insert[new_img]=img_src;
						}
					}
				}

				db_inserts.push(thisQ_insert);
				new_question_count++;
			}
		//console.log(question_div);
		}
		console.log(db_inserts);
		
		
		
		let req = [test_name,username];
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function (){
			if(xmlHttp.readyState==4&&xmlHttp.status==200){
				console.log(xmlHttp.responseText);
				//submitChanges();
			}
		}
		xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/saveData.pl',true);
		xmlHttp.send(req);
    }
}