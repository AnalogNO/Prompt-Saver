document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#submit").addEventListener("click", onClickSubmit);
  document.querySelector("#key").addEventListener("click", onClickKey);
  document.querySelector("#saveBtn").addEventListener('click', onClickSave);
  document.querySelector("#loadBtn").addEventListener('click', onClickLoad);
  document.querySelector("#renameBtn").addEventListener('click', onClickRename);
  document.querySelector("#deleteBtn").addEventListener('click', onClickDelete);
  document.querySelector("#loading").style.display = "none";
  var savedInputs = JSON.parse(localStorage.getItem('savedInputs')) || [];
  updateSavedInputsDropdown(savedInputs);

});

function onClickSubmit() {
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
  var savedInputsDropdown = document.getElementById('savedInputs');
  var selectedIndex = savedInputsDropdown.selectedIndex;
  if (selectedIndex >= 0) {
      var savedInputs = JSON.parse(localStorage.getItem('savedInputs')) || [];
      document.getElementById('queryInput').value = savedInputs[selectedIndex].input;
  }
}

function onClickRename() {
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

function onClickDelete() {
  var savedInputsDropdown = document.getElementById('savedInputs');
  var selectedIndex = savedInputsDropdown.selectedIndex;
  if (selectedIndex >= 0) {
    var confirmation = confirm('Are you sure you want to delete this item?');
    if (confirmation) {
      var savedInputs = JSON.parse(localStorage.getItem('savedInputs')) || [];
      savedInputs.splice(selectedIndex, 1);
      localStorage.setItem('savedInputs', JSON.stringify(savedInputs));
      updateSavedInputsDropdown(savedInputs);
    }
  }
}

function updateSavedInputsDropdown(savedInputs) {
  var dropdown = document.getElementById('savedInputs');
  dropdown.innerHTML = '';
  for (var i = 0; i < savedInputs.length; i++) {
      var option = document.createElement('option');
      option.text = savedInputs[i].name;
      option.value = i; 
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
