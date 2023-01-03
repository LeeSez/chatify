let divIntro, divEnteryForm, divChoose, divLogin, divReg, divHomeScreen, divChatsList, divChatPage;
let inputLoginPassword, inputLoginEmail, inputRegEmail, inputRegPassword, inputRegPasswordRepeat, inputRegName;

let email, password;
let messages={};

function initiate(){
    divIntro = document.querySelector("#intro");
    divEnteryForm = document.querySelector("#enteryForm");
    divChoose = document.querySelector("#choose");
    divLogin = document.querySelector("#login");
    divReg = document.querySelector("#register");
    divHomeScreen = document.querySelector("#homeScreen");
    divChatsList = document.querySelector("#chatsList");
    divChatPage = document.querySelector("#chatPage");

    inputLoginEmail = document.querySelector("#loginEmail");
    inputLoginPassword = document.querySelector("#loginPassword");
    inputRegEmail = document.querySelector("#regEmail");
    inputRegPassword = document.querySelector("#regPassword");
    inputRegPasswordRepeat = document.querySelector("#regPasswordRepeat");
    inputRegName = document.querySelector("#regName");
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
    email = inputLoginEmail.value;
    password = inputLoginPassword.value;
    if(email && password){
        sendHttpGetRequest("/api/login?email="+email+"&password="+password,(response)=>{
            if(response == "failedToLog"){
                alert("wrong details");
            }
            else{
                let time = 1450;
                divLogin.classList.remove("logTemplate");
                divEnteryForm.classList.add("closeForm");
                setTimeout(()=>{
                    divEnteryForm.style.height = "10vh";
                    divEnteryForm.classList.remove("closeForm");
                },time);
            
                setTimeout(()=>{
                    divIntro.classList.add("invisible");
                    divHomeScreen.classList.add("visible");
                },time+400);  

                let contactsList = contacts(JSON.parse(response),email);
                createContactCard(contactsList, divChatsList);
            }
        });
    } 
}

function register(){
    inputRegEmail.classList.remove("redHighlight");
    inputRegPassword.classList.remove("redHighlight");
    inputRegPasswordRepeat.classList.remove("redHighlight");

    if(inputRegEmail.value && inputRegPassword.value && inputRegPasswordRepeat.value && inputRegName.value){
        if(!validateEmail(inputRegEmail.value)){
            inputRegEmail.classList.add("redHighlight");
            console.log("highlight");
            return;
        }
        else if(!validatePassword(inputRegPassword.value)){
            inputRegPassword.classList.add("redHighlight");
            console.log("highlight");
            return;
        }
        else if(inputRegPassword.value == inputRegPasswordRepeat.value){
            sendHttpGetRequest("/api/register?email="+inputRegEmail.value+"&password="+inputRegPassword.value+"&name="+inputRegName.value, (response)=>{
                if(response == "alreadyExists"){
                    console.log("user already exists");
                    alert("user already exists");
                }
                else if(response == "registerSuccessful"){
                    console.log("successful");
                    changeForm("toLogin");
                } 
            });
        }
        else{
            inputRegPasswordRepeat.classList.add("redHighlight");
            return;
        }
    }
}

function validateEmail(email){
    //email restrictions
    if(email.includes("@") && email.includes(".")) return true;
    else return false;
}
function validatePassword(password){
    //password restrictions
    if(password.length>7){
        if(password.search(/[A-Z]/) != -1){
            if(password.search(/[0-9]/) != -1){
                return true;
            }
        }
    }
    return false;
}

function createContactCard(list,element){
    for(let i = 0; i<list.length; i++){
        let card = document.createElement("div");
        card.classList.add("chatCard");
        card.classList.add("flexCol");
        card.id = list[i];
        card.onclick = openChat;
        card.innerHTML = list[i];

        element.appendChild(card);
    }
}

function openChat(event){
    changeForm("toChatPage");
    sendHttpGetRequest("/api/pull?email="+email+"&password="+password+"&receiver="+event.target.id, (response)=>{
        response.forEach((object)=>{});
    });
}

function updateMessages(){

}

function contacts(response, email){
    let array = [];
    for(let i = 0; i<response.length; i++){
        
        if(response[i].sender != email && !array.includes(response[i].sender)) array.push(response[i].sender);
        
        if(response[i].receiver != email && !array.includes(response[i].receiver)) array.push(response[i].receiver);
    }
    return array;
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
    else if(eventType == "toChatPage"){
        divHomeScreen.classList.add("invisible");;
        divChatPage.classList.add("visible");
    }
    else if(eventType == "toHomeScreen"){
        divHomeScreen.classList.add("visible");
        divChatPage.classList.add("invisible");
    }
}

function sendHttpGetRequest(url,callback){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = ()=>{
        if(httpRequest.readyState == 4){
            if(httpRequest.status == 200){
                callback(httpRequest.response);
            }
            else{
                console.log(httpRequest.status);
            }
        }
    };
    
    httpRequest.open('GET',url,true);
    httpRequest.send();
} 

function sendHttpPostRequest(url,callback,body){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = ()=>{
        if(httpRequest.readyState == 4){
            if(httpRequest.status == 200){
                callback(httpRequest.response);
            }
            else{
                console.log(httpRequest.status);
            }
        }
    };
    
    httpRequest.open('POST',url,true);
    httpRequest.send(body);
} 




