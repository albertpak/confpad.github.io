const fs = require('fs');
const path = require('path');

const jsyaml = require('js-yaml');

const MESSAGE_LIMIT = 280;
let talks, conferences;

// Get filenames
let talksFile = process.argv[2];
let conferencesFile = './data/conferences.yaml';

if (!conferencesFile) {
  return console.error('No talks file provided, run, e.g.: `make tools-simple-list FILE=data/conferences/2018-09-13-react-alicante-2018.yaml`')
}

// Read YAML configs
let conferencesYamlString = fs.readFileSync(conferencesFile, 'utf8');
let talksYamlString = fs.readFileSync(talksFile, 'utf8');

// Convert YAML to JS object
try {
  conferences = jsyaml.safeLoad(conferencesYamlString);
  talks = jsyaml.safeLoad(talksYamlString);
} catch (error) {
  return console.error(error.message);
}

// Get conference
let conferenceId = path.basename(talksFile, path.extname(talksFile));
let conference = conferences.find(item => item.id === conferenceId);

let title = `New videos from ${conference.name}: https://confpad.io/#/${conferenceId}`;
let footer = `…and more!`;

// Prepare
talks = talks
  .sort(() => Math.random() - 0.5)
  .map(talk => {
    let authors = (talk.authors || [])
      .map(item => item.twitter)
      .filter(item => item)
      .map(item => `@${item}`)
      .join(', ');
    authors = authors ? ` by ${authors}` : '';

    return `🎤 ${talk.title}${authors}`;
  });

// Build messages
let result = [];
let message = [];
while (talks.length) {
  if (!message.length) {
    message.push(title);
    message.push('');
  }

  message.push(talks.pop());

  // Prepare final message
  let finalMessage = Array.from(message);
  finalMessage.push(footer);
  finalMessage = finalMessage.join('\n');

  // Add message to result if maximum character lenght reached
  if (finalMessage.length > MESSAGE_LIMIT) {
    talks.push(message.pop());
    message.push(footer);
    result.push(message.join('\n'));
    message = [];
  }
}

result.forEach(item => console.log(`${item}\n\n`));
