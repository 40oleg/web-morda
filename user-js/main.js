document.addEventListener('DOMContentLoaded', main);

let currentModel = null;

async function main() {


    if(ifHasToken()) {
        await checkToken();
        const allModels = await getModels();
        createModelsInDOM(allModels);
        subscribeOnModelChange();
        subscribeOnSendResult();
        subscribeOnLogout();
        refreshMoneyCounter();
        refreshTaskList();
    } else {
        subscribeOnAuthorizing();
    }
}

function subscribeOnModelChange() {
    $('.model').on('click', function(){
        const model = $(this).attr('data-model');
        currentModel = model;
        $('.pick-model').removeClass('active-pick-model');
        $(this).children('.pick-model').addClass('active-pick-model');
    })
}

function subscribeOnSendResult() {
    $('.send-button').on('click', () => {
        const body = {
            model: currentModel,
            seqn: Number($('input[name="seqn"]').val()),
            riagendr: Number($('input[name="riagendr"]').val()),
            paq605: Number($('input[name="paq605"]').val()),
            bmxbmi: Number($('input[name="bmxbmi"]').val()),
            lbxglu: Number($('input[name="lbxglu"]').val()),
            diq010: Number($('input[name="diq010"]').val()),
            lbxglt: Number($('input[name="lbxglt"]').val()),
            lbxin: Number($('input[name="lbxin"]').val()),
        };

        if (!body.model) {
            alert('Выберите модель!');
            return;
        }

        $.ajax({
            url: 'https://22d1-31-131-194-117.ngrok-free.app/models',
            type: 'POST',
            data: JSON.stringify(body),
            headers: {
                "token": localStorage.getItem('token')
            },
            contentType: 'application/json',
            success: () => {
                refreshTaskList();
                refreshMoneyCounter();
            },
            error: () => alert('Ошибка')
        })
    })
}

function getModels() {
    return $.ajax({
        url: 'https://22d1-31-131-194-117.ngrok-free.app/models',
        method: 'GET',
        headers: {
            "ngrok-skip-browser-warning": "69420",
        },
    })
}

function createModelsInDOM(models) {
    for(const model of models) {
        $('.models-container')
            .append(
                `<div class="model" data-model="${model.name}">
                    <h2>${model.name}</h2>
                    <p>Цена: <b>${model.price} денег</b></p>
                    <div class="pick-model">Выбрать</div>
                </div>`);
    }
}

function subscribeOnAuthorizing() {
    $('.authorize').on('click', async () => {
        const login = $('.user-login').val();
        const password = $('.user-password').val();
        $.ajax({
            url: 'https://22d1-31-131-194-117.ngrok-free.app/user',
            method: 'POST',
            data: {username: login, password: password},
            contentType: 'application/x-www-form-urlencoded',
            headers: {
                "ngrok-skip-browser-warning": "69420"
            },
            success: (tokenData) => {
                console.log(tokenData)
                localStorage.setItem('token', tokenData.access_token)
                location.reload();
            },
            error: () => {
                alert('Неверный пароль')
            }
        })
    });
}

function ifHasToken() {
    if (!localStorage.getItem('token')) {
        $('.main-inner-container').addClass('hide');
        return false;
    } else {
        $('.login-container').addClass('hide');
        return true;
    }
}

function checkToken() {
    return $.ajax({
        url: 'https://22d1-31-131-194-117.ngrok-free.app/user',
        method: 'GET',
        contentType: 'application/json',
        headers: {
            "ngrok-skip-browser-warning": "69420",
            "token": localStorage.getItem('token'),
        },
    })
}


function subscribeOnLogout() {
    $('.logout-block').on('click', () => {
        localStorage.clear();
        location.reload();
    });
}

function refreshMoneyCounter() {
    $.ajax({
        url: 'https://22d1-31-131-194-117.ngrok-free.app/user',
        method: 'GET',
        contentType: 'application/json',
        headers: {
            "ngrok-skip-browser-warning": "69420",
            "token": localStorage.getItem('token'),
        },
        success: (user) => {
            $('.money-count').text(user.balance);
        }
    })
}

function refreshTaskList() {
    $.ajax({
        url: 'https://22d1-31-131-194-117.ngrok-free.app/user',
        method: 'GET',
        contentType: 'application/json',
        headers: {
            "ngrok-skip-browser-warning": "69420",
            "token": localStorage.getItem('token'),
        },
        success: (user) => {
            $('.task-block table').html(`
                <tr>
                    <th>Идентификатор:</th>
                    <th>Модель:</th>
                    <th>Статус:</th>
                    <th>Результат:</th>
                </tr>
            `);
            user.tasks.forEach(task => {
                $('.task-block table').append(`
                <tr>
                    <th>${task.job_id}</th>
                    <th>${task.model}</th>
                    <th>${task.status}</th>
                    <th>${task.result}</th>
                </tr>
                `);
            })
        }
    })
}
