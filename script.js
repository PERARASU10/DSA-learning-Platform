// Compiler Functionality
const openCompilerBtn = document.getElementById('openCompiler');
const closeCompilerBtn = document.getElementById('closeCompiler');
const minimizeCompilerBtn = document.getElementById('minimizeCompiler');
const compilerContainer = document.getElementById('compilerContainer');
const runCodeBtn = document.getElementById('runCode');
const output = document.getElementById('output');
const languageSelector = document.getElementById('languageSelector');

let editor; // Monaco Editor instance

// Initialize Monaco Editor
require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.33.0/min/vs' } });
require(['vs/editor/editor.main'], () => {
  editor = monaco.editor.create(document.getElementById('codeEditor'), {
    value: '', // Initial code
    language: 'python', // Default language
    theme: 'vs-dark', // VS Code dark theme
    automaticLayout: true, // Auto-resize editor
    fontSize: 14, // Font size
    fontFamily: 'Consolas, "Courier New", monospace', // VS Code font
    lineNumbers: 'on', // Show line numbers
    minimap: { enabled: false }, // Disable minimap
    scrollBeyondLastLine: false, // Disable extra scrolling
    renderWhitespace: 'none', // Hide whitespace characters
    wordWrap: 'on', // Enable word wrap
  });
});

// Piston API endpoint
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

openCompilerBtn.addEventListener('click', () => {
  compilerContainer.classList.add('active');
  openCompilerBtn.classList.add('hidden');
});

closeCompilerBtn.addEventListener('click', () => {
  compilerContainer.classList.remove('active');
  openCompilerBtn.classList.remove('hidden');
  // Clear compiler content
  editor.setValue(''); // Clear code editor
  output.textContent = 'Output will appear here...'; // Clear output
});

minimizeCompilerBtn.addEventListener('click', () => {
  compilerContainer.classList.toggle('minimized');
});

// Run Code Functionality
runCodeBtn.addEventListener('click', async () => {
  const code = editor.getValue(); // Get code from Monaco Editor

  // Check if code is empty
  if (!code.trim()) {
    output.textContent = 'Please write some code before running.';
    return;
  }

  const language = languageSelector.value; // Get selected language

  // Map languages to their specific versions
  const languageVersions = {
    python: '3.10.0',
    java: '15.0.2',
    c: '10.2.0',
    cpp: '10.2.0',
  };

  const version = languageVersions[language]; // Get the version for the selected language

  output.textContent = 'Running code...';
  runCodeBtn.disabled = true;
  runCodeBtn.textContent = 'Running...'; // Add loading state

  try {
    // Send code to Piston API
    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: version, // Use the specific version
        files: [
          {
            content: code,
          },
        ],
      }),
    });

    // Log the response for debugging
    console.log('Response:', response);

    if (!response.ok) {
      const errorData = await response.json(); // Parse the error response
      console.error('API Error:', errorData);
      throw new Error(`API Error: ${errorData.message || 'Unknown error'}`);
    }

    const resultData = await response.json();
    console.log('Result Data:', resultData);

    // Check if resultData.run exists
    if (resultData.run) {
      output.textContent = resultData.run.output || 'No output';
    } else {
      output.textContent = 'Error: No execution data received.';
    }
  } catch (error) {
    console.error('Error:', error);
    output.textContent = `Error executing code: ${error.message}`;
  } finally {
    runCodeBtn.disabled = false;
    runCodeBtn.textContent = 'Run Code'; // Reset button text
  }
});

// Update language selector to change Monaco Editor language
languageSelector.addEventListener('change', (e) => {
  const language = e.target.value;
  monaco.editor.setModelLanguage(editor.getModel(), language);
});

// Copy Button Functionality
document.getElementById('copy-button').addEventListener('click', () => {
  const codeContent = document.getElementById('code-display').textContent;
  navigator.clipboard.writeText(codeContent).then(() => {
    alert('Code copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy code: ', err);
  });
});

// Populate Concepts List
const conceptsList = document.getElementById("concepts-list");
const sortingTypesList = document.getElementById("sorting-types-list");
const typesListContainer = document.getElementById("types-list");
const codeSection = document.getElementById("code-section");
const conceptTitle = document.getElementById("concept-title");
const codeDisplay = document.getElementById("code-display");

const sortingTypes = [
  { name: "Bubble Sort", folder: "bubble-sort" },
  { name: "Selection Sort", folder: "selection-sort" },
  { name: "Insertion Sort", folder: "insertion-sort" },
  { name: "Merge Sort", folder: "merge-sort" },
  { name: "Quick Sort", folder: "quick-sort" },
];

const concepts = [
  { name: "Linked List", folder: "linked-list" },
  { name: "Sorting Algorithm", folder: "sorting-algorithm", types: sortingTypes },
];

concepts.forEach((concept) => {
  const listItem = document.createElement("li");
  listItem.textContent = concept.name;
  listItem.addEventListener("click", () => {
    if (concept.types) {
      showSortingTypes(concept.types);
    } else {
      showCodeSection(concept);
    }
  });
  conceptsList.appendChild(listItem);
});

function showSortingTypes(types) {
  typesListContainer.classList.remove("hidden");
  sortingTypesList.innerHTML = "";
  types.forEach((type) => {
    const typeItem = document.createElement("li");
    typeItem.textContent = type.name;
    typeItem.addEventListener("click", () => showCodeSection(type));
    sortingTypesList.appendChild(typeItem);
  });
}

function showCodeSection(concept) {
  conceptTitle.textContent = concept.name;
  codeDisplay.textContent = "Select a language to view the code.";
  codeSection.classList.remove("hidden");

  document.querySelectorAll("#language-buttons button").forEach((button) => {
    button.onclick = () => {
      const language = button.getAttribute("data-language");
      fetch(`concepts/${concept.folder}/${language}.txt`)
        .then((response) => response.text())
        .then((data) => {
          codeDisplay.textContent = data;
        })
        .catch(() => {
          codeDisplay.textContent = `Code not available for ${language}.`;
        });
    };
  });
}