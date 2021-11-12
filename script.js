'use strict';

// CLASS FOR LIST ITEMS
class ListItem {
  date = new Date();
  id = Date.now().toString().slice(-7);

  constructor(text, isCompleted = false) {
    (this.text = text), (this.isCompleted = isCompleted);
  }
}

//NEW ITEM ELEMENTS
const newItemText = document.querySelector('.new-item-text');
const newItemBtn = document.querySelector('.new-item-btn');

// LIST CONTROL ELEMENTS
const listControl = document.querySelector('.list-control');
const listLength = document.querySelector('.list-length');
const filterMenuBox = document.querySelector('.filter-items');
const filterMenu = document.querySelector('.filter-items-menu');
const deleteItemsBtn = document.querySelector('.delete-items');

//LIST ELEMENTS
const itemsList = document.querySelector('.list');

class App {
  list = [];
  maxLength = 50;

  constructor() {
    // GET DATA FROM LOCAL STORAGE
    this.getLocalStorage();

    //SET MAX NUM OF CHARS FOR ITEMS
    newItemText.maxLength = this.maxLength;

    //EVENT HANDLERS
    newItemBtn.addEventListener('click', this.newItem.bind(this));
    itemsList.addEventListener('click', this.deleteOneItem.bind(this));
    deleteItemsBtn.addEventListener(
      'click',
      this.deleteMultipleItems.bind(this)
    );
    itemsList.addEventListener('click', this.completeItem.bind(this));
    filterMenuBox.addEventListener('change', this.filterItems.bind(this));
    itemsList.addEventListener('click', this.editItem.bind(this));
  }

  newItem(e) {
    e.preventDefault();
    // CREATE NEW ITEM OBJECT, PUSH IT TO LIST ARRAY
    const text = newItemText.value;
    if (!text) return;
    const listItem = new ListItem(text);
    this.list.push(listItem);
    //RENDER LIST ITEM ONLY IF THE NOT COMPLETED ITEMS ARE BEING DISPPLAYED
    if (filterMenu.value !== 'completed') this.renderItem(listItem);
    //DISPLAY LIST LENGTH
    this.displayListLength();
    //DISPLAY LIST CONTROL
    this.displayListControl();
    newItemText.value = '';
    newItemText.focus;
    //SET LOCAL STORAGE
    this.setLocalStorage();
  }

  displayListControl() {
    if (this.list.length > 0) listControl.classList.remove('hidden');
    else listControl.classList.add('hidden');
  }

  displayListLength() {
    //COUNT NUMBER OF COMPLETED ITEMS
    const numCompl = this.list.filter(item => item.isCompleted).length;
    //SET THE TEXT
    listLength.textContent = `✔ ${numCompl}/${this.list.length}`;
    // // SET TEXT TO '' IF LIST EMPTY
    // if (this.list.length === 0) listLength.textContent = '';
  }

  renderItem(listItem) {
    const markup = `
      <li class="list-item ${
        listItem.isCompleted ? 'completed' : ''
      }" data-id="${listItem.id}">
        <button class="btn btn-complete">✔</button>
        <div class="list-item-text" contenteditable="false">${
          listItem.text
        }</div>
        <button class="btn btn-edit">📋</button>
        <button class="btn btn-delete">✖</button>
      </li>
    `;
    itemsList.insertAdjacentHTML('beforeend', markup);
  }

  renderList(list) {
    itemsList.innerHTML = '';
    list.forEach(listItem => {
      this.renderItem(listItem);
    });
    //DISPLAY LIST LENGTH
    this.displayListLength();
    //DISPLAY LIST CONTROL
    this.displayListControl();
  }

  delete(id) {
    //DELETE ITEM OBJECT FROM LIST ARRAY
    const index = this.list.findIndex(item => item.id === id);
    this.list.splice(index, 1);
    //RE-RENDER LIST
    this.renderList(this.list);
    //SET LOCAL STORAGE
    this.setLocalStorage();
    //DISPLAY LIST CONTROL
    this.displayListControl();
  }

  deleteOneItem(e) {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    const id = btn.closest('.list-item').dataset.id;
    this.delete(id);
  }

