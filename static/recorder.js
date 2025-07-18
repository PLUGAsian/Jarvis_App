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

let isRecording = false;
let userWords;
let userArray = [];

//I need to use await and async to make it so the recognizer finshes before sending the data to the python server
//PROCESS:
//Click button => start recording => wait for user to click button again => analyze speech => send data to server => 
//wait for response => update html to display response

function captureEvent(audioEvent){
    console.log("Recording started");
    userWords = audioEvent.results[0][0].transcript //this part takes a variable amount of time, so the stop button function needs to wait for this to finish
    console.log("User said: " + userWords);
}

function captureEventWithInterim(audioEvent){
    console.log("Recording started");
    let chunk = audioEvent.results[0][0].transcript
    userBlock.textContent = chunk; //fix this this doesnt work... yet >:)
    userArray.push(chunk);
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
        r.addEventListener('result', captureEvent);
        //userArray.join(" ");
        //userWords = userArray;
    }
    else if(userWords !== undefined && userWords.legnth > 0){
        //console.log("else if");
        mic_button.disabled = true;
        mic_button.classList.remove("is_recording");
        r.removeEventListener('result', captureEvent); 
        r.stop();
        isRecording = false;
        //this part below needs to wait for the recognizer
        let jsonData = JSON.stringify(userWords);
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
        //console.log("Else")
        r.stop();
        isRecording = false;
        jarvisBlock.textContent = "Jarvis couldn't here you :(" + "\n Could you please try again?";
        mic_button.classList.remove("is_recording");
        mic_button.value = "Click me!";
    }
}

mic_button.addEventListener("click", recordAndSend);

