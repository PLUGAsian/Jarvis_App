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
const userBlock = document.getElementById("userWords");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

//adjust values
const r  = new SpeechRecognition();
r.interimResults = true;
r.continuous = true;

let isRecording = false;
let userWords;
let userArray = [];

//I need to use await and async to make it so the recognizer finshes before sending the data to the python server
//PROCESS:
//function 1: records the data and returns a promise of a userwords string
//function 2: awaits promise of function 1 before executing to ensure there is data to send
//function 3: the thing that adds the event listener and handlers

function captureEvent(audioEvent){
    console.log("Recording started");
    userWords = audioEvent.results[0][0].transcript //this part takes a variable amount of time, so the stop button function needs to wait for this to finish
    console.log("User said: " + userWords);
}

function captureEventWithInterim(audioEvent){
    //note2self: using interim results will automatically stop the recognizer upon not hearing any speech
    console.log("Chunk recorded");
    let chunk = audioEvent.results[0][0].transcript
    userBlock.textContent = chunk; //fix this this doesnt work... yet >:)
    userArray.push(chunk);
    console.log(userArray);
}

function recordAndSend(){
    console.log("button pressed");
    if(!isRecording){
        mic_button.classList.add("is_recording");
        //console.log("Recording");
        isRecording = true;
        jarvisBlock.textContent = "Jarvis is listening...";
        r.start();
        mic_button.value = "Recording...";
        r.addEventListener('result', captureEventWithInterim);
    }
    else if(userArray.length > 0){
        //console.log("else if");
        r.removeEventListener('result', captureEventWithInterim);
        mic_button.disabled = true;
        mic_button.classList.remove("is_recording"); 
        r.stop();
        isRecording = false;
        //this part below needs to wait for the recognizer
        let jsonData = JSON.stringify(userArray[userArray.length - 1]);
        console.log("Data to send: " + jsonData);
        jarvisBlock.textContent = "Jarvis is thinking...";
        try {
            $.ajax({
                url: '/jarvis',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: jsonData,
                success: function(result){
                    console.log("Data received back");
                    jarvisBlock.textContent = "Jarvis says: " + result;
                    mic_button.disabled = false;
                    mic_button.value = "Click me!";
                }
            });
        }
        catch(error){
            console.log("Something went wrong");
            jarvisBlock.textContent = "Jarvis encountered an error :(";
        }
        console.log("Data sent to server");
        userArray = [];
    }
    else{
        r.stop();
        isRecording = false;
        jarvisBlock.textContent = "Jarvis couldn't here you :(" + "\n Could you please try again?";
        mic_button.classList.remove("is_recording");
        mic_button.value = "Click me!";
    }
}

mic_button.addEventListener("click", recordAndSend);

