'use strict';

// CLASS FOR LIST ITEMS
class ListItem {
  date = new Date();
  id = Date.now().toString().slice(-7);

  constructor(text, isCompleted = false) {
    (this.text = text), (this.isCompleted = isCompleted);
  }
}

const newItemText = document.querySelector('.new-item-text');
const newItemBtn = document.querySelector('.new-item-btn');

const listLength = document.querySelector('.list-length');
const filterMenu = document.querySelector('.filter-items-menu');

const itemsList = document.querySelector('.list');

class App {
  list = [];

  constructor() {
    // GET DATA FROM LOCAL STORAGE
    this.getLocalStorage();

    //EVENT HANDLERS
    newItemBtn.addEventListener('click', this.newItem.bind(this));
    itemsList.addEventListener('click', this.deleteItem.bind(this));
    itemsList.addEventListener('click', this.completeItem.bind(this));
    filterMenu.addEventListener('change', this.filterItems.bind(this));
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
    newItemText.value = '';
    newItemText.focus;
    //SET LOCAL STORAGE
    this.setLocalStorage();
  }

  displayListLength() {
    //COUNT NUMBER OF COMPLETED ITEMS
    const numCompl = this.list.filter(item => item.isCompleted).length;
    listLength.textContent = `${numCompl} / ${this.list.length} ${
      this.list.length > 1 ? 'items' : 'item'
    }`;
    if (this.list.length === 0) listLength.textContent = '';
  }

  renderItem(listItem) {
    const markup = `
      <li class="list-item ${
        listItem.isCompleted ? 'completed' : ''
      }" data-id="${listItem.id}">
        <div class="list-item-text" contenteditable="false">${
          listItem.text
        }</div>
        <button class="btn btn-complete">✅</button>
        <button class="btn btn-delete">❌</button>
        <button class="btn btn-edit">📋</button>
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
  }

  deleteItem(e) {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    //DELETE ITEM OBJECT FROM LIST ARRAY
    const id = btn.closest('.list-item').dataset.id;
    const index = this.list.findIndex(item => item.id === id);
    this.list.splice(index, 1);
    //RE-RENDER LIST
    this.renderList(this.list);
    //SET LOCAL STORAGE
    this.setLocalStorage();
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
      text.focus();
    }
    //CLOSE CONTENT EDITING IF THE FIELD ISN'T EMPTY
    else {
      if (text.textContent === '') return;
      text.contentEditable = 'false';
      text.classList.remove('editing');
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
    if (filterMenu.value === 'all') this.renderList(this.list);
    // IF OTHER OPTIONS SELECTED, RENDER FILTERED LIST
    if (filterMenu.value === 'completed') {
      filterList = this.list.filter(item => item.isCompleted);
      this.renderList(filterList);
    }
    if (filterMenu.value === 'not-completed') {
      filterList = this.list.filter(item => !item.isCompleted);
      this.renderList(filterList);
    }
  }
}

const app = new App();
