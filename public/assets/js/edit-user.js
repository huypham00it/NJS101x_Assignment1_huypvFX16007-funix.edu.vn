const input = document.querySelector('#image');
const preview = document.querySelector('.preview');

// EVENT WHEN CHANGE IMAGE
input.addEventListener('change', function(){
    const url = input.value;
    preview.src = url;
})