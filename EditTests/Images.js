let imagesToUnlink = [];
let madeImageChange = false;
let numImages;
let displayedImages =[];

function loadEditImages(from){
    let cont = swapBetweenSubPages('editImages');
    if(!cont){
        return;
    }

    if(from=='removed'){
        feedback.className='';
        feedback.classList.add("success-class");
        feedback.innerText="Archived: ";
        for(let i =0;i<imagesToUnlink.length;i++){
            feedback.innerText+=imagesToUnlink[i];
            if(i!=imagesToUnlink.length-1){
                feedback.innerText+=", ";
            }else{
                feedback.innerText+=".";
            }
        }
        setTimeout( ()=> {
            feedback.innerText='';
        },5000);
        imagesToUnlink = [];
    }else if(from=='added'){
        feedback.className='';
        feedback.classList.add("success-class");
        feedback.innerText=("Added!!");
        setTimeout( ()=> {
            feedback.innerText='';
        },5000);
    }
    
    document.getElementById('visible-test').innerHTML = "Edit Images";

    let savebutton = document.getElementById('saveChangesButton');

    savebutton.setAttribute("onclick","archiveImages()");
    savebutton.innerHTML="Rm Selected Images";

    displayedImages =[];

    let getNames = new XMLHttpRequest();

    getNames.open("GET", "https://www-bd.fnal.gov/cgi-mcr/pdowdle/getImageNames.pl");
    getNames.overrideMimeType("application/json");
    getNames.onload = () => {
        let imageNames = JSON.parse(getNames.response).sort();
        imageNames.forEach((el) => {
            if(el[0] !== '.'){
                displayedImages.push(el);
            }
        });
        getAllQuestions(displayedImages);
    }
    getNames.send();
}

function getAllQuestions(displayedImages){
    let usedImgs= [];
    let resp;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            let info = JSON.parse(resp);
            for(let i =0;i<info.length;i++){//there are possibly 10 images per question.
                for(let j =0;j<10;j++){
                    let name = info[i]['img'+j];
                    if(name){
                        let tmp = name.split('https://www-bd.fnal.gov/ops/pdowdle/SelfTests/images/')[1];
                        let imgName = tmp.split('?')[0];
                        let obj = {
                            imageName:imgName,
                            testName:info[i].test_name,
                            numInTest: info[i].num_in_test
                        }
                        usedImgs.push(obj);
                    }
                }
            }
            buildImages(displayedImages,usedImgs);
        }else{

        }
    }
    xmlHttp.open("GET", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/getUsedImages.pl',true);
    xmlHttp.send();
}

function buildImages(imageNames,usedImgs){
    numImages = imageNames.length;
    let editTestDiv = document.getElementById("edit-test");
    let uploadImageButton = document.createElement("button");
    uploadImageButton.classList.add("button");
    uploadImageButton.setAttribute("onclick","displayUpload()");
    uploadImageButton.innerText="Upload Image";
    editTestDiv.appendChild(uploadImageButton);

    let editGrid = document.createElement('div');
    editGrid.classList.add('edit-images-grid');

    let column0Header = document.createElement('div');
    column0Header.innerHTML = "Delete?";
    column0Header.classList.add("column-header");
    let column1Header = document.createElement('div');
    column1Header.innerHTML = "Image Name";
    column1Header.classList.add("column-header");
    let column2Header = document.createElement('div');
    column2Header.innerHTML = "Used In";
    column2Header.classList.add("column-header");
    let column3Header = document.createElement('div');
    column3Header.innerHTML = "Image";
    column3Header.classList.add("column-header");

    editGrid.appendChild(column0Header);
    editGrid.appendChild(column1Header);
    editGrid.appendChild(column2Header);
    editGrid.appendChild(column3Header);
    editTestDiv.appendChild(editGrid);

    for(let i =0;i<imageNames.length;i++){
        let editGrid = document.createElement('div');
        editGrid.classList.add('edit-images-grid');
        let checkDiv = document.createElement("div");
        let checkImage = document.createElement("input");
        checkImage.setAttribute("type","checkbox");
        checkImage.id="active"+i;
        checkImage.onchange=function(){madeImageChange=true;}
        checkDiv.appendChild(checkImage);

        let imgLabel = document.createElement('div');
        imgLabel.innerText=imageNames[i];
        imgLabel.id='img'+[i];

        let usedIn = document.createElement('div');
        for(let j =0;j<usedImgs.length;j++){
            if(usedImgs[j].imageName==imageNames[i]){
                let tmpDiv = document.createElement("div");
                let tmpSpan = document.createElement("li");
                tmpSpan.innerText=usedImgs[j].testName+", # "+usedImgs[j].numInTest;
                tmpDiv.appendChild(tmpSpan);
                usedIn.appendChild(tmpDiv);
            }
        }

        let thisImg = document.createElement("img");
        thisImg.classList.add("edit-images");
        thisImg.src='https://www-bd.fnal.gov/ops/pdowdle/SelfTests/images/'+imageNames[i];
        thisImg.setAttribute("alt",imageNames[i]);

        editGrid.appendChild(checkDiv);
        editGrid.appendChild(imgLabel);
        editGrid.appendChild(usedIn);
        editGrid.appendChild(thisImg);
        editTestDiv.appendChild(editGrid);
    }

    editImagesLoaded=true;
    document.getElementById('editActiveButton').removeAttribute("disabled");
    document.getElementById("getTestButton").removeAttribute("disabled");
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

function submitImage(event) {
    let fname = event.srcElement[0].value;
    if(!fname){
        alert("No Imge Selected!");
        return;
    }
    if(fname.includes('?')||fname.includes('/')||fname.includes('\\')){
        alert("No question marks or slashes allowed in file names!");
        return;
    }
    let found=false;
    for(let i =0;i<displayedImages.length;i++){
        if(fname==displayedImages[i]){
            found=true;
            alert("File name already exists!");
            return
        }
    }

    var url = 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/uploadImg.pl';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function (){
        if(request.readyState==4&&request.status==200){
            madeImageChange = false;
            loadEditImages('added');
        }
    }
    request.open('POST', url, true);
  
    request.send(new FormData(event.target)); // create FormData from form that triggered event
    event.preventDefault();

    //dont need this anymore as the test needs ot be reloaded when being selected since images are ona diff page now
    // setTimeout(() => {
    //     let dropDowns = document.querySelectorAll(".image-select");
    //     dropDowns.forEach((el) => {
    //         populateNames(el);
    //     });
    // }, 500);

}

function archiveImages(){

    for(let i =0;i<numImages;i++){
        if(document.getElementById("active"+i).checked){
            imagesToUnlink.push(document.getElementById("img"+i).innerText);
        }
    }

    if(imagesToUnlink.length==0){
        feedback.className='';
        feedback.classList.add("error-class");
        feedback.innerText=("No images to remove!");
        return;
    }

    let resp;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (){
        if(xmlHttp.readyState==4&&xmlHttp.status==200){
            resp = xmlHttp.responseText;
            madeImageChange = false;
            loadEditImages('removed');
        }else{

        }
    }
    xmlHttp.open("POST", 'https://www-bd.fnal.gov/cgi-mcr/pdowdle/archiveImage.pl',true);
    xmlHttp.send(imagesToUnlink);
}