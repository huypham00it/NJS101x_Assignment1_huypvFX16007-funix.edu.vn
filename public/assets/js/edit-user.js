const input = document.querySelector('#image');
const preview = document.querySelector('.preview');

// EVENT WHEN CHANGE IMAGE
input.addEventListener('change', function(){
    const file = this.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', function(){
        preview.src = this.result;
    });
    reader.readAsDataURL(file);
})