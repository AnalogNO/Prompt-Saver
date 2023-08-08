document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#submit").addEventListener("click", onClickSubmit);
  document.querySelector("#key").addEventListener("click", onClickKey);
  document.querySelector("#saveBtn").addEventListener('click', onClickSave);
  document.querySelector("#loadBtn").addEventListener('click', onClickLoad);
  document.querySelector("#renameBtn").addEventListener('click', onClickRename);
  document.querySelector("#loading").style.display = "none";
  var savedInputs = JSON.parse(localStorage.getItem('savedInputs')) || [];
  updateSavedInputsDropdown(savedInputs);

});

function onClickSubmit() {
  // Your original submit button click logic goes here...
  var queryInput = document.querySelector("#queryInput").value;

  if (localStorage.getItem("key") === null) {
    alert(
      "No Key saved. click the key in the bottom right corner, and enter your key."
    );
    return;
  }

  const key = localStorage.getItem("key");
  const openaiApiKey = key;
  console.log("Talking to  OpenAI API...");
  console.log(`Key is: ${openaiApiKey}, Query is ${queryInput}`);
  document.querySelector("#loading").style.display = "block";
  document.querySelector("#menu").style.display = "none";

  chrome.runtime.sendMessage(
    {
      method: "POST",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {"role": "system", "content": "You are a helpful assistant. output everything in HTML format."},
          {
  "role": "user",
  "content": `${queryInput}`
}

        ],
      }),
    },
    handleResponse
  );
}

function onClickKey() {
  // Your original key button click logic goes here...
  var key = prompt(
    "Enter your OpenAI API key. You can find it at https://beta.openai.com/account/api-keys"
  );
  if (key === "") {
    alert(
      "You have deleted your key. You will need to enter it again if you wish to continue."
    );
    localStorage.removeItem("key");
  } else {
    alert(
      "You have saved your key!"
    );
    localStorage.setItem("key", key);
  }
}

function onClickSave() {
  // Your original save button click logic goes here...
  var query = document.getElementById('queryInput').value;
  var savedInputs = JSON.parse(localStorage.getItem('savedInputs')) || [];
  var name = prompt('Enter a name for this input:', query);
  if (name) {
      savedInputs.push({ name: name, input: query });
      localStorage.setItem('savedInputs', JSON.stringify(savedInputs));
      updateSavedInputsDropdown(savedInputs);
  }
}

function onClickLoad() {
  // Your original load button click logic goes here...
  var savedInputsDropdown = document.getElementById('savedInputs');
  var selectedIndex = savedInputsDropdown.selectedIndex;
  if (selectedIndex >= 0) {
      var savedInputs = JSON.parse(localStorage.getItem('savedInputs')) || [];
      document.getElementById('queryInput').value = savedInputs[selectedIndex].input;
  }
}

function onClickRename() {
  // Your original rename button click logic goes here...
  var savedInputsDropdown = document.getElementById('savedInputs');
  var selectedIndex = savedInputsDropdown.selectedIndex;
  if (selectedIndex >= 0) {
      var newName = prompt('Enter the new name:', savedInputsDropdown.options[selectedIndex].text);
      if (newName) {
          var savedInputs = JSON.parse(localStorage.getItem('savedInputs')) || [];
          savedInputs[selectedIndex].name = newName;
          localStorage.setItem('savedInputs', JSON.stringify(savedInputs));
          updateSavedInputsDropdown(savedInputs);
      }
  }
}

function updateSavedInputsDropdown(savedInputs) {
  // Your original updateSavedInputsDropdown function logic goes here...
  var dropdown = document.getElementById('savedInputs');
  dropdown.innerHTML = '';
  for (var i = 0; i < savedInputs.length; i++) {
      var option = document.createElement('option');
      option.text = savedInputs[i].name;
      option.value = i;  // Store the index of the input in the value property
      dropdown.add(option);
  }
}

function handleResponse(response) {
  if (chrome.runtime.lastError) {
    alert(`Error: ${chrome.runtime.lastError.message}`);
    return;
  }
  if (response.error) {
    alert(`Error: ${response.error}`);
    return;
  }

  let answer = response.choices[0].message.content;
  console.log(`Answer is: ${answer}`);
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#key").style.display = "none";
  answer = "<br>" + answer;
  document.querySelector("#result").innerHTML = answer;
}
