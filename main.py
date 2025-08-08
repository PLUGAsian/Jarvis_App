#to run, use python3 main.py in the terminal
#ALSO MAKE SURE TO ACTIVE VIRTUAL ENVIROMENT EVERY TIME YOU CLOSE
#VSCODE
#USE: source ollama_project_env/bin/activate
#Also to commit: use git add . => git commit -m "message here or smthn :3"
#To push changes to master: git push (use after the following command above)
#TODO: Find out how to to but everything in my main branch
from flask import Flask, request, render_template, url_for, jsonify, json
import speech_recognition as sr
import pyttsx3
#from pyttsx3 import engine
from ollama import chat 

r = sr.Recognizer()

conversationHistory = []

def jarvis(text):
    conversationHistory.append({'role': 'user', 'content': text})
    stream = chat(
        model='Jarvis',
        messages=conversationHistory, 
        stream=False
    )

    """
    for chunk in stream:
        #you have to use chunk['message']['content'] and not stream because stream is not a string and is a series of dictionaries for each token(I think)
        content = chunk['message']['content']
        fullResponse += content
        print(chunk['message']['content'], end='', flush=True)
    """
    
    fullResponse = stream['message']['content']
    #print(fullResponse)
    conversationHistory.append({'role': 'assistant', 'content': fullResponse})
    #engine.say(fullResponse)
    #engine.runAndWait()
    #print("\n")
    return fullResponse

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/jarvis', methods=['POST'])
def jarvis_endpoint():
    data = request.get_json()
    print(data)
    return jsonify(jarvis(data))
    
@app.route('/clear', methods=['GET'])
def clear():
    global conversationHistory
    conversationHistory = []
    return str("History cleared!")
    

if __name__ == "__main__":
    app.run(debug=True)

#initialize mic
r = sr.Recognizer()
r.pause_threshold = 1 #how long to wait before it stops listening

#initialize tts
engine = pyttsx3.init()
engine.setProperty('voice', 'com.apple.eloquence.en-GB.Rocko')

#initialize the recognizer
def listen():
    while(1):
        try:
            with sr.Microphone() as source2:
                r.adjust_for_ambient_noise(source2, duration=0.5) #tells how long to adjust for

                audio2 = r.listen(source2)

                Mytext = r.recognize_google(audio2)
            
                return Mytext

        except sr.RequestError as e:
            print("Could not recognize speech; {0}".format(e))
        
        except sr.UnknownValueError:
            print("unknown error occurred")

    return

"""
while(1):
    words = listen()
    print("- " + words)
    #to stop the code
    if(words == "initiate shutdown"):
        print("Shutting down now...")
        engine.say('Shutting down now...')
        engine.runAndWait()
        break
    else:
        jarvis(words)
        #print(words)
"""
        
"""
def main():
    voices = engine.getProperty('voices') 
    for voice in voices:
    # to get the info. about various voices in our PC 
        print("Voice:")
        print("ID: %s" %voice.id)
        print("Name: %s" %voice.name)
        print("Age: %s" %voice.age)
        print("Gender: %s" %voice.gender)
        print("Languages Known: %s" %voice.languages)
main()
"""

"""
Developer notes!: Currently, the way I have this running is that
Jarvis begins a new conversation with every sequence of words I say.
The only problem with this is that because I begin a new chat, Jarvis
has no context of the previous things I have said because it is an 
entirely different conversation. Must figure out how to send continual 
messages that persist throughout Jarvis' memory.

EDIT: fixed
"""

"""
More dev notes:
I have successfully received the files from js. However there are 
currently 2 problems:

1 - The wav files I am receiving are not being recognized by the 
speech recognizer. I need to convert them to pcm via pydub

2 - I have no clue if the files even contain audio as I have not been 
able to listen to them yet.

EDIT: fixed, fixed, and fixed. Also i moved on to a web app now :)
"""
