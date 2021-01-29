const form = document.querySelector('form');
const nameInput = form.querySelector('input[type="text"]');
const fileInput = form.querySelector('input[type="file"]');
const submitBtn = form.querySelector('button');
const photos = document.querySelector('#photos');
const ext = document.querySelector('#ext');
const loading = document.querySelector('#loading');
const auth = document.querySelector('#auth');
const login = document.querySelector('#login');
const logout = document.querySelector('#logout');

HTMLElement.prototype.hide = function () {
    this.style.display = 'none';
};
HTMLElement.prototype.show = function () {
    this.style.display = 'block';
};

const Program = {
    init() {
        this.storage = firebase.storage().ref();

        this.bind();
        this.load();
        this.events();
    },
    bind() {
        this.upload = this.upload.bind(this);
    },
    events() {
        this.auth();
        form.addEventListener('submit', this.upload);
        auth.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', event => {
                event.preventDefault();
                const link = event.target.getAttribute('href');
                if (link === 'login') {
                    this.login();
                } else {
                    this.logout();
                }
            })
        );
        fileInput.addEventListener('change', function () {
            let fileName = (() => {
                const name = this.files[0]?.name;

                if (name) {
                    const idx = name.lastIndexOf('.');
                    ext.innerHTML = name.slice(idx);
                    return name.slice(0, idx);
                } else {
                    ext.innerHTML = '';
                    return '';
                }
            })()

            nameInput.value = fileName;
            nameInput.parentNode.show();
            submitBtn.show();
            nameInput.select();
        })
    },
    load() {
        // Create a reference under which you want to list
        var listRef = this.storage.child('photos');
        // Find all the prefixes and items.
        listRef.listAll().then((res) => {
            console.log({ res })
            loading.hide();
            res.items.sort((a, b) => a.name > b.name ? 1 : -1).forEach((itemRef) => {
                console.log({ itemRef })
                // All the items under listRef.
                this.show(itemRef);
            });
        }).catch(function (error) {
            // Uh-oh, an error occurred!
        });
    },
    upload(event) {
        event.preventDefault();
        submitBtn.disabled = true;
        submitBtn.style.opacity = '.3';

        const date = Date.now();
        const fileName = date + nameInput.value + ext.innerHTML;
        const file = fileInput.files[0];

        const uploadTask = this.storage.child('photos/' + fileName).put(file, { public: true });
        console.log(uploadTask)

        loading.show();
        uploadTask.then(snapshot => {
            console.log('Done', snapshot);
            loading.hide();
            this.show(snapshot.metadata);
            nameInput.parentNode.hide();
            submitBtn.hide();

            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        });
    },
    show({ bucket, fullPath }) {
        const baseURL = 'https://storage.googleapis.com';
        const img = document.createElement('img');
        img.src = `${baseURL}/${bucket}/${fullPath}`;
        photos.prepend(img);
    },
    auth() {
        firebase.auth().onAuthStateChanged((user) => {
            console.log('State changed')
            auth.querySelector('.loading').hide();

            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                var uid = user.uid;
                // ...
                console.log({ uid, user })
                login.hide();
                logout.show();
            } else {
                // User is signed out
                // ...
                logout.hide();
                login.show();
            }
        });
    },
    login() {
        const provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth()
            .signInWithPopup(provider)
            .then((result) => {
                /** @type {firebase.auth.OAuthCredential} */
                var credential = result.credential;

                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = credential.accessToken;
                // The signed-in user info.
                var user = result.user;
                // ...

                console.log({ credential, token, user });
                alert('Te logueaste correctamente. Podés ver tus datos en la consola.');
            }).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
    },
    logout() {
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
            console.log('Logged out!')
        }).catch((error) => {
            // An error happened.
        });
    }
}



// createUserWithEmailAndPassword
/*firebase.auth().signInWithEmailAndPassword('juan.elfers@gmail.com', 'JohnGalt91')
    .then((user) => {
        // Signed in
        // ...
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
    });*/




/*
// Create a reference with an initial file path and name
var storage = firebase.storage();
var pathReference = storage.ref('images/stars.jpg');

// Create a reference from a Google Cloud Storage URI
var gsReference = storage.refFromURL('gs://bucket/images/stars.jpg')

// Create a reference from an HTTPS URL
// Note that in the URL, characters are URL escaped!
var httpsReference = storage.refFromURL('https://firebasestorage.googleapis.com/b/bucket/o/images%20stars.jpg')*/