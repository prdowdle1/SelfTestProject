function saveChanges(){
    feedback.innerText='';
    if(!loadedTest||!madeChange){
        feedback.className='';
        feedback.classList.add('error-class');
		feedback.innerText="Nothing to save!";
        return;
    }
    let result = confirm("This is not reversible, all changes will be committed and any 'undos' will be forgotten.")
    if(result==false){
        return;
    }else{
		feedback.innerText = '';
		let db_inserts = [];
		let edit_test_div = document.getElementById("edit-test");
		let question_count = edit_test_div.childElementCount;
		let new_question_count=1;
		let test_name=loadedTestName;
		let found_at_least_one_Q = false;
		
		for(let i = 0;i<question_count;i++){
			let question_div=edit_test_div.children[i];
			let hidden = question_div.style.display;
			let found_at_least_one_opt = false;
			let question_number = +question_div.id.split("question")[1];

			if(hidden!='none'){
				found_at_least_one_Q=true;
				let question_format = question_div.getAttribute('data-type');
				let question_text_div = question_div.getElementsByClassName('edit-question-text-box');
				let question_text = question_text_div[0].value;
				let image_div = question_div.querySelector('.image-grid');
				let img_count = image_div.childElementCount;

				let new_opt_count = 0;				
				let new_img_count=0;
				
				if(question_text==''){
					feedback.className='';
					feedback.classList.add('error-class');
					feedback.innerHTML="Where is the question text for number " +(i+1)+"?!?!?!";
					return;
				}
				
				let thisQ_insert = {test_name: test_name, num_in_test: new_question_count, question: question_text, format: question_format};
				if(question_format!="Fill in the Blank"){//fill in has no options div
					let options_div_id = 'options'+(question_number);//plus one cus test nums start at 1
					let options_div = document.getElementById(options_div_id);
					let num_options = options_div.childElementCount;

					for(let j = 0;j<num_options;j++){//get all non hidden options
						let this_option = options_div.children[j];
						let isHidden = this_option.style.display;
						if(isHidden!='none'){
							found_at_least_one_opt=true;
							let tmp_id = (question_number)+'opt'+j+'text';
							let opt_text = document.getElementById(tmp_id).value;
							let this_opt = 'opt'+new_opt_count;
							new_opt_count++;
							thisQ_insert[this_opt]=opt_text;
						}
					}
					if(!found_at_least_one_opt){
						feedback.className='';
						feedback.classList.add('error-class');
						feedback.innerHTML = "No options for number "+new_question_count+"!";
						return;
					}
						
					if(question_format=='Multiple Choice'){
						thisQ_insert.num_answers=1;
						let options_buttons=document.getElementsByName(question_number);
						let correct_answer_option;
						let hiddenCount = 0;
						for(k=0;k<options_buttons.length;k++){//get selected answer
							let tmp_id = (question_number)+'opt'+k;
							let vis_radio_div = document.getElementById(tmp_id).style.display;
							if(vis_radio_div=='none'){
								hiddenCount++;
							}
							if(options_buttons[k].checked){
								if(vis_radio_div!='none'){
									correct_answer_option = "opt"+(k-hiddenCount);
								}
							}
						}
						if(!correct_answer_option){
							feedback.className='';
							feedback.classList.add('error-class');
							feedback.innerHTML="You are missing an answer selection for number " +(i+1)+"!!!";
							return;
						}
						thisQ_insert.answer0=correct_answer_option;
					}else if(question_format=='Drop Down'){
						let answers_grid_id = 'dropGrid' + question_number;
						let answers_grid = document.getElementById(answers_grid_id);
						let num_answers = answers_grid.childElementCount;
						let new_ans_count = 0;

						for(let k = 0;k<num_answers;k++){
							let ans_div_id = (question_number)+"ans"+k+"div";
							let ans_display = document.getElementById(ans_div_id).style.display;
							if(ans_display!="none"){
								let this_ans_id = (question_number)+"ans"+k;
								let this_ans_opt=document.getElementById(this_ans_id).value;
								let this_ans = "answer"+new_ans_count;
								thisQ_insert[this_ans]=this_ans_opt;
								new_ans_count++
							}
						}
						if(new_ans_count==0){
							feedback.className='';
							feedback.classList.add('error-class');
							feedback.innerHTML = "No answer for number "+new_question_count+"!";
							return;
						}
						thisQ_insert.num_answers=new_ans_count;

					}
					else if(question_format=='Multiple Select'){
						let num_answers=0;
						let options_buttons=document.getElementsByName(question_number);
						for(k=0;k<options_buttons.length;k++){//get selected answer
							let tmp_id = (question_number)+'opt'+k;
							let vis_radio_div = document.getElementById(tmp_id).style.display;
							if(vis_radio_div!='none'){
								let this_ans_id = (question_number)+"check"+k;
								let this_ans_opt=document.getElementById(this_ans_id).checked;
								let this_ans = "answer"+num_answers;
								thisQ_insert[this_ans]=this_ans_opt;
								num_answers++;
							}
						}
						if(num_answers==0){
							feedback.className='';
							feedback.classList.add('error-class');
							feedback.innerHTML="You are missing an answer selection for number " +(i+1)+"!!!";
							return;
						}
						thisQ_insert.num_answers = num_answers;
					}
				}
				if(question_format=='Fill in the Blank'){
					thisQ_insert.num_answers=1;
					thisQ_insert.answer0='opt0';
					let this_ans_id = (question_number)+"ans";
					let this_ans_text=document.getElementById(this_ans_id).value;
					if(this_ans_text==''){
						feedback.className='';
						feedback.classList.add('error-class');
						feedback.innerHTML = "No answer for number "+new_question_count+"!";
						return;
					}
					thisQ_insert.opt0 = this_ans_text;
				}
				if(img_count>0){//get images, this works for all three types of questions
					for(let m = 0;m<img_count;m++){
						let this_img = image_div.children[m];
						let isHidden = this_img.style.display;
						if(isHidden!='none'){
							let img_name_id = (question_number)+"img"+m+"name";
							let img_el = document.getElementById((question_number)+"img"+m+"image");
							let queryParams = `?width=${img_el.clientWidth}`
							let img_name = document.getElementById(img_name_id).value;
							let img_src = 'https://www-bd.fnal.gov/ops/pdowdle/SelfTests/images/'+ img_name + queryParams;
							let new_img = 'img'+new_img_count;
							new_img_count++;
							thisQ_insert[new_img]=img_src;
						}
					}
				}

				db_inserts.push(thisQ_insert);
				new_question_count++;
			}
		}
		if(!found_at_least_one_Q){
			feedback.className='';
			feedback.classList.add('error-class');
			feedback.innerText = "Theres no questions lol?";
			return;
		}
		let req = {test_name:test_name,username:username,data:db_inserts};
		
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function (){
			if(xmlHttp.readyState==4&&xmlHttp.status==200){
				loadedTest=false;
				retrieveTest('saved',test_name);
			}else{
				
			}
		}
		xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/saveData.pl',true);
		xmlHttp.send(JSON.stringify(req));
    }
}

function saveActive(){
	if(!madeActiveChange){
        feedback.className='';
        feedback.classList.add('error-class');
        feedback.innerText="Nothing to save!";
        return;
	}
	let reqNames = [];
	for(let i =0;i<testNames.length;i++){
		let id = 'active'+i;
		let checked = document.getElementById(id).checked;
		let el = {test_name:testNames[i].test_name,active:checked};
		reqNames.push(el);
	}
	let req = {testNames:reqNames};

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function (){
		if(xmlHttp.readyState==4&&xmlHttp.status==200){
			testNames=reqNames;
			feedback.className='';
			feedback.classList.add("success-class");
			feedback.innerText=("Saved!!");
			madeActiveChange = false;
			setTimeout( ()=> {
				feedback.innerText='';
			},5000);
		}else{

		}
	}
	xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/saveActive.pl',true);
	xmlHttp.send(JSON.stringify(req));
}