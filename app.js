/*
astro-naming-convention
Copyright 2018 Brian D. Morgan

Permission to use, copy, modify, and/or distribute this software for any purpose with
or without fee is hereby granted, provided that the above copyright notice and this
permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD
TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

// require these NodeJS modules:
const fs = require('fs');
const readline = require('readline');

// some app-specific constants:
const definitionFilename = 'definition.json';
const lastAnswersFilename = 'answers.json';

// main:
getDefinition().then(result => {
  let definition = result;
  getLastAnswers().then(result => {
    let lastAnswers = result.data || {};
    let useDefaults = result.useDefaults || false;
    if (result.message) {
      console.log(result.message);
    }
    // good to be here:
    processWorkflow(definition, lastAnswers, useDefaults);
  }, reason => {
    console.log(reason);
    process.exit(2);
  });
}, reason => {
  console.log(reason);
  process.exit(1);
});

// read the definition file, parse JSON, and return a JavaScript object:
function getDefinition() {
  return new Promise((resolve, reject) => {
    fs.readFile(definitionFilename, 'utf8', (err, data) => {
      if (!err) {
        try {
          var obj = JSON.parse(data);
          resolve(obj);
        }
        catch(err) {
          reject('Unable to parse definition file: ' + definitionFilename + '. Cannot continue.');
        }
      } else {
        reject('Unable to read definition file: ' + definitionFilename + '. Cannot continue.');
      }
    });
  });
}

// read the last answers file, parse JSON, and return a JavaScript object:
function getLastAnswers() {
  return new Promise((resolve, reject) => {
    fs.readFile(lastAnswersFilename, 'utf8', (err, data) => {
      if (!err) {
        try {
          var obj = JSON.parse(data);
          resolve({
            data: obj
          });
        }
        catch(err) {
          resolve({
            message: 'Unable to access last answers. Reverting to defaults.',
            useDefaults: true
          });
        }
      } else {
        resolve({
          useDefaults: true
        });
      }
    });
  });
}

// Evaluate the constraints on a given item.
// Note that undefined constraints automatically return true which means
// that the item should be included in the workflow.
function evaluateConstraints(item, definition) {
  var include = true;
  if (item.constraints) {
    item.constraints.forEach(constraint => {
      var argument = definition.find(otherItem => {
        return otherItem.id === constraint.id;
      });
      if (!argument) {
        console.log('Warning -- could not find constraint id: ' + constraint.id);
      }
      var match = constraint.answers.find(answer => {
        return answer.toUpperCase() === argument.answer.toUpperCase();
      });
      if (!match) {
        include = false;
      }
    });
  }
  return include;
}

// iterate through the definition, print last answer as default,
// accept new answer if desired, and print result when completed:
function processWorkflow(definition, lastAnswers, useDefaults) {

  // prepare event-based line input/output:
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // get an interator on the definition object:
  var iter = definition[Symbol.iterator]();
  var item;

  // define a custom prompt function:
  var prompt = () => {
    // get the next item from the definition object:
    while (true) {
      item = iter.next().value;
      if (item) {
        item.include = evaluateConstraints(item, definition);
        if (item.include) {
          // this is the last answer from the previous run:
          item.answer = useDefaults ? item.default : (lastAnswers[item.id] || '');
          // construct the custom prompt:
          rl.setPrompt(`${item.prompt} [${item.answer}] ? `);
          // print it out:
          rl.prompt();
          break;
        }
      } else {
        // no more items to iterate over -- fire the 'close' event:
        rl.close();
        break;
      }
    }
  };

  // print the first prompt:
  prompt();

  // this event is fired by the framework when a new line of input is available:
  rl.on('line', answer => {
    if (answer.length > 0) {
      // accept a new answer if something was typed in:
      if (answer === '-') {
        answer = '';
      }
      item.answer = answer.trim();
    }
    // print the next prompt:
    prompt();
  });

  // this event is fired by the framework when all iterations are completed:
  rl.on('close', () => {
    // build up the result:
    let result = [];
    // let's first sort them:
    definition.sort((a, b) => {
      return a.order - b.order;
    });
    // iterate over all definition items:
    definition.forEach(item => {
      if (item.include) {
        // get the answer:
        var answer = item.answer;
        // build up the result with this answer but skip it if answer is empty:
        if (answer.length > 0) {
          // create the formatting function:
          var formatter = eval('template`' + item.format + '`');
          // format the answer and push it onto the result.
          // replace any spaces with hyphens:
          result.push(formatter(answer).replace(/ /g, '-'));
        }
        // save the answer for use in the next run:
        lastAnswers[item.id] = answer;
      }
    });
    // print out the result, using underscores to separate answers:
    console.log(`\nName: ${result.join('_')}`);
    // write the last answers file:
    fs.writeFileSync(lastAnswersFilename, JSON.stringify(lastAnswers), 'utf8');
  });

  // this event is fired by the framework if user types Ctrl-C:
  rl.on('SIGINT', () => {
    console.log('\nYou requested to exit. Bye!');
    process.exit(1);
  });
}

// This is a very useful function from the Mozilla website:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates
// It can be used to create custom formatting functions. For example:
//    var formatter = template`Forecast for ${0}: Rain ending in ${1} minutes.`;
//    console.log(formatter('New York City', 26));

function template(strings, ...keys) {
  return (function(...values) {
    var dict = values[values.length - 1] || {};
    var result = [strings[0]];
    keys.forEach(function(key, i) {
      var value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
};
