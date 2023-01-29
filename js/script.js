// CLASSES
class Note {
  constructor(value) {
    this.content = value;
    this.pinned = false;
  }
}

class Db {
  // GET CURRENT ID STORED ON LOCALSTORAGE
  currentId() {
    const id = localStorage.getItem('id');

    if (!id) {
      localStorage.setItem('id', 0);
      return 1;
    }

    return parseInt(id) + 1;
  }

  // SAVE NOTE ON LOCALSTORAGE
  saveNote(value) {
    const nextId = this.currentId();
    localStorage.setItem(nextId, JSON.stringify(value));
    localStorage.setItem('id', nextId);
  }

  // GET NOTES FROM LOCAL STORAGE ON OBJECT FORMAT
  getNotesFromLocalStorage() {
    let data = [];

    const id = localStorage.getItem('id');

    for (let i = 0; i <= id; i++) {
      const dataObject = JSON.parse(localStorage.getItem(i));

      if (dataObject !== null) {
        dataObject.id = i;
        data.push(dataObject);
      }
    }

    const organizedData = data.sort((a, b) => a.pinned - b.pinned).reverse();

    return organizedData;
  }

  // SWITCHES THE STATUS OF NOTE
  switchPinnedStatus(id) {
    const currentData = JSON.parse(localStorage.getItem(JSON.stringify(id)));

    currentData.pinned = !currentData.pinned;

    localStorage.setItem(id, JSON.stringify(currentData));

    ShowNotesOnScreen();
  }

  // UPDATE NOTE
  updateNote(updatedData) {
    localStorage.setItem(updatedData.id, JSON.stringify(updatedData));
  }

  // REMOVE NOTE FROM LOCALSTORAGE
  removeNote(id) {
    localStorage.removeItem(id);
    ShowNotesOnScreen();
  }

  // CLONE A NOTE
  cloneNote(data) {
    const nextId = this.currentId();
    localStorage.setItem(nextId, JSON.stringify(data));
    localStorage.setItem('id', nextId);

    ShowNotesOnScreen();
  }

  // SEARCH FOR A NOTE
  search(note) {
    const notes = this.getNotesFromLocalStorage();

    const filteredNotes = notes.filter((n) =>
      n.content.toLowerCase().includes(note.content.toLowerCase()),
    );

    ShowNotesOnScreen(filteredNotes, true);
  }
}

const db = new Db();
const addNoteBtn = document.querySelector('#addNote');

addNoteBtn.addEventListener('click', () => {
  const NoteValue = document.querySelector('#addNoteField');

  if (!NoteValue.value) {
    alert('The add field cannot be null!');
    return;
  }

  const note = new Note(NoteValue.value);

  db.saveNote(note);

  NoteValue.value = '';

  ShowNotesOnScreen();
});

// FUNCTION TO DISPLAY ALL NOTES ON NOTES CONTAINER
function ShowNotesOnScreen(notes = [], filter = false) {
  if (notes.length <= 0 || filter == false) {
    notes = db.getNotesFromLocalStorage();
  }

  const notesWrapper = document.querySelector('#notesWrapper');

  notesWrapper.innerHTML = '';

  notes.map((n) => {
    // NOTEPAD CONTAINER
    const noteDiv = document.createElement('div');

    n.pinned === false
      ? noteDiv.classList.add('note')
      : noteDiv.classList.add('note', 'pinned');

    // TEXTAREA ELEMENT
    const textareaElm = document.createElement('textarea');
    textareaElm.innerText = n.content;

    textareaElm.addEventListener('change', (e) => {
      n.content = e.target.value;
      db.updateNote(n);
    });

    //THUMBTACK ELEMENT
    const thumbTackDiv = document.createElement('div');
    thumbTackDiv.classList.add('thumbtackWrapper');

    const thumbTackIcon = document.createElement('i');
    thumbTackIcon.className = 'fa-sharp fa-solid fa-thumbtack';

    //THUMBTACK DIV PIN FN
    thumbTackDiv.addEventListener('click', () => {
      db.switchPinnedStatus(n.id);
    });

    thumbTackDiv.appendChild(thumbTackIcon);

    //OPTIONS ELEMENTS
    const optionsWrapperDiv = document.createElement('div');
    optionsWrapperDiv.classList.add('optionsWrapper');

    const removeIcon = document.createElement('i');
    removeIcon.className = 'fa-solid fa-xmark';

    removeIcon.addEventListener('click', () => {
      db.removeNote(n.id);
    });

    const copyIcon = document.createElement('i');
    copyIcon.className = 'fa-regular fa-copy';

    copyIcon.addEventListener('click', () => {
      db.cloneNote(n);
    });

    optionsWrapperDiv.appendChild(removeIcon);
    optionsWrapperDiv.appendChild(copyIcon);

    //APPENDING ELEMENTS
    noteDiv.appendChild(textareaElm);
    noteDiv.appendChild(thumbTackDiv);
    noteDiv.appendChild(optionsWrapperDiv);

    notesWrapper.appendChild(noteDiv);
  });
}

// SEARCHFIELD
const searchField = document.querySelector('#searchField');

searchField.addEventListener('keyup', (e) => {
  const note = new Note(e.target.value);

  db.search(note);
});

// CSV
const btnCSVExport = document.querySelector('#btnCSVExport');

btnCSVExport.addEventListener('click', () => {
  const data = db.getNotesFromLocalStorage();

  downloadCSV(data);
});

function downloadCSV(objArray) {
  let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  let str = '';

  console.log(array);

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index in array[i]) {
      if (line != '') line += ',';

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  let file = new Blob([str], { type: 'text/csv' });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(file, 'data.csv');
  } else {
    let a = document.createElement('a'),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
