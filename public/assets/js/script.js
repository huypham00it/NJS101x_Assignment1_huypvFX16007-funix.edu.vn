const menuBtn = document.querySelector('.mobile-menu');
const nav = document.querySelector('nav')

// EVENT WHEN CLICK ON MENU BUTTON
menuBtn.addEventListener('click', function(){
    this.classList.toggle('active');
    nav.classList.toggle('active');
})