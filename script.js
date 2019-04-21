let input;
let exp;
let inversed = false;
let expCont = '';
let temp = '';
let memory = [];
let hist;

window.onload = () => {
  input = document.querySelector('#input-panel');
  exp = document.querySelector('#expressions');
  hist = document.querySelector('#history');

  document.querySelectorAll('.btn').forEach(x => {
    // Handler for button clicks
    x.onclick = () => {
      // speak when a button click triggered
      getSpeechText(x);
      // check if the button is a valued one and append it to the input panel
      if (x.name === 'value') {
        // check that the button is not an operator
        if (x.className.indexOf('oprtr') === -1) {
          input.value += x.value;
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
              input.value += '.';
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
          case '()':
            handleBraces();
        }
      }
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
      getSpeechText(x);
    };
  });

  document.getElementById('pi').onclick = () => {
    if (lastIsOperator() || input.value === '') {
      input.value = 'π';
      responsiveVoice.speak('pi', 'US English Female');
    }
  };

  document.getElementById('ans').onclick = () => {
    if (memory.length !== 0 && (lastIsOperator() || input.value === '')) {
      input.value = memory[memory.length - 1];
      responsiveVoice.speak('previous answer', 'US English Female');
    }
  };

  document.getElementById('inverse').onclick = () => {
    responsiveVoice.speak('inversing', 'US English Female');
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
  };
  // handler for keydown events
  window.addEventListener('keydown', (e)=> {
    document.querySelector("button[value='" + e.key.replace('Enter', '=').replace('/', '÷').replace('*', '×') + "']") ? document.querySelector("button[value='" + e.key.replace('Enter', '=').replace('/', '÷').replace('*', '×') + "']").click() :  false;
  });
};

// Handler for content changes
function oncontent () {
  exp.innerHTML = formatToHTML(formatExpression(temp));
}
