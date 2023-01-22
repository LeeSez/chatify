let divIntro, divEnteryForm, divChoose, divLogin, divReg, divHomeScreen, divChatsList, divChatPage, divChat, divSearch, divKeyboardDeck, divKeyback;
let inputLoginPassword, inputLoginEmail, inputRegEmail, inputRegPassword, inputRegPasswordRepeat, inputRegName, inputMessage, inputNewContact;
let btnSend, btnLogin, btnReg, btnSearch;
let  pTopName, pGreeting, pSearchError;

let email, password, username;
let currentChat = "";
let messages={};
let nameDictionary = [];

function initiate(){
    divIntro = document.querySelector("#intro");
    divEnteryForm = document.querySelector("#enteryForm");
    divChoose = document.querySelector("#choose");
    divLogin = document.querySelector("#login");
    divReg = document.querySelector("#register");
    divHomeScreen = document.querySelector("#homeScreen");
    divChatsList = document.querySelector("#chatsList");
    divChatPage = document.querySelector("#chatPage");
    divChat = document.querySelector("#chat");
    divSearch = document.querySelector("#searchBackground");
    divKeyboardDeck = document.querySelector("#keyboardDeck");
    divKeyback = document.querySelector("#keyback");

    inputLoginEmail = document.querySelector("#loginEmail");
    inputLoginPassword = document.querySelector("#loginPassword");
    inputRegEmail = document.querySelector("#regEmail");
    inputRegPassword = document.querySelector("#regPassword");
    inputRegPasswordRepeat = document.querySelector("#regPasswordRepeat");
    inputRegName = document.querySelector("#regName");
    inputMessage = document.querySelector("#keyboardMessage");
    inputNewContact = document.querySelector("#searchNewContact");

    btnSend = document.querySelector("#send");
    btnLogin = document.querySelector("#btnLogin");
    btnReg = document.querySelector("#btnReg");
    btnSearch = document.querySelector("#btnSearch");

    pTopName = document.querySelector("#topName");
    pGreeting = document.querySelector("#pGreeting");
    pSearchError = document.querySelector("#searchError");

    /* keyboard expension related
    inputMessage.addEventListener("input", ()=>{
        if(inputMessage.scrollWidth >= divKeyback.clientWidth){
            divKeyboardDeck.style.height = ((divKeyboardDeck.clientHeight/window.innerHeight)*100 + 2) + "vh";
        }
    });*/
}