  deleteMultipleItems(e) {
    const btn = e.target.closest('.delete-items');
    if (!btn) return;
    //DELETE ALL ITEMS
    if (filterMenu.value === 'all') {
      this.list.splice(0);
      //RE-RENDER LIST
      this.renderList(this.list);
      //SET LOCAL STORAGE
      this.setLocalStorage();
      //DELETE COMPLETED ITEMS
    } else if (filterMenu.value === 'completed') {
      const newList = this.list.filter(item => !item.isCompleted);
      this.list = newList;
      //RE-RENDER LIST
      this.renderList(this.list);
      //DISPLAY FILTER OPTION
      this.filterItems();
      //SET LOCAL STORAGE
      this.setLocalStorage();
    } else return;
  }

  editItem(e) {
    const btn = e.target.closest('.btn-edit');
    if (!btn) return;
    //IF ITEM IS COMPLETED RETURN
    const id = btn.closest('.list-item').dataset.id;
    const index = this.list.findIndex(item => item.id === id);
    if (this.list[index].isCompleted) return;
    //SELECT TEXT FIELD
    const text = btn.closest('.list-item').querySelector('.list-item-text');
    //ALLOW CONTENT EDITING
    if (text.contentEditable === 'false') {
      text.contentEditable = 'true';
      text.classList.add('editing');
      //FOCUS END OF THE TEXT CONTENT
      const selection = window.getSelection();
      const range = document.createRange();
      selection.removeAllRanges();
      range.selectNodeContents(text);
      range.collapse(false);
      selection.addRange(range);
      text.focus();
      text.addEventListener('keydown', e => {
        // DONT ALLOW NEW LINES
        if (e.key === 'Enter') e.preventDefault();
        //PREVENT FROM TYPING MORE THEN "THIS.MAXLENGTH" CHARS
        const textLen = text.textContent.length;
        if (textLen >= this.maxLength && e.key !== 'Backspace')
          e.preventDefault();
      });
    }
    //CLOSE CONTENT EDITING IF THE FIELD ISN'T EMPTY
    else {
      if (text.textContent === '') return;
      text.contentEditable = 'false';
      text.classList.remove('editing');
      //SAVE NEW ITEM TEXT
      this.list[index].text = text.textContent;
      //SET LOCAL STORAGE
      this.setLocalStorage();
    }
  }

  completeItem(e) {
    const btn = e.target.closest('.btn-complete');
    if (!btn) return;
    //FIND ITEM OBJECT (INDEX) IN LIST
    const id = btn.closest('.list-item').dataset.id;
    const index = this.list.findIndex(item => item.id === id);
    //SET iSCOMPLETED VALUE OF ITEM OBJECT
    this.list[index].isCompleted = this.list[index].isCompleted ? false : true;
    //DISPLAY ITEM AS COMPLETED
    btn.closest('.list-item').classList.toggle('completed');
    //SET LOCAL STORAGE
    this.setLocalStorage();
    //DISPLAY LIST LENGTH INFO
    this.displayListLength();
    //FILTER
    this.filterItems();
  }

  setLocalStorage() {
    localStorage.setItem('list', JSON.stringify(this.list));
  }

  getLocalStorage() {
    //GET DATA FROM LOCAL STORAGE
    const data = JSON.parse(localStorage.getItem('list'));
    if (!data) return;
    // SET LIST ARRAY FROM DATA
    this.list = data;
    //SET PROTOTYPE FOR ITEMS OBJECTS
    this.list.forEach(item => {
      if (item.__proto__ !== ListItem.prototype)
        item.__proto__ = ListItem.prototype;
    });
    //RENDER LIST
    this.renderList(this.list);
  }

  filterItems() {
    let filterList;
    // IF "ALL" SELECTED, JUST RENDER THIS.LIST
    if (filterMenu.value === 'all') {
      this.renderList(this.list);
      //STYLE ON DELETE ITEMS BTN
      deleteItemsBtn.classList.remove('inactive');
    }
    // IF OTHER OPTIONS SELECTED, RENDER FILTERED LIST
    if (filterMenu.value === 'completed') {
      filterList = this.list.filter(item => item.isCompleted);
      this.renderList(filterList);
      //STYLE ON DELETE ITEMS BTN
      deleteItemsBtn.classList.remove('inactive');
    }
    if (filterMenu.value === 'not-completed') {
      filterList = this.list.filter(item => !item.isCompleted);
      this.renderList(filterList);
      //STYLE ON DELETE ITEMS BTN
      deleteItemsBtn.classList.add('inactive');
    }
  }
}

const app = new App();
