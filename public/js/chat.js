const chat = {
    async init(db) {
        console.log(db, db.ref('chat/'))
        
        document.querySelector('#user-label').style.display = localStorage.getItem('user') ? 'none' : 'block';
        
        await this.auth().then(() => {});

        this.db = db.ref('chat/');
        this.events();
    },  

    auth () {
        return new Promise(resolve => {
            firebase.auth().onAuthStateChanged(async (user) => {
                console.log({ user })

                if (!user) {
                    alert('Debe loguearse para comenzar');
                    await Program.login();
                }

                resolve();
            });
        });
    },

    events() {
        document.querySelector('form').addEventListener('submit', this.onSendMessage.bind(this));
        this.db.on('value', this.onReceiveMessage.bind(this));
    },

    onSendMessage(event) {
        event.preventDefault();

        let user = this.user || localStorage.getItem('user');

        if (!user) {
            const userInput = document.querySelector('#user');
            this.user = user = userInput.value;

            if (user) {
                userInput.disabled = true;
                localStorage.setItem('user', user);
            } else {
                alert('Ingresá un usuario');
                userInput.focus();
                return;
            }
        }

        const message = document.querySelector('input#new-message').value;
        const timestamp = new Date().valueOf();

        const { key } = this.db.push({
            message,
            timestamp,
            user
        });

        console.log({ key });
    },

    onReceiveMessage(snapshot) {
        console.log(snapshot, snapshot.val());

        const messages = document.querySelector('#messages');

        messages.innerHTML = Object.values(snapshot.val()).map(({ message, user, timestamp }) => (`
            <div class="message">
                <hr>
                <em>${user}</em> <small>${new Date(+timestamp)}</small>
                <p>${message}</p>
            </div>
        `)).join('');
    }
};

export default function (database) {
    chat.init(database);
};