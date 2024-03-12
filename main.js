const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-book';
const bookShelf = [];

document.addEventListener('DOMContentLoaded', function () {
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.addEventListener('click', function (event) {
        if (event.target.classList.contains('mark-as-read')) {
            const bookId = parseInt(event.target.parentElement.parentElement.id.split('-')[1]);
            addBookToCompleted(bookId);
        }
    });
});

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const id = generateId();
    const bookObject = generateBookObject(id, title, author, year, isComplete);
    bookShelf.push(bookObject);

    const bookElement = makeBook(bookObject);

    if (isComplete) {
        const completedBookList = document.getElementById('completeBookshelfList');
        completedBookList.appendChild(bookElement);
    } else {
        const uncompletedBookList = document.getElementById('incompleteBookshelfList');
        uncompletedBookList.appendChild(bookElement);
    }

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;
    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + bookObject.author;
    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + bookObject.year;
    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);
    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    if (bookObject.isComplete) {
        const markAsReadButton = document.createElement('button');
        markAsReadButton.classList.add('green', 'mark-as-read');
        markAsReadButton.innerText = 'Belum selesai dibaca';
        markAsReadButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText = 'Hapus Buku';
        deleteButton.addEventListener('click', function () {
            const bookId = parseInt(this.parentElement.parentElement.id.split('-')[1]);
            removeBook(bookId);
        });

        const buttonAction = document.createElement('div');
        buttonAction.classList.add('action');
        buttonAction.append(markAsReadButton, deleteButton);
        container.append(buttonAction);
    } else {
        const markAsReadButton = document.createElement('button');
        markAsReadButton.classList.add('green', 'mark-as-read');
        markAsReadButton.innerText = 'Sudah Selesai Dibaca';
        markAsReadButton.addEventListener('click', function () {
            const bookId = parseInt(this.parentElement.parentElement.id.split('-')[1]);
            addBookToCompleted(bookId);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText = 'Hapus Buku';
        deleteButton.addEventListener('click', function () {
            const bookId = parseInt(this.parentElement.parentElement.id.split('-')[1]);
            removeBook(bookId);
        });

        const buttonAction = document.createElement('div');
        buttonAction.classList.add('action');
        buttonAction.append(markAsReadButton, deleteButton);
        container.append(buttonAction);
    }
    return container;
}

function addBookToCompleted(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;
    if (!bookShelf[bookIndex].isComplete) {
        bookShelf[bookIndex].isComplete = true;
        const updatedBookElement = makeBook(bookShelf[bookIndex]);
        const uncompletedBookList = document.getElementById('incompleteBookshelfList');
        const bookElementToRemove = document.getElementById(`book-${bookId}`);
        if (bookElementToRemove && uncompletedBookList.contains(bookElementToRemove)) {
            uncompletedBookList.removeChild(bookElementToRemove);
            const completedBookList = document.getElementById('completeBookshelfList');
            completedBookList.appendChild(updatedBookElement);

            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        } else {
            console.error(error);
        }
    }
}

function removeBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;
    const confirmation = confirm('Apakah Yakin??')
    if (confirmation) {
        bookShelf.splice(bookIndex, 1);

        const bookElementToRemove = document.getElementById(`book-${bookId}`);
        if (bookElementToRemove) {
            bookElementToRemove.parentElement.removeChild(bookElementToRemove)
        }
        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function removeBookFromCompleted(bookId) {
    const bookTargetIndex = findBookIndex(bookId);
    if (bookTargetIndex === -1) return;
    bookShelf.splice(bookTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = false;
    const updatedBookElement = makeBook(bookTarget);
    const completedBookList = document.getElementById('completeBookshelfList');
    const bookElementToRemove = document.getElementById(`book-${bookId}`);
    completedBookList.removeChild(bookElementToRemove);
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.appendChild(updatedBookElement);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of bookShelf) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in bookShelf) {
        if (bookShelf[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        isComplete
    };
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookShelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            bookShelf.push(book);
            const bookElement = makeBook(book);
            if (book.isComplete) {
                const completedBookList = document.getElementById('completeBookshelfList');
                completedBookList.appendChild(bookElement);
            } else {
                const uncompletedBookList = document.getElementById('incompleteBookshelfList');
                uncompletedBookList.appendChild(bookElement);
            }
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

const bookSearch = document.getElementById("searchBook");
bookSearch.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchInput = document.getElementById("searchBookTitle").value;
    searchBooks(searchInput);
});

function searchBooks(query) {
    const uncompletedBookList = document.getElementById("incompleteBookshelfList");
    const completedBookList = document.getElementById("completeBookshelfList");
    for (const bookItem of bookShelf) {
        const bookElement = document.getElementById(`book-${bookItem.id}`);
        if (bookItem.title.toLowerCase().includes(query.toLowerCase())) {
            bookElement.style.display = "block";
        } else {
            bookElement.style.display = "none";
        }
    }
}

function showAllBooks() {
    const uncompletedBookList = document.getElementById("incompleteBookshelfList");
    const completedBookList = document.getElementById("completeBookshelfList");
    for (const bookItem of bookShelf) {
        const bookElement = document.getElementById(`book-${bookItem.id}`);
        bookElement.style.display = "block";
    }
}

bookSearch.addEventListener("reset", function () {
    showAllBooks();
});
