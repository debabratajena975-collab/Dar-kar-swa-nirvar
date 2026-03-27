import os
import speech_recognition as sr
from gtts import gTTS
import time

def speak(text):
    print(f"DJ: {text}")
    tts = gTTS(text=text, lang='hi') 
    tts.save("res.mp3")
    os.system("mpv res.mp3 > /dev/null 2>&1")

def listen():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source, duration=0.5)
        try:
            audio = r.listen(source, timeout=None)
            query = r.recognize_google(audio, language='en-in')
            return query.lower()
        except:
            return ""

print("DJ is Active... Say 'DJ' to talk!")

while True:
    query = listen()
    
    if "dj" in query:
        speak("Han Boss! Mu sunuchi, kahantu kemiti achhanti?")
        
        while True:
            user_input = listen()
            if "happy" in user_input or "bhala" in user_input:
                speak("Suni bahut khusi lagila Boss!")
            elif "sad" in user_input or "dukha" in user_input:
                speak("Udaas mat hoiye Boss, DJ aapke saath hai.")
            elif "sleep" in user_input:
                speak("Thik achhi Boss, mu standby mode re achhi. DJ boli dakile mu puni asibi.")
                break 
            elif "exit" in user_input:
                speak("Goodbye Boss!")
                exit()
    time.sleep(0.1)

