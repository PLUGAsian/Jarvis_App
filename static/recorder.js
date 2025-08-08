/*
document.onload = console.log("Recorder script loaded");
$(document).ready(function() {
    $("#jarvis-button").click(function(){
        $("#test").load("/static/data.txt");
    });
});
*/

//TODO: make it so jarvis will keep listening after a pause

document.onload = console.log("Recorder script loaded");
const mic_button = document.getElementById("jarvis-button");
const playback = document.getElementById("audio");
const jarvisBlock = document.getElementById("response");
const userBlock = document.getElementById("userWords");
const clearButton = document.getElementById("reset-chat");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

//adjust values
const r  = new SpeechRecognition();
r.interimResults = true;

let isRecording = false;
let userWords;
let userArray = [];
let userMessage = [];

//I need to use await and async to make it so the recognizer finshes before sending the data to the python server
//PROCESS:
//function 1: records the data and returns a promise of a userwords string
//function 2: awaits promise of function 1 before executing to ensure there is data to send
//function 3: the thing that adds the event listener and handlers

//NOTE2SELF: Add a button that deletes conversation history to start a new slate

function captureEvent(audioEvent){
    console.log("Recording started");
    userWords = audioEvent.results[0][0].transcript //this part takes a variable amount of time, so the stop button function needs to wait for this to finish
    console.log("User said: " + userWords);
}

function captureEventWithInterim(audioEvent){
    //note2self: using interim results will automatically stop the recognizer upon not hearing any speech
    console.log("Chunk recorded");
    let chunk = audioEvent.results[0][0].transcript;
    userBlock.textContent = chunk; 
    userArray.push(chunk);
    if(audioEvent.results[0].isFinal){ 
        userMessage.push(userArray[userArray.length - 1]);
        console.log("Sentence recorded: " + userMessage);
    }
    console.log(userArray);
}

function recordAndSend(){
    console.log("button pressed");
    if(!isRecording){
        window.speechSynthesis.cancel();
        mic_button.classList.add("is_recording");
        mic_button.classList.remove("not_recording");
        console.log("Mic button classList: " + mic_button.classList);
        //console.log("Recording");
        isRecording = true;
        jarvisBlock.textContent = "Jarvis is listening...";
        r.start();
        r.addEventListener('result', captureEventWithInterim);
        r.addEventListener('end', continueRecording);
    }
    else if(userMessage.length > 0){
        r.removeEventListener('end', continueRecording);
        r.removeEventListener('result', captureEventWithInterim);
        mic_button.disabled = true;
        console.log("Mic button classList: " + mic_button.classList);
        r.stop();
        isRecording = false;
        //this part below needs to wait for the recognizer
        userMessage = userMessage.join(" ");
        console.log("Usermessage array length: " + userMessage.length + " " + userMessage);
        let jsonData = JSON.stringify(userMessage);
        console.log("Data to send: " + jsonData);
        jarvisBlock.textContent = "Jarvis is thinking...";
        //add a brain symbol here and a wheel spinning animation to show he is thinking.
        try {
            $.ajax({
                url: '/jarvis',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: jsonData,
                success: function(result){
                    console.log("Data received back");
                    mic_button.disabled = false;
                    jarvisBlock.textContent = "Jarvis says: " + result;
                    mic_button.classList.remove("is_recording");
                    mic_button.classList.add("not_recording");
                    jarvisMessage = new SpeechSynthesisUtterance(result);
                    jarvisMessage.rate = 1.5;
                    window.speechSynthesis.speak(jarvisMessage);
                }
            });
        }
        catch(error){
            console.log("Something went wrong");
            jarvisBlock.textContent = "Jarvis encountered an error :(";
        }
        console.log("Data sent to server");
        userArray = [];
        userMessage = [];
    }
    else{
        r.stop();
        isRecording = false;
        jarvisBlock.textContent = "Jarvis couldn't here you :(" + "\n Could you please try again?";
        mic_button.classList.remove("is_recording");
        mic_button.classList.add("not_recording");
    }
}

function continueRecording(){
    console.log("starting again!");
    r.start();
}

function clearConversation(){
    userBlock.textContent = "You said: ";
    jarvisBlock.textContent = "Jarvis says: ";
    $.ajax({
        url: '/clear',
        type: 'GET',
        success: function(result){
            console.log(result);
        }
    })
}

mic_button.addEventListener("click", recordAndSend);
clearButton.addEventListener("click", clearConversation);
