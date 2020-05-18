var modal = document.getElementById('simpleModal');
var modalBtn = document.getElementById('modalBtn');
var modalT = document.getElementById('simpleModalT');
var modalBtnT = document.getElementById('modalBtnT');
var modalL = document.getElementById('simpleModalL');
var modalBtL = document.getElementById('modalBtnL');
var closeBtn = document.getElementsByClassName('closeBtn')[0];

modalBtn.addEventListener('click', openModal);
modalBtnT.addEventListener('click', openModal);
modalBtnL.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', outsideClick);

function openModal(){
    modal.style.display = 'block';
}
function closeModal(){
    modal.style.display = 'none';
}
function outsideClick(e){
    if(e.target == modal){
    modal.style.display = 'none';
}
}