function loginAnimation(eventType){
    /* General animation */
    let time = 150;
    divChoose.classList.add("fadeOut");
    
    setTimeout(()=>{
        divChoose.classList.add("hidden");
        divChoose.classList.remove("fadeOut");
    },time);
    
    setTimeout(()=>{
        divEnteryForm.classList.add("openForm");    
    },time+200);
    
    setTimeout(()=>{
        divEnteryForm.classList.add("highform");
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
        btnLogin.disabled = true;
        sendHttpGetRequest("/api/login?email="+email+"&password="+password,(response)=>{
            btnLogin.disabled = false;
            if(response == "failedToLog"){
                alert("wrong details");
            }
            else{
                let time = 1450;
                divLogin.classList.remove("logTemplate");
                divEnteryForm.classList.add("closeForm");
                divEnteryForm.classList.remove("highform");
                setTimeout(()=>{
                    divEnteryForm.classList.add("lowform");
                    divEnteryForm.classList.remove("closeForm");
                },time);
            
                setTimeout(()=>{
                    divIntro.classList.add("hidden");
                    divHomeScreen.classList.remove("hidden");
                    divEnteryForm.classList.remove("lowform");
                },time+400);  

                nameDictionary = JSON.parse(response);

                username = nameDictionary[1][nameDictionary[1].length-1];
                nameDictionary[0].pop();
                nameDictionary[1].pop();

                greet();
                createContactCard(nameDictionary, divChatsList);
                retriveMessages();
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
            btnReg.disabled = true;
            sendHttpGetRequest("/api/register?email="+inputRegEmail.value+"&password="+inputRegPassword.value+"&name="+inputRegName.value, (response)=>{
                btnReg.disabled = false;
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
    for(let i = 0; i<list[0].length; i++){
        let card = document.createElement("div");
        card.classList.add("chatCard");
        card.classList.add("flexCol");
        card.id = list[0][i];
        card.onclick = openChat;
        card.innerHTML = list[1][i];

        messages[list[0][i]] = [];

        element.appendChild(card);
    }
}

function retriveMessages(){
    let keys = Object.keys(messages);

    for(let i = 0; i<keys.length; i++){
        let lastId;
        if(messages[keys[i]].length > 0)
            lastId= messages[keys[i]][messages[keys[i]].length-1].id;
        else
            lastId = 0;
        
        sendHttpGetRequest("/api/pull?email="+email+"&password="+password+"&receiver="+keys[i]+"&lastId="+lastId, (response)=>{
            let resp = JSON.parse(response);
            if(nameDictionary[0][nameDictionary[1].indexOf(pTopName.innerHTML)] == keys[i]){
                createMessages(divChat, resp, keys[i]);
            }

            for(let j = 0; j<resp.length; j++){
                messages[keys[i]].push(resp[j]);
            } 

            if(i == keys.length-1 && keys.length > 0){
                setTimeout(()=>{retriveMessages();},500);
            }
            return;
        });
    }
}

function openChat(event){
    changeForm("toChatPage");
    //retriveMessages();
    createMessages(divChat, messages[event.target.id], event.target.id);
    currentChat = event.target.id;
    divChat.scrollTop = divChat.scrollHeight;
}

function createMessages(element,array, contact){
    let shouldScroll = Math.round(divChat.scrollHeight-divChat.scrollTop) -150 < divChat.clientHeight  ? true : false;
    pTopName.innerHTML = nameDictionary[1][nameDictionary[0].indexOf(contact)];
    for(let i = 0; i<array.length; i++){
        let message = document.createElement("div");
        if(array[i].sender == email){
            message.classList.add("myMessage");
        }
        else{
            message.classList.add("otherMessage");
        }
        message.id = array[i].id;
        message.innerHTML = array[i].content;

        element.appendChild(message);
    }

    if(shouldScroll) divChat.scrollTop = divChat.scrollHeight;
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
        divHomeScreen.classList.add("hidden");
        divChatPage.classList.remove("hidden");
    }
    else if(eventType == "toHomeScreen"){
        divHomeScreen.classList.remove("hidden");
        divChatPage.classList.add("hidden");
    }
    else if(eventType == "toIntro"){
        divIntro.classList.remove("hidden");
        divHomeScreen.classList.add("hidden");
        divChoose.classList.remove("hidden");
        divEnteryForm.classList.remove("hidden");
    }
}

function backToHomePage(){
    if(!divSearch.classList.contains("hidden"))
    divSearch.classList.add("hidden");
    changeForm("toHomeScreen");
    pTopName.innerHTML = "";
    while(divChat.firstChild){
        divChat.removeChild(divChat.firstChild);
    }
}

function send(){
    let body = {
        "email":email,
        "password":password,
        "receiver":currentChat,
        "content":inputMessage.value
    };
    if(body.content != ""){
        btnSend.disabled = true;
        sendHttpPostRequest("/api/send",JSON.stringify(body), (response)=>{
            btnSend.disabled = false;
            inputMessage.value ="";
        });
    }
}

function searchNewContact(){
    pSearchError.classList.add("invisible");
    contactEmail = inputNewContact.value;
    let keys = Object.keys(messages);
    if(contactEmail && !keys.includes(contactEmail)){
        btnSearch.disabled = true;
        sendHttpGetRequest("/api/lookForContact?contactEmail="+contactEmail, (response)=>{
            btnSearch.disabled = false;
            if(response == "user_not_found"){
                console.log("user not found");
                pSearchError.classList.remove("invisible");
            }
            else {
                let newContactName = JSON.parse(response);
                newContactName = newContactName[0].name;
                inputNewContact.value = "";
                pTopName.innerHTML = newContactName
                currentChat = contactEmail;

                nameDictionary[0].push(contactEmail);
                nameDictionary[1].push(newContactName);

                changeForm("toChatPage");
                createContactCard([[contactEmail],[newContactName]],divChatsList);
            }
        });
    }
}

function showContactSearch(){
    if(divSearch.classList.contains("hidden"))
        divSearch.classList.remove("hidden");
    else{
        divSearch.classList.add("hidden");
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

function sendHttpPostRequest(url,body,callback){
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

function activateEnter(event ,name){
    if(event.key == "Enter"){
        switch(name){
            case "register":
                register();
                break;
            case "login":
                login();
                break;
            case "send":
                send();
                break;
            case "conSearch":
                searchNewContact();
                break;
        }
    }
}

function greet(){
    let date = new Date();
    let hour = date.getHours();
    let ext;
    if(hour>=5 && hour<=11){
        ext = "Good Morning, ";
    }
    else if(hour>=12 && hour<=17){
        ext = "Good Afternoon, ";
    }
    else if(hour>=18 && hour<=21){
        ext = "Good Evening, ";
    } 
    else{
        ext = "Good Night, ";
    }
    pGreeting.innerHTML = ext + username + ".";
}

function logout(){
    changeForm("toIntro");
    deleteChildNodes(1, divChatsList);

    nameDictionary = [];
    username = "";
    password = "";
    email = "";
    messages = {};
    currentChat = "";
}

function deleteChildNodes(keepNumber, element){
    while(element.children.length > keepNumber){
        element.removeChild(element.lastChild);
    }
}




