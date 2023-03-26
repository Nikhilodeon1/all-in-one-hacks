from flask import Flask, render_template, request, redirect, url_for, flash, make_response, session, abort
#import openai
from werkzeug.utils import secure_filename
import requests
#============================
import torch
import torchaudio
torch.random.manual_seed(0)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
from torchaudio.utils import download_asset
#=============================
app = Flask(__name__)
app.secret_key = "|\|||<|-|||_"
#============================
#openai.api_key = "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"
#print(completion.choices[0].message)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/conversion', methods=['POST'])
def conversion():
    r = requests.get('blob:http://127.0.0.1:5000/e83a4000-7389-4d7a-823a-3142029821cf')
    with open('static\query.wav', 'wb') as f:
        f.write(r.content)
    SPEECH_FILE = download_asset("C:\\Users\\nikhi\\sciencFairProject_v2\\static\\query.wav")
    bundle = torchaudio.pipelines.WAV2VEC2_ASR_BASE_960H
    model = bundle.get_model().to(device)
    waveform, sample_rate = torchaudio.load(SPEECH_FILE)
    waveform = waveform.to(device)
    if sample_rate != bundle.sample_rate:
        waveform = torchaudio.functional.resample(waveform, sample_rate, bundle.sample_rate)
    with torch.inference_mode():
        emission, _ = model(waveform)
    class GreedyCTCDecoder(torch.nn.Module):
        def __init__(self, labels, blank=0):
            super().__init__()
            self.labels = labels
            self.blank = blank
        def forward(self, emission: torch.Tensor) -> str:
            indices = torch.argmax(emission, dim=-1)  # [num_seq,]
            indices = torch.unique_consecutive(indices, dim=-1)
            indices = [i for i in indices if i != self.blank]
            return "".join([self.labels[i] for i in indices])
    decoder = GreedyCTCDecoder(labels=bundle.get_labels())
    transcript = decoder(emission[0])
    return render_template('result.html', transcript=transcript)

@app.route('/manager')
def manager():
    #chat or music?
    return 'a'
