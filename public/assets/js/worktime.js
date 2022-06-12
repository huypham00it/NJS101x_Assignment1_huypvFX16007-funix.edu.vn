const modal = document.querySelector('.modalContent');
const modalCloseBtn = modal.querySelector('.modalContent button.close');
const acceptBtn = modal.querySelector('.modalContent button.accept');

modalCloseBtn.addEventListener('click', () => modal.style.display = 'none');

const action = {
    type: '',
    userId: ''
}

const manageAction = (btn) => {
    modal.style.display = 'flex';
    action.type = btn.dataset.type;
    action.userId = btn.parentNode.querySelector('[name=userId]').value;
}

acceptBtn.addEventListener('click',() => {
    if(action.type == 'delete'){
        fetch('/manager/delete-worktime/' + action.userId, {
            method: 'DELETE'
        })
        .then(result => {
            if(result.status == 200){
                alert('Xóa dữ liệu thành công!')
                window.location.href = '/manager/worktime-details/' + action.userId;
            }
        })
        .done()
        .catch(err => console.log(err))
    }
    if(action.type == 'block'){
        fetch('/manager/block-user/' + action.userId, {
            method: 'POST'
        })
        .then(result => {
            if(result.status == 200){
                alert('Khóa tài khoản thành công!')
                window.location.href = '/manager/worktime-details/' + action.userId;
            }
        })
        .done()
        .catch(err => console.log(err))
    }
}) 

