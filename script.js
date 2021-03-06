// script.js

let input;
let exp;
let inversed = false;
let expCont = '';
let temp = '';
let memory = [];
let hist;
let mode = 'r'; // radian mode
let soundEnabled = false;

window.onload = () => {
  input = document.querySelector('#input-panel');
  exp = document.querySelector('#expressions');
  hist = document.querySelector('#history');

  responsiveVoice.setDefaultVoice('US English Female');

  document.querySelectorAll('.btn').forEach(x => {
    // Handler for button clicks
    x.onclick = () => {
      // check if the button is a valued one and append it to the input panel
      if (x.name === 'value') {
        // check that the button is not an operator
        if (x.className.indexOf('oprtr') === -1) {
          if (lastIsOperator() || exp.innerHTML === '' || input.value.endsWith('(') || /[\d\.]/.test(input.value.charAt(input.value.length - 1))) {
            input.value += x.value;
          } else {
            exp.innerText += input.value + '×';
            temp += input.value + '×';
            input.value = x.value;
          }
        } else {
          // if the button is an operator and the last is not an operator, the operator and previous entries in input will append to exp panel while clearing all the entries in the input panel.
          if (!lastIsOperator() && (temp !== '' || input.value !== '')) {
            exp.innerText += input.value + '' + x.value;
            temp += input.value + '' + x.value;
            input.value = '';
          } else if (lastIsOperator() && (temp !== '' || input.value !== '')) {
            temp = temp.substring(0, temp.length - 1) + x.value;
            exp.innerText = temp;
          }
        }
        // Checks if a function is associated with the button (like equals, sqrt, etc.)
      } else if (x.name === 'func') {
        switch (x.value) {
          case '=':
            // input.value = getResult(input.value);
            if (temp !== '' || input.value !== '') {
              if (input.value !== '') {
                input.value = getResult(temp + input.value);
                exp.innerText = '';
                temp = '';
              } else {
                input.value = getResult(temp.substring(0, temp.length - 1) + input.value);
                exp.innerText = '';
                temp = '';
              }
            }
            break;
          case '.':
            if (!hasDecimal()) {
              if (!lastIsOperator() && (temp !== '' || input.value !== '')) {
                input.value += '.';
              } else if (lastIsOperator() && (temp !== '' || input.value !== '')) {
                input.value = '.';
              }
            }
            break;
          case '←':
            input.value = input.value.substring(0, input.value.length - 1);
            break;
          case 'C':
            input.value = '';
            exp.innerText = '';
            temp = '';
            break;
          case 'CE':
            input.value = '';
            break;
          case '±':
            input.value = '-(' + input.value + ')';
            break;
          case '%':
            if (!(input.value === '' && temp === '')) {
              input.value = getResult(temp + input.value + '*100');
              exp.innerText = '';
              temp = '';
            }
            break;
          case 'sin':
            addFunction('sin');
            break;
          case 'cos':
            addFunction('cos');
            break;
          case 'tan':
            addFunction('tan');
            break;
          case '()':
            handleBraces();
            break;
        }
      }
      x.blur();
      // speak when a button click triggered
      getSpeechText(x);
    };
  });

  // listener for changes in #exp
  setInterval(() => {
    if (exp.innerHTML !== expCont) {
      oncontent();
      expCont = exp.innerHTML;
      console.log(temp);
    }

  }, 300);

  // advanced button handlers here...

  // handler for buttons with common mathematical functions
  document.querySelectorAll('.func').forEach(x => {
    x.onclick = () => {
      addFunction(x.value);

      x.blur();
      getSpeechText(x);
    };
  });

  document.getElementById('pi').onclick = () => {
    if (lastIsOperator() || input.value === '' || input.value.endsWith('(')) {
      input.value += 'π';
    } else if (lastIsNumber() || input.value.endsWith(')')) {
      exp.innerText += input.value + '×';
      temp += input.value + '×';
      input.value = 'π';
    }
    document.getElementById('pi').blur();
    speak('pi');
  };

  document.getElementById('E').onclick = () => {
    if (lastIsOperator() || input.value === '' || input.value.endsWith('(')) {
      input.value += 'E';
    } else if (lastIsNumber() || input.value.endsWith(')')) {
      exp.innerText += input.value + '×';
      temp += input.value + '×';
      input.value = 'E';
    }
    document.getElementById('E').blur();
    speak('e');
  }

  document.getElementById('rand').onclick = () => {
    if (lastIsOperator() || input.value === '' || input.value.endsWith('(')) {
      input.value += random();
    } else if (lastIsNumber() || input.value.endsWith(')')) {
      exp.innerText += input.value + '×';
      temp += input.value + '×';
      input.value = random();
    }
    document.getElementById('random').blur();
    speak('random number');
  }

  document.getElementById('ans').onclick = () => {
    if (memory.length !== 0 && (lastIsOperator() || input.value === '')) {
      input.value = memory[memory.length - 1];
    } else if (memory.length !== 0 && lastIsNumber()) {
      exp.innerText += input.value + '×';
      temp += input.value + '×';
      input.value = memory[memory.length - 1];
    }
    document.getElementById('ans').blur();
    speak('Previous answer');
  };

  document.getElementById('inverse').onclick = () => {

    inversed = !inversed;
    document.querySelectorAll('.inversable').forEach(x => {
      // format the buttons for the inversed version
      if (inversed) {
        document.getElementById('inverse').style.backgroundColor = 'rgb(144, 223, 228)';
        x.style.backgroundColor = 'rgb(144, 223, 228)';
        x.innerHTML = inverseDict[x.value];
        x.value = inverseDict[x.value];
        // format the button for the normal version
      } else {
        document.getElementById('inverse').style.backgroundColor = 'white';
        x.style.backgroundColor = 'white';
        for (let [k, v] of Object.entries(inverseDict)) {
          if (x.value === v) {
            x.value = k;
            x.innerHTML = k;
          }
        }
      }
    });
    document.getElementById('inverse').blur();
    speak('inversing');
  };

  document.getElementById('angle-mode').onclick = () => {
    mode = mode === 'r' ? 'd' : 'r';
    document.getElementById('angle-mode').blur();
  };

  // Toggle the sounds
  document.querySelector('.sound').onclick = () => {
    if (!soundEnabled) {
      soundEnabled = true;
      document.getElementsByClassName('sound')[0].classList['value'] = 'fas fa-volume-up sound';
    } else {
      soundEnabled = false;
      document.getElementsByClassName('sound')[0].classList['value'] = 'fas fa-volume-mute sound';
    }
  };

  // handler for keydown events
  window.addEventListener('keydown', (e) => {
    // True if an input has focus
    let inputFocused;
    console.log(e.key.replace('Enter', '='));
    // Relavant key on the calculator to the key pressed on keyboard
    let relBtn = document.querySelector("button[value='" + e.key.toUpperCase().replace('ENTER', '=').replace('/', '÷').replace('*', '×').replace('BACKSPACE', '←') + "']");
    for (let x of document.querySelectorAll('input')) {
      if (x.matches(':focus')) {
        inputFocused = true;
        break;
      }
    }
    if (!inputFocused && relBtn) {
      relBtn.click();
    }
  });
};

// Handler for content changes
function oncontent () {
  exp.innerHTML = formatToHTML(formatExpression(temp));
  for (let x of exp.children) {
    if (x.nodeName === 'INPUT') {
      resizable(x);
    }
  }
}
