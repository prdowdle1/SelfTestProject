function displayImages(){
    let cont = swapBetweenSubPages('editImages');
    if(!cont){
        return;
    }
    
    document.getElementById('visible-test').innerHTML = "Edit Images";


    let uploadImageButton = document.createElement("button");
    uploadImageButton.classList.add("button");
    uploadImageButton.setAttribute("onclick","displayUpload()");
    uploadImageButton.innerText="Upload Image";

    document.getElementById("edit-test").appendChild(uploadImageButton);

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