var modal = document.getElementById('simpleModal');
var modalBtn = document.getElementById('modalBtn');
var modalT = document.getElementById('simpleModalT');
var modalBtnT = document.getElementById('modalBtnT');
var modalL = document.getElementById('simpleModalL');
var modalBtnL = document.getElementById('modalBtnL');
var gCloseBtn = document.getElementsByClassName('closeBtn')[0];
var tCloseBtn = document.getElementsByClassName('closeBtn')[1];
var lCloseBtn = document.getElementsByClassName('closeBtn')[2];

modalBtn.addEventListener('click', openModal);
modalBtnT.addEventListener('click', openModal);
modalBtnL.addEventListener('click', openModal);
gCloseBtn.addEventListener('click', closeModal);
tCloseBtn.addEventListener('click', closeModal);
lCloseBtn.addEventListener('click', closeModal);

window.addEventListener('click', outsideClick);

function openModal(e){
    console.log('Hi');
    if(e.target.parentElement.value === "G") {
        modal.style.display = 'block';
    } else if(e.target.parentElement.value === "T") {
        modalT.style.display = 'block';
    } else {
        modalL.style.display = 'block';
    }
    
}
function closeModal(e){
    if(e.target.id === "gCloseBtn") {
        modal.style.display = 'none';
    } else if(e.target.id === "tCloseBtn") {
        modalT.style.display = 'none';
    } else {
        modalL.style.display = 'none';
    }
    
}
function outsideClick(e){
    if(e.target == modal){
    modal.style.display = 'none';
}
}