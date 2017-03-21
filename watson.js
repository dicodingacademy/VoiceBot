var config  = require('./config');
var fs      = require('fs');
var watson  = require('watson-developer-cloud');
var blobStream = require('blob-stream');

var conversation = watson.conversation({
  username: config.conversation_username,
  password: config.conversation_password,
  version: 'v1',
  version_date: '2017-02-03'
});

var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var speech_to_text = new SpeechToTextV1 ({
  username: config.STT_username,
  password: config.STT_password
});

var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var text_to_speech = new TextToSpeechV1 ({
  username: config.TTS_username,
  password: config.TTS_password
});

var watson = {
  message: function(text, context, callback){
    conversation.message({
      workspace_id: config.workspace_id,
      input: {'text': text},
      context: context
    }, callback);
  },

  speech: function(stream, err, data) {
    var params = {
      content_type: 'audio/l16; rate=44100; channels=2',
      model: 'en-US_BroadbandModel'  // Specify your language model here
    };
    var textStream = stream.pipe(
        speech_to_text.createRecognizeStream(params)
    );
    textStream.setEncoding('utf8');
    textStream.on('error', err);
    textStream.on('data', data);
  },

  text: function(message, filename, onFinish) {
    var params = {
      text: message,
      voice: 'en-US_AllisonVoice',
      accept: 'audio/wav'
    };

    // Pipe the synthesized text to a file.
    // text_to_speech.synthesize(params, callback);
    text_to_speech.synthesize(params)
    .on('error', function(error) {
      console.log('Error:', error);
    })
    .pipe(fs.createWriteStream('./audio/'+filename))
    .on('finish', onFinish);
    // }).pipe(blobStream).on('finish', onFinish);
  }

}

module.exports = watson;
