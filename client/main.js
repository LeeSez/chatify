let divIntro, divEnteryForm, divChoose, divLogin, divReg, divHomeScreen;

function initiate(){
    divIntro = document.querySelector("#intro");
    divEnteryForm = document.querySelector("#enteryForm");
    divChoose = document.querySelector("#choose");
    divLogin = document.querySelector("#login");
    divReg = document.querySelector("#register");
    divHomeScreen = document.querySelector("#homeScreen");
}

function loginAnimation(eventType){
    /* General animation */
    let time = 150;
    divChoose.classList.add("fadeOut");
    
    setTimeout(()=>{
        divChoose.style.display = "none";
        divChoose.classList.remove("fadeOut");
    },time);
    
    setTimeout(()=>{
        divEnteryForm.classList.add("openForm");    
    },time+200);
    
    setTimeout(()=>{
        divEnteryForm.style.height = "80vh";
        divEnteryForm.classList.remove("openForm");
        
        if(eventType == "login"){
            divLogin.classList.add("logTemplate");
        }
        else if(eventType == "register"){
            divReg.classList.add("logTemplate");
        }
    },time+950+200);
}

function login(){
    let time = 1450;
    divLogin.classList.remove("logTemplate");
    divEnteryForm.classList.add("closeForm");
    setTimeout(()=>{
        divEnteryForm.style.height = "10vh";
        divEnteryForm.classList.remove("closeForm");
    },time);

    setTimeout(()=>{
        divIntro.style.display = "none";
        divHomeScreen.style.display = "block";
    },time+400);    
}

function register(){
    changeForm("toLogin");
}

function changeForm(eventType){
    if(eventType == "toLogin"){
        divLogin.classList.add("logTemplate");
        divReg.classList.remove("logTemplate");
    }
    else if(eventType == "toRegister"){
        divLogin.classList.remove("logTemplate");
        divReg.classList.add("logTemplate");
    }
}