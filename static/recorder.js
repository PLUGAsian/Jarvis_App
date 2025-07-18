/*
document.onload = console.log("Recorder script loaded");
$(document).ready(function() {
    $("#jarvis-button").click(function(){
        $("#test").load("/static/data.txt");
    });
});
*/

document.onload = console.log("Recorder script loaded");
const mic_button = document.getElementById("jarvis-button");
const playback = document.getElementById("audio");
const jarvisBlock = document.getElementById("response");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

//adjust values
const r  = new SpeechRecognition();

let isRecording = false;
let userWords;

//I need to use await and async to make it so the recognizer finshes before sending the data to the python server
//PROCESS:
//Click button => start recording => wait for user to click button again => analyze speech => send data to server => 
//wait for response => update html to display response

function captureEvent(audioEvent){
    console.log("Recording started");
    userWords = audioEvent.results[0][0].transcript //this part takes a variable amount of time, so the stop button function needs to wait for this to finish
    console.log("User said: " + userWords);
}

function recordAndSend(){
    if(!isRecording){
        isRecording = true;
        jarvisBlock.textContent = "Jarvis is listening...";
        r.start();
        r.addEventListener('result', captureEvent);
    }
    else{
        r.removeEventListener('result', captureEvent); 
        r.stop();
        isRecording = false;
        //this part below needs to wait for the recognizer
        let jsonData = JSON.stringify(userWords);
        console.log("Data to send: " + jsonData);
        jarvisBlock.textContent = "Jarvis is thinking...";
        $.ajax({
            url: '/jarvis',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: jsonData,
            success: function(result){
                console.log("Data received back");
                jarvisBlock.textContent = "Jarvis says: " + result;
            }
        });
        console.log("Data sent to server");
    }
}

mic_button.addEventListener("click", recordAndSend);

